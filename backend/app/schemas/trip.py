from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel
from app.models.trip import CargoPriority, RouteCategory, TripStatus
from app.schemas.vehicle import VehicleResponse
from app.schemas.driver import DriverResponse

class TripCreate(BaseModel):
    vehicle_id: int
    driver_id: int
    cargo_type: str
    cargo_priority: CargoPriority = CargoPriority.NORMAL
    origin_name: str
    origin_lat: float
    origin_lng: float
    destination_name: str
    destination_lat: float
    destination_lng: float
    route_type: RouteCategory = RouteCategory.RECOMMENDED
    normal_eta_minutes: int
    risk_adjusted_eta_minutes: int
    expected_delay_minutes: int = 0
    delay_reasons: Optional[str] = None
    route_geometry: str

class TripResponse(BaseModel):
    id: int
    tracking_code: str
    vehicle_id: int
    driver_id: int
    cargo_type: str
    cargo_priority: CargoPriority
    origin_name: str
    origin_lat: float
    origin_lng: float
    destination_name: str
    destination_lat: float
    destination_lng: float
    route_type: RouteCategory
    normal_eta_minutes: int
    risk_adjusted_eta_minutes: int
    expected_delay_minutes: int
    delay_reasons: Optional[str] = None
    route_geometry: str
    status: TripStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    vehicle: Optional[VehicleResponse] = None
    driver: Optional[DriverResponse] = None

    class Config:
        from_attributes = True
