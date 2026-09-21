"""
ASTRA-SAFE FastAPI API Endpoints
Provides endpoints for prediction, explainability, metrics, search, and NASA telemetry.
"""

from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.asteroid import (
    AsteroidPredictionRequest,
    AsteroidPredictionResponse,
    AsteroidListResponse,
    AllMetricsResponse,
    GlobalFeatureImportanceResponse,
    HealthCheckResponse
)
from app.services.ml_service import ml_service
from app.services.asteroid_db import asteroid_db
from app.services.nasa_service import nasa_service

router = APIRouter(prefix="/api", tags=["Asteroid Intelligence"])


@router.get("/health", response_model=HealthCheckResponse, summary="System Health & Status")
async def health_check():
    """Returns platform operational status, ML model load state, and dataset stats."""
    return {
        "status": "healthy" if ml_service.is_loaded else "degraded",
        "model_loaded": ml_service.is_loaded,
        "active_model": ml_service.metrics.get("selected_model", "Unknown"),
        "dataset_records": len(asteroid_db.df) if asteroid_db.df is not None else 0,
        "version": "1.0.0-production",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/model", summary="Active ML Model Metadata")
async def get_model_info():
    """Returns metadata and hyperparameters for the active best model."""
    selected_name = ml_service.metrics.get("selected_model", "Random Forest")
    model_details = ml_service.metrics.get("models", {}).get(selected_name, {})

    return {
        "active_model": selected_name,
        "selection_rationale": ml_service.metrics.get("selection_rationale", ""),
        "description": model_details.get("description", ""),
        "hyperparameters": model_details.get("hyperparameters", {}),
        "primary_metrics": model_details.get("metrics", {}),
        "features": ml_service.metrics.get("dataset_statistics", {}).get("features_used", []),
        "dataset_summary": ml_service.metrics.get("dataset_statistics", {})
    }


@router.get("/metrics", response_model=AllMetricsResponse, summary="Model Evaluation & Comparison Metrics")
async def get_all_metrics():
    """
    Returns actual evaluation metrics (Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix, ROC curves)
    comparing Logistic Regression, Random Forest, and XGBoost.
    """
    metrics_data = ml_service.get_metrics()
    if not metrics_data:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model metrics are not available. Please train the models first."
        )
    return metrics_data


@router.get("/feature-importance", response_model=GlobalFeatureImportanceResponse, summary="Global Feature Importance")
async def get_feature_importance():
    """Returns global feature importances for the deployed classifier."""
    return ml_service.get_feature_importance()


@router.get("/asteroids", response_model=AsteroidListResponse, summary="Searchable Asteroid Catalog")
async def get_asteroids(
    search: Optional[str] = Query(None, description="Search by asteroid name, ID, or orbit class"),
    hazard_filter: Optional[str] = Query("all", description="'all', 'hazardous', or 'non_hazardous'"),
    sort_by: str = Query("estimated_diameter_km", description="Sort field (e.g. estimated_diameter_km, relative_velocity_kms, miss_distance_km)"),
    sort_order: str = Query("desc", description="'asc' or 'desc'"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(15, ge=1, le=100, description="Items per page")
):
    """Retrieves paginated, filterable Near-Earth Object records."""
    return asteroid_db.get_asteroids(
        search=search,
        hazard_filter=hazard_filter,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )


@router.get("/asteroids/{asteroid_id}", summary="Single Asteroid Detail & ML Analysis")
async def get_asteroid_detail(asteroid_id: str):
    """Retrieves comprehensive orbital/physical specs and runs real-time ML hazard scoring."""
    record = asteroid_db.get_asteroid_by_id(asteroid_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asteroid with identifier '{asteroid_id}' was not found in catalog."
        )
    return record


@router.post("/predict", response_model=AsteroidPredictionResponse, summary="Predict Asteroid Hazard & Explain")
async def predict_asteroid_hazard(payload: AsteroidPredictionRequest):
    """
    Analyzes physical & orbital parameters using the trained ML model pipeline.
    Returns:
    - Hazard classification (Potentially Hazardous vs Non-Hazardous)
    - Predicted probability percentage
    - Confidence level and risk rating
    - SHAP-based feature contribution impact breakdown
    """
    try:
        data_dict = payload.model_dump()
        result = ml_service.predict(data_dict)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Inference error: {str(e)}"
        )


@router.get("/data/distributions", summary="Dataset Feature Distributions")
async def get_data_distributions():
    """Returns feature distributions and statistical summaries partitioned by hazard classification."""
    return asteroid_db.get_distributions()


@router.get("/nasa/live", summary="NASA/JPL Live Near-Earth Approaches")
async def get_live_nasa_data():
    """Retrieves live or recent near-Earth close approaches with automated ML hazard screening."""
    return nasa_service.get_live_approaches()
