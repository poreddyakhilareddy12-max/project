import os
import uuid
import shutil
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.incident import Incident, IncidentStatus, IncidentSeverity, IncidentType
from app.models.road_segment import RoadSegment, RiskLevel
from app.models.district import District, AccessibilityStatus
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.schemas.incident import IncidentResponse, IncidentCreate, SyncRequest, SyncResponse

router = APIRouter(prefix='/incidents', tags=['Incidents & Offline Sync'])

@router.get('', response_model=List[IncidentResponse])
def get_incidents(
    severity: Optional[IncidentSeverity] = None,
    status_filter: Optional[IncidentStatus] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if severity:
        query = query.filter(Incident.severity == severity)
    if status_filter:
        query = query.filter(Incident.status == status_filter)
    return query.order_by(Incident.created_at.desc()).all()

@router.get('/{id}', response_model=IncidentResponse)
def get_incident(id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.post('/upload-photo')
async def upload_incident_photo(file: UploadFile = File(...)):
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, and WebP images are permitted")
        
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filename = f"incident_{uuid.uuid4().hex[:12]}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    photo_url = f"/uploads/{filename}"
    return {"photo_url": photo_url, "filename": filename}

def process_incident_side_effects(inc: Incident, db: Session):
    """Update road segment risk, district status, and generate automated alerts."""
    # Find nearest road segment if not specified
    if not inc.road_segment_id:
        seg = db.query(RoadSegment).first()
        if seg:
            inc.road_segment_id = seg.id
            
    if inc.road_segment_id:
        segment = db.query(RoadSegment).filter(RoadSegment.id == inc.road_segment_id).first()
        if segment:
            # Increase risk score
            bump = 35.0 if inc.severity == IncidentSeverity.CRITICAL else (20.0 if inc.severity == IncidentSeverity.HIGH else 10.0)
            segment.current_risk_score = min(100.0, segment.current_risk_score + bump)
            if segment.current_risk_score >= 80.0:
                segment.risk_level = RiskLevel.CRITICAL
            elif segment.current_risk_score >= 60.0:
                segment.risk_level = RiskLevel.HIGH
            
            if inc.severity == IncidentSeverity.CRITICAL and inc.incident_type in [IncidentType.LANDSLIDE, IncidentType.FLOOD, IncidentType.BRIDGE_ISSUE]:
                segment.is_blocked = True
                
            # Update district if linked
            if segment.district_id:
                inc.district_id = segment.district_id
                dist = db.query(District).filter(District.id == segment.district_id).first()
                if dist:
                    dist.active_disruptions_count += 1
                    dist.affected_routes_count += 1
                    dist.accessibility_score = max(10.0, dist.accessibility_score - bump * 0.8)
                    if dist.accessibility_score < 40.0:
                        dist.accessibility_status = AccessibilityStatus.RED
                    elif dist.accessibility_score < 65.0:
                        dist.accessibility_status = AccessibilityStatus.ORANGE
                    elif dist.accessibility_score < 85.0:
                        dist.accessibility_status = AccessibilityStatus.YELLOW
                        
            # Trigger automated alert
            alert_sev = AlertSeverity.CRITICAL if inc.severity == IncidentSeverity.CRITICAL else AlertSeverity.HIGH
            alert = Alert(
                severity=alert_sev,
                title=f"New {inc.incident_type.value}: {inc.description[:50]}...",
                description=f"Field report ({inc.severity.value} severity) at coordinates [{round(inc.latitude, 4)}, {round(inc.longitude, 4)}]. Segment risk escalated to {round(segment.current_risk_score, 1)}/100.",
                location_name=f"{segment.highway_name} ({segment.start_location} - {segment.end_location})",
                district_id=segment.district_id,
                road_segment_id=segment.id,
                incident_id=inc.id,
                status=AlertStatus.ACTIVE
            )
            db.add(alert)

@router.post('', response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def report_incident(
    payload: IncidentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Incident).filter(Incident.client_uuid == payload.client_uuid).first()
    if existing:
        return existing
        
    inc = Incident(
        client_uuid=payload.client_uuid,
        reporter_id=current_user.id,
        reporter_role=current_user.role.value,
        incident_type=payload.incident_type,
        severity=payload.severity,
        description=payload.description,
        latitude=payload.latitude,
        longitude=payload.longitude,
        road_segment_id=payload.road_segment_id,
        district_id=payload.district_id,
        photo_url=payload.photo_url,
        status=IncidentStatus.REPORTED,
        created_at=datetime.now(timezone.utc)
    )
    db.add(inc)
    db.flush()
    process_incident_side_effects(inc, db)
    db.commit()
    db.refresh(inc)
    return inc

@router.post('/sync', response_model=SyncResponse)
def batch_sync_incidents(
    payload: SyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    synced_count = 0
    duplicate_count = 0
    errors = []
    
    for item in payload.incidents:
        try:
            # Check duplicate idempotency
            existing = db.query(Incident).filter(Incident.client_uuid == item.client_uuid).first()
            if existing:
                duplicate_count += 1
                continue
                
            inc = Incident(
                client_uuid=item.client_uuid,
                reporter_id=current_user.id,
                reporter_role=current_user.role.value,
                incident_type=item.incident_type,
                severity=item.severity,
                description=item.description,
                latitude=item.latitude,
                longitude=item.longitude,
                road_segment_id=item.road_segment_id,
                district_id=item.district_id,
                photo_url=item.photo_url,
                status=IncidentStatus.REPORTED,
                created_at=item.client_timestamp or datetime.now(timezone.utc)
            )
            db.add(inc)
            db.flush()
            process_incident_side_effects(inc, db)
            synced_count += 1
        except Exception as e:
            errors.append(f"UUID {item.client_uuid}: {str(e)}")
            
    db.commit()
    return SyncResponse(synced_count=synced_count, duplicate_count=duplicate_count, errors=errors)
