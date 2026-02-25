'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, clearToken, isTokenValid } from '@/lib/api';
import Image from 'next/image';

/* ── Animation helpers (match dashboard) ── */
const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
const fadeUp = (delay: number, dur = 0.5) =>
  `policyFadeUp ${dur}s ${ease} ${delay}s both`;
const lineExpand = (delay: number) =>
  `policyLineExpand 0.6s ${ease} ${delay}s both`;

/* ── Colors (match dashboard) ── */
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

/* ── Types ── */
interface MilestoneEntry {
  id: number;
  timestamp: string;
  name: string;
  email: string;
  clientId: string;
  clientPublicId: string;
  clientName: string;
  centerId: string | null;
  counselorId: string | null;
  program: string | null;
  categories: string[];
  recordsCreated: number;
  errors: string[];
  details: { type: string; status: string }[];
  signature: string;
  emailNotifications: Record<string, string>;
}

interface LogResponse {
  count: number;
  days: number;
  smtp_configured: boolean;
  submissions: MilestoneEntry[];
  error?: string;
}

/* ── Helpers ── */
function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function relativeTime(iso: string): string {
  try {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diffMin = Math.floor((now - then) / 60_000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  } catch {
    return '';
  }
}

const categoryLabels: Record<string, string> = {
  employees: 'Employees',
  sales: 'Sales',
  new_business: 'New Business',
  capital: 'Capital',
  testimonial: 'Testimonial',
};

export default function MilestoneLogPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [days, setDays] = useState(14);
  const [data, setData] = useState<LogResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  // Auth check
  useEffect(() => {
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

  // Fetch log data
  const fetchLog = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      const res = await fetch(`/api/milestones/log?days=${days}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: LogResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load log');
    } finally {
      setLoading(false);
    }
  }, [authed, days]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  // Admin password gate
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

  // Filter submissions by search
  const filtered = data?.submissions.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.clientName.toLowerCase().includes(q) ||
      s.clientPublicId.toLowerCase().includes(q)
    );
  }) ?? [];

  // Stats
  const totalRecords = filtered.reduce((n, s) => n + s.recordsCreated, 0);
  const withErrors = filtered.filter((s) => s.errors.length > 0).length;

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
                Milestone Log
              </h1>
            </div>
            <p className="text-[13px] font-[var(--sans)]" style={{ color: c.textMuted, opacity: 0, animation: fadeUp(0.3) }}>
              Enter the admin password to view submission history.
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
              {passLoading ? 'Verifying...' : 'View Log'}
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

  // ─── Main View ───
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
              Milestone Log
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-3 py-1.5 text-[11px] font-[var(--mono)] tracking-[0.08em] uppercase rounded-[var(--radius-sm)] transition-colors cursor-pointer"
              style={{ color: c.textMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.color = c.white; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = c.textMuted; e.currentTarget.style.background = 'transparent'; }}
            >
              Dashboard
            </button>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8" style={{ opacity: 0, animation: fadeUp(0.1) }}>
            <div>
              <p className="text-[10px] font-[var(--mono)] tracking-[0.12em] uppercase mb-1" style={{ color: c.textMuted }}>
                Submissions
              </p>
              <h2
                className="text-[26px] font-bold tracking-[-0.02em]"
                style={{ fontFamily: 'var(--display)', color: c.white }}
              >
                Milestone History
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: c.textFaint }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, client..."
                  className="pl-9 pr-3 py-1.5 text-[12px] font-[var(--mono)] rounded-[var(--radius-sm)] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors w-56"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${c.cardBorder}` }}
                />
              </div>
              {/* Day filter */}
              <div className="flex items-center gap-1.5">
                {[7, 14, 30].map((d) => (
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
              </div>
              {/* Refresh */}
              <button
                onClick={fetchLog}
                className="p-1.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer"
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

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" style={{ opacity: 0, animation: fadeUp(0.15) }}>
            <div className="rounded-xl p-5" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.pool}18` }}>
                  <svg className="w-4 h-4" style={{ color: c.pool }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <p className="text-[11px] font-[var(--mono)] tracking-[0.08em] uppercase" style={{ color: c.textMuted }}>
                  Submissions
                </p>
              </div>
              <p className="text-[32px] font-bold leading-none tracking-[-0.02em]" style={{ fontFamily: 'var(--display)', color: c.white }}>
                {filtered.length}
              </p>
            </div>
            <div className="rounded-xl p-5" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.green}18` }}>
                  <svg className="w-4 h-4" style={{ color: c.green }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <p className="text-[11px] font-[var(--mono)] tracking-[0.08em] uppercase" style={{ color: c.textMuted }}>
                  Records Created
                </p>
              </div>
              <p className="text-[32px] font-bold leading-none tracking-[-0.02em]" style={{ fontFamily: 'var(--display)', color: c.green }}>
                {totalRecords}
              </p>
            </div>
            <div className="rounded-xl p-5" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${withErrors > 0 ? c.red : c.green}18` }}>
                  <svg className="w-4 h-4" style={{ color: withErrors > 0 ? c.red : c.green }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
                <p className="text-[11px] font-[var(--mono)] tracking-[0.08em] uppercase" style={{ color: c.textMuted }}>
                  With Errors
                </p>
              </div>
              <p className="text-[32px] font-bold leading-none tracking-[-0.02em]" style={{ fontFamily: 'var(--display)', color: withErrors > 0 ? c.red : c.green }}>
                {withErrors}
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: c.rule, borderTopColor: c.pool }} />
                <p className="text-[14px] font-[var(--sans)] font-light" style={{ color: c.textMuted }}>
                  Loading submissions...
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="px-5 py-4 rounded-[var(--radius-md)] mb-6 flex items-center justify-between gap-4" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0" style={{ color: c.red }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <p className="text-[14px]" style={{ color: c.red }}>{error}</p>
              </div>
              <button
                onClick={fetchLog}
                className="px-3 py-1.5 text-[11px] font-[var(--mono)] tracking-[0.08em] uppercase rounded-[var(--radius-sm)] transition-colors cursor-pointer shrink-0"
                style={{ color: c.white, background: 'rgba(255,255,255,0.08)', border: `1px solid ${c.cardBorder}` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Submissions List */}
          {data && !loading && (
            <div style={{ opacity: 0, animation: fadeUp(0.2) }}>
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-10 h-10 mx-auto mb-4" style={{ color: c.textFaint }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <p className="text-[14px] font-[var(--sans)]" style={{ color: c.textMuted }}>
                    {search ? 'No submissions match your search.' : `No submissions in the last ${days} days.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((entry) => {
                    const hasErrors = entry.errors.length > 0;
                    const expanded = expandedId === entry.id;
                    return (
                      <div
                        key={entry.id}
                        className="rounded-xl overflow-hidden transition-all"
                        style={{
                          background: c.card,
                          border: `1px solid ${hasErrors ? 'rgba(248,113,113,0.2)' : c.cardBorder}`,
                        }}
                      >
                        {/* Row summary — always visible */}
                        <button
                          onClick={() => setExpandedId(expanded ? null : entry.id)}
                          className="w-full px-5 py-4 flex items-center gap-4 text-left cursor-pointer transition-colors"
                          style={{ background: 'transparent' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          {/* Status indicator */}
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: hasErrors ? c.red : c.green }}
                          />

                          {/* Name + email */}
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-[var(--sans)] font-medium truncate" style={{ color: c.white }}>
                              {entry.name}
                            </p>
                            <p className="text-[12px] font-[var(--mono)] truncate" style={{ color: c.textMuted }}>
                              {entry.email}
                            </p>
                          </div>

                          {/* Client */}
                          <div className="hidden sm:block min-w-0 w-40">
                            <p className="text-[12px] font-[var(--sans)] truncate" style={{ color: c.textSecondary }}>
                              {entry.clientName}
                            </p>
                            <p className="text-[11px] font-[var(--mono)]" style={{ color: c.textFaint }}>
                              {entry.clientPublicId}
                            </p>
                          </div>

                          {/* Categories */}
                          <div className="hidden md:flex items-center gap-1.5 w-48 flex-wrap">
                            {entry.categories.map((cat) => (
                              <span
                                key={cat}
                                className="px-2 py-0.5 rounded text-[10px] font-[var(--mono)] tracking-wide uppercase"
                                style={{ background: 'rgba(255,255,255,0.06)', color: c.textSecondary }}
                              >
                                {categoryLabels[cat] || cat}
                              </span>
                            ))}
                          </div>

                          {/* Records count */}
                          <div className="text-right w-16 shrink-0">
                            <p className="text-[16px] font-bold font-[var(--display)]" style={{ color: hasErrors ? c.amber : c.green }}>
                              {entry.recordsCreated}
                            </p>
                            <p className="text-[10px] font-[var(--mono)]" style={{ color: c.textFaint }}>
                              records
                            </p>
                          </div>

                          {/* Timestamp */}
                          <div className="hidden lg:block text-right w-20 shrink-0">
                            <p className="text-[11px] font-[var(--mono)]" style={{ color: c.textMuted }}>
                              {relativeTime(entry.timestamp)}
                            </p>
                          </div>

                          {/* Chevron */}
                          <svg
                            className="w-4 h-4 shrink-0 transition-transform"
                            style={{ color: c.textFaint, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>

                        {/* Expanded details */}
                        {expanded && (
                          <div className="px-5 pb-5 pt-1" style={{ borderTop: `1px solid ${c.rule}` }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 mt-4">
                              <Detail label="Submitted" value={formatTimestamp(entry.timestamp)} />
                              <Detail label="Client Name" value={entry.clientName} />
                              <Detail label="Client ID" value={entry.clientPublicId} />
                              <Detail label="Program" value={entry.program || '—'} />
                              <Detail label="Center ID" value={entry.centerId || '—'} />
                              <Detail label="Counselor ID" value={entry.counselorId || '—'} />
                              <Detail
                                label="Categories"
                                value={entry.categories.map((c) => categoryLabels[c] || c).join(', ')}
                              />
                              <Detail label="Signature" value={entry.signature} />
                            </div>

                            {/* Record details */}
                            {entry.details.length > 0 && (
                              <div className="mt-5">
                                <p className="text-[10px] font-[var(--mono)] tracking-[0.1em] uppercase mb-2" style={{ color: c.textFaint }}>
                                  Records
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {entry.details.map((d, i) => (
                                    <span
                                      key={i}
                                      className="px-2.5 py-1 rounded-md text-[11px] font-[var(--mono)]"
                                      style={{
                                        background: d.status === 'created' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                                        color: d.status === 'created' ? c.green : c.red,
                                        border: `1px solid ${d.status === 'created' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                                      }}
                                    >
                                      {d.type}: {d.status}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Email notifications */}
                            {Object.keys(entry.emailNotifications).length > 0 && (
                              <div className="mt-5">
                                <p className="text-[10px] font-[var(--mono)] tracking-[0.1em] uppercase mb-2" style={{ color: c.textFaint }}>
                                  Email Notifications
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(entry.emailNotifications).map(([key, val]) => {
                                    const ok = val === 'sent' || val === 'ok';
                                    return (
                                      <span
                                        key={key}
                                        className="px-2.5 py-1 rounded-md text-[11px] font-[var(--mono)]"
                                        style={{
                                          background: ok ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                                          color: ok ? c.green : c.red,
                                          border: `1px solid ${ok ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                                        }}
                                      >
                                        {key}: {val}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Errors */}
                            {entry.errors.length > 0 && (
                              <div className="mt-5">
                                <p className="text-[10px] font-[var(--mono)] tracking-[0.1em] uppercase mb-2" style={{ color: c.red }}>
                                  Errors
                                </p>
                                <div className="space-y-1.5">
                                  {entry.errors.map((err, i) => (
                                    <p key={i} className="text-[12px] font-[var(--mono)] px-3 py-2 rounded-md" style={{ background: 'rgba(248,113,113,0.06)', color: 'rgba(248,113,113,0.8)', border: '1px solid rgba(248,113,113,0.12)' }}>
                                      {err}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              <p className="text-center text-[10px] font-[var(--mono)] tracking-[0.04em] mt-8 mb-8" style={{ color: c.textFaint }}>
                Showing {filtered.length} of {data.count} submissions from the last {data.days} days
                {data.smtp_configured ? '' : ' · SMTP not configured'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Detail field ── */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-[var(--mono)] tracking-[0.1em] uppercase mb-0.5" style={{ color: c.textFaint }}>
        {label}
      </p>
      <p className="text-[13px] font-[var(--sans)]" style={{ color: c.textSecondary }}>
        {value}
      </p>
    </div>
  );
}
