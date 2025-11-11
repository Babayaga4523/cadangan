"use client";
import { create } from 'zustand';
import axios from 'axios';

// Configure axios for CORS
axios.defaults.baseURL = ''; // Use relative URLs to go through Next.js proxy
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['Accept'] = 'application/json';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'siswa';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export type { AuthState };

// Check if we're on the server side (SSR)
const isServer = typeof window === 'undefined';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  setUser: (user: User | null) => {
    if (!isServer) {
      set({ user });
    }
  },

  setToken: (token: string | null) => {
    if (!isServer) {
      set({ token });
    }
  },

  login: async (email: string, password: string) => {
    if (isServer) return;

    set({ isLoading: true, error: null });

    try {
      const response = await axios.post('/api/login', {
        email,
        password,
      }, {
        withCredentials: true,
      });

      const responseData = response.data;
      const user = responseData.user;
      const token = responseData.token || responseData.access_token;

      if (!user || !user.role) {
        throw new Error('Invalid login response');
      }

      if (token) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      set({
        user,
        token: token || 'session',
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  logout: () => {
    if (isServer) return;

    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    if (isServer) return;

    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token });
        return;
      } catch {
        // Invalid stored data
      }
    }

    // If no valid stored data, try to get from API
    try {
      const response = await axios.get('/api/me', {
        withCredentials: true,
      });
      const user = response.data;
      set({ user, token: token || 'session' });
    } catch {
      set({ user: null, token: null });
    }
  },
}));