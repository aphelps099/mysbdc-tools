'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

/* ── Animation helpers ── */
const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
const fadeUp = (delay: number, dur = 0.5) =>
  `policyFadeUp ${dur}s ${ease} ${delay}s both`;
const lineExpand = (delay: number) =>
  `policyLineExpand 0.6s ${ease} ${delay}s both`;

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    const success = await signIn(password);
    if (success) {
      window.location.href = '/chat';
    }
  };

  /* Timing cascade */
  const t = {
    logo: 0.05,
    title: 0.2,
    subtitle: 0.35,
    line: 0.4,
    input: 0.5,
    button: 0.6,
    footer: 0.8,
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6" style={{ background: '#0c1929' }}>
      <div className="w-full max-w-[380px] flex flex-col items-center">
        {/* ─── Logo ─── */}
        <div style={{ opacity: 0, animation: fadeUp(t.logo, 0.6) }}>
          <Image
            src="/sbdc-white-2026.png"
            alt="NorCal SBDC"
            width={100}
            height={40}
            className="object-contain"
            priority
          />
        </div>

        {/* ─── Title ─── */}
        <h1
          className="mt-10 text-[28px] font-bold tracking-[-0.02em] text-center"
          style={{
            fontFamily: 'var(--display)',
            color: '#ffffff',
            opacity: 0,
            animation: fadeUp(t.title),
          }}
        >
          SBDC Advisor AI
        </h1>
        <p
          className="mt-2 text-[14px] font-light text-center"
          style={{
            fontFamily: 'var(--sans)',
            color: 'rgba(255,255,255,0.35)',
            opacity: 0,
            animation: fadeUp(t.subtitle),
          }}
        >
          Sign in to continue
        </p>

        {/* ─── Divider line ─── */}
        <div
          className="w-full mt-8 mb-8"
          style={{
            height: 1,
            background: 'rgba(255,255,255,0.08)',
            transformOrigin: 'left',
            animation: lineExpand(t.line),
          }}
        />

        {/* ─── Form ─── */}
        <form onSubmit={handleSubmit} className="w-full" style={{ opacity: 0, animation: fadeUp(t.input) }}>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Access code"
              autoFocus
              className="
                w-full h-12 pl-11 pr-11
                text-[14px] font-[var(--sans)] font-light
                text-white
                rounded-[var(--radius-md)]
                placeholder:text-white/25
                focus:outline-none focus:border-[rgba(255,255,255,0.25)] focus:bg-white/[0.08]
                transition-all duration-[var(--duration-fast)]
              "
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.2)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; }}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              )}
            </button>
          </div>

          {error && (
            <p
              className="mt-3 text-[13px] font-[var(--sans)] flex items-center gap-1.5"
              style={{ color: '#f87171' }}
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            className="
              w-full h-12 mt-4
              text-[14px] font-[var(--sans)] font-medium text-white
              bg-[var(--royal)]
              rounded-[var(--radius-md)]
              hover:bg-[#1a4f96] active:bg-[#164282]
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-colors duration-[var(--duration-fast)]
              cursor-pointer
            "
            style={{ opacity: 0, animation: fadeUp(t.button) }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* ─── Footer ─── */}
        <div className="mt-12 text-center" style={{ opacity: 0, animation: fadeUp(t.footer) }}>
          <p className="text-[11px] font-[var(--mono)] tracking-[0.08em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Questions?{' '}
            <a
              href="mailto:phelps@norcalsbdc.org"
              className="transition-colors duration-150"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
            >
              phelps@norcalsbdc.org
            </a>
          </p>
          <p className="mt-2 text-[10px] font-[var(--mono)] tracking-[0.06em]" style={{ color: 'rgba(255,255,255,0.12)' }}>
            NorCal SBDC &middot; Prototype
          </p>
        </div>
      </div>
    </div>
  );
}
