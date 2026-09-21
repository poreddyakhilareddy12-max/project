"""
ASTRA-SAFE Model Explainability Module
Provides local SHAP-based and Tree-based feature attribution for individual asteroid hazard predictions,
explaining exactly how each physical and orbital parameter contributed to the hazard probability.
"""

import numpy as np
import pandas as pd
import shap

FEATURE_NAMES_READABLE = {
    "estimated_diameter_km": "Estimated Diameter",
    "relative_velocity_kms": "Relative Velocity",
    "miss_distance_km": "Miss Distance",
    "eccentricity": "Orbital Eccentricity",
    "inclination_deg": "Orbital Inclination",
    "orbital_period_days": "Orbital Period",
    "semi_major_axis_au": "Semi-Major Axis",
    "absolute_magnitude_h": "Absolute Magnitude (H)"
}

FEATURE_UNITS = {
    "estimated_diameter_km": "km",
    "relative_velocity_kms": "km/s",
    "miss_distance_km": "km",
    "eccentricity": "ratio",
    "inclination_deg": "°",
    "orbital_period_days": "days",
    "semi_major_axis_au": "AU",
    "absolute_magnitude_h": "mag"
}


class AsteroidExplainer:
    def __init__(self, pipeline, feature_cols):
        self.pipeline = pipeline
        self.feature_cols = feature_cols
        self.preprocessor = pipeline.named_steps["preprocessor"]
        self.classifier = pipeline.named_steps["classifier"]
        self.explainer = None
        self._init_explainer()

    def _init_explainer(self):
        try:
            if hasattr(self.classifier, "tree_") or hasattr(self.classifier, "get_booster") or hasattr(self.classifier, "estimators_"):
                self.explainer = shap.TreeExplainer(self.classifier)
            else:
                self.explainer = None
        except Exception as e:
            print(f"[ASTRA-SAFE Explainer] Warning initializing SHAP explainer: {e}")
            self.explainer = None

    def explain_instance(self, input_dict: dict) -> list[dict]:
        """
        Computes the feature attribution breakdown for a single asteroid input.
        Returns a list of contributing features with impact direction, magnitude, and scientific explanation.
        """
        df_in = pd.DataFrame([{col: float(input_dict.get(col, 0.0)) for col in self.feature_cols}])
        X_scaled = self.preprocessor.transform(df_in)

        raw_impacts = None

        if self.explainer is not None:
            try:
                shap_res = self.explainer.shap_values(X_scaled)
                # Handle shapes:
                # 1. 3D array (n_samples, n_features, n_classes) -> shape (1, 8, 2)
                if isinstance(shap_res, np.ndarray):
                    if shap_res.ndim == 3:
                        raw_impacts = shap_res[0, :, 1]
                    elif shap_res.ndim == 2:
                        raw_impacts = shap_res[0, :]
                    else:
                        raw_impacts = shap_res
                # 2. List of 2D arrays: [array(1, 8), array(1, 8)]
                elif isinstance(shap_res, list) and len(shap_res) == 2:
                    raw_impacts = np.array(shap_res[1])[0]
                elif hasattr(shap_res, "values"):
                    vals = shap_res.values
                    if vals.ndim == 3:
                        raw_impacts = vals[0, :, 1]
                    elif vals.ndim == 2:
                        raw_impacts = vals[0, :]
                    else:
                        raw_impacts = vals
            except Exception as e:
                print(f"[ASTRA-SAFE Explainer] SHAP computation fallback: {e}")
                raw_impacts = None

        if raw_impacts is None or len(raw_impacts) != len(self.feature_cols):
            raw_impacts = self._importance_fallback(X_scaled[0], input_dict)

        raw_impacts = np.asarray(raw_impacts, dtype=float).flatten()
        max_abs = max(float(np.max(np.abs(raw_impacts))), 1e-6)

        contributions = []
        for i, col in enumerate(self.feature_cols):
            val = float(input_dict.get(col, 0.0))
            raw_score = float(raw_impacts[i]) if i < len(raw_impacts) else 0.0
            normalized_pct = round((raw_score / max_abs) * 100, 1)

            # Categorize impact level
            abs_pct = abs(normalized_pct)
            if abs_pct >= 60:
                impact_level = "High"
            elif abs_pct >= 25:
                impact_level = "Medium"
            else:
                impact_level = "Low"

            direction = "increases_hazard" if raw_score > 0 else "decreases_hazard"
            explanation_note = self._generate_feature_rationale(col, val, direction)

            contributions.append({
                "feature": col,
                "label": FEATURE_NAMES_READABLE.get(col, col),
                "value": val,
                "unit": FEATURE_UNITS.get(col, ""),
                "shap_score": round(raw_score, 4),
                "relative_impact_percent": normalized_pct,
                "impact_level": impact_level,
                "direction": direction,
                "scientific_rationale": explanation_note
            })

        # Sort descending by absolute impact
        contributions.sort(key=lambda x: abs(x["relative_impact_percent"]), reverse=True)
        return contributions

    def _importance_fallback(self, x_scaled_row, input_dict):
        if hasattr(self.classifier, "feature_importances_"):
            importances = self.classifier.feature_importances_
            signs = []
            for col in self.feature_cols:
                val = float(input_dict.get(col, 0.0))
                if col in ["miss_distance_km", "absolute_magnitude_h"]:
                    signs.append(-1.0 if val > 15000000 else 1.0)
                else:
                    signs.append(1.0 if val > 0.1 else -1.0)
            return np.array(importances) * np.array(signs)
        elif hasattr(self.classifier, "coef_"):
            return np.array(self.classifier.coef_[0]) * np.array(x_scaled_row)
        return np.ones(len(self.feature_cols)) * 0.1

    def _generate_feature_rationale(self, col: str, val: float, direction: str) -> str:
        if col == "estimated_diameter_km":
            if val >= 0.14:
                return f"Diameter ({val:.3f} km) exceeds NASA PHA threshold of 140 meters, increasing kinetic hazard potential."
            return f"Diameter ({val:.3f} km) is below 140m planetary damage threshold, substantially mitigating atmospheric breakthrough risk."
        elif col == "relative_velocity_kms":
            if val >= 25.0:
                return f"Relative velocity of {val:.1f} km/s is elevated, multiplying potential impact energy."
            return f"Relative velocity of {val:.1f} km/s represents nominal encounter kinetic velocity."
        elif col == "miss_distance_km":
            if val <= 7480000:
                return f"Miss distance ({val:,.0f} km / {val/149597870.7:.4f} AU) is within the 0.05 AU critical screening perimeter."
            return f"Miss distance ({val:,.0f} km / {val/149597870.7:.3f} AU) passes beyond the immediate 0.05 AU hazard radius."
        elif col == "eccentricity":
            if val > 0.4:
                return f"High orbital eccentricity ({val:.3f}) indicates an Earth-crossing elliptical trajectory."
            return f"Moderate orbital eccentricity ({val:.3f}) suggests a relatively circular, stable orbit."
        elif col == "absolute_magnitude_h":
            if val <= 22.0:
                return f"Bright absolute magnitude H={val:.1f} correlates to large physical mass."
            return f"Faint absolute magnitude H={val:.1f} confirms small sub-hundred-meter asteroid size."
        elif col == "inclination_deg":
            if val < 5.0:
                return f"Low orbital inclination ({val:.1f}°) keeps the asteroid near Earth's ecliptic plane, increasing intersection frequency."
            return f"Inclination of {val:.1f}° tilts the orbit away from the primary ecliptic plane."
        elif col == "orbital_period_days":
            return f"Orbital period of {val:.1f} days characterizes its resonance with Earth's 365.25-day cycle."
        elif col == "semi_major_axis_au":
            return f"Semi-major axis of {val:.3f} AU places the orbit in the Near-Earth asteroid classification regime."
        return f"Parameter {col}={val} processed by statistical model."
