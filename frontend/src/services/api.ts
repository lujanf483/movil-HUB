import { Preferences } from '@capacitor/preferences';

const API_URL = import.meta.env.VITE_API_URL as string;

export interface PublicUser {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export interface PrivacyNotice {
  version: string;
  title: string;
  updatedAt: string;
  controller: string;
  sections: { heading: string; body: string }[];
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  acceptPrivacy: boolean;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const raw = data?.message;
    const message = Array.isArray(raw)
      ? raw[0]
      : raw ?? 'Ocurrió un error inesperado';
    throw new ApiError(message, res.status);
  }
  return data as T;
}

export const api = {
  getPrivacyNotice: () => request<PrivacyNotice>('/privacy/notice'),

  register: (payload: RegisterPayload) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (identifier: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  me: (token: string) => request<PublicUser>('/auth/me', {}, token),

  refresh: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  logout: (token: string) =>
    request<{ message: string }>('/auth/logout', { method: 'POST' }, token),
};

const KEYS = {
  access: 'tut0hub_access',
  refresh: 'tut0hub_refresh',
};

export const tokenStorage = {
  async save(accessToken: string, refreshToken: string) {
    await Preferences.set({ key: KEYS.access, value: accessToken });
    await Preferences.set({ key: KEYS.refresh, value: refreshToken });
  },
  async getAccess() {
    return (await Preferences.get({ key: KEYS.access })).value;
  },
  async getRefresh() {
    return (await Preferences.get({ key: KEYS.refresh })).value;
  },
  async clear() {
    await Preferences.remove({ key: KEYS.access });
    await Preferences.remove({ key: KEYS.refresh });
  },
};