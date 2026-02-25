'use client';

import { useState, useEffect } from 'react';
import { fetchHealth } from '@/lib/api';
import type { HealthData } from '@/lib/api';

type Status = 'checking' | 'connected' | 'error';

export function useBackendStatus() {
  const [status, setStatus] = useState<Status>('checking');
  const [health, setHealth] = useState<HealthData | null>(null);
  const [errorDetail, setErrorDetail] = useState('');

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        console.log('[SBDC] Backend healthy:', data);
        setHealth(data);
        setStatus('connected');
      })
      .catch((err) => {
        console.error('[SBDC] Backend health check failed:', err);
        setErrorDetail(
          'Cannot reach backend. Ensure BACKEND_URL is set on the frontend Railway service.'
        );
        setStatus('error');
      });
  }, []);

  return { status, health, errorDetail };
}
