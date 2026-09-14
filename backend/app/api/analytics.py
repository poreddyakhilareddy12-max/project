from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.road_segment import RoadSegment, RiskLevel
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.trip import Trip, TripStatus, CargoPriority
from app.models.incident import Incident, IncidentSeverity, IncidentType
from app.models.district import District, AccessibilityStatus
from app.models.alert import Alert, AlertStatus

router = APIRouter(prefix='/analytics', tags=['Analytics & Operations Reporting'])

@router.get('/overview')
def get_analytics_overview(db: Session = Depends(get_db)):
    total_segments = db.query(RoadSegment).count()
    blocked_segments = db.query(RoadSegment).filter(RoadSegment.is_blocked == True).count()
    high_risk_segments = db.query(RoadSegment).filter(RoadSegment.risk_level.in_([RiskLevel.HIGH, RiskLevel.CRITICAL])).count()
    
    total_vehicles = db.query(Vehicle).count()
    active_vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.ACTIVE).count()
    
    total_trips = db.query(Trip).count()
    active_trips = db.query(Trip).filter(Trip.status == TripStatus.IN_TRANSIT).count()
    medical_trips = db.query(Trip).filter(Trip.cargo_priority.in_([CargoPriority.MEDICAL, CargoPriority.EMERGENCY])).count()
    
    total_incidents = db.query(Incident).count()
    active_alerts = db.query(Alert).filter(Alert.status == AlertStatus.ACTIVE).count()
    
    # District health breakdown
    green_districts = db.query(District).filter(District.accessibility_status == AccessibilityStatus.GREEN).count()
    yellow_districts = db.query(District).filter(District.accessibility_status == AccessibilityStatus.YELLOW).count()
    orange_districts = db.query(District).filter(District.accessibility_status == AccessibilityStatus.ORANGE).count()
    red_districts = db.query(District).filter(District.accessibility_status == AccessibilityStatus.RED).count()
    
    # Risk distribution for charts
    risk_distribution = [
        {"name": "Low Risk (<30)", "count": db.query(RoadSegment).filter(RoadSegment.current_risk_score < 30).count(), "fill": "#10b981"},
        {"name": "Moderate (30-59)", "count": db.query(RoadSegment).filter(RoadSegment.current_risk_score >= 30, RoadSegment.current_risk_score < 60).count(), "fill": "#f59e0b"},
        {"name": "High Risk (60-79)", "count": db.query(RoadSegment).filter(RoadSegment.current_risk_score >= 60, RoadSegment.current_risk_score < 80).count(), "fill": "#f97316"},
        {"name": "Critical (80-100)", "count": db.query(RoadSegment).filter(RoadSegment.current_risk_score >= 80).count(), "fill": "#ef4444"}
    ]
    
    # Incident breakdown
    incident_types = [
        {"type": "Landslide", "count": db.query(Incident).filter(Incident.incident_type == IncidentType.LANDSLIDE).count()},
        {"type": "Flood", "count": db.query(Incident).filter(Incident.incident_type == IncidentType.FLOOD).count()},
        {"type": "Road Damage", "count": db.query(Incident).filter(Incident.incident_type == IncidentType.ROAD_DAMAGE).count()},
        {"type": "Bridge Issue", "count": db.query(Incident).filter(Incident.incident_type == IncidentType.BRIDGE_ISSUE).count()},
        {"type": "Traffic", "count": db.query(Incident).filter(Incident.incident_type == IncidentType.TRAFFIC_CONGESTION).count()}
    ]
    
    # Corridor Bottlenecks
    corridors = [
        {"corridor": "NH-2 Kohima-Imphal", "delay_min": 180, "risk": 91, "status": "BLOCKED"},
        {"corridor": "NH-29 Dimapur-Kohima", "delay_min": 45, "risk": 82, "status": "CAUTION"},
        {"corridor": "NH-10 Siliguri-Gangtok", "delay_min": 60, "risk": 76, "status": "CAUTION"},
        {"corridor": "NH-6 Shillong-Silchar", "delay_min": 35, "risk": 58, "status": "OPEN"},
        {"corridor": "NH-27 Guwahati-Nagaon", "delay_min": 0, "risk": 15, "status": "OPEN"}
    ]
    
    return {
        "kpis": {
            "monitored_routes": total_segments,
            "blocked_routes": blocked_segments,
            "high_risk_routes": high_risk_segments,
            "active_vehicles": active_vehicles,
            "active_trips": active_trips,
            "medical_priority_trips": medical_trips,
            "total_incidents": total_incidents,
            "active_alerts": active_alerts,
            "inaccessible_districts": red_districts
        },
        "district_breakdown": {
            "green": green_districts,
            "yellow": yellow_districts,
            "orange": orange_districts,
            "red": red_districts
        },
        "risk_distribution": risk_distribution,
        "incident_breakdown": incident_types,
        "corridors": corridors
    }
