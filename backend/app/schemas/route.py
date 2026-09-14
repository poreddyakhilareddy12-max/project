from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.models.trip import CargoPriority, RouteCategory

class RouteCompareRequest(BaseModel):
    origin_name: str
    origin_lat: float
    origin_lng: float
    destination_name: str
    destination_lat: float
    destination_lng: float
    cargo_priority: CargoPriority = CargoPriority.NORMAL
    cargo_type: Optional[str] = 'General Supplies'
    vehicle_weight_tons: Optional[float] = 12.0

class RouteCandidate(BaseModel):
    id: str # route_a, route_b, route_c
    category: RouteCategory # FASTEST, SAFEST, RECOMMENDED
    highway_corridor: str
    distance_km: float
    normal_eta_minutes: int
    risk_adjusted_eta_minutes: int
    expected_delay_minutes: int
    average_risk_score: float
    incident_count: int
    blocked_segments_count: int
    high_risk_segments_count: int
    accessibility: str # Accessible, Caution, High Risk
    delay_reasons: List[str]
    why_recommended: Optional[str] = None
    geometry: List[List[float]] # [[lat, lng], ...]
    segments_summary: List[Dict[str, Any]]

class RouteCompareResponse(BaseModel):
    origin: str
    destination: str
    cargo_priority: CargoPriority
    candidates: List[RouteCandidate]
    recommended_route_id: str
    recommendation_rationale: str
