import axios from 'axios';
import {
  AsteroidPredictionRequest,
  AsteroidPredictionResponse,
  AsteroidListResponse,
  AsteroidSummary,
  AllMetricsResponse,
  GlobalFeatureImportanceResponse,
  HealthCheckResponse,
  DistributionDataResponse,
  LiveNASAResponse,
} from '../types/asteroid';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const asteroidApi = {
  getHealth: async (): Promise<HealthCheckResponse> => {
    const res = await api.get<HealthCheckResponse>('/health');
    return res.data;
  },

  getModelInfo: async (): Promise<any> => {
    const res = await api.get('/model');
    return res.data;
  },

  getMetrics: async (): Promise<AllMetricsResponse> => {
    const res = await api.get<AllMetricsResponse>('/metrics');
    return res.data;
  },

  getFeatureImportance: async (): Promise<GlobalFeatureImportanceResponse> => {
    const res = await api.get<GlobalFeatureImportanceResponse>('/feature-importance');
    return res.data;
  },

  getAsteroids: async (params: {
    search?: string;
    hazard_filter?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    page_size?: number;
  }): Promise<AsteroidListResponse> => {
    const res = await api.get<AsteroidListResponse>('/asteroids', { params });
    return res.data;
  },

  getAsteroidById: async (id: string): Promise<AsteroidSummary> => {
    const res = await api.get<AsteroidSummary>(`/asteroids/${id}`);
    return res.data;
  },

  predictHazard: async (payload: AsteroidPredictionRequest): Promise<AsteroidPredictionResponse> => {
    const res = await api.post<AsteroidPredictionResponse>('/predict', payload);
    return res.data;
  },

  getDistributions: async (): Promise<DistributionDataResponse> => {
    const res = await api.get<DistributionDataResponse>('/data/distributions');
    return res.data;
  },

  getLiveNASAData: async (): Promise<LiveNASAResponse> => {
    const res = await api.get<LiveNASAResponse>('/nasa/live');
    return res.data;
  },
};

export default asteroidApi;
