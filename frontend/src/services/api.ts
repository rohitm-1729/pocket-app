import axios from 'axios';
import type {
  User,
  Article,
  ArticleListResponse,
  Token,
  LoginCredentials,
  SignupCredentials,
  ArticleFilters,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  signup: async (credentials: SignupCredentials): Promise<Token> => {
    const { data } = await api.post<Token>('/api/auth/signup', credentials);
    return data;
  },

  login: async (credentials: LoginCredentials): Promise<Token> => {
    const { data } = await api.post<Token>('/api/auth/login', credentials);
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/api/auth/me');
    return data;
  },
};

// Articles API
export const articlesApi = {
  list: async (filters?: ArticleFilters): Promise<ArticleListResponse> => {
    const params = new URLSearchParams();
    if (filters?.is_read !== undefined) params.append('is_read', String(filters.is_read));
    if (filters?.is_archived !== undefined) params.append('is_archived', String(filters.is_archived));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const { data } = await api.get<ArticleListResponse>(`/api/articles?${params}`);
    return data;
  },

  get: async (id: number): Promise<Article> => {
    const { data } = await api.get<Article>(`/api/articles/${id}`);
    return data;
  },

  create: async (url: string): Promise<Article> => {
    const { data } = await api.post<Article>('/api/articles', { url });
    return data;
  },

  update: async (id: number, updates: Partial<Pick<Article, 'is_read' | 'is_archived'>>): Promise<Article> => {
    const { data } = await api.patch<Article>(`/api/articles/${id}`, updates);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/articles/${id}`);
  },

  search: async (query: string): Promise<ArticleListResponse> => {
    const { data } = await api.get<ArticleListResponse>(`/api/articles/search?q=${encodeURIComponent(query)}`);
    return data;
  },
};

export default api;
