'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, clearToken, isTokenValid } from '@/lib/api';
import { useAnalyticsDashboard } from '@/hooks/useAnalyticsDashboard';
import Image from 'next/image';

/* ── Animation helpers ── */
const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
const fadeUp = (delay: number, dur = 0.5) =>
  `policyFadeUp ${dur}s ${ease} ${delay}s both`;
const lineExpand = (delay: number) =>
  `policyLineExpand 0.6s ${ease} ${delay}s both`;

/* ── Colors ── */
const c = {
  bg: '#0c1929',
  card: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(255,255,255,0.08)',
  white: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.6)',
  textMuted: 'rgba(255,255,255,0.35)',
  textFaint: 'rgba(255,255,255,0.18)',
  rule: 'rgba(255,255,255,0.08)',
  royal: '#1D5AA7',
  pool: '#8FC5D9',
  green: '#34d399',
  amber: '#fbbf24',
  red: '#f87171',
  purple: '#a78bfa',
};

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

export default function DashboardPage() {
  const router = useRouter();
  const [days, setDays] = useState(30);
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { data, loading, error, authExpired, refresh } = useAnalyticsDashboard(authed ? days : 0);

  // Redirect to login when the hook detects an expired token
  useEffect(() => {
    if (authExpired) {
      const timer = setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [authExpired]);

  useEffect(() => {
    // Validate the JWT itself — not just its presence
    if (!isTokenValid()) {
      clearToken();
      sessionStorage.removeItem('sbdc_admin');
      window.location.href = '/login';
      return;
    }
    if (sessionStorage.getItem('sbdc_admin') === '1') {
      setAuthed(true);
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassError('');
    try {
      const token = getToken();
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ password: passInput }),
      });
      if (res.ok) {
        sessionStorage.setItem('sbdc_admin', '1');
        setAuthed(true);
      } else if (res.status === 429) {
        setPassError('Too many attempts. Wait a minute.');
      } else if (res.status === 401) {
        // Could be bad password or expired JWT — check
        const body = await res.json().catch(() => null);
        const detail = body?.detail || '';
        if (detail === 'Unauthorized') {
          setPassError('Session expired. Redirecting to login...');
          setTimeout(() => { clearToken(); window.location.href = '/login'; }, 1500);
        } else {
          setPassError('Incorrect password');
        }
      } else {
        setPassError('Something went wrong. Try again.');
      }
    } catch {
      setPassError('Connection error');
    } finally {
      setPassLoading(false);
    }
  };

  // ─── Password Gate ───
  if (!authed) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-6" style={{ background: c.bg }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div style={{ opacity: 0, animation: fadeUp(0.05, 0.6) }}>
              <Image
                src="/sbdc-white-2026.png"
                alt="NorCal SBDC"
                width={100}
                height={40}
                className="object-contain mx-auto mb-8"
                priority
              />
            </div>
            <div className="flex items-center justify-center gap-2.5 mb-3" style={{ opacity: 0, animation: fadeUp(0.2) }}>
              <svg className="w-4 h-4" style={{ color: c.textMuted }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <h1
                className="text-[20px] font-bold tracking-[-0.01em]"
                style={{ fontFamily: 'var(--display)', color: c.white }}
              >
                Admin Analytics
              </h1>
            </div>
            <p className="text-[13px] font-[var(--sans)]" style={{ color: c.textMuted, opacity: 0, animation: fadeUp(0.3) }}>
              Enter the admin password to access the dashboard.
            </p>
          </div>

          <div style={{ height: 1, background: c.rule, transformOrigin: 'left', animation: lineExpand(0.35) }} />

          <form onSubmit={handleAdminLogin} className="mt-6" style={{ opacity: 0, animation: fadeUp(0.45) }}>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passInput}
                onChange={(e) => { setPassInput(e.target.value); setPassError(''); }}
                placeholder="Admin password"
                autoFocus
                className="w-full px-4 py-3 pr-11 rounded-[var(--radius-md)] text-[14px] font-[var(--mono)] placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors text-white"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${c.cardBorder}` }}
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
            {passError && (
              <p className="mt-2 text-[12px] font-[var(--mono)] flex items-center gap-1.5" style={{ color: c.red }}>
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                {passError}
              </p>
            )}
            <button
              type="submit"
              disabled={passLoading}
              className="w-full mt-4 px-4 py-3 bg-[var(--royal)] text-white rounded-[var(--radius-md)] font-[var(--sans)] font-medium text-[14px] hover:bg-[#1a4f96] transition-colors cursor-pointer disabled:opacity-40"
            >
              {passLoading ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>
          <button
            onClick={() => router.push('/chat')}
            className="w-full mt-4 text-center text-[11px] font-[var(--mono)] tracking-[0.08em] uppercase transition-colors cursor-pointer"
            style={{ color: c.textMuted, opacity: 0, animation: fadeUp(0.55) }}
            onMouseEnter={(e) => { e.currentTarget.style.color = c.textSecondary; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = c.textMuted; }}
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: c.bg }}>
      {/* ─── Header ─── */}
      <header className="px-6 py-5 shrink-0" style={{ borderBottom: `1px solid ${c.rule}` }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/sbdc-white-2026.png"
              alt="NorCal SBDC"
              width={80}
              height={32}
              className="object-contain"
              priority
            />
            <div className="h-5 w-px" style={{ background: c.rule }} />
            <h1
              className="text-[18px] font-bold tracking-[-0.01em]"
              style={{ fontFamily: 'var(--display)', color: c.white }}
            >
              Analytics
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/chat')}
              className="px-3 py-1.5 text-[11px] font-[var(--mono)] tracking-[0.08em] uppercase rounded-[var(--radius-sm)] transition-colors cursor-pointer"
              style={{ color: c.textMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.color = c.white; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = c.textMuted; e.currentTarget.style.background = 'transparent'; }}
            >
              Back to Chat
            </button>
            <button
              onClick={() => { clearToken(); window.location.href = '/login'; }}
              className="px-3 py-1.5 text-[11px] font-[var(--mono)] tracking-[0.08em] uppercase rounded-[var(--radius-sm)] transition-colors cursor-pointer"
              style={{ color: c.textFaint }}
              onMouseEnter={(e) => { e.currentTarget.style.color = c.red; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = c.textFaint; }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ─── Content ─── */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Controls */}
          <div className="flex items-center justify-between mb-8" style={{ opacity: 0, animation: fadeUp(0.1) }}>
            <div>
              <p className="text-[10px] font-[var(--mono)] tracking-[0.12em] uppercase mb-1" style={{ color: c.textMuted }}>
                Dashboard
              </p>
              <h2
                className="text-[26px] font-bold tracking-[-0.02em]"
                style={{ fontFamily: 'var(--display)', color: c.white }}
              >
                LLM Usage
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              {[7, 14, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className="px-3 py-1.5 text-[12px] font-[var(--mono)] tracking-wider rounded-[var(--radius-sm)] transition-all cursor-pointer"
                  style={{
                    background: days === d ? c.royal : 'rgba(255,255,255,0.04)',
                    color: days === d ? c.white : c.textMuted,
                    border: `1px solid ${days === d ? c.royal : c.cardBorder}`,
                  }}
                >
                  {d}d
                </button>
              ))}
              <button
                onClick={refresh}
                className="ml-2 p-1.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                style={{ color: c.textMuted }}
                onMouseEnter={(e) => { e.currentTarget.style.color = c.white; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = c.textMuted; }}
                title="Refresh"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: c.rule, borderTopColor: c.pool }} />
                <p className="text-[14px] font-[var(--sans)] font-light" style={{ color: c.textMuted }}>
                  Loading analytics...
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !authExpired && (
            <div className="px-5 py-4 rounded-[var(--radius-md)] mb-6 flex items-center justify-between gap-4" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0" style={{ color: c.red }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <p className="text-[14px]" style={{ color: c.red }}>{error}</p>
              </div>
              <button
                onClick={refresh}
                className="px-3 py-1.5 text-[11px] font-[var(--mono)] tracking-[0.08em] uppercase rounded-[var(--radius-sm)] transition-colors cursor-pointer shrink-0"
                style={{ color: c.white, background: 'rgba(255,255,255,0.08)', border: `1px solid ${c.cardBorder}` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                Retry
              </button>
            </div>
          )}

          {data && !loading && (
            <>
              {/* ─── LLM Usage KPI Cards ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" style={{ opacity: 0, animation: fadeUp(0.15) }}>
                <KPICard icon={<path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.2 48.2 0 0 0 5.887-.37c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />} iconColor={c.pool} label="Total Chats" value={data.llm_usage.total_chats.toLocaleString()} />
                <KPICard icon={<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />} iconColor={c.purple} label="Tokens Used" value={formatTokens(data.llm_usage.total_tokens)} />
                <KPICard icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />} iconColor={c.green} label="Est. Cost" value={`$${data.llm_usage.estimated_cost.toFixed(2)}`} />
              </div>

              {/* ─── Token Breakdown ─── */}
              <div
                className="rounded-xl p-6 mb-8"
                style={{ background: c.card, border: `1px solid ${c.cardBorder}`, opacity: 0, animation: fadeUp(0.2) }}
              >
                <h3 className="text-[11px] font-[var(--mono)] tracking-[0.1em] uppercase mb-5" style={{ color: c.textMuted }}>
                  Token Breakdown
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <TokenStat label="Input Tokens" value={formatTokens(data.llm_usage.input_tokens)} color={c.pool} />
                  <TokenStat label="Output Tokens" value={formatTokens(data.llm_usage.output_tokens)} color={c.purple} />
                  <TokenStat label="Avg Latency" value={data.llm_usage.avg_duration_ms > 0 ? `${(data.llm_usage.avg_duration_ms / 1000).toFixed(1)}s` : '—'} color={c.amber} />
                </div>

                {/* Usage bar */}
                {data.llm_usage.total_tokens > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2 text-[10px] font-[var(--mono)]" style={{ color: c.textFaint }}>
                      <span>Input ({Math.round(data.llm_usage.input_tokens / data.llm_usage.total_tokens * 100)}%)</span>
                      <span>Output ({Math.round(data.llm_usage.output_tokens / data.llm_usage.total_tokens * 100)}%)</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-l-full"
                        style={{
                          width: `${(data.llm_usage.input_tokens / data.llm_usage.total_tokens) * 100}%`,
                          background: c.pool,
                        }}
                      />
                      <div
                        className="h-full rounded-r-full"
                        style={{
                          width: `${(data.llm_usage.output_tokens / data.llm_usage.total_tokens) * 100}%`,
                          background: c.purple,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ─── ATLAS Impact Dashboard Link ─── */}
              <div
                className="rounded-xl p-6 mb-8"
                style={{ background: c.card, border: `1px solid ${c.cardBorder}`, opacity: 0, animation: fadeUp(0.21) }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.pool}18` }}>
                      <svg className="w-4 h-4" style={{ color: c.pool }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[13px] font-[var(--sans)] font-medium" style={{ color: c.white }}>
                        ATLAS — Impact Dashboard
                      </p>
                      <p className="text-[12px] font-[var(--sans)]" style={{ color: c.textMuted }}>
                        Real-time aggregate impact: capital accessed, jobs created, businesses started, revenue growth
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/atlas')}
                    className="px-4 py-2 text-[11px] font-[var(--mono)] tracking-[0.08em] uppercase rounded-[var(--radius-sm)] transition-colors shrink-0 cursor-pointer"
                    style={{ color: c.white, background: c.royal }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#1a4f96'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = c.royal; }}
                  >
                    Open ATLAS
                  </button>
                </div>
              </div>

              {/* ─── Milestone Log Link ─── */}
              <div
                className="rounded-xl p-6 mb-8"
                style={{ background: c.card, border: `1px solid ${c.cardBorder}`, opacity: 0, animation: fadeUp(0.23) }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.green}18` }}>
                      <svg className="w-4 h-4" style={{ color: c.green }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[13px] font-[var(--sans)] font-medium" style={{ color: c.white }}>
                        Milestone Submission Log
                      </p>
                      <p className="text-[12px] font-[var(--sans)]" style={{ color: c.textMuted }}>
                        View 14-day history of milestone form submissions, records created, and errors
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/milestone-log')}
                    className="px-4 py-2 text-[11px] font-[var(--mono)] tracking-[0.08em] uppercase rounded-[var(--radius-sm)] transition-colors shrink-0 cursor-pointer"
                    style={{ color: c.white, background: c.royal }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#1a4f96'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = c.royal; }}
                  >
                    View Log
                  </button>
                </div>
              </div>

              {/* Footer note */}
              <p className="text-center text-[10px] font-[var(--mono)] tracking-[0.04em] mt-4 mb-8" style={{ color: c.textFaint }}>
                LLM costs tracked locally.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


// ── Reusable KPI Card ───────────────────────────────────────

function KPICard({ icon, iconColor, label, value }: {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${iconColor}18` }}
        >
          <svg className="w-4 h-4" style={{ color: iconColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {icon}
          </svg>
        </div>
        <p className="text-[11px] font-[var(--mono)] tracking-[0.08em] uppercase" style={{ color: c.textMuted }}>
          {label}
        </p>
      </div>
      <p
        className="text-[32px] font-bold leading-none tracking-[-0.02em]"
        style={{ fontFamily: 'var(--display)', color: c.white }}
      >
        {value}
      </p>
    </div>
  );
}


// ── Token stat row ───────────────────────────────────────

function TokenStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-[10px] font-[var(--mono)] tracking-[0.1em] uppercase mb-1.5" style={{ color: c.textFaint }}>
        {label}
      </p>
      <p className="text-[22px] font-bold tracking-[-0.02em]" style={{ fontFamily: 'var(--display)', color }}>
        {value}
      </p>
    </div>
  );
}
