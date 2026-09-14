import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class RiskLevel(str, enum.Enum):
    LOW = 'LOW'
    MODERATE = 'MODERATE'
    HIGH = 'HIGH'
    CRITICAL = 'CRITICAL'

class RoadSegment(Base):
    __tablename__ = 'road_segments'
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    highway_name = Column(String(50), index=True, nullable=False)
    start_location = Column(String(100), nullable=False)
    end_location = Column(String(100), nullable=False)
    start_lat = Column(Float, nullable=False)
    start_lng = Column(Float, nullable=False)
    end_lat = Column(Float, nullable=False)
    end_lng = Column(Float, nullable=False)
    distance_km = Column(Float, nullable=False)
    elevation_m = Column(Float, default=500.0)
    slope_deg = Column(Float, default=15.0)
    soil_saturation = Column(Float, default=0.3)
    rainfall_24h_mm = Column(Float, default=10.0)
    bridge_count = Column(Integer, default=1)
    bridge_health_score = Column(Float, default=90.0)
    current_risk_score = Column(Float, default=20.0)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.LOW, nullable=False)
    is_blocked = Column(Boolean, default=False, nullable=False)
    geometry_geojson = Column(Text, nullable=False) # JSON array of coordinates [[lat, lng], ...]
    district_id = Column(Integer, ForeignKey('districts.id'), nullable=True)
    last_assessed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    district = relationship('District', back_populates='road_segments')
    incidents = relationship('Incident', back_populates='road_segment')
    alerts = relationship('Alert', back_populates='road_segment')
