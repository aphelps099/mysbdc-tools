/* ═══════════════════════════════════════════════════════
   Partnership CRM — usage tracking beacon.
   Fire-and-forget: uses sendBeacon so events survive tab
   closes, falls back to keepalive fetch, and never throws
   into the UI.
   ═══════════════════════════════════════════════════════ */

export function track(event: string, meta?: Record<string, string | number>): void {
  try {
    const body = JSON.stringify({ event, meta });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/track', new Blob([body], { type: 'application/json' }));
      return;
    }
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* analytics must never break the app */
  }
}
