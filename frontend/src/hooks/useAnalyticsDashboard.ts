'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getToken, isTokenValid, clearToken } from '@/lib/api';

interface LLMUsage {
  total_chats: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  avg_duration_ms: number;
  estimated_cost: number;
}

export interface DashboardData {
  period_days: number;
  llm_usage: LLMUsage;
}

export function useAnalyticsDashboard(days = 30) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authExpired, setAuthExpired] = useState(false);
  const retryCount = useRef(0);

  const fetchDashboard = useCallback(async () => {
    if (days <= 0) return;

    // Pre-flight: check token validity before making the request
    if (!isTokenValid()) {
      clearToken();
      sessionStorage.removeItem('sbdc_admin');
      setAuthExpired(true);
      setError('Session expired. Redirecting to login...');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`/api/analytics/dashboard?days=${days}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 401) {
        // Token was rejected by the backend — clear everything and signal expiration
        clearToken();
        sessionStorage.removeItem('sbdc_admin');
        setAuthExpired(true);
        setError('Session expired. Redirecting to login...');
        retryCount.current = 0;
        return;
      }

      if (!res.ok) {
        // Retry transient errors (502, 503, 504) up to 2 times
        if (retryCount.current < 2 && res.status >= 500) {
          retryCount.current += 1;
          const delay = retryCount.current * 2000;
          setTimeout(() => fetchDashboard(), delay);
          return;
        }
        throw new Error(`Failed to load analytics (${res.status})`);
      }

      retryCount.current = 0;
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  // Initial fetch on mount / days change
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, authExpired, refresh: fetchDashboard };
}
