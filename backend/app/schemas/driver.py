from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.driver import DriverStatus
from app.schemas.auth import UserResponse
from app.schemas.vehicle import VehicleResponse

class DriverBase(BaseModel):
    license_number: str
    phone_number: str
    status: DriverStatus = DriverStatus.IDLE
    assigned_vehicle_id: Optional[int] = None

class DriverCreate(DriverBase):
    user_id: int

class DriverResponse(DriverBase):
    id: int
    user_id: int
    last_lat: Optional[float] = None
    last_lng: Optional[float] = None
    last_active_at: datetime
    user: Optional[UserResponse] = None
    assigned_vehicle: Optional[VehicleResponse] = None

    class Config:
        from_attributes = True
