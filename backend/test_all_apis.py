import sys
import os
sys.path.insert(0, os.path.abspath('backend'))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("1. Testing Health...")
r = client.get("/api/health")
assert r.status_code == 200, r.text
print("   PASS:", r.json())

print("2. Testing Auth Login...")
r = client.post("/api/auth/login", json={"username": "admin", "password": "Password123!"})
assert r.status_code == 200, r.text
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("   PASS: Logged in as Admin")

print("3. Testing ML Risk Prediction...")
r = client.post("/api/risk/predict", json={
    "rainfall_24h_mm": 95.0,
    "rainfall_72h_mm": 240.0,
    "soil_saturation": 0.82,
    "slope_deg": 35.0,
    "elevation_m": 1600.0,
    "traffic_level": 4,
    "road_condition_score": 45.0,
    "bridge_age_years": 35.0,
    "bridge_health_score": 50.0,
    "historical_incidents_count": 5
})
assert r.status_code == 200, r.text
risk_res = r.json()
print("   PASS: Predicted Risk Score:", risk_res["risk_score"], "Level:", risk_res["risk_level"], "Factors:", risk_res["top_contributing_factors"])

print("4. Testing Route Comparison (Guwahati -> Imphal, Medical Priority)...")
r = client.post("/api/routes/compare", json={
    "origin_name": "Guwahati Medical College (GMCH)",
    "origin_lat": 26.1445,
    "origin_lng": 91.7362,
    "destination_name": "RIMS Hospital, Imphal",
    "destination_lat": 24.8170,
    "destination_lng": 93.9368,
    "cargo_priority": "MEDICAL"
})
assert r.status_code == 200, r.text
route_res = r.json()
print("   PASS: Candidates evaluated:", len(route_res["candidates"]))
print("   Recommended Route:", route_res["recommended_route_id"], "Rationale:", route_res["recommendation_rationale"])

print("5. Testing Vehicles list & GPS update...")
r = client.get("/api/vehicles")
assert r.status_code == 200
v_list = r.json()
assert len(v_list) > 0
print(f"   PASS: {len(v_list)} vehicles retrieved")

v_id = v_list[0]["id"]
r = client.post(f"/api/vehicles/{v_id}/location", json={"latitude": 25.8500, "longitude": 93.8600, "speed_kmh": 45.0})
assert r.status_code == 200
print("   PASS: GPS location ping recorded")

print("6. Testing Districts health matrix...")
r = client.get("/api/districts")
assert r.status_code == 200
print(f"   PASS: {len(r.json())} NE districts queried")

print("7. Testing Alerts query...")
r = client.get("/api/alerts")
assert r.status_code == 200
print(f"   PASS: {len(r.json())} alerts active")

print("8. Testing Compact SMS Parser...")
r = client.post("/api/low-bandwidth/parse-sms", json={
    "raw_message": "INCIDENT|NH2|LANDSLIDE|CRITICAL|25.512,94.148 Mudslide blocking road",
    "sender_phone": "+91-94350-99887"
})
assert r.status_code == 200, r.text
print("   PASS: SMS parse result:", r.json()["message"])

print("9. Testing Offline Sync endpoint...")
r = client.post("/api/incidents/sync", json={
    "incidents": [
        {
            "client_uuid": "offline-test-uuid-001",
            "incident_type": "ROAD_DAMAGE",
            "severity": "MEDIUM",
            "description": "Potholes and loose rocks on NH-29 bend",
            "latitude": 25.75,
            "longitude": 93.92
        }
    ]
}, headers=headers)
assert r.status_code == 200, r.text
print("   PASS: Sync result:", r.json())

print("10. Testing Analytics Overview...")
r = client.get("/api/analytics/overview")
assert r.status_code == 200
print("   PASS: Analytics KPIs:", r.json()["kpis"])

print("\n=======================================================")
print(">>> ALL 10 COMPREHENSIVE BACKEND API SUITES PASSED! <<<")
print("=======================================================")
