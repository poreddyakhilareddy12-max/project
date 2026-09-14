import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class DriverStatus(str, enum.Enum):
    IDLE = 'IDLE'
    ON_TRIP = 'ON_TRIP'
    OFF_DUTY = 'OFF_DUTY'

class Driver(Base):
    __tablename__ = 'drivers'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    license_number = Column(String(50), nullable=False)
    phone_number = Column(String(20), nullable=False)
    status = Column(Enum(DriverStatus), default=DriverStatus.IDLE, nullable=False)
    assigned_vehicle_id = Column(Integer, ForeignKey('vehicles.id'), nullable=True)
    last_lat = Column(Float, nullable=True)
    last_lng = Column(Float, nullable=True)
    last_active_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    user = relationship('User', back_populates='driver_profile')
    assigned_vehicle = relationship('Vehicle', back_populates='drivers')
    trips = relationship('Trip', back_populates='driver')
