from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.alert import Alert, AlertStatus, AlertSeverity
from app.schemas.alert import AlertResponse

router = APIRouter(prefix='/alerts', tags=['Automated Alerts'])

@router.get('', response_model=List[AlertResponse])
def get_alerts(
    severity: Optional[AlertSeverity] = None,
    status_filter: Optional[AlertStatus] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity)
    if status_filter:
        query = query.filter(Alert.status == status_filter)
    return query.order_by(Alert.created_at.desc()).all()

@router.post('/{id}/acknowledge', response_model=AlertResponse)
def acknowledge_alert(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = AlertStatus.ACKNOWLEDGED
    alert.acknowledged_by = current_user.id
    db.commit()
    db.refresh(alert)
    return alert

@router.post('/{id}/resolve', response_model=AlertResponse)
def resolve_alert(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = AlertStatus.RESOLVED
    alert.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(alert)
    return alert
