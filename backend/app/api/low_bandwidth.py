import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.incident import Incident, IncidentStatus
from app.api.incidents import process_incident_side_effects
from app.services.sms_service import sms_service

router = APIRouter(prefix='/low-bandwidth', tags=['Low-Bandwidth & SMS Gateway'])

class SMSParseRequest(BaseModel):
    raw_message: str
    sender_phone: str = "+91-94350-00000"

class SMSParseResponse(BaseModel):
    success: bool
    message: str
    incident_id: int | None = None
    parsed_data: dict | None = None

@router.post('/parse-sms', response_model=SMSParseResponse)
def parse_and_ingest_sms(payload: SMSParseRequest, db: Session = Depends(get_db)):
    parsed = sms_service.parse_compact_message(payload.raw_message)
    if not parsed.get('success'):
        return SMSParseResponse(success=False, message=parsed.get('error', 'Failed to parse SMS message'))
        
    # Find system user or first official for reporter attribution
    reporter = db.query(User).filter(User.username == 'official').first()
    if not reporter:
        reporter = db.query(User).first()
        
    inc = Incident(
        client_uuid=f"sms-{uuid.uuid4().hex[:8]}",
        reporter_id=reporter.id if reporter else 1,
        reporter_role='SMS_GATEWAY',
        incident_type=parsed['incident_type'],
        severity=parsed['severity'],
        description=f"{parsed['description']} [Sender: {payload.sender_phone}]",
        latitude=parsed['latitude'],
        longitude=parsed['longitude'],
        status=IncidentStatus.REPORTED,
        created_at=datetime.now(timezone.utc)
    )
    db.add(inc)
    db.flush()
    process_incident_side_effects(inc, db)
    db.commit()
    db.refresh(inc)
    
    return SMSParseResponse(
        success=True,
        message=f"SMS successfully ingested and geo-tagged as Incident #{inc.id}",
        incident_id=inc.id,
        parsed_data={
            'corridor': parsed['corridor'],
            'incident_type': parsed['incident_type'].value,
            'severity': parsed['severity'].value,
            'latitude': parsed['latitude'],
            'longitude': parsed['longitude']
        }
    )
