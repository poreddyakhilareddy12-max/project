import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class AlertSeverity(str, enum.Enum):
    INFO = 'INFO'
    WARNING = 'WARNING'
    HIGH = 'HIGH'
    CRITICAL = 'CRITICAL'

class AlertStatus(str, enum.Enum):
    ACTIVE = 'ACTIVE'
    ACKNOWLEDGED = 'ACKNOWLEDGED'
    RESOLVED = 'RESOLVED'

class Alert(Base):
    __tablename__ = 'alerts'
    
    id = Column(Integer, primary_key=True, index=True)
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.WARNING, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    location_name = Column(String(100), nullable=False)
    district_id = Column(Integer, ForeignKey('districts.id'), nullable=True)
    road_segment_id = Column(Integer, ForeignKey('road_segments.id'), nullable=True)
    trip_id = Column(Integer, ForeignKey('trips.id'), nullable=True)
    incident_id = Column(Integer, ForeignKey('incidents.id'), nullable=True)
    status = Column(Enum(AlertStatus), default=AlertStatus.ACTIVE, nullable=False)
    acknowledged_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    
    district = relationship('District', back_populates='alerts')
    road_segment = relationship('RoadSegment', back_populates='alerts')
    trip = relationship('Trip', back_populates='alerts')
    incident = relationship('Incident', back_populates='alerts')
