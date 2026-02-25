'use client';

import { useEffect, useRef } from 'react';

const HEARTBEAT_INTERVAL = 60_000; // 60 seconds
const MAX_INTERVAL = 5 * 60_000;   // 5 minutes — back off when backend is down
const SESSION_KEY = 'sbdc_session_id';

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Sends periodic heartbeats to /api/analytics/heartbeat.
 * Fires immediately on mount, then every 60 s.
 * Backs off to 5-minute intervals after consecutive failures
 * to avoid flooding logs when the backend is unreachable.
 * Uses sessionStorage so each browser tab = one session.
 */
export function useAnalytics() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let failures = 0;
    let currentInterval = HEARTBEAT_INTERVAL;

    const schedule = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(beat, currentInterval);
    };

    const beat = () => {
      fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, timezone: tz }),
        keepalive: true,
      })
        .then((res) => {
          if (res.ok) {
            // Reset backoff on success
            if (failures > 0) {
              failures = 0;
              currentInterval = HEARTBEAT_INTERVAL;
              schedule();
            }
          } else {
            failures++;
          }
        })
        .catch(() => {
          failures++;
          // After 3 consecutive failures, back off to avoid log spam
          if (failures >= 3 && currentInterval < MAX_INTERVAL) {
            currentInterval = MAX_INTERVAL;
            schedule();
          }
        });
    };

    // First beat immediately
    beat();
    schedule();

    // Final beat on tab close
    const onUnload = () => beat();
    window.addEventListener('beforeunload', onUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, []);
}
