"""
Unit & Integration Tests for ASTRA-SAFE ML Pipeline & Prediction API
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.ml_service import ml_service
from ml.dataset import BENCHMARK_ASTEROIDS

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["dataset_records"] > 0


def test_model_metadata():
    response = client.get("/api/model")
    assert response.status_code == 200
    data = response.json()
    assert "active_model" in data
    assert "primary_metrics" in data
    assert "features" in data
    assert len(data["features"]) > 0


def test_model_metrics():
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "selected_model" in data
    assert "models" in data
    assert "Logistic Regression" in data["models"]
    assert "Random Forest" in data["models"]
    assert "XGBoost" in data["models"]

    # Verify metrics structure
    for model_name in ["Logistic Regression", "Random Forest", "XGBoost"]:
        m = data["models"][model_name]["metrics"]
        assert 0.0 <= m["accuracy"] <= 1.0
        assert 0.0 <= m["recall"] <= 1.0
        assert 0.0 <= m["f1_score"] <= 1.0
        assert 0.0 <= m["roc_auc"] <= 1.0


def test_predict_hazardous_asteroid_apophis():
    payload = {
        "name": "99942 Apophis",
        "estimated_diameter_km": 0.370,
        "relative_velocity_kms": 30.73,
        "miss_distance_km": 37400.0,
        "eccentricity": 0.191,
        "inclination_deg": 3.33,
        "orbital_period_days": 323.6
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_hazardous"] is True
    assert data["classification"] == "POTENTIALLY HAZARDOUS"
    assert data["hazard_probability"] >= 75.0
    assert len(data["feature_contributions"]) > 0
    assert "scientific_disclaimer" in data


def test_predict_non_hazardous_asteroid_eros():
    payload = {
        "name": "433 Eros",
        "estimated_diameter_km": 16.840,
        "relative_velocity_kms": 5.48,
        "miss_distance_km": 26630000.0,
        "eccentricity": 0.223,
        "inclination_deg": 10.83,
        "orbital_period_days": 643.2
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_hazardous"] is False
    assert data["classification"] == "NON-HAZARDOUS"
    assert data["hazard_probability"] <= 35.0


def test_predict_invalid_input_bounds():
    # Negative diameter
    payload = {
        "name": "Invalid NEO",
        "estimated_diameter_km": -0.5,
        "relative_velocity_kms": 25.0,
        "miss_distance_km": 1000000.0,
        "eccentricity": 0.2,
        "inclination_deg": 5.0,
        "orbital_period_days": 300.0
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422  # Pydantic validation error


def test_asteroids_catalog():
    response = client.get("/api/asteroids?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] > 0
    assert len(data["asteroids"]) == 10
    assert "hazardous_count" in data
    assert "non_hazardous_count" in data


def test_asteroid_detail():
    response = client.get("/api/asteroids/99942")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "ml_analysis" in data
    assert "estimated_diameter_km" in data


def test_distributions():
    response = client.get("/api/data/distributions")
    assert response.status_code == 200
    data = response.json()
    assert "estimated_diameter_km" in data
    assert "relative_velocity_kms" in data
    assert "miss_distance_km" in data
    assert len(data["estimated_diameter_km"]["histogram"]) > 0


def test_live_nasa_feed():
    response = client.get("/api/nasa/live")
    assert response.status_code == 200
    data = response.json()
    assert "close_approaches" in data
    assert len(data["close_approaches"]) > 0
