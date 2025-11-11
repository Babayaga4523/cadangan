'use client';

import { useEffect } from 'react';
import { useAuthStore } from './auth';

export function AuthHydration() {
  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return;

    // Only hydrate if we don't already have auth state
    const currentUser = useAuthStore.getState().user;
    const currentToken = useAuthStore.getState().token;

    if (currentUser || currentToken) {
      return; // Already hydrated
    }

    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (userStr && token) {
        const user = JSON.parse(userStr);
        useAuthStore.getState().setUser(user);
        useAuthStore.getState().setToken(token);
      }
    } catch (e) {
      console.error('Failed to hydrate auth state:', e);
      // Clear potentially corrupted data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []); // Empty dependency array - only run once

  return null;
}