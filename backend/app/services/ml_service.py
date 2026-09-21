"""
ASTRA-SAFE ML Service Singleton
Loads the trained ML model pipeline, preprocessor, metrics, and SHAP explainer on backend startup.
Exposes high-performance inference, probabilistic calibration, and feature attribution methods.
"""

import json
import os
from datetime import datetime, timezone
import joblib
import numpy as np
import pandas as pd

from ml.explainer import AsteroidExplainer
from ml.train import FEATURE_COLS

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "models")
MODEL_PATH = os.path.join(MODELS_DIR, "asteroid_model.joblib")
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "preprocessor.joblib")
METRICS_PATH = os.path.join(MODELS_DIR, "metrics.json")
ALL_MODELS_PATH = os.path.join(MODELS_DIR, "all_models.joblib")


class MLService:
    _instance = None

    def __init__(self):
        self.model_pipeline = None
        self.preprocessor = None
        self.metrics = {}
        self.all_models = {}
        self.explainer = None
        self.is_loaded = False
        self.load_artifacts()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = MLService()
        return cls._instance

    def load_artifacts(self):
        try:
            if os.path.exists(MODEL_PATH):
                self.model_pipeline = joblib.load(MODEL_PATH)
                print(f"[MLService] Loaded model pipeline from {MODEL_PATH}")

            if os.path.exists(PREPROCESSOR_PATH):
                self.preprocessor = joblib.load(PREPROCESSOR_PATH)
                print(f"[MLService] Loaded preprocessor from {PREPROCESSOR_PATH}")

            if os.path.exists(METRICS_PATH):
                with open(METRICS_PATH, "r") as f:
                    self.metrics = json.load(f)
                print(f"[MLService] Loaded metrics JSON from {METRICS_PATH}")

            if os.path.exists(ALL_MODELS_PATH):
                self.all_models = joblib.load(ALL_MODELS_PATH)

            if self.model_pipeline is not None:
                self.explainer = AsteroidExplainer(self.model_pipeline, FEATURE_COLS)
                self.is_loaded = True
                print("[MLService] ML Service initialized and ready for inference.")
            else:
                print("[MLService] Warning: Model artifacts not found. Please run train.py first.")
        except Exception as e:
            print(f"[MLService] Error loading artifacts: {e}")
            self.is_loaded = False

    def predict(self, data: dict) -> dict:
        """
        Executes real ML inference on input parameters.
        Returns hazard classification, probability percentage, confidence rating,
        and full SHAP/feature contribution breakdown.
        """
        if not self.is_loaded or self.model_pipeline is None:
            raise RuntimeError("ML model pipeline is not loaded.")

        # Derive semi-major axis and absolute magnitude if not provided
        d_km = float(data.get("estimated_diameter_km", 0.1))
        p_days = float(data.get("orbital_period_days", 365.25))

        semi_major = data.get("semi_major_axis_au")
        if semi_major is None:
            semi_major = round((p_days / 365.25) ** (2.0 / 3.0), 4)

        abs_mag = data.get("absolute_magnitude_h")
        if abs_mag is None:
            abs_mag = round(15.618 - 5.0 * np.log10(max(d_km, 0.001)), 2)

        input_features = {
            "estimated_diameter_km": d_km,
            "relative_velocity_kms": float(data.get("relative_velocity_kms", 20.0)),
            "miss_distance_km": float(data.get("miss_distance_km", 5000000.0)),
            "eccentricity": float(data.get("eccentricity", 0.2)),
            "inclination_deg": float(data.get("inclination_deg", 5.0)),
            "orbital_period_days": p_days,
            "semi_major_axis_au": float(semi_major),
            "absolute_magnitude_h": float(abs_mag)
        }

        # Build single row dataframe for pipeline
        df_row = pd.DataFrame([input_features])

        # Run prediction & probabilities
        pred_class = int(self.model_pipeline.predict(df_row)[0])
        probabilities = self.model_pipeline.predict_proba(df_row)[0]
        hazard_prob = float(probabilities[1])
        hazard_pct = round(hazard_prob * 100, 1)

        # Confidence categorization
        if hazard_prob >= 0.85 or hazard_prob <= 0.15:
            confidence = "Very High"
        elif hazard_prob >= 0.70 or hazard_prob <= 0.30:
            confidence = "High"
        elif hazard_prob >= 0.60 or hazard_prob <= 0.40:
            confidence = "Moderate"
        else:
            confidence = "Borderline / Low"

        # Risk level categorization
        if hazard_prob >= 0.75:
            risk_level = "Critical Risk"
        elif hazard_prob >= 0.45:
            risk_level = "Elevated Risk"
        elif hazard_prob >= 0.20:
            risk_level = "Low Risk"
        else:
            risk_level = "Nominal / Negligible"

        # Feature contributions via Explainer
        contributions = self.explainer.explain_instance(input_features)

        selected_model_name = self.metrics.get("selected_model", "Random Forest Classifier")

        return {
            "name": data.get("name", "Analyzed Object"),
            "is_hazardous": bool(pred_class == 1),
            "classification": "POTENTIALLY HAZARDOUS" if pred_class == 1 else "NON-HAZARDOUS",
            "hazard_probability": hazard_pct,
            "hazard_probability_percent": f"{hazard_pct}%",
            "confidence_level": confidence,
            "risk_level": risk_level,
            "model_used": selected_model_name,
            "model_version": "v1.2.0-production",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "input_parameters": {
                **input_features,
                "miss_distance_au": round(input_features["miss_distance_km"] / 149597870.7, 5)
            },
            "feature_contributions": contributions,
            "scientific_disclaimer": "This system provides preliminary machine-learning-based screening and is not a replacement for professional orbital analysis or confirmed impact prediction. Statistical feature influences do not constitute physical collision trajectory integrations."
        }

    def get_metrics(self) -> dict:
        """Returns comparison metrics across all 3 models."""
        return self.metrics

    def get_feature_importance(self) -> dict:
        """Returns global feature importances of the active best model."""
        selected = self.metrics.get("selected_model", "Random Forest")
        model_info = self.metrics.get("models", {}).get(selected, {})
        return {
            "model_name": selected,
            "features": model_info.get("feature_importance", [])
        }


ml_service = MLService.get_instance()
