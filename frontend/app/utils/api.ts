const API_BASE = ''; // Use relative URLs to go through Next.js proxy

export async function getCsrf() {
  const response = await fetch(`/api/sanctum/csrf-cookie`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get CSRF token');
  }
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Backwards-compatible helper: return parsed JSON on success, throw on non-ok
  const res = await fetchWithAuthRaw(endpoint, options);
  if (!res.ok) {
    // Try to read body for a helpful message
    const txt = await res.text().catch(() => '');
    throw new Error(`HTTP error! status: ${res.status} ${txt}`);
  }
  // Parse JSON if possible
  const data = await res.json().catch(() => null);
  return data;
}

export async function fetchWithAuthRaw(endpoint: string, options: RequestInit = {}) {
  try {
    // Support both legacy 'token' and newer 'auth_token' keys; default to 'session' (Sanctum cookie-only)
    const token = localStorage.getItem('token')
      || localStorage.getItem('auth_token')
      || 'session';

    // Build headers - only add Authorization if we have a real token (not "session")
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(options.headers as Record<string, string> || {}),
    };

    // Only set Content-Type to application/json if body is not FormData
    // FormData needs browser to set Content-Type with proper boundary
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Only add Bearer token if it's not the "session" placeholder
    if (token !== 'session') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add /api prefix to endpoint if it doesn't already have it
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const response = await fetch(`${API_BASE}${cleanEndpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Always include credentials for session-based auth
    });

    if (response.status === 401) {
      // Clear all known auth storages
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication expired');
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...(options.credentials ? { credentials: options.credentials } : {}),
  });

  return response;
}

export { API_BASE };