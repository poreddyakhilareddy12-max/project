import enum
from sqlalchemy import Column, Integer, String, Float, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

class AccessibilityStatus(str, enum.Enum):
    GREEN = 'GREEN'       # Accessible
    YELLOW = 'YELLOW'     # Partially accessible
    ORANGE = 'ORANGE'     # High risk
    RED = 'RED'           # Inaccessible

class District(Base):
    __tablename__ = 'districts'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    state = Column(String(50), index=True, nullable=False)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    accessibility_status = Column(Enum(AccessibilityStatus), default=AccessibilityStatus.GREEN, nullable=False)
    accessibility_score = Column(Float, default=100.0) # 0-100
    active_disruptions_count = Column(Integer, default=0)
    affected_routes_count = Column(Integer, default=0)
    estimated_recovery_hours = Column(Float, default=0.0)
    
    road_segments = relationship('RoadSegment', back_populates='district')
    incidents = relationship('Incident', back_populates='district')
    alerts = relationship('Alert', back_populates='district')
