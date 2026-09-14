from typing import Optional
from pydantic import BaseModel
from app.models.district import AccessibilityStatus

class DistrictBase(BaseModel):
    name: str
    state: str
    center_lat: float
    center_lng: float
    accessibility_status: AccessibilityStatus
    accessibility_score: float
    active_disruptions_count: int = 0
    affected_routes_count: int = 0
    estimated_recovery_hours: float = 0.0

class DistrictResponse(DistrictBase):
    id: int

    class Config:
        from_attributes = True
