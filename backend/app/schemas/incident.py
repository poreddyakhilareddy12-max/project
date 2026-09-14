from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.incident import IncidentType, IncidentSeverity, IncidentStatus

class IncidentCreate(BaseModel):
    client_uuid: str
    incident_type: IncidentType
    severity: IncidentSeverity
    description: str
    latitude: float
    longitude: float
    road_segment_id: Optional[int] = None
    district_id: Optional[int] = None
    photo_url: Optional[str] = None

class IncidentSyncItem(IncidentCreate):
    client_timestamp: Optional[datetime] = None

class IncidentResponse(IncidentCreate):
    id: int
    reporter_id: int
    reporter_role: str
    status: IncidentStatus
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SyncRequest(BaseModel):
    incidents: list[IncidentSyncItem]

class SyncResponse(BaseModel):
    synced_count: int
    duplicate_count: int
    errors: list[str] = []
