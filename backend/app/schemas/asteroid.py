"""
ASTRA-SAFE Pydantic Schemas for Request & Response Validation
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AsteroidPredictionRequest(BaseModel):
    name: Optional[str] = Field(default="Custom NEO Candidate", description="Identifier or name of the asteroid")
    estimated_diameter_km: float = Field(..., gt=0.0, le=1500.0, description="Estimated asteroid diameter in kilometers (e.g. 0.370)")
    relative_velocity_kms: float = Field(..., gt=0.0, le=150.0, description="Relative velocity at close approach in km/s (e.g. 25.4)")
    miss_distance_km: float = Field(..., gt=0.0, description="Nominal miss distance in kilometers (e.g. 37400 or 7500000)")
    eccentricity: float = Field(..., ge=0.0, lt=1.0, description="Orbital eccentricity [0 to 0.999] (e.g. 0.191)")
    inclination_deg: float = Field(..., ge=0.0, le=180.0, description="Orbital inclination in degrees (e.g. 3.33)")
    orbital_period_days: float = Field(..., gt=0.0, le=50000.0, description="Orbital period in days (e.g. 323.6)")
    semi_major_axis_au: Optional[float] = Field(default=None, description="Semi-major axis in AU (optional, auto-calculated if missing)")
    absolute_magnitude_h: Optional[float] = Field(default=None, description="Absolute visual magnitude H (optional, auto-calculated if missing)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "99942 Apophis",
                "estimated_diameter_km": 0.370,
                "relative_velocity_kms": 30.73,
                "miss_distance_km": 37400.0,
                "eccentricity": 0.191,
                "inclination_deg": 3.33,
                "orbital_period_days": 323.6
            }
        }
    }


class FeatureContribution(BaseModel):
    feature: str
    label: str
    value: float
    unit: str
    shap_score: float
    relative_impact_percent: float
    impact_level: str  # "High", "Medium", "Low"
    direction: str     # "increases_hazard", "decreases_hazard"
    scientific_rationale: str


class AsteroidPredictionResponse(BaseModel):
    name: str
    is_hazardous: bool
    classification: str  # "POTENTIALLY HAZARDOUS" or "NON-HAZARDOUS"
    hazard_probability: float  # e.g. 82.4
    hazard_probability_percent: str  # e.g. "82.4%"
    confidence_level: str  # "Very High", "High", "Moderate", "Low"
    risk_level: str  # "Critical Risk", "Elevated Risk", "Low Risk", "Nominal"
    model_used: str
    model_version: str
    timestamp: str
    input_parameters: Dict[str, Any]
    feature_contributions: List[FeatureContribution]
    scientific_disclaimer: str


class AsteroidSummary(BaseModel):
    id: str
    name: str
    estimated_diameter_km: float
    relative_velocity_kms: float
    miss_distance_km: float
    miss_distance_au: float
    absolute_magnitude_h: float
    eccentricity: float
    inclination_deg: float
    orbital_period_days: float
    semi_major_axis_au: float
    orbit_class: str
    is_hazardous: int
    hazard_probability: Optional[float] = None
    discovery_year: int
    close_approach_date: str


class AsteroidListResponse(BaseModel):
    total_count: int
    page: int
    page_size: int
    total_pages: int
    hazardous_count: int
    non_hazardous_count: int
    asteroids: List[AsteroidSummary]


class ModelMetricItem(BaseModel):
    name: str
    description: str
    hyperparameters: Dict[str, Any]
    metrics: Dict[str, float]
    confusion_matrix: Dict[str, Any]
    roc_curve: List[Dict[str, float]]
    pr_curve: List[Dict[str, float]]
    feature_importance: List[Dict[str, Any]]


class AllMetricsResponse(BaseModel):
    selected_model: str
    selection_rationale: str
    dataset_statistics: Dict[str, Any]
    models: Dict[str, ModelMetricItem]


class GlobalFeatureImportanceResponse(BaseModel):
    model_name: str
    features: List[Dict[str, Any]]


class HealthCheckResponse(BaseModel):
    status: str
    model_loaded: bool
    active_model: str
    dataset_records: int
    version: str
    timestamp: str
