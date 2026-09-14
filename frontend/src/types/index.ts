export type UserRole = 'ADMIN' | 'FIELD_OFFICIAL' | 'DRIVER';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  username: string;
  full_name: string;
  user_id: number;
}

export type VehicleType = 'TRUCK' | 'MEDICAL_SUPPLY' | 'AGRICULTURAL' | 'CONSTRUCTION' | 'ESSENTIAL_COMMODITY';
export type VehicleStatus = 'ACTIVE' | 'IDLE' | 'MAINTENANCE';

export interface Vehicle {
  id: number;
  registration_number: string;
  vehicle_type: VehicleType;
  capacity_tons: number;
  current_lat: number;
  current_lng: number;
  speed_kmh: number;
  status: VehicleStatus;
  last_gps_ping: string;
}

export type DriverStatus = 'IDLE' | 'ON_TRIP' | 'OFF_DUTY';

export interface Driver {
  id: number;
  user_id: number;
  license_number: string;
  phone_number: string;
  status: DriverStatus;
  assigned_vehicle_id?: number;
  last_lat?: number;
  last_lng?: number;
  last_active_at: string;
  user?: User;
  assigned_vehicle?: Vehicle;
}

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RoadSegment {
  id: number;
  code: string;
  highway_name: string;
  start_location: string;
  end_location: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  distance_km: number;
  elevation_m: number;
  slope_deg: number;
  soil_saturation: number;
  rainfall_24h_mm: number;
  bridge_count: number;
  bridge_health_score: number;
  current_risk_score: number;
  risk_level: RiskLevel;
  is_blocked: boolean;
  geometry_geojson: string;
  district_id?: number;
  last_assessed_at: string;
}

export type AccessibilityStatus = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export interface District {
  id: number;
  name: string;
  state: string;
  center_lat: number;
  center_lng: number;
  accessibility_status: AccessibilityStatus;
  accessibility_score: number;
  active_disruptions_count: number;
  affected_routes_count: number;
  estimated_recovery_hours: number;
}

export type IncidentType = 'LANDSLIDE' | 'FLOOD' | 'ROAD_DAMAGE' | 'BRIDGE_ISSUE' | 'TRAFFIC_CONGESTION' | 'ACCIDENT' | 'OTHER';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'REPORTED' | 'VERIFIED' | 'IN_PROGRESS' | 'RESOLVED';

export interface Incident {
  id: number;
  client_uuid: string;
  reporter_id: number;
  reporter_role: string;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  latitude: number;
  longitude: number;
  road_segment_id?: number;
  district_id?: number;
  photo_url?: string;
  status: IncidentStatus;
  created_at: string;
}

export interface OfflineIncident {
  client_uuid: string;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  latitude: number;
  longitude: number;
  road_segment_id?: number;
  district_id?: number;
  photo_blob?: string; // base64 representation of offline photo
  client_timestamp: string;
  sync_status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  error_message?: string;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: number;
  severity: AlertSeverity;
  title: string;
  description: string;
  location_name: string;
  district_id?: number;
  road_segment_id?: number;
  trip_id?: number;
  incident_id?: number;
  status: AlertStatus;
  acknowledged_by?: number;
  created_at: string;
  resolved_at?: string;
}

export type CargoPriority = 'NORMAL' | 'ESSENTIAL' | 'MEDICAL' | 'EMERGENCY';
export type RouteCategory = 'FASTEST' | 'SAFEST' | 'RECOMMENDED';

export interface RouteCandidate {
  id: string;
  category: RouteCategory;
  highway_corridor: string;
  distance_km: number;
  normal_eta_minutes: number;
  risk_adjusted_eta_minutes: number;
  expected_delay_minutes: number;
  average_risk_score: number;
  incident_count: number;
  blocked_segments_count: number;
  high_risk_segments_count: number;
  accessibility: string;
  delay_reasons: string[];
  why_recommended?: string;
  geometry: [number, number][];
  segments_summary: { name: string; status: string; risk: string }[];
}

export interface RouteCompareResponse {
  origin: string;
  destination: string;
  cargo_priority: CargoPriority;
  candidates: RouteCandidate[];
  recommended_route_id: string;
  recommendation_rationale: string;
}

export interface Trip {
  id: number;
  tracking_code: string;
  vehicle_id: number;
  driver_id: number;
  cargo_type: string;
  cargo_priority: CargoPriority;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
  route_type: RouteCategory;
  normal_eta_minutes: number;
  risk_adjusted_eta_minutes: number;
  expected_delay_minutes: number;
  delay_reasons?: string;
  route_geometry: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  started_at: string;
  completed_at?: string;
  vehicle?: Vehicle;
  driver?: Driver;
}
