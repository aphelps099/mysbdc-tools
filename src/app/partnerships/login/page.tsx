'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/* ═══════════════════════════════════════════════════════
   /partnerships/login — standalone gate for the CRM.
   The CRM-only password issues a session scoped to just
   /partnerships (see middleware.ts + /api/auth/session),
   so this link can be shared without exposing the toolbox.
   Styled with the FAV NorCal SBDC tokens (Typekit kit is
   loaded globally in the root layout).
   ═══════════════════════════════════════════════════════ */

const SERA = "'proxima-sera', Georgia, 'Times New Roman', serif";
const NOVA = "'proxima-nova', Arial, Helvetica, sans-serif";

export default function PartnershipsLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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
        router.push(data.redirect || '/partnerships');
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
        minHeight: '100vh',
        background: '#fdfdfd',
        color: '#0f1c2d',
        fontFamily: NOVA,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fdfdfd',
          border: '1px solid #0f1c2d29',
          borderTop: '5px solid #c23c3c',
          borderRadius: 5,
          padding: '38px 38px 42px',
        }}
      >
        <p
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '0 0 18px',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '.17em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ width: 33, height: 3, background: '#c23c3c' }} />
          NorCal SBDC Network
        </p>
        <h1
          style={{
            margin: 0,
            fontFamily: SERA,
            fontWeight: 400,
            fontSize: 40,
            letterSpacing: '-.04em',
            lineHeight: 1.02,
          }}
        >
          Partnership CRM
        </h1>
        <p style={{ margin: '14px 0 26px', fontSize: 14, lineHeight: 1.55, color: '#2c3240' }}>
          Enter the password to open the partnerships workspace.
        </p>
        <label style={{ display: 'block' }}>
          <span
            style={{
              display: 'block',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '.13em',
              textTransform: 'uppercase',
              color: '#687080',
              marginBottom: 7,
            }}
          >
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              minHeight: 43,
              fontFamily: NOVA,
              fontSize: 15,
              fontWeight: 500,
              color: '#0f1c2d',
              background: '#fdfdfd',
              border: '1px solid #0f1c2d29',
              borderRadius: 4,
              padding: '11px 13px',
              boxSizing: 'border-box',
            }}
          />
        </label>
        {error && (
          <p style={{ margin: '12px 0 0', fontSize: 13, fontWeight: 700, color: '#c23c3c' }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          style={{
            marginTop: 20,
            width: '100%',
            height: 50,
            border: 'none',
            borderRadius: 4,
            background: busy ? '#144b8c' : '#1b5faf',
            color: '#fff',
            fontFamily: NOVA,
            fontSize: 15,
            fontWeight: 700,
            cursor: busy ? 'default' : 'pointer',
            transition: 'background .18s',
          }}
        >
          {busy ? 'Checking' : 'Open the CRM'}
        </button>
      </form>
    </div>
  );
}
