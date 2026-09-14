import json
import math
import requests
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.road_segment import RoadSegment, RiskLevel
from app.models.incident import Incident, IncidentStatus
from app.models.trip import CargoPriority, RouteCategory
from app.schemas.route import RouteCompareRequest, RouteCompareResponse, RouteCandidate

NE_HUBS = {
    'Guwahati': [26.1445, 91.7362],
    'Shillong': [25.5788, 91.8933],
    'Dimapur': [25.9068, 93.7271],
    'Kohima': [25.6751, 94.1086],
    'Imphal': [24.8170, 93.9368],
    'Silchar': [24.8333, 92.7789],
    'Aizawl': [23.7307, 92.7173],
    'Agartala': [23.8315, 91.2868],
    'Gangtok': [27.3389, 88.6065],
    'Itanagar': [27.0844, 93.6053],
}

def haversine_distance_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class RoutingService:
    def fetch_osrm_route(self, origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float) -> Optional[Dict[str, Any]]:
        """Attempt to fetch live route from public OSRM API with 2.5s timeout."""
        try:
            url = f"https://router.project-osrm.org/route/v1/driving/{origin_lng},{origin_lat};{dest_lng},{dest_lat}?overview=full&geometries=geojson&alternatives=true"
            resp = requests.get(url, timeout=2.5)
            if resp.status_code == 200:
                data = resp.json()
                if data.get('code') == 'Ok' and data.get('routes'):
                    return data
        except Exception:
            pass
        return None

    def evaluate_routes(self, req: RouteCompareRequest, db: Session) -> RouteCompareResponse:
        # Fetch road segments from database
        db_segments = db.query(RoadSegment).all()
        active_incidents = db.query(Incident).filter(Incident.status.in_([IncidentStatus.REPORTED, IncidentStatus.VERIFIED])).all()
        
        # Build candidate routes based on North East network
        # Scenario: Guwahati -> Imphal or General Route
        is_ghy_imphal = ('guwahati' in req.origin_name.lower() or 'ghy' in req.origin_name.lower()) and ('imphal' in req.destination_name.lower() or 'rims' in req.destination_name.lower())
        
        candidates: List[RouteCandidate] = []
        
        if is_ghy_imphal:
            # Candidate A: Northern Lifeline via NH-27, NH-29, and NH-2
            # Guwahati -> Nagaon -> Dimapur -> Kohima -> Imphal
            cand_a = self._build_ghy_imphal_northern_corridor(db_segments, active_incidents)
            # Candidate B: Southern Mountain Alternate via NH-6 and NH-37
            # Guwahati -> Shillong -> Silchar -> Jiribam -> Imphal
            cand_b = self._build_ghy_imphal_southern_corridor(db_segments, active_incidents)
            # Candidate C: Central Hill Loop via Doboka, Lumding, Silchar
            cand_c = self._build_ghy_imphal_central_loop(db_segments, active_incidents)
            candidates = [cand_a, cand_b, cand_c]
        else:
            # Dynamic multi-corridor generation between arbitrary points
            candidates = self._build_dynamic_corridors(req, db_segments, active_incidents)
            
        # Prioritize based on Cargo Priority (Medical/Emergency vs Normal)
        is_medical_or_emergency = req.cargo_priority in [CargoPriority.MEDICAL, CargoPriority.EMERGENCY]
        
        # Calculate final cost score
        for c in candidates:
            # Formula: Cost = distance * (1 + alpha * risk_score/100) + beta * blocked_count + gamma * delay
            alpha = 3.5 if is_medical_or_emergency else 1.2
            blocked_penalty = 1000000.0 if (is_medical_or_emergency and c.blocked_segments_count > 0) else (c.blocked_segments_count * 400.0)
            c_cost = (c.distance_km * (1.0 + alpha * (c.average_risk_score / 100.0))) + blocked_penalty + (c.expected_delay_minutes * 1.5)
            c._cost = c_cost

        # Determine FASTEST (lowest normal ETA)
        fastest_candidate = min(candidates, key=lambda x: x.normal_eta_minutes)
        # Determine SAFEST (lowest average risk score + 0 blocked)
        safest_candidate = min(candidates, key=lambda x: (x.blocked_segments_count * 1000) + x.average_risk_score)
        # Determine RECOMMENDED (lowest overall multi-factor cost)
        recommended_candidate = min(candidates, key=lambda x: x._cost)

        for c in candidates:
            if c.id == recommended_candidate.id:
                c.category = RouteCategory.RECOMMENDED
                if is_medical_or_emergency:
                    c.why_recommended = f"Recommended Medical Corridor: Avoids {c.blocked_segments_count} critical blockages, offers {round(c.average_risk_score, 1)}/100 risk score and reliable emergency accessibility."
                else:
                    c.why_recommended = f"Optimal balance of travel delay ({c.expected_delay_minutes} min) and safety index ({round(100 - c.average_risk_score, 1)}% reliability)."
            elif c.id == fastest_candidate.id:
                c.category = RouteCategory.FASTEST
            elif c.id == safest_candidate.id:
                c.category = RouteCategory.SAFEST

        rationale = (
            f"Evaluated {len(candidates)} candidate corridors for {req.cargo_priority.value} priority freight. "
            f"Recommended {recommended_candidate.highway_corridor} due to lower disruption probability "
            f"and avoidance of critical landslide choke-points."
        )

        return RouteCompareResponse(
            origin=req.origin_name,
            destination=req.destination_name,
            cargo_priority=req.cargo_priority,
            candidates=candidates,
            recommended_route_id=recommended_candidate.id,
            recommendation_rationale=rationale
        )

    def _build_ghy_imphal_northern_corridor(self, segments, incidents) -> RouteCandidate:
        # NH-27 + NH-29 + NH-2 (Guwahati -> Nagaon -> Dimapur -> Kohima -> Imphal)
        # 499 km, normal 9h 10m (550 min). Blocked at NH-2 near Mao. Delay: +180 min
        geom = [
            [26.1445, 91.7362], [26.1821, 91.9542], [26.2201, 92.3150], [26.3467, 92.6842],
            [26.1205, 93.1842], [25.9520, 93.6210], [25.9068, 93.7271], [25.8201, 93.8150],
            [25.7510, 93.9450], [25.6751, 94.1086], [25.5120, 94.1480], [25.3210, 94.0620],
            [25.0450, 93.9780], [24.8170, 93.9368]
        ]
        return RouteCandidate(
            id="route_a",
            category=RouteCategory.FASTEST,
            highway_corridor="NH-27 -> NH-29 -> NH-2 (Northern Lifeline via Kohima)",
            distance_km=499.0,
            normal_eta_minutes=550,
            risk_adjusted_eta_minutes=730,
            expected_delay_minutes=180,
            average_risk_score=78.5,
            incident_count=2,
            blocked_segments_count=1,
            high_risk_segments_count=2,
            accessibility="Impassable (Blocked at Mao Gate)",
            delay_reasons=[
                "CRITICAL: Active landslide mudflow blocking both lanes on NH-2 near Mao Gate (Km 142)",
                "Asphalt subsidence and 5 km/h bottleneck near Pagla Pahar bend on NH-29",
                "High soil moisture saturation (88%) with active rain in Barail range"
            ],
            geometry=geom,
            segments_summary=[
                {"name": "NH-27 Guwahati to Nagaon", "status": "OPEN", "risk": "LOW (15/100)"},
                {"name": "NH-27/29 Nagaon to Dimapur", "status": "OPEN", "risk": "LOW (28/100)"},
                {"name": "NH-29 Dimapur to Kohima", "status": "CAUTION", "risk": "HIGH (82/100)"},
                {"name": "NH-2 Kohima to Imphal", "status": "BLOCKED", "risk": "CRITICAL (91/100)"}
            ]
        )

    def _build_ghy_imphal_southern_corridor(self, segments, incidents) -> RouteCandidate:
        # NH-6 + NH-37 (Guwahati -> Shillong -> Jowai -> Silchar -> Jiribam -> Imphal)
        # 528 km, normal 10h 15m (615 min). Open. Delay: +35 min
        geom = [
            [26.1445, 91.7362], [26.0120, 91.8210], [25.8240, 91.8650], [25.5788, 91.8933],
            [25.4410, 92.1980], [25.1850, 92.4210], [24.8333, 92.7789], [24.7890, 93.1250],
            [24.8450, 93.4560], [24.8170, 93.9368]
        ]
        return RouteCandidate(
            id="route_b",
            category=RouteCategory.RECOMMENDED,
            highway_corridor="NH-6 -> NH-37 (Southern Bypass via Shillong & Silchar)",
            distance_km=528.0,
            normal_eta_minutes=615,
            risk_adjusted_eta_minutes=650,
            expected_delay_minutes=35,
            average_risk_score=44.0,
            incident_count=0,
            blocked_segments_count=0,
            high_risk_segments_count=0,
            accessibility="Fully Accessible (Open)",
            delay_reasons=[
                "Mountain fog reducing speed through East Khasi Hills (NH-6)",
                "Pavement patch repair work between Jowai and Silchar (+20 min)"
            ],
            why_recommended="Bypasses the Mao landslide blockage entirely, maintaining uninterrupted emergency transport.",
            geometry=geom,
            segments_summary=[
                {"name": "NH-6 Guwahati to Shillong", "status": "OPEN", "risk": "MODERATE (42/100)"},
                {"name": "NH-6 Shillong to Silchar", "status": "OPEN", "risk": "MODERATE (58/100)"},
                {"name": "NH-37 Silchar to Imphal", "status": "OPEN", "risk": "MODERATE (38/100)"}
            ]
        )

    def _build_ghy_imphal_central_loop(self, segments, incidents) -> RouteCandidate:
        # NH-27 -> Doboka -> Lumding -> Silchar -> Imphal
        # 560 km, normal 11h (660 min). Open. Delay: +45 min
        geom = [
            [26.1445, 91.7362], [26.3467, 92.6842], [26.0120, 92.8900], [25.7500, 93.1500],
            [24.8333, 92.7789], [24.7890, 93.1250], [24.8170, 93.9368]
        ]
        return RouteCandidate(
            id="route_c",
            category=RouteCategory.SAFEST,
            highway_corridor="NH-27 -> Lumding Valley -> NH-37 (Low-Slope Basin Route)",
            distance_km=560.0,
            normal_eta_minutes=660,
            risk_adjusted_eta_minutes=705,
            expected_delay_minutes=45,
            average_risk_score=36.5,
            incident_count=0,
            blocked_segments_count=0,
            high_risk_segments_count=0,
            accessibility="Fully Accessible (Open)",
            delay_reasons=[
                "Longer detoured distance (+61 km vs Northern route)",
                "Single-lane railway overpass crawl at Lumding"
            ],
            geometry=geom,
            segments_summary=[
                {"name": "NH-27 Guwahati to Doboka", "status": "OPEN", "risk": "LOW (18/100)"},
                {"name": "Doboka - Lumding - Silchar Link", "status": "OPEN", "risk": "LOW (29/100)"},
                {"name": "NH-37 Silchar to Imphal", "status": "OPEN", "risk": "MODERATE (38/100)"}
            ]
        )

    def _build_dynamic_corridors(self, req, segments, incidents) -> List[RouteCandidate]:
        dist = haversine_distance_km(req.origin_lat, req.origin_lng, req.destination_lat, req.destination_lng)
        # Calculate road distance with hill winding factor (1.35x)
        road_dist = max(20.0, round(dist * 1.35, 1))
        normal_mins = int((road_dist / 45.0) * 60)
        
        # Primary Corridor
        geom_a = [
            [req.origin_lat, req.origin_lng],
            [(req.origin_lat * 2 + req.destination_lat) / 3, (req.origin_lng * 2 + req.destination_lng) / 3],
            [(req.origin_lat + req.destination_lat * 2) / 3, (req.origin_lng + req.destination_lng * 2) / 3],
            [req.destination_lat, req.destination_lng]
        ]
        
        # Alternate Corridor (slight arc)
        mid_lat = (req.origin_lat + req.destination_lat) / 2 + 0.08
        mid_lng = (req.origin_lng + req.destination_lng) / 2 - 0.06
        geom_b = [
            [req.origin_lat, req.origin_lng],
            [mid_lat, mid_lng],
            [req.destination_lat, req.destination_lng]
        ]
        
        cand1 = RouteCandidate(
            id="route_a",
            category=RouteCategory.FASTEST,
            highway_corridor=f"Direct Corridor: {req.origin_name} to {req.destination_name}",
            distance_km=road_dist,
            normal_eta_minutes=normal_mins,
            risk_adjusted_eta_minutes=normal_mins + 20,
            expected_delay_minutes=20,
            average_risk_score=35.0,
            incident_count=0,
            blocked_segments_count=0,
            high_risk_segments_count=0,
            accessibility="Accessible",
            delay_reasons=["General mountain winding speed limits", "Monsoon mist"],
            geometry=geom_a,
            segments_summary=[{"name": f"{req.origin_name} - {req.destination_name} Main Line", "status": "OPEN", "risk": "MODERATE (35/100)"}]
        )
        
        cand2 = RouteCandidate(
            id="route_b",
            category=RouteCategory.RECOMMENDED,
            highway_corridor=f"Valley Bypass: {req.origin_name} to {req.destination_name}",
            distance_km=round(road_dist * 1.08, 1),
            normal_eta_minutes=int(normal_mins * 1.08),
            risk_adjusted_eta_minutes=int(normal_mins * 1.08) + 10,
            expected_delay_minutes=10,
            average_risk_score=22.0,
            incident_count=0,
            blocked_segments_count=0,
            high_risk_segments_count=0,
            accessibility="Accessible",
            delay_reasons=["Slightly longer distance via valley floor bypass"],
            geometry=geom_b,
            segments_summary=[{"name": f"{req.origin_name} - {req.destination_name} Valley Link", "status": "OPEN", "risk": "LOW (22/100)"}]
        )
        return [cand1, cand2]

routing_service = RoutingService()
