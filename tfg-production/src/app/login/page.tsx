'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

/* ═══════════════════════════════════════════════════════
   /login — Password gate
   ═══════════════════════════════════════════════════════ */

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({ error: 'Invalid password' }));
        setError(data.error || 'Invalid password');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Subtle grid overlay for tech texture */}
      <div className="login-grid" aria-hidden="true" />

      {/* Compact centered lockup */}
      <div className="login-content">
        <div className="login-badge">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M5 5V4a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>Authorized access</span>
        </div>

        <h1 className="login-heading">
          <span className="login-heading-sbdc">SBDC</span>
          <span className="login-heading-tools">Tools</span>
        </h1>

        <p className="login-sub">Enter your password to continue</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="login-input"
              autoFocus
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="submit"
              className="login-btn"
              disabled={!password.trim() || loading}
              aria-label="Sign in"
            >
              {loading ? (
                <svg className="login-spinner" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3.5 9h11M10 4.5 14.5 9 10 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}
        </form>
      </div>

      {/* Footer */}
      <footer className="login-footer">
        questions? contact <strong>Aaron Phelps</strong>
        {' '}<span className="login-footer-sep">|</span>{' '}
        marketing and technology @ Norcal SBDC
        {' '}<span className="login-footer-sep">|</span>{' '}
        <a href="mailto:phelps@norcalsbdc.org">phelps@norcalsbdc.org</a>
      </footer>
    </div>
  );
}
