import numpy as np
import pandas as pd

def generate_ne_hazard_dataset(n_samples=3500, random_state=42):
    np.random.seed(random_state)
    
    rainfall_24h = np.random.exponential(scale=35.0, size=n_samples)
    rainfall_24h = np.clip(rainfall_24h, 0.0, 260.0)
    
    rainfall_72h = rainfall_24h * np.random.uniform(1.8, 3.2, size=n_samples) + np.random.exponential(scale=20.0, size=n_samples)
    rainfall_72h = np.clip(rainfall_72h, 0.0, 650.0)
    
    soil_saturation = 0.2 + 0.7 * (rainfall_72h / 500.0) + np.random.normal(0, 0.05, size=n_samples)
    soil_saturation = np.clip(soil_saturation, 0.1, 1.0)
    
    slope_deg = np.random.beta(2, 3, size=n_samples) * 55.0
    elevation_m = np.random.uniform(60.0, 2800.0, size=n_samples)
    traffic_level = np.random.choice([1, 2, 3, 4, 5], p=[0.2, 0.3, 0.3, 0.15, 0.05], size=n_samples)
    
    road_condition_score = np.random.uniform(25.0, 95.0, size=n_samples)
    bridge_age_years = np.random.uniform(2.0, 60.0, size=n_samples)
    bridge_health_score = 100.0 - (bridge_age_years * 0.9) - np.random.uniform(0, 20.0, size=n_samples)
    bridge_health_score = np.clip(bridge_health_score, 20.0, 100.0)
    
    historical_incidents = np.random.poisson(lam=(slope_deg / 15.0) * (rainfall_72h / 150.0), size=n_samples)
    historical_incidents = np.clip(historical_incidents, 0, 15)
    
    landslide_factor = (slope_deg / 50.0) ** 1.5 * (soil_saturation ** 1.3) * (rainfall_24h / 120.0) * 50.0
    flood_factor = ((2800.0 - elevation_m) / 2800.0) * (rainfall_72h / 250.0) * (soil_saturation ** 1.5) * 30.0
    infrastructure_penalty = ((100.0 - road_condition_score) / 100.0) * 15.0 + ((100.0 - bridge_health_score) / 100.0) * 15.0
    history_factor = (historical_incidents / 15.0) * 20.0
    
    raw_risk = landslide_factor + flood_factor + infrastructure_penalty + history_factor + np.random.normal(0, 3.5, size=n_samples)
    risk_score = np.clip(raw_risk, 0.0, 100.0)
    
    categories = []
    for r in risk_score:
        if r < 30.0:
            categories.append('LOW')
        elif r < 60.0:
            categories.append('MODERATE')
        elif r < 80.0:
            categories.append('HIGH')
        else:
            categories.append('CRITICAL')
            
    df = pd.DataFrame({
        'rainfall_24h_mm': np.round(rainfall_24h, 2),
        'rainfall_72h_mm': np.round(rainfall_72h, 2),
        'soil_saturation': np.round(soil_saturation, 3),
        'slope_deg': np.round(slope_deg, 2),
        'elevation_m': np.round(elevation_m, 1),
        'traffic_level': traffic_level,
        'road_condition_score': np.round(road_condition_score, 1),
        'bridge_age_years': np.round(bridge_age_years, 1),
        'bridge_health_score': np.round(bridge_health_score, 1),
        'historical_incidents_count': historical_incidents,
        'risk_score': np.round(risk_score, 2),
        'risk_level': categories
    })
    return df
