from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel
from app.models.road_segment import RiskLevel

class RoadSegmentBase(BaseModel):
    code: str
    highway_name: str
    start_location: str
    end_location: str
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    distance_km: float
    elevation_m: float
    slope_deg: float
    soil_saturation: float
    rainfall_24h_mm: float
    bridge_count: int
    bridge_health_score: float
    current_risk_score: float
    risk_level: RiskLevel
    is_blocked: bool
    geometry_geojson: str
    district_id: Optional[int] = None

class RoadSegmentResponse(RoadSegmentBase):
    id: int
    last_assessed_at: datetime

    class Config:
        from_attributes = True
