import axios from 'axios';
import { User, Asset, AssetStatus, DashboardStats, Pagination } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: JWT ekleme
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 kontrolü
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Oturum süresi dolduysa veya geçersizse temizle
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ success: boolean; token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    return res.data;
  },

  register: async (userData: { email: string; password: string; fullName: string; department: string; role?: string }) => {
    const res = await api.post<{ success: boolean; user: User }>('/auth/register', userData);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<{ success: boolean; user: User }>('/auth/me');
    return res.data;
  },
};

// ==================== ASSET API ====================
export const assetApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: AssetStatus; department?: string }) => {
    const res = await api.get<{ success: boolean; data: Asset[]; pagination: Pagination }>('/assets', {
      params,
    });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: Asset }>(`/assets/${id}`);
    return res.data;
  },

  getByTag: async (assetTag: string) => {
    const res = await api.get<{ success: boolean; data: Asset }>(`/assets/qr/${assetTag}`);
    return res.data;
  },

  create: async (assetData: Partial<Asset> & { notes?: string }) => {
    const res = await api.post<{ success: boolean; data: Asset }>('/assets', assetData);
    return res.data;
  },

  update: async (id: string, assetData: Partial<Asset> & { notes?: string }) => {
    const res = await api.put<{ success: boolean; data: Asset }>(`/assets/${id}`, assetData);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/assets/${id}`);
    return res.data;
  },

  assign: async (id: string, userId: string, notes?: string) => {
    const res = await api.post<{ success: boolean; data: Asset }>(`/assets/${id}/assign`, {
      userId,
      notes,
    });
    return res.data;
  },

  return: async (id: string, notes?: string) => {
    const res = await api.post<{ success: boolean; data: Asset }>(`/assets/${id}/return`, {
      notes,
    });
    return res.data;
  },

  getHistory: async (id: string) => {
    const res = await api.get<{ success: boolean; data: any[] }>(`/assets/${id}/history`);
    return res.data;
  },
};

// ==================== DASHBOARD API ====================
export const dashboardApi = {
  getStats: async () => {
    const res = await api.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
    return res.data;
  },
};

// ==================== USER API ====================
export const userApi = {
  getAll: async () => {
    const res = await api.get<{ success: boolean; data: User[] }>('/users');
    return res.data;
  },

  update: async (id: string, data: Partial<User> & { password?: string }) => {
    const res = await api.put<{ success: boolean; data: User }>(`/users/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/users/${id}`);
    return res.data;
  },
};
