import os
import joblib
import numpy as np

class RiskService:
    def __init__(self):
        model_path = os.path.join(os.path.dirname(__file__), '..', 'ml', 'models', 'road_risk_model.joblib')
        if os.path.exists(model_path):
            self.model_data = joblib.load(model_path)
            self.model = self.model_data['model']
            self.feature_cols = self.model_data['feature_cols']
            self.feature_importances = self.model_data['feature_importances']
        else:
            self.model = None
            self.feature_cols = []
            self.feature_importances = {}

    def predict_risk(self, features: dict) -> dict:
        if not self.model:
            slope = features.get('slope_deg', 15.0)
            rain = features.get('rainfall_24h_mm', 20.0)
            soil = features.get('soil_saturation', 0.4)
            hist = features.get('historical_incidents_count', 1)
            score = min(100.0, max(0.0, (slope * 0.8) + (rain * 0.4) + (soil * 30.0) + (hist * 4.0)))
        else:
            row = [features.get(col, 0.0) for col in self.feature_cols]
            pred = self.model.predict([row])[0]
            score = float(np.clip(pred, 0.0, 100.0))
            
        score = round(score, 1)
        if score < 30.0:
            level = 'LOW'
        elif score < 60.0:
            level = 'MODERATE'
        elif score < 80.0:
            level = 'HIGH'
        else:
            level = 'CRITICAL'
            
        reasons = []
        if features.get('slope_deg', 0) >= 25.0:
            reasons.append(f"Steep hillside gradient ({features.get('slope_deg')}° slope)")
        if features.get('rainfall_24h_mm', 0) >= 60.0:
            reasons.append(f"Intense monsoon precipitation ({features.get('rainfall_24h_mm')} mm in 24h)")
        if features.get('soil_saturation', 0) >= 0.70:
            reasons.append(f"High subsoil moisture saturation ({int(features.get('soil_saturation', 0)*100)}%)")
        if features.get('bridge_health_score', 100) < 65.0:
            reasons.append(f"Structural bridge restriction (Health rating: {features.get('bridge_health_score')}%)")
        if features.get('historical_incidents_count', 0) >= 3:
            reasons.append(f"High landslide recurrence zone ({features.get('historical_incidents_count')} historical incidents)")
            
        if not reasons:
            reasons.append('Normal terrain stability with favorable drainage')
            
        return {
            'risk_score': score,
            'risk_level': level,
            'top_contributing_factors': reasons[:4],
            'feature_importances': self.feature_importances
        }

risk_service = RiskService()
