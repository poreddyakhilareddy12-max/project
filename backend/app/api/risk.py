from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.risk_service import risk_service

router = APIRouter(prefix='/risk', tags=['Machine Learning Risk'])

class RiskPredictionRequest(BaseModel):
    rainfall_24h_mm: float = 45.0
    rainfall_72h_mm: float = 120.0
    soil_saturation: float = 0.65
    slope_deg: float = 28.0
    elevation_m: float = 1450.0
    traffic_level: int = 3
    road_condition_score: float = 65.0
    bridge_age_years: float = 24.0
    bridge_health_score: float = 70.0
    historical_incidents_count: int = 3

class RiskPredictionResponse(BaseModel):
    risk_score: float
    risk_level: str
    top_contributing_factors: List[str]
    feature_importances: Dict[str, float]

@router.post('/predict', response_model=RiskPredictionResponse)
def predict_road_risk(payload: RiskPredictionRequest):
    return risk_service.predict_risk(payload.model_dump())
