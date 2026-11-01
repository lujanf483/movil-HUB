import { create } from 'zustand';
import { api, PublicUser, RegisterPayload, tokenStorage } from '../services/api';

interface AuthState {
  user: PublicUser | null;
  loading: boolean;
  restoreSession: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  restoreSession: async () => {
    try {
      const access = await tokenStorage.getAccess();
      const refresh = await tokenStorage.getRefresh();
      if (!access || !refresh) {
        set({ user: null, loading: false });
        return;
      }
      try {
        const user = await api.me(access);
        set({ user, loading: false });
      } catch {
        const tokens = await api.refresh(refresh);
        await tokenStorage.save(tokens.accessToken, tokens.refreshToken);
        const user = await api.me(tokens.accessToken);
        set({ user, loading: false });
      }
    } catch {
      await tokenStorage.clear();
      set({ user: null, loading: false });
    }
  },

  login: async (identifier, password) => {
    const res = await api.login(identifier, password);
    await tokenStorage.save(res.accessToken, res.refreshToken);
    set({ user: res.user });
  },

  register: async (payload) => {
    const res = await api.register(payload);
    await tokenStorage.save(res.accessToken, res.refreshToken);
    set({ user: res.user });
  },

  logout: async () => {
    const access = await tokenStorage.getAccess();
    if (access) {
      try {
        await api.logout(access);
      } catch {
        // si falla la red igual se cierra la sesión local
      }
    }
    await tokenStorage.clear();
    set({ user: null });
  },
}));