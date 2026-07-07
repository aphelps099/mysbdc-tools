'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/* ═══════════════════════════════════════════════════════
   /motion/tfg/login — direct-access gate for TFG Motion
   Lets the studio be shared as a standalone link with its
   own password; the session it creates is scoped to
   /motion/tfg only (see middleware.ts).
   ═══════════════════════════════════════════════════════ */

export default function TFGMotionLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        router.push(data.redirect || '/motion/tfg');
        router.refresh();
      } else {
        setError(data.error || 'Invalid password');
        setBusy(false);
      }
    } catch {
      setError('Something went wrong — try again.');
      setBusy(false);
    }
  };

  return (
    <div
      className="h-dvh flex items-center justify-center"
      style={{ background: '#0a0a0a' }}
    >
      <form onSubmit={submit} className="flex flex-col items-center" style={{ width: 320 }}>
        {/* Ring mark */}
        <span
          aria-hidden
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '6px solid #4EFF00',
            display: 'inline-block',
            filter: 'drop-shadow(0 0 14px rgba(78,255,0,0.4))',
            marginBottom: 22,
          }}
        />
        <h1
          className="uppercase text-center"
          style={{
            fontFamily: "'Michroma', sans-serif",
            fontSize: 15,
            letterSpacing: '0.22em',
            color: '#f2f2ef',
            marginBottom: 6,
          }}
        >
          TFG <span style={{ color: '#4EFF00' }}>Motion</span>
        </h1>
        <p
          className="uppercase text-center"
          style={{
            fontFamily: "'GT America Extended', sans-serif",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: '#6e7671',
            marginBottom: 28,
          }}
        >
          tech futures group · motion studio
        </p>

        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full outline-none"
          style={{
            fontFamily: "'GT America Extended', sans-serif",
            fontSize: 14,
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.12)',
            background: '#161616',
            color: '#f2f2ef',
            textAlign: 'center',
            letterSpacing: '0.06em',
          }}
        />

        <button
          type="submit"
          disabled={busy || !password}
          className="w-full uppercase"
          style={{
            fontFamily: "'GT America Extended', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            marginTop: 12,
            padding: '12px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#4EFF00',
            color: '#0a0a0a',
            cursor: busy || !password ? 'default' : 'pointer',
            opacity: busy || !password ? 0.5 : 1,
            transition: 'opacity 150ms ease',
          }}
        >
          {busy ? 'Checking…' : 'Enter Studio'}
        </button>

        <p
          style={{
            fontFamily: "'GT America Extended', sans-serif",
            fontSize: 11,
            color: error ? '#ff6b81' : 'transparent',
            marginTop: 14,
            minHeight: 16,
            textAlign: 'center',
          }}
        >
          {error || '·'}
        </p>
      </form>
    </div>
  );
}
