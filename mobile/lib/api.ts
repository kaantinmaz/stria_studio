import { router } from 'expo-router';
import { clearToken, getToken } from './storage';
import type {
  Appointment,
  AuthData,
  Campaign,
  MeData,
  Service,
  SlotData,
  ValidationErrors,
} from './types';

const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://admin.striastudio.com.tr';
export const API_URL = rawBaseUrl.replace(/\/$/, '');
const APP_API_URL = `${API_URL}/api/app`;

type LaravelError = {
  message?: string;
  errors?: ValidationErrors;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors: ValidationErrors = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: Record<string, unknown>;
  auth?: boolean;
};

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;
  const token = auth ? await getToken() : null;
  const response = await fetch(url, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    await clearToken();
    router.replace('/giris');
  }

  if (!response.ok) {
    let payload: LaravelError = {};
    try {
      payload = (await response.json()) as LaravelError;
    } catch {
      // The friendly fallback below covers non-JSON server and network-proxy errors.
    }
    throw new ApiError(
      payload.message ?? (response.status >= 500 ? 'Şu anda bir sorun oluştu. Lütfen tekrar dene.' : 'İşlem tamamlanamadı.'),
      response.status,
      payload.errors,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function friendlyError(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) return 'Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.';
  return 'Beklenmedik bir sorun oluştu. Lütfen tekrar dene.';
}

export function fieldError(error: unknown, field: string) {
  return error instanceof ApiError ? error.errors[field]?.[0] : undefined;
}

export const api = {
  async login(email: string, password: string) {
    const response = await request<{ data: AuthData }>(`${APP_API_URL}/login`, {
      method: 'POST',
      auth: false,
      body: { email, password },
    });
    return response.data;
  },

  async register(payload: { name: string; email: string; password: string; phone?: string }) {
    const response = await request<{ data: AuthData }>(`${APP_API_URL}/register`, {
      method: 'POST',
      auth: false,
      body: payload,
    });
    return response.data;
  },

  logout: () => request<void>(`${APP_API_URL}/logout`, { method: 'POST' }),

  async me() {
    const response = await request<{ data: MeData }>(`${APP_API_URL}/me`);
    return response.data;
  },

  async appointments() {
    const response = await request<{ data: Appointment[] }>(`${APP_API_URL}/appointments`);
    return response.data;
  },

  async slots(date: string) {
    const response = await request<{ data: SlotData }>(`${APP_API_URL}/slots?date=${encodeURIComponent(date)}`);
    return response.data;
  },

  async createAppointment(payload: { service_slug: string; date: string; time: string; note?: string }) {
    const response = await request<{ data: { id: number; status: 'requested' } }>(`${APP_API_URL}/appointments`, {
      method: 'POST',
      body: payload,
    });
    return response.data;
  },

  async campaigns() {
    const response = await request<{ data: Campaign[] }>(`${APP_API_URL}/campaigns`);
    return response.data;
  },

  async services() {
    const response = await request<{ data: Service[] } | Service[]>(`${API_URL}/api/services`, { auth: false });
    return Array.isArray(response) ? response : response.data;
  },
};
