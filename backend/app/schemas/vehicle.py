from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.vehicle import VehicleType, VehicleStatus

class VehicleBase(BaseModel):
    registration_number: str
    vehicle_type: VehicleType
    capacity_tons: float
    current_lat: float
    current_lng: float
    speed_kmh: float = 0.0
    status: VehicleStatus = VehicleStatus.ACTIVE

class VehicleCreate(VehicleBase):
    pass

class VehicleLocationUpdate(BaseModel):
    latitude: float
    longitude: float
    speed_kmh: Optional[float] = 0.0

class VehicleResponse(VehicleBase):
    id: int
    last_gps_ping: datetime

    class Config:
        from_attributes = True
