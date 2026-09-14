import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class IncidentType(str, enum.Enum):
    LANDSLIDE = 'LANDSLIDE'
    FLOOD = 'FLOOD'
    ROAD_DAMAGE = 'ROAD_DAMAGE'
    BRIDGE_ISSUE = 'BRIDGE_ISSUE'
    TRAFFIC_CONGESTION = 'TRAFFIC_CONGESTION'
    ACCIDENT = 'ACCIDENT'
    OTHER = 'OTHER'

class IncidentSeverity(str, enum.Enum):
    LOW = 'LOW'
    MEDIUM = 'MEDIUM'
    HIGH = 'HIGH'
    CRITICAL = 'CRITICAL'

class IncidentStatus(str, enum.Enum):
    REPORTED = 'REPORTED'
    VERIFIED = 'VERIFIED'
    IN_PROGRESS = 'IN_PROGRESS'
    RESOLVED = 'RESOLVED'

class Incident(Base):
    __tablename__ = 'incidents'
    
    id = Column(Integer, primary_key=True, index=True)
    client_uuid = Column(String(100), unique=True, index=True, nullable=False)
    reporter_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    reporter_role = Column(String(50), nullable=False)
    incident_type = Column(Enum(IncidentType), default=IncidentType.LANDSLIDE, nullable=False)
    severity = Column(Enum(IncidentSeverity), default=IncidentSeverity.MEDIUM, nullable=False)
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    road_segment_id = Column(Integer, ForeignKey('road_segments.id'), nullable=True)
    district_id = Column(Integer, ForeignKey('districts.id'), nullable=True)
    photo_url = Column(String(255), nullable=True)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.REPORTED, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    
    reporter = relationship('User', back_populates='reported_incidents')
    road_segment = relationship('RoadSegment', back_populates='incidents')
    district = relationship('District', back_populates='incidents')
    alerts = relationship('Alert', back_populates='incident')
