import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

class VehicleType(str, enum.Enum):
    TRUCK = 'TRUCK'
    MEDICAL_SUPPLY = 'MEDICAL_SUPPLY'
    AGRICULTURAL = 'AGRICULTURAL'
    CONSTRUCTION = 'CONSTRUCTION'
    ESSENTIAL_COMMODITY = 'ESSENTIAL_COMMODITY'

class VehicleStatus(str, enum.Enum):
    ACTIVE = 'ACTIVE'
    IDLE = 'IDLE'
    MAINTENANCE = 'MAINTENANCE'

class Vehicle(Base):
    __tablename__ = 'vehicles'
    
    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String(30), unique=True, index=True, nullable=False)
    vehicle_type = Column(Enum(VehicleType), default=VehicleType.TRUCK, nullable=False)
    capacity_tons = Column(Float, default=10.0)
    current_lat = Column(Float, nullable=False)
    current_lng = Column(Float, nullable=False)
    speed_kmh = Column(Float, default=0.0)
    status = Column(Enum(VehicleStatus), default=VehicleStatus.ACTIVE, nullable=False)
    last_gps_ping = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    drivers = relationship('Driver', back_populates='assigned_vehicle')
    trips = relationship('Trip', back_populates='vehicle')
    breadcrumbs = relationship('GPSBreadcrumb', back_populates='vehicle')
