'use client';

import { useState } from 'react';
import { login as apiLogin, setToken, clearToken, getToken } from '@/lib/api';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signIn = async (password: string): Promise<boolean> => {
    setError('');
    setLoading(true);
    try {
      const { token } = await apiLogin(password);
      setToken(token);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    clearToken();
    window.location.href = '/login';
  };

  const isAuthenticated = () => !!getToken();

  return { signIn, signOut, isAuthenticated, loading, error };
}
