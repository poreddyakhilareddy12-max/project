import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class CargoPriority(str, enum.Enum):
    NORMAL = 'NORMAL'
    ESSENTIAL = 'ESSENTIAL'
    MEDICAL = 'MEDICAL'
    EMERGENCY = 'EMERGENCY'

class RouteCategory(str, enum.Enum):
    FASTEST = 'FASTEST'
    SAFEST = 'SAFEST'
    RECOMMENDED = 'RECOMMENDED'

class TripStatus(str, enum.Enum):
    PENDING = 'PENDING'
    IN_TRANSIT = 'IN_TRANSIT'
    DELIVERED = 'DELIVERED'
    CANCELLED = 'CANCELLED'

class Trip(Base):
    __tablename__ = 'trips'
    
    id = Column(Integer, primary_key=True, index=True)
    tracking_code = Column(String(50), unique=True, index=True, nullable=False)
    vehicle_id = Column(Integer, ForeignKey('vehicles.id'), nullable=False)
    driver_id = Column(Integer, ForeignKey('drivers.id'), nullable=False)
    cargo_type = Column(String(100), nullable=False)
    cargo_priority = Column(Enum(CargoPriority), default=CargoPriority.NORMAL, nullable=False)
    origin_name = Column(String(100), nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    destination_name = Column(String(100), nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lng = Column(Float, nullable=False)
    route_type = Column(Enum(RouteCategory), default=RouteCategory.RECOMMENDED, nullable=False)
    normal_eta_minutes = Column(Integer, nullable=False)
    risk_adjusted_eta_minutes = Column(Integer, nullable=False)
    expected_delay_minutes = Column(Integer, default=0)
    delay_reasons = Column(Text, nullable=True) # JSON list of strings
    route_geometry = Column(Text, nullable=False) # JSON array of coordinates
    status = Column(Enum(TripStatus), default=TripStatus.IN_TRANSIT, nullable=False)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    vehicle = relationship('Vehicle', back_populates='trips')
    driver = relationship('Driver', back_populates='trips')
    breadcrumbs = relationship('GPSBreadcrumb', back_populates='trip')
    alerts = relationship('Alert', back_populates='trip')
