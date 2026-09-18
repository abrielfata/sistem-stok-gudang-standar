const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const detailsMsg = json?.details?.map((d: any) => `${d.field}: ${d.message}`).join(', ');
    const errorMessage =
      detailsMsg ||
      (typeof json?.error === 'string' ? json.error : json?.error?.message) ||
      json?.message ||
      `Error ${response.status}: Gagal memproses permintaan`;
      
    throw new Error(errorMessage);
  }

  return json;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
  },

  // Products
  products: {
    getAll: (params?: { search?: string; categoryId?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.categoryId) query.append('categoryId', params.categoryId);
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      const queryString = query.toString();
      return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id: string) => apiRequest(`/products/${id}`),
    create: (data: any) =>
      apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest(`/products/${id}`, {
        method: 'DELETE',
      }),
  },

  // Master Data
  categories: {
    getAll: () => apiRequest('/categories'),
    create: (data: any) => {
      // Auto-generate code if missing
      if (!data.code && data.name) {
        data.code = `CAT-${data.name.substring(0, 3).toUpperCase()}`;
      }
      return apiRequest('/categories', { method: 'POST', body: JSON.stringify(data) });
    },
    update: (id: string, data: any) => apiRequest(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),
  },
  uoms: {
    getAll: () => apiRequest('/uoms'),
    create: (data: any) => apiRequest('/uoms', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/uoms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/uoms/${id}`, { method: 'DELETE' }),
  },
  warehouses: {
    getAll: () => apiRequest('/warehouses'),
    create: (data: any) => apiRequest('/warehouses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/warehouses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/warehouses/${id}`, { method: 'DELETE' }),
  },
  suppliers: {
    getAll: () => apiRequest('/suppliers'),
    create: (data: any) => apiRequest('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/suppliers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/suppliers/${id}`, { method: 'DELETE' }),
  },
  customers: {
    getAll: () => apiRequest('/customers'),
    create: (data: any) => apiRequest('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest(`/customers/${id}`, { method: 'DELETE' }),
  },

  // Inventory
  inventory: {
    getStocks: () => apiRequest('/inventory/stocks'),
    getStockCard: (productId: string, warehouseId: string) => 
      apiRequest(`/inventory/stocks/${productId}/${warehouseId}/kartu-stok`),
  },

  // Transactions
  inbound: {
    getAll: () => apiRequest('/inbound/grn'),
    getById: (id: string) => apiRequest(`/inbound/grn/${id}`),
    create: (data: any) => apiRequest('/inbound/grn', { method: 'POST', body: JSON.stringify(data) }),
    confirm: (id: string) => apiRequest(`/inbound/grn/${id}/confirm`, { method: 'POST' }),
    cancel: (id: string) => apiRequest(`/inbound/grn/${id}/cancel`, { method: 'POST' }),
  },
  outbound: {
    getAll: () => apiRequest('/outbound/so'),
    getById: (id: string) => apiRequest(`/outbound/so/${id}`),
    create: (data: any) => apiRequest('/outbound/so', { method: 'POST', body: JSON.stringify(data) }),
    confirm: (id: string) => apiRequest(`/outbound/so/${id}/confirm`, { method: 'POST' }),
    cancel: (id: string) => apiRequest(`/outbound/so/${id}/cancel`, { method: 'POST' }),
  },

  // System
  audit: {
    getAll: () => apiRequest('/audit'),
  },

  // Dashboard
  dashboard: {
    getKpi: () => apiRequest('/dashboard/kpi'),
    getActivity: (days = 7) => apiRequest(`/dashboard/activity?days=${days}`),
  },
};
