import axios from 'axios';
import {
  LoginResponse,
  User,
  Vehicle,
  Trip,
  Incident,
  Alert,
  District,
  RoadSegment,
  RouteCompareResponse,
  CargoPriority
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ner_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
};

export const routesApi = {
  compare: async (payload: {
    origin_name: string;
    origin_lat: number;
    origin_lng: number;
    destination_name: string;
    destination_lat: number;
    destination_lng: number;
    cargo_priority: CargoPriority;
    cargo_type?: string;
  }): Promise<RouteCompareResponse> => {
    const res = await apiClient.post<RouteCompareResponse>('/routes/compare', payload);
    return res.data;
  },
  getSegments: async (): Promise<RoadSegment[]> => {
    const res = await apiClient.get<RoadSegment[]>('/routes/segments');
    return res.data;
  },
  getHubs: async (): Promise<{ name: string; coordinates: [number, number] }[]> => {
    const res = await apiClient.get<{ name: string; coordinates: [number, number] }[]>('/routes/hubs');
    return res.data;
  },
};

export const riskApi = {
  predict: async (features: Record<string, any>) => {
    const res = await apiClient.post('/risk/predict', features);
    return res.data;
  },
};

export const vehiclesApi = {
  getAll: async (): Promise<Vehicle[]> => {
    const res = await apiClient.get<Vehicle[]>('/vehicles');
    return res.data;
  },
  updateLocation: async (id: number, loc: { latitude: number; longitude: number; speed_kmh?: number }): Promise<Vehicle> => {
    const res = await apiClient.post<Vehicle>(`/vehicles/${id}/location`, loc);
    return res.data;
  },
};

export const tripsApi = {
  getAll: async (): Promise<Trip[]> => {
    const res = await apiClient.get<Trip[]>('/trips');
    return res.data;
  },
  getMyTrip: async (): Promise<Trip | null> => {
    const res = await apiClient.get<Trip | null>('/drivers/me/trip');
    return res.data;
  },
  reroute: async (id: number, alternateGeometry: string, reasons: string): Promise<Trip> => {
    const res = await apiClient.post<Trip>(`/trips/${id}/reroute?alternate_geometry=${encodeURIComponent(alternateGeometry)}&delay_reasons=${encodeURIComponent(reasons)}`);
    return res.data;
  },
};

export const incidentsApi = {
  getAll: async (): Promise<Incident[]> => {
    const res = await apiClient.get<Incident[]>('/incidents');
    return res.data;
  },
  create: async (payload: any): Promise<Incident> => {
    const res = await apiClient.post<Incident>('/incidents', payload);
    return res.data;
  },
  uploadPhoto: async (file: File): Promise<{ photo_url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<{ photo_url: string; filename: string }>('/incidents/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  sync: async (incidents: any[]): Promise<{ synced_count: number; duplicate_count: number; errors: string[] }> => {
    const res = await apiClient.post('/incidents/sync', { incidents });
    return res.data;
  },
};

export const alertsApi = {
  getAll: async (): Promise<Alert[]> => {
    const res = await apiClient.get<Alert[]>('/alerts');
    return res.data;
  },
  acknowledge: async (id: number): Promise<Alert> => {
    const res = await apiClient.post<Alert>(`/alerts/${id}/acknowledge`);
    return res.data;
  },
  resolve: async (id: number): Promise<Alert> => {
    const res = await apiClient.post<Alert>(`/alerts/${id}/resolve`);
    return res.data;
  },
};

export const districtsApi = {
  getAll: async (): Promise<District[]> => {
    const res = await apiClient.get<District[]>('/districts');
    return res.data;
  },
};

export const lowBandwidthApi = {
  parseSms: async (rawMessage: string, senderPhone?: string) => {
    const res = await apiClient.post('/low-bandwidth/parse-sms', {
      raw_message: rawMessage,
      sender_phone: senderPhone || '+91-94350-00000',
    });
    return res.data;
  },
};

export const analyticsApi = {
  getOverview: async () => {
    const res = await apiClient.get('/analytics/overview');
    return res.data;
  },
};
