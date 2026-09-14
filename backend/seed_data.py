import sys
import os
import json

# Ensure app is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.driver import Driver, DriverStatus
from app.models.vehicle import Vehicle, VehicleType, VehicleStatus
from app.models.district import District, AccessibilityStatus
from app.models.road_segment import RoadSegment, RiskLevel
from app.models.trip import Trip, CargoPriority, RouteCategory, TripStatus
from app.models.incident import Incident, IncidentType, IncidentSeverity, IncidentStatus
from app.models.alert import Alert, AlertSeverity, AlertStatus

def run_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print('Checking database tables...')
        if db.query(User).count() > 0:
            print('Database already contains records. Skipping seed.')
            return

        print('Seeding Users...')
        admin = User(
            username='admin',
            email='admin@nerlogix.gov.in',
            hashed_password=get_password_hash('Password123!'),
            full_name='Dr. Animesh Sharma (Logistics Director)',
            role=UserRole.ADMIN,
            is_active=True
        )
        official = User(
            username='official',
            email='official@nerlogix.gov.in',
            hashed_password=get_password_hash('Password123!'),
            full_name='Tenzing Lepcha (Field Inspection Officer)',
            role=UserRole.FIELD_OFFICIAL,
            is_active=True
        )
        driver1 = User(
            username='driver',
            email='driver@nerlogix.gov.in',
            hashed_password=get_password_hash('Password123!'),
            full_name='Ranjit Roy (Senior Convoy Driver)',
            role=UserRole.DRIVER,
            is_active=True
        )
        driver2 = User(
            username='driver2',
            email='driver2@nerlogix.gov.in',
            hashed_password=get_password_hash('Password123!'),
            full_name='Keviletuo Angami (Mountain Transport Specialist)',
            role=UserRole.DRIVER,
            is_active=True
        )
        db.add_all([admin, official, driver1, driver2])
        db.commit()

        print('Seeding Districts...')
        districts_data = [
            District(name='Kamrup Metropolitan', state='Assam', center_lat=26.1445, center_lng=91.7362, accessibility_status=AccessibilityStatus.GREEN, accessibility_score=94.0, active_disruptions_count=0, affected_routes_count=0, estimated_recovery_hours=0.0),
            District(name='East Khasi Hills', state='Meghalaya', center_lat=25.5788, center_lng=91.8933, accessibility_status=AccessibilityStatus.YELLOW, accessibility_score=78.5, active_disruptions_count=1, affected_routes_count=1, estimated_recovery_hours=3.5),
            District(name='Dimapur', state='Nagaland', center_lat=25.9068, center_lng=93.7271, accessibility_status=AccessibilityStatus.GREEN, accessibility_score=90.0, active_disruptions_count=0, affected_routes_count=0, estimated_recovery_hours=0.0),
            District(name='Kohima', state='Nagaland', center_lat=25.6751, center_lng=94.1086, accessibility_status=AccessibilityStatus.ORANGE, accessibility_score=48.0, active_disruptions_count=2, affected_routes_count=3, estimated_recovery_hours=9.0),
            District(name='Imphal West', state='Manipur', center_lat=24.8170, center_lng=93.9368, accessibility_status=AccessibilityStatus.RED, accessibility_score=31.0, active_disruptions_count=3, affected_routes_count=4, estimated_recovery_hours=18.0),
            District(name='Aizawl', state='Mizoram', center_lat=23.7307, center_lng=92.7173, accessibility_status=AccessibilityStatus.YELLOW, accessibility_score=72.0, active_disruptions_count=1, affected_routes_count=1, estimated_recovery_hours=5.0),
            District(name='West Tripura', state='Tripura', center_lat=23.8315, center_lng=91.2868, accessibility_status=AccessibilityStatus.GREEN, accessibility_score=88.0, active_disruptions_count=0, affected_routes_count=0, estimated_recovery_hours=0.0),
            District(name='Papum Pare', state='Arunachal Pradesh', center_lat=27.0844, center_lng=93.6053, accessibility_status=AccessibilityStatus.GREEN, accessibility_score=85.0, active_disruptions_count=0, affected_routes_count=0, estimated_recovery_hours=0.0),
            District(name='East Sikkim', state='Sikkim', center_lat=27.3389, center_lng=88.6065, accessibility_status=AccessibilityStatus.ORANGE, accessibility_score=52.0, active_disruptions_count=2, affected_routes_count=2, estimated_recovery_hours=12.0),
            District(name='Cachar', state='Assam', center_lat=24.8333, center_lng=92.7789, accessibility_status=AccessibilityStatus.YELLOW, accessibility_score=75.0, active_disruptions_count=1, affected_routes_count=1, estimated_recovery_hours=4.0),
        ]
        db.add_all(districts_data)
        db.commit()

        d_map = {d.name: d.id for d in db.query(District).all()}

        print('Seeding Road Segments with real North Eastern highway corridors...')
        segments_data = [
            RoadSegment(
                code='NH27-GHY-NAG-01', highway_name='NH-27', start_location='Guwahati', end_location='Nagaon',
                start_lat=26.1445, start_lng=91.7362, end_lat=26.3467, end_lng=92.6842,
                distance_km=122.0, elevation_m=65.0, slope_deg=3.0, soil_saturation=0.35, rainfall_24h_mm=18.0,
                bridge_count=5, bridge_health_score=94.0, current_risk_score=15.0, risk_level=RiskLevel.LOW, is_blocked=False,
                geometry_geojson=json.dumps([[26.1445, 91.7362], [26.1821, 91.9542], [26.2201, 92.3150], [26.3467, 92.6842]]),
                district_id=d_map.get('Kamrup Metropolitan')
            ),
            RoadSegment(
                code='NH27-NAG-DIM-02', highway_name='NH-27 / NH-29', start_location='Nagaon', end_location='Dimapur',
                start_lat=26.3467, start_lng=92.6842, end_lat=25.9068, end_lng=93.7271,
                distance_km=165.0, elevation_m=145.0, slope_deg=8.0, soil_saturation=0.48, rainfall_24h_mm=32.0,
                bridge_count=8, bridge_health_score=86.0, current_risk_score=28.0, risk_level=RiskLevel.LOW, is_blocked=False,
                geometry_geojson=json.dumps([[26.3467, 92.6842], [26.1205, 93.1842], [25.9520, 93.6210], [25.9068, 93.7271]]),
                district_id=d_map.get('Dimapur')
            ),
            RoadSegment(
                code='NH29-DIM-KOH-01', highway_name='NH-29', start_location='Dimapur', end_location='Kohima',
                start_lat=25.9068, start_lng=93.7271, end_lat=25.6751, end_lng=94.1086,
                distance_km=74.0, elevation_m=1444.0, slope_deg=28.0, soil_saturation=0.78, rainfall_24h_mm=94.0,
                bridge_count=4, bridge_health_score=68.0, current_risk_score=82.0, risk_level=RiskLevel.HIGH, is_blocked=False,
                geometry_geojson=json.dumps([[25.9068, 93.7271], [25.8201, 93.8150], [25.7510, 93.9450], [25.6751, 94.1086]]),
                district_id=d_map.get('Kohima')
            ),
            RoadSegment(
                code='NH2-KOH-IMP-01', highway_name='NH-2', start_location='Kohima', end_location='Imphal',
                start_lat=25.6751, start_lng=94.1086, end_lat=24.8170, end_lng=93.9368,
                distance_km=138.0, elevation_m=1220.0, slope_deg=34.0, soil_saturation=0.88, rainfall_24h_mm=135.0,
                bridge_count=7, bridge_health_score=52.0, current_risk_score=91.0, risk_level=RiskLevel.CRITICAL, is_blocked=True,
                geometry_geojson=json.dumps([[25.6751, 94.1086], [25.5120, 94.1480], [25.3210, 94.0620], [25.0450, 93.9780], [24.8170, 93.9368]]),
                district_id=d_map.get('Imphal West')
            ),
            RoadSegment(
                code='NH37-SIL-IMP-ALT', highway_name='NH-37 (Alternate Corridor)', start_location='Silchar', end_location='Imphal',
                start_lat=24.8333, start_lng=92.7789, end_lat=24.8170, end_lng=93.9368,
                distance_km=210.0, elevation_m=780.0, slope_deg=18.0, soil_saturation=0.52, rainfall_24h_mm=45.0,
                bridge_count=12, bridge_health_score=82.0, current_risk_score=38.0, risk_level=RiskLevel.MODERATE, is_blocked=False,
                geometry_geojson=json.dumps([[24.8333, 92.7789], [24.7890, 93.1250], [24.8450, 93.4560], [24.8170, 93.9368]]),
                district_id=d_map.get('Cachar')
            ),
            RoadSegment(
                code='NH6-GHY-SHL-01', highway_name='NH-6', start_location='Guwahati', end_location='Shillong',
                start_lat=26.1445, start_lng=91.7362, end_lat=25.5788, end_lng=91.8933,
                distance_km=98.0, elevation_m=1525.0, slope_deg=22.0, soil_saturation=0.62, rainfall_24h_mm=62.0,
                bridge_count=3, bridge_health_score=88.0, current_risk_score=42.0, risk_level=RiskLevel.MODERATE, is_blocked=False,
                geometry_geojson=json.dumps([[26.1445, 91.7362], [26.0120, 91.8210], [25.8240, 91.8650], [25.5788, 91.8933]]),
                district_id=d_map.get('East Khasi Hills')
            ),
            RoadSegment(
                code='NH6-SHL-SIL-02', highway_name='NH-6', start_location='Shillong', end_location='Silchar',
                start_lat=25.5788, start_lng=91.8933, end_lat=24.8333, end_lng=92.7789,
                distance_km=215.0, elevation_m=890.0, slope_deg=26.0, soil_saturation=0.69, rainfall_24h_mm=78.0,
                bridge_count=9, bridge_health_score=74.0, current_risk_score=58.0, risk_level=RiskLevel.MODERATE, is_blocked=False,
                geometry_geojson=json.dumps([[25.5788, 91.8933], [25.4410, 92.1980], [25.1850, 92.4210], [24.8333, 92.7789]]),
                district_id=d_map.get('Cachar')
            ),
            RoadSegment(
                code='NH108-SIL-AIZ-01', highway_name='NH-108', start_location='Silchar', end_location='Aizawl',
                start_lat=24.8333, start_lng=92.7789, end_lat=23.7307, end_lng=92.7173,
                distance_km=178.0, elevation_m=1132.0, slope_deg=24.0, soil_saturation=0.55, rainfall_24h_mm=48.0,
                bridge_count=6, bridge_health_score=80.0, current_risk_score=46.0, risk_level=RiskLevel.MODERATE, is_blocked=False,
                geometry_geojson=json.dumps([[24.8333, 92.7789], [24.4210, 92.7150], [24.0520, 92.7310], [23.7307, 92.7173]]),
                district_id=d_map.get('Aizawl')
            ),
            RoadSegment(
                code='NH8-SIL-AGT-01', highway_name='NH-8', start_location='Silchar', end_location='Agartala',
                start_lat=24.8333, start_lng=92.7789, end_lat=23.8315, end_lng=91.2868,
                distance_km=285.0, elevation_m=220.0, slope_deg=10.0, soil_saturation=0.42, rainfall_24h_mm=22.0,
                bridge_count=14, bridge_health_score=89.0, current_risk_score=24.0, risk_level=RiskLevel.LOW, is_blocked=False,
                geometry_geojson=json.dumps([[24.8333, 92.7789], [24.5120, 92.3450], [24.1250, 91.9820], [23.8315, 91.2868]]),
                district_id=d_map.get('West Tripura')
            ),
            RoadSegment(
                code='NH10-SIL-GGK-01', highway_name='NH-10', start_location='Siliguri', end_location='Gangtok',
                start_lat=26.7271, start_lng=88.3953, end_lat=27.3389, end_lng=88.6065,
                distance_km=114.0, elevation_m=1650.0, slope_deg=32.0, soil_saturation=0.74, rainfall_24h_mm=85.0,
                bridge_count=6, bridge_health_score=65.0, current_risk_score=76.0, risk_level=RiskLevel.HIGH, is_blocked=False,
                geometry_geojson=json.dumps([[26.7271, 88.3953], [26.8920, 88.4810], [27.1520, 88.5140], [27.3389, 88.6065]]),
                district_id=d_map.get('East Sikkim')
            )
        ]
        db.add_all(segments_data)
        db.commit()

        print('Seeding Vehicles...')
        vehicles_data = [
            Vehicle(registration_number='AS-01-MC-1049', vehicle_type=VehicleType.MEDICAL_SUPPLY, capacity_tons=3.5, current_lat=25.8450, current_lng=93.8500, speed_kmh=42.0, status=VehicleStatus.ACTIVE),
            Vehicle(registration_number='NL-07-TR-4421', vehicle_type=VehicleType.ESSENTIAL_COMMODITY, capacity_tons=16.0, current_lat=25.9068, current_lng=93.7271, speed_kmh=35.0, status=VehicleStatus.ACTIVE),
            Vehicle(registration_number='MN-01-AG-8812', vehicle_type=VehicleType.AGRICULTURAL, capacity_tons=8.0, current_lat=24.8170, current_lng=93.9368, speed_kmh=0.0, status=VehicleStatus.IDLE),
            Vehicle(registration_number='MZ-01-CN-3390', vehicle_type=VehicleType.CONSTRUCTION, capacity_tons=22.0, current_lat=24.8333, current_lng=92.7789, speed_kmh=28.0, status=VehicleStatus.ACTIVE)
        ]
        db.add_all(vehicles_data)
        db.commit()

        v1 = db.query(Vehicle).filter(Vehicle.registration_number == 'AS-01-MC-1049').first()
        v2 = db.query(Vehicle).filter(Vehicle.registration_number == 'NL-07-TR-4421').first()

        print('Seeding Driver profiles...')
        d_profile1 = Driver(user_id=driver1.id, license_number='AS-DRV-2018-9941', phone_number='+91-94350-11223', status=DriverStatus.ON_TRIP, assigned_vehicle_id=v1.id, last_lat=25.8450, last_lng=93.8500)
        d_profile2 = Driver(user_id=driver2.id, license_number='NL-DRV-2020-5512', phone_number='+91-98621-33445', status=DriverStatus.ON_TRIP, assigned_vehicle_id=v2.id, last_lat=25.9068, last_lng=93.7271)
        db.add_all([d_profile1, d_profile2])
        db.commit()

        print('Seeding Active Trip...')
        trip1 = Trip(
            tracking_code='NER-TRIP-9041',
            vehicle_id=v1.id,
            driver_id=d_profile1.id,
            cargo_type='Emergency ICU Medicines & Blood Plasma',
            cargo_priority=CargoPriority.MEDICAL,
            origin_name='Guwahati Medical College (GMCH)',
            origin_lat=26.1445,
            origin_lng=91.7362,
            destination_name='RIMS Hospital, Imphal',
            destination_lat=24.8170,
            destination_lng=93.9368,
            route_type=RouteCategory.RECOMMENDED,
            normal_eta_minutes=540,
            risk_adjusted_eta_minutes=650,
            expected_delay_minutes=110,
            delay_reasons=json.dumps([
                'Active landslide blockage on NH-2 near Kohima-Mao corridor',
                'Precautionary detour via Silchar NH-37 mountain alternate recommended for medical convoy',
                'Monsoon road slush reducing average speed to 32 km/h'
            ]),
            route_geometry=json.dumps([[26.1445, 91.7362], [26.3467, 92.6842], [25.9068, 93.7271], [25.6751, 94.1086], [24.8170, 93.9368]]),
            status=TripStatus.IN_TRANSIT
        )
        db.add(trip1)
        db.commit()

        print('Seeding Incidents...')
        seg_nh2 = db.query(RoadSegment).filter(RoadSegment.code == 'NH2-KOH-IMP-01').first()
        seg_nh29 = db.query(RoadSegment).filter(RoadSegment.code == 'NH29-DIM-KOH-01').first()

        inc1 = Incident(
            client_uuid='seed-inc-001',
            reporter_id=official.id,
            reporter_role='FIELD_OFFICIAL',
            incident_type=IncidentType.LANDSLIDE,
            severity=IncidentSeverity.CRITICAL,
            description='Massive rockfall and mudflow blocked both lanes at Km 142 near Mao gate. Clearing equipment en route.',
            latitude=25.5120,
            longitude=94.1480,
            road_segment_id=seg_nh2.id if seg_nh2 else None,
            district_id=d_map.get('Kohima'),
            photo_url=None,
            status=IncidentStatus.VERIFIED
        )
        inc2 = Incident(
            client_uuid='seed-inc-002',
            reporter_id=driver1.id,
            reporter_role='DRIVER',
            incident_type=IncidentType.ROAD_DAMAGE,
            severity=IncidentSeverity.HIGH,
            description='Severe asphalt subsidence and shoulder collapse near Pagla Pahar bend. Heavy vehicles must crawl at 5 km/h.',
            latitude=25.7510,
            longitude=93.9450,
            road_segment_id=seg_nh29.id if seg_nh29 else None,
            district_id=d_map.get('Kohima'),
            photo_url=None,
            status=IncidentStatus.REPORTED
        )
        db.add_all([inc1, inc2])
        db.commit()

        print('Seeding Automated Alerts...')
        alert1 = Alert(
            severity=AlertSeverity.CRITICAL,
            title='NH-2 Blocked: Critical Landslide at Mao Corridor',
            description='NH-2 connecting Kohima to Imphal is completely impassable. All commercial and medical freight advised to divert.',
            location_name='NH-2 Kohima-Mao Gate Segment',
            district_id=d_map.get('Kohima'),
            road_segment_id=seg_nh2.id if seg_nh2 else None,
            incident_id=inc1.id,
            status=AlertStatus.ACTIVE
        )
        alert2 = Alert(
            severity=AlertSeverity.HIGH,
            title='High Landslide Vulnerability Warning on NH-29',
            description='Continuous rainfall exceeding 94mm in 24 hours has saturated soil slopes. Risk score elevated to 82/100.',
            location_name='NH-29 Dimapur to Kohima Corridor',
            district_id=d_map.get('Kohima'),
            road_segment_id=seg_nh29.id if seg_nh29 else None,
            status=AlertStatus.ACTIVE
        )
        alert3 = Alert(
            severity=AlertSeverity.WARNING,
            title='Medical Priority Delay Advisory: Convoy NER-TRIP-9041',
            description='ICU medical shipment facing estimated +110 min delay due to Mao corridor obstruction.',
            location_name='En route to RIMS Imphal',
            trip_id=trip1.id,
            status=AlertStatus.ACTIVE
        )
        db.add_all([alert1, alert2, alert3])
        db.commit()

        print('Database successfully seeded with realistic North East India logistics baseline!')
    finally:
        db.close()

if __name__ == '__main__':
    run_seed()
