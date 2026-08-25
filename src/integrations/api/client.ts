import type { CVData, TemplateId } from '@/types/cv';
import type { PersonalInfo } from '@/types/cv';

const API_BASE = '/api';

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = typeof window === 'undefined' ? null : localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      if (typeof window !== 'undefined') localStorage.setItem('auth_token', token);
    } else {
      if (typeof window !== 'undefined') localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  async request<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, token } = options;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const authToken = token || this.token;
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    config.signal = controller.signal;
    let response: Response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, config);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('The server took too long to respond');
      }
      throw new Error('Unable to reach the server');
    } finally {
      window.clearTimeout(timeout);
    }
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : { error: response.statusText || 'Unexpected server response' };

    if (!response.ok) {
      if (response.status === 401 && this.token) {
        this.setToken(null);
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data as T;
  }

  get<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T = unknown>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  put<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

// Type definitions for API responses
export interface ApiUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  phone: string;
  profileData: Partial<PersonalInfo>;
  isActive: boolean;
  createdAt?: string;
  roles?: string[];
}

export interface AuthResponse {
  user: ApiUser;
  token: string;
}

export interface SavedCV {
  id: string;
  name: string;
  cvData: CVData;
  templateId: TemplateId;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser extends ApiUser {
  cvCount: number;
  lastLogin: string | null;
}

export interface AdminCV {
  id: string;
  name: string;
  cvData: Record<string, unknown>;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  userDisplayName: string;
  fullName: string;
  phone: string;
  email: string;
}

export interface LoginHistoryEntry {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  ipAddress: string;
  country: string | null;
  countryCode: string | null;
  city: string | null;
  userAgent: string | null;
  loggedInAt: string;
}

export interface AdminStats {
  totalUsers: number;
  onlineUsers: number;
  totalCVs: number;
  roles: Record<string, number>;
  recentLogins: LoginHistoryEntry[];
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedUsers extends PaginatedResponse<AdminUser> {
  users: AdminUser[];
}

export interface PaginatedCVs extends PaginatedResponse<AdminCV> {
  cvs: AdminCV[];
}

export interface PaginatedLoginHistory extends PaginatedResponse<LoginHistoryEntry> {
  entries: LoginHistoryEntry[];
}
