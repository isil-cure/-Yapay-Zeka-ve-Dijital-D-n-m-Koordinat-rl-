const API_BASE = '/api';

interface RequestOptions extends RequestInit {
  data?: any;
}

export async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('it_asset_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.data) {
    config.body = JSON.stringify(options.data);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 401) {
    // Oturum süresi dolmuş veya geçersiz
    localStorage.removeItem('it_asset_token');
    localStorage.removeItem('it_asset_user');
    if (!window.location.pathname.includes('/login')) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
  }

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = responseData.message || 'İşlem gerçekleştirilemedi.';
    throw new Error(errorMsg);
  }

  return responseData;
}

export const api = {
  // Auth
  login: (data: any) => request('/auth/login', { method: 'POST', data }),
  getMe: () => request('/auth/me'),
  changePassword: (data: any) => request('/auth/change-password', { method: 'PUT', data }),

  // Dashboard
  getStats: () => request('/dashboard/stats'),

  // Assets
  getAssets: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
    });
    return request(`/assets?${query.toString()}`);
  },
  getAsset: (id: string) => request(`/assets/${id}`),
  createAsset: (data: any) => request('/assets', { method: 'POST', data }),
  updateAsset: (id: string, data: any) => request(`/assets/${id}`, { method: 'PUT', data }),
  deleteAsset: (id: string) => request(`/assets/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (data: any) => request('/categories', { method: 'POST', data }),

  // Custody
  assignAsset: (data: any) => request('/custody/assign', { method: 'POST', data }),
  returnAsset: (data: any) => request('/custody/return', { method: 'POST', data }),
  reportFault: (data: any) => request('/custody/report-fault', { method: 'POST', data }),
  getCustodyLogs: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
    });
    return request(`/custody/logs?${query.toString()}`);
  },
  getMyAssets: () => request('/custody/my-assets'),

  // Users
  getUsers: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
    });
    return request(`/users?${query.toString()}`);
  },
  getUser: (id: string) => request(`/users/${id}`),
  createUser: (data: any) => request('/users', { method: 'POST', data }),
  updateUser: (id: string, data: any) => request(`/users/${id}`, { method: 'PUT', data }),
  resetUserPassword: (id: string, data: any) => request(`/users/${id}/reset-password`, { method: 'PUT', data }),
  deleteUser: (id: string) => request(`/users/${id}`, { method: 'DELETE' }),

  // QR & Saha Hızlı İşlemler
  lookupQr: (query: string) => request(`/qr/lookup/${encodeURIComponent(query)}`),
  quickAction: (data: any) => request('/qr/quick-action', { method: 'POST', data }),
};
