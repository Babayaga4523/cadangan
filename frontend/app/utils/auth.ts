import { fetchWithAuth, getCsrf } from './api';

const API_BASE = ''; // Use relative URLs to go through Next.js proxy

function stripBOM(text: string) {
  return text.replace(/^\uFEFF/, '');
}

async function safeParseResponse(res: Response) {
  const text = await res.text();
  const clean = stripBOM(text);
  try { return JSON.parse(clean); } catch { return { raw: clean }; }
}

interface AuthResponse {
  access_token?: string;
  token?: string;
  data?: {
    access_token?: string;
  };
  user?: object;
  message?: string;
  errors?: { [key: string]: string[] };
  raw?: string;
}

export async function register(name: string, email: string, password: string, password_confirmation: string) {
  await getCsrf();
  const res = await fetch(`${API_BASE}/api/backend/register`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    credentials: 'include',
    body: JSON.stringify({ name, email, password, password_confirmation }),
  });

  const data: AuthResponse = await safeParseResponse(res);
  if (!res.ok) {
    if (data?.errors) {
      const key = Object.keys(data.errors)[0];
      throw new Error(data.errors[key][0]);
    }
    throw new Error(data?.message || (data?.raw ?? 'Registration failed'));
  }

  if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));
  
  // Handle both Bearer token and session-based auth
  const token = data?.access_token || data?.token || data?.data?.access_token;
  if (token) {
    localStorage.setItem('token', token);
  } else if (res.ok) {
    // If no token but response is ok, we're using session auth
    localStorage.setItem('token', 'session');
  }
  return data;
}

export async function login(email: string, password: string) {
  // Skip CSRF token for API login since we're using token-based auth
  // await getCsrf();
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data: AuthResponse = await safeParseResponse(res);
  if (!res.ok) {
    if (data?.errors) {
      const key = Object.keys(data.errors)[0];
      throw new Error(data.errors[key][0]);
    }
    throw new Error(data?.message || (data?.raw ?? 'Login failed'));
  }

  if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));
  
  // Handle both Bearer token and session-based auth
  const token = data?.access_token || data?.token || data?.data?.access_token;
  if (token) {
    localStorage.setItem('token', token);
  } else if (res.ok) {
    // If no token but response is ok, we're using session auth
    localStorage.setItem('token', 'session');
  }
  return data;
}

export async function logout() {
  try {
    await fetchWithAuth('/logout', { method: 'POST' });
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function getToken() {
  return localStorage.getItem('token');
}

export function isAuthenticated() {
  return !!getToken();
}