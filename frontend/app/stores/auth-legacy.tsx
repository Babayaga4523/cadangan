'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'siswa';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const legacyUseAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      setUser: (user: User | null) => set({ user }),
      setToken: (token: string | null) => set({ token }),
      clearError: () => set({ error: null }),
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();
          
          if (!res.ok) {
            throw new Error(data.message || 'Login failed');
          }

          const token = data.access_token || data.token || data?.data?.access_token;
          const user = data.user;

          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({ token, user, isLoading: false, error: null });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Login failed';
          set({ error: errorMessage, isLoading: false });
          throw err;
        }
      },
      logout: async () => {
        set({ isLoading: true });
        try {
          await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include',
          });
        } finally {
          localStorage.removeItem('token');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          set({ token: null, user: null, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      skipHydration: true,
    }
  )
);

export function getLegacyAuthToken() {
  return legacyUseAuthStore.getState().token;
}
