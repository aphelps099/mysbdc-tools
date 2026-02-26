'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

/* ═══════════════════════════════════════════════════════
   /login — Premium password gate
   ═══════════════════════════════════════════════════════ */

/**
 * Animated SBDC star — inline SVG that draws its stroke on mount.
 * The path traces the open-stroke 5-point star from the brand assets.
 */
function AnimatedStar() {
  return (
    <div className="login-star" aria-hidden="true">
      <svg
        viewBox="0 0 540 560"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="login-star-svg"
      >
        {/* Open-stroke 5-point star — traces the SBDC brand mark */}
        <path
          className="login-star-path"
          d="
            M 270 20
            L 330 190
            L 510 190
            L 365 305
            L 420 490
            L 270 385
            L 120 490
            L 175 305
            L 30 190
            L 210 190
          "
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

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
      {/* Animated background star */}
      <AnimatedStar />

      {/* Main content */}
      <div className="login-content">
        <div className="login-logo">
          <Image
            src="/sbdc-white-2026.png"
            alt="NorCal SBDC"
            width={180}
            height={54}
            priority
          />
        </div>

        <h1 className="login-heading">Tools</h1>

        <div className="login-divider" />

        <form onSubmit={handleSubmit} className="login-form">
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

          {error && <p className="login-error">{error}</p>}

          <button
            type="submit"
            className="login-btn"
            disabled={!password.trim() || loading}
          >
            {loading ? 'Signing in\u2026' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Contact footer */}
      <footer className="login-footer">
        <span>questions?</span>
        <span className="login-footer-sep">contact</span>
        <span className="login-footer-name">Aaron Phelps</span>
        <span className="login-footer-sep">|</span>
        <span>marketing and technology @ Norcal SBDC</span>
        <span className="login-footer-sep">|</span>
        <a href="mailto:phelps@norcalsbdc.org" className="login-footer-link">
          phelps@norcalsbdc.org
        </a>
      </footer>
    </div>
  );
}
