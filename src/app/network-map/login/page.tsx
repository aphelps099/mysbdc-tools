'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/* ═══════════════════════════════════════════════════════
   /network-map/login — standalone gate for the Network Map.
   The map-only password issues a session scoped to just
   /network-map (see middleware.ts + /api/auth/session), so
   this link can be shared without exposing the toolbox.
   ═══════════════════════════════════════════════════════ */

const SERIF = "'proxima-sera', Georgia, 'Times New Roman', serif";
const SANS = "'proxima-nova', -apple-system, system-ui, 'Segoe UI', sans-serif";

export default function NetworkMapLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Load the NorCal Adobe Fonts kit (Proxima Sera + Proxima Nova).
  useEffect(() => {
    const id = 'nm-typekit';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://use.typekit.net/pkl5rjs.css';
    document.head.appendChild(link);
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(data.redirect || '/network-map');
        router.refresh();
      } else {
        setError('That password didn’t work.');
        setBusy(false);
      }
    } catch {
      setError('Something went wrong — please try again.');
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F7F4EE',
        padding: 24,
        fontFamily: SANS,
      }}
    >
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#B5473C',
            marginBottom: 14,
          }}
        >
          NorCal SBDC
        </div>

        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: 'clamp(44px, 9vw, 72px)',
            lineHeight: 1.02,
            letterSpacing: '-0.01em',
            color: '#16233A',
            margin: '0 0 14px',
          }}
        >
          Network Map
        </h1>

        <p
          style={{
            fontFamily: SERIF,
            fontSize: 18,
            fontStyle: 'italic',
            color: '#5a6873',
            margin: '0 0 34px',
          }}
        >
          Enter the password to view the map.
        </p>

        <input
          type="password"
          value={password}
          autoFocus
          autoComplete="current-password"
          placeholder="Password"
          aria-label="Map password"
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '15px 18px',
            fontSize: 17,
            fontFamily: SANS,
            color: '#16233A',
            background: '#ffffff',
            border: '1px solid ' + (error ? '#B5473C' : '#e3ded4'),
            borderRadius: 12,
            outline: 'none',
            textAlign: 'center',
          }}
        />

        <button
          type="submit"
          disabled={busy || !password}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '15px 18px',
            fontSize: 16,
            fontWeight: 600,
            fontFamily: SANS,
            color: '#ffffff',
            background: busy || !password ? '#8ea0bd' : '#2B5EA7',
            border: 'none',
            borderRadius: 12,
            cursor: busy || !password ? 'default' : 'pointer',
            transition: 'background .15s ease',
          }}
        >
          {busy ? 'Opening…' : 'View the map'}
        </button>

        <p
          style={{
            height: 20,
            margin: '16px 0 0',
            fontSize: 14,
            color: '#B5473C',
            fontFamily: SANS,
            opacity: error ? 1 : 0,
            transition: 'opacity .15s ease',
          }}
          role="alert"
        >
          {error || ' '}
        </p>
      </form>
    </div>
  );
}
