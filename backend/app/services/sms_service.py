import re
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.incident import Incident, IncidentType, IncidentSeverity, IncidentStatus
from app.models.road_segment import RoadSegment
from app.models.user import User

class SMSService:
    def parse_compact_message(self, raw_text: str) -> Dict[str, Any]:
        """
        Parses compact SMS protocol formats:
        Format: INCIDENT|<CORRIDOR_OR_DISTRICT>|<TYPE>|<SEVERITY>|<OPTIONAL_DETAILS_OR_COORDS>
        Example: INCIDENT|NH2|LANDSLIDE|HIGH|25.512,94.148
        """
        parts = [p.strip() for p in raw_text.split('|')]
        if len(parts) < 4 or parts[0].upper() != 'INCIDENT':
            return {
                'success': False,
                'error': "Invalid SMS syntax. Expected format: INCIDENT|<HIGHWAY>|<TYPE>|<SEVERITY>|<COORDS_OR_NOTES>"
            }
            
        corridor = parts[1].upper()
        inc_type_raw = parts[2].upper()
        severity_raw = parts[3].upper()
        extra = parts[4] if len(parts) > 4 else ""
        
        # Map incident type
        type_mapping = {
            'LANDSLIDE': IncidentType.LANDSLIDE,
            'FLOOD': IncidentType.FLOOD,
            'ROAD_DAMAGE': IncidentType.ROAD_DAMAGE,
            'ROAD_BLOCKED': IncidentType.ROAD_DAMAGE,
            'BRIDGE': IncidentType.BRIDGE_ISSUE,
            'BRIDGE_ISSUE': IncidentType.BRIDGE_ISSUE,
            'TRAFFIC': IncidentType.TRAFFIC_CONGESTION,
            'ACCIDENT': IncidentType.ACCIDENT
        }
        inc_type = type_mapping.get(inc_type_raw, IncidentType.OTHER)
        
        # Map severity
        sev_mapping = {
            'LOW': IncidentSeverity.LOW,
            'MED': IncidentSeverity.MEDIUM,
            'MEDIUM': IncidentSeverity.MEDIUM,
            'HIGH': IncidentSeverity.HIGH,
            'CRITICAL': IncidentSeverity.CRITICAL
        }
        severity = sev_mapping.get(severity_raw, IncidentSeverity.MEDIUM)
        
        # Extract lat/lng if provided in extra
        lat, lng = 25.6751, 94.1086 # Default NE centroid (Kohima)
        coord_match = re.search(r'([0-9]+\.[0-9]+)[,\s]+([0-9]+\.[0-9]+)', extra)
        if coord_match:
            lat = float(coord_match.group(1))
            lng = float(coord_match.group(2))
            desc = f"SMS Field Report via {corridor}: {inc_type.value} reported ({severity.value}). Coordinates: {lat}, {lng}"
        else:
            desc = f"SMS Field Report via {corridor}: {inc_type.value} reported ({severity.value}). Notes: {extra or 'No additional remarks'}"
            
        return {
            'success': True,
            'corridor': corridor,
            'incident_type': inc_type,
            'severity': severity,
            'latitude': lat,
            'longitude': lng,
            'description': desc,
            'raw_message': raw_text
        }

sms_service = SMSService()
