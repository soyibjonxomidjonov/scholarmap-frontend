import type {
  User,
  UserCreate,
  University,
  UniversityFilters,
  Eslatma,
  EslatmaFilters,
  LoginCredentials,
  TokenPair,
  PaginatedResponse,
  AiChatRequest,
  AiChatResponse,
} from './types';

const API_URL = import.meta.env.VITE_API_URL || 'https://scholarmap.uz/api/v1';

// Token storage keys — kept in sync with App.tsx
const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      error.detail || error.message || `Request failed with status ${response.status}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  auth: {
    async login(credentials: LoginCredentials): Promise<TokenPair> {
      const data = await request<TokenPair>('/auth/token/', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      localStorage.setItem(TOKEN_KEY, data.access);
      localStorage.setItem(REFRESH_KEY, data.refresh);
      return data;
    },

    async refresh(refresh: string): Promise<TokenPair> {
      const data = await request<TokenPair>('/auth/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      });
      localStorage.setItem(TOKEN_KEY, data.access);
      return data;
    },

    async verify(token: string): Promise<{ valid: boolean }> {
      return request('/auth/token/verify/', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    },

    async getCurrentUser(): Promise<User> {
      return request<User>('/auth/users/me/');
    },

    async updateProfile(data: Partial<User>): Promise<User> {
      return request<User>('/auth/users/me/', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    async register(data: UserCreate): Promise<User> {
      return request<User>('/users/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async setPassword(newPassword: string, currentPassword: string): Promise<void> {
      return request('/auth/users/set_password/', {
        method: 'POST',
        body: JSON.stringify({ new_password: newPassword, current_password: currentPassword }),
      });
    },

    async resetPassword(email: string): Promise<void> {
      return request('/auth/users/reset_password/', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    logout() {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
    },
  },

  users: {
    async list(page = 1): Promise<PaginatedResponse<User>> {
      return request(`/users/?page=${page}`);
    },

    async get(id: number): Promise<User> {
      return request(`/users/${id}/`);
    },

    async create(data: UserCreate): Promise<User> {
      return request('/users/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(id: number, data: Partial<UserCreate>): Promise<User> {
      return request(`/users/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async partialUpdate(id: number, data: Partial<UserCreate>): Promise<User> {
      return request(`/users/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    async delete(id: number): Promise<void> {
      return request(`/users/${id}/`, { method: 'DELETE' });
    },
  },

  universities: {
    async list(filters: UniversityFilters = {}): Promise<PaginatedResponse<University>> {
      const params = new URLSearchParams();
      if (filters.university_name) params.append('university_name', filters.university_name);
      if (filters.state) params.append('state', filters.state);
      if (filters.level) params.append('level', filters.level);
      if (filters.grant_name) params.append('grant_name', filters.grant_name);
      if (filters.grand_amount) params.append('grand_amount', filters.grand_amount);
      if (filters.grand_turi) params.append('grand_turi', filters.grand_turi);
      if (filters.directions) params.append('directions', filters.directions);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', String(filters.page));

      const query = params.toString();
      return request(`/universiteties/${query ? `?${query}` : ''}`);
    },

    async get(id: number): Promise<University> {
      return request(`/universiteties/${id}/`);
    },

    async create(data: Omit<University, 'id' | 'updated_at' | 'created_at'>): Promise<University> {
      return request('/universiteties/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(id: number, data: Partial<University>): Promise<University> {
      return request(`/universiteties/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async partialUpdate(id: number, data: Partial<University>): Promise<University> {
      return request(`/universiteties/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    async delete(id: number): Promise<void> {
      return request(`/universiteties/${id}/`, { method: 'DELETE' });
    },
  },

  eslatmalar: {
    async list(filters: EslatmaFilters = {}): Promise<PaginatedResponse<Eslatma>> {
      const params = new URLSearchParams();
      if (filters.user) params.append('user', String(filters.user));
      if (filters.university) params.append('university', String(filters.university));
      if (filters.eslatma_matni) params.append('eslatma_matni', filters.eslatma_matni);
      if (filters.qolgan_kun) params.append('qolgan_kun', filters.qolgan_kun);
      if (filters.tugash_kun) params.append('tugash_kun', filters.tugash_kun);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', String(filters.page));

      const query = params.toString();
      return request(`/eslatmalar/${query ? `?${query}` : ''}`);
    },

    async get(id: number): Promise<Eslatma> {
      return request(`/eslatmalar/${id}/`);
    },

    async create(data: Omit<Eslatma, 'id' | 'qolgan_kun' | 'tugash_kun' | 'updated_at' | 'created_at'>): Promise<Eslatma> {
      return request('/eslatmalar/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(id: number, data: Partial<Eslatma>): Promise<Eslatma> {
      return request(`/eslatmalar/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async partialUpdate(id: number, data: Partial<Eslatma>): Promise<Eslatma> {
      return request(`/eslatmalar/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    async delete(id: number): Promise<void> {
      return request(`/eslatmalar/${id}/`, { method: 'DELETE' });
    },
  },

  aiChat: {
    async send(request: AiChatRequest): Promise<AiChatResponse> {
      const formData = new FormData();
      formData.append('text', request.text);
      if (request.file) formData.append('file', request.file);
      if (request.target_lang) formData.append('target_lang', request.target_lang);
      if (request.response_type) formData.append('response_type', request.response_type);

      const token = localStorage.getItem(TOKEN_KEY);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/ai-chat/`, {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!response.ok) {
        throw new ApiError(response.status, 'AI Chat request failed');
      }

      return response.json();
    },
  },

  aiTranslate: {
    async send(request: AiChatRequest): Promise<AiChatResponse> {
      const formData = new FormData();
      formData.append('text', request.text);
      if (request.file) formData.append('file', request.file);
      if (request.target_lang) formData.append('target_lang', request.target_lang);
      if (request.response_type) formData.append('response_type', request.response_type);

      const token = localStorage.getItem(TOKEN_KEY);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/super-ai-translate/`, {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!response.ok) {
        throw new ApiError(response.status, 'AI Translate request failed');
      }

      return response.json();
    },
  },
};

export { ApiError };