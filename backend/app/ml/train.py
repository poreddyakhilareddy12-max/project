import os
import sys
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# Ensure backend directory is in pythonpath
sys.path.insert(0, os.path.abspath('backend'))
from app.ml.dataset_generator import generate_ne_hazard_dataset

def train_and_save_model():
    print('Generating calibrated North East hazardous terrain dataset (3,500 samples)...')
    df = generate_ne_hazard_dataset()
    
    feature_cols = [
        'rainfall_24h_mm', 'rainfall_72h_mm', 'soil_saturation', 'slope_deg',
        'elevation_m', 'traffic_level', 'road_condition_score', 'bridge_age_years',
        'bridge_health_score', 'historical_incidents_count'
    ]
    
    X = df[feature_cols]
    y = df['risk_score']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print('Training Random Forest Regressor for Disruption Risk...')
    model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = float(mse ** 0.5)
    
    print(f'Model Evaluation: R^2 Score = {r2:.4f}, RMSE = {rmse:.2f}')
    
    model_dir = 'backend/app/ml/models'
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'road_risk_model.joblib')
    
    payload = {
        'model': model,
        'feature_cols': feature_cols,
        'metrics': {'r2': float(r2), 'rmse': float(rmse)},
        'feature_importances': dict(zip(feature_cols, [float(v) for v in model.feature_importances_]))
    }
    
    joblib.dump(payload, model_path)
    print(f'Trained model package successfully serialized to: {model_path}')
    return payload

if __name__ == '__main__':
    train_and_save_model()
