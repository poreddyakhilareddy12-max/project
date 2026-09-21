export interface FeatureContribution {
  feature: string;
  label: string;
  value: number;
  unit: string;
  shap_score: number;
  relative_impact_percent: number;
  impact_level: 'High' | 'Medium' | 'Low';
  direction: 'increases_hazard' | 'decreases_hazard';
  scientific_rationale: string;
}

export interface AsteroidPredictionRequest {
  name?: string;
  estimated_diameter_km: number;
  relative_velocity_kms: number;
  miss_distance_km: number;
  eccentricity: number;
  inclination_deg: number;
  orbital_period_days: number;
  semi_major_axis_au?: number;
  absolute_magnitude_h?: number;
}

export interface AsteroidPredictionResponse {
  name: string;
  is_hazardous: boolean;
  classification: string;
  hazard_probability: number;
  hazard_probability_percent: string;
  confidence_level: string;
  risk_level: string;
  model_used: string;
  model_version: string;
  timestamp: string;
  input_parameters: {
    estimated_diameter_km: number;
    relative_velocity_kms: number;
    miss_distance_km: number;
    miss_distance_au: number;
    eccentricity: number;
    inclination_deg: number;
    orbital_period_days: number;
    semi_major_axis_au: number;
    absolute_magnitude_h: number;
    [key: string]: any;
  };
  feature_contributions: FeatureContribution[];
  scientific_disclaimer: string;
}

export interface AsteroidSummary {
  id: string;
  name: string;
  estimated_diameter_km: number;
  relative_velocity_kms: number;
  miss_distance_km: number;
  miss_distance_au: number;
  absolute_magnitude_h: number;
  eccentricity: number;
  inclination_deg: number;
  orbital_period_days: number;
  semi_major_axis_au: number;
  orbit_class: string;
  is_hazardous: number;
  discovery_year: number;
  close_approach_date: string;
  hazard_probability?: number;
  ml_analysis?: AsteroidPredictionResponse;
}

export interface AsteroidListResponse {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  hazardous_count: number;
  non_hazardous_count: number;
  asteroids: AsteroidSummary[];
}

export interface ModelMetricItem {
  name: string;
  description: string;
  hyperparameters: Record<string, any>;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
  };
  confusion_matrix: {
    true_negative: number;
    false_positive: number;
    false_negative: number;
    true_positive: number;
    raw: number[][];
  };
  roc_curve: Array<{ fpr: number; tpr: number }>;
  pr_curve: Array<{ recall: number; precision: number }>;
  feature_importance: Array<{
    feature: string;
    importance: number;
    impact_level: string;
  }>;
}

export interface AllMetricsResponse {
  selected_model: string;
  selection_rationale: string;
  dataset_statistics: {
    total_samples: number;
    training_samples: number;
    testing_samples: number;
    potentially_hazardous_count: number;
    non_hazardous_count: number;
    hazardous_percentage: number;
    features_used: string[];
  };
  models: {
    [modelName: string]: ModelMetricItem;
  };
}

export interface GlobalFeatureImportanceResponse {
  model_name: string;
  features: Array<{
    feature: string;
    importance: number;
    impact_level: string;
  }>;
}

export interface HealthCheckResponse {
  status: string;
  model_loaded: boolean;
  active_model: string;
  dataset_records: number;
  version: string;
  timestamp: string;
}

export interface DistributionDataResponse {
  [featureKey: string]: {
    key: string;
    label: string;
    unit: string;
    statistics: {
      mean_all: number;
      mean_hazardous: number;
      mean_non_hazardous: number;
      median_all: number;
      std_all: number;
      min: number;
      max: number;
    };
    histogram: Array<{
      range_label: string;
      midpoint: number;
      hazardous_count: number;
      non_hazardous_count: number;
      total_count: number;
    }>;
  };
}

export interface LiveNASAResponse {
  source: string;
  source_status: string;
  retrieval_timestamp: string;
  target_date: string;
  total_objects_today: number;
  close_approaches: Array<{
    id: string;
    name: string;
    estimated_diameter_km: number;
    relative_velocity_kms: number;
    miss_distance_km: number;
    miss_distance_au: number;
    absolute_magnitude_h: number;
    eccentricity: number;
    inclination_deg: number;
    orbital_period_days: number;
    semi_major_axis_au: number;
    close_approach_date: string;
    nasa_jpl_url: string;
    ml_evaluation?: {
      is_hazardous: boolean;
      classification: string;
      hazard_probability: number;
      risk_level: string;
      top_contributor: string;
    };
  }>;
}
