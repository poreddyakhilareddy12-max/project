from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.alert import AlertSeverity, AlertStatus

class AlertResponse(BaseModel):
    id: int
    severity: AlertSeverity
    title: str
    description: str
    location_name: str
    district_id: Optional[int] = None
    road_segment_id: Optional[int] = None
    trip_id: Optional[int] = None
    incident_id: Optional[int] = None
    status: AlertStatus
    acknowledged_by: Optional[int] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
