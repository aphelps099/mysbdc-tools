'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchNeoserraStatus,
  searchNeoserra,
  fetchNeoserraRecord,
  fetchNeoserraList,
  fetchNeoserraClientProfile,
  fetchClientMilestones,
  fetchNeoserraDashboard,
  getToken,
} from '@/lib/api';
import type { MilestoneSubmission, DashboardData, CenterStat, TrainingEntry } from '@/lib/api';

type View =
  | { kind: 'dashboard' }
  | { kind: 'search' }
  | { kind: 'contact'; id: string }
  | { kind: 'client'; id: string }
  | { kind: 'centers' };

export type NeoserraAction = 'ask-ai';

interface NeoserraPanelProps {
  open: boolean;
  onClose: () => void;
  onAction?: (context: string, action: NeoserraAction) => void;
}

export default function NeoserraPanel({ open, onClose, onAction }: NeoserraPanelProps) {
  // ── Admin gate (same pattern as Analytics dashboard) ──
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const [configured, setConfigured] = useState<boolean | null>(null);
  const [view, setView] = useState<View>({ kind: 'dashboard' });
  const [history, setHistory] = useState<View[]>([]);

  // Check if already admin-authed this session
  useEffect(() => {
    if (open && sessionStorage.getItem('sbdc_admin') === '1') {
      setAuthed(true);
    }
  }, [open]);

  // Once admin-authed, check Neoserra config
  useEffect(() => {
    if (open && authed && configured === null) {
      fetchNeoserraStatus()
        .then((s) => setConfigured(s.configured))
        .catch(() => setConfigured(false));
    }
  }, [open, authed, configured]);

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
      } else {
        setPassError('Incorrect password');
      }
    } catch {
      setPassError('Connection error');
    } finally {
      setPassLoading(false);
    }
  };

  const navigate = useCallback((next: View) => {
    setHistory((h) => [...h, view]);
    setView(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const goBack = useCallback(() => {
    setHistory((h) => {
      const copy = [...h];
      const prev = copy.pop();
      if (prev) setView(prev);
      return copy;
    });
  }, []);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
        style={{ animation: 'backdropIn 200ms ease both' }}
        onClick={onClose}
      />

      {/* Panel — wider than events panel for CRM data */}
      <div
        className="
          fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:right-4 sm:top-4 sm:bottom-4
          sm:w-[520px] sm:rounded-2xl rounded-t-2xl
          flex flex-col overflow-hidden
        "
        style={{
          animation: 'modalIn 250ms cubic-bezier(0.16,1,0.3,1) both',
          background: 'var(--p-white, #fff)',
          boxShadow: '0 20px 60px -12px rgba(0,0,0,0.18), 0 0 0 1px var(--p-line, rgba(0,0,0,0.06))',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid var(--rule-light)' }}>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button
                onClick={goBack}
                className="p-1.5 rounded-full transition-colors cursor-pointer"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </button>
            )}
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-[18px] font-bold leading-tight tracking-[-0.01em]" style={{ fontFamily: 'var(--display)', color: 'var(--text-primary)' }}>
                  Neoserra
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase" style={{ background: 'var(--cream)', color: 'var(--text-tertiary)', fontFamily: 'var(--sans)' }}>
                  CRM
                </span>
              </div>
              <p className="text-[11px] mt-0.5 font-light" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--sans)' }}>
                {view.kind === 'dashboard' && 'Network Dashboard'}
                {view.kind === 'search' && 'Search contacts & clients'}
                {view.kind === 'contact' && 'Contact Record'}
                {view.kind === 'client' && 'Client Record'}
                {view.kind === 'centers' && 'SBDC Centers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors cursor-pointer"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!authed ? (
            /* ─── Admin Password Gate ─── */
            <div className="flex flex-col items-center justify-center px-8 py-16">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                style={{ background: 'var(--cream)' }}
              >
                <svg className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <h3 className="text-[16px] font-bold mb-1" style={{ fontFamily: 'var(--display)', color: 'var(--text-primary)' }}>
                Admin Access
              </h3>
              <p className="text-[13px] font-light text-center mb-6" style={{ fontFamily: 'var(--sans)', color: 'var(--text-tertiary)' }}>
                Enter the admin password to continue.
              </p>
              <form onSubmit={handleAdminLogin} className="w-full max-w-[280px]">
                <input
                  type="password"
                  value={passInput}
                  onChange={(e) => { setPassInput(e.target.value); setPassError(''); }}
                  placeholder="Admin password"
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-full text-[14px] focus:outline-none focus:ring-2"
                  style={{
                    fontFamily: 'var(--mono)',
                    border: '1px solid var(--rule-light)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                  }}
                />
                {passError && (
                  <p className="mt-2 text-[12px] text-center" style={{ fontFamily: 'var(--mono)', color: '#dc2626' }}>
                    {passError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full mt-3 px-4 py-2.5 rounded-full font-semibold text-[13px] transition-colors cursor-pointer disabled:opacity-50"
                  style={{ fontFamily: 'var(--sans)', background: 'var(--p-accent, var(--navy))', color: 'var(--p-accent-contrast, #fff)' }}
                >
                  {passLoading ? 'Verifying...' : 'Unlock'}
                </button>
              </form>
            </div>
          ) : (
            <>
              {configured === null && <LoadingState message="Checking Neoserra connection..." />}
              {configured === false && (
                <ErrorBanner message="Neoserra API not configured. Set NEOSERRA_API_TOKEN in backend/.env" />
              )}
              {configured && view.kind === 'dashboard' && (
                <DashboardView onNavigate={navigate} />
              )}
              {configured && view.kind === 'search' && (
                <SearchView onNavigate={navigate} onAction={onAction} />
              )}
              {configured && view.kind === 'contact' && (
                <ContactDetailView contactId={view.id} onNavigate={navigate} onAction={onAction} />
              )}
              {configured && view.kind === 'client' && (
                <ClientDetailView clientId={view.id} onNavigate={navigate} onAction={onAction} />
              )}
              {configured && view.kind === 'centers' && <CentersView />}
            </>
          )}
        </div>

        {/* Quick nav footer */}
        {authed && configured && (
          <div className="flex items-center gap-1.5 px-5 py-3" style={{ borderTop: '1px solid var(--rule-light)' }}>
            {([
              ['dashboard', 'Dashboard'],
              ['search', 'Search'],
              ['centers', 'Centers'],
            ] as const).map(([key, label]) => {
              const isActive = view.kind === key;
              return (
                <button
                  key={key}
                  onClick={() => { setHistory([]); setView({ kind: key }); }}
                  className="px-3.5 py-[5px] rounded-full text-[11px] font-semibold transition-all cursor-pointer"
                  style={{
                    fontFamily: 'var(--sans)',
                    background: isActive ? 'var(--p-accent, var(--navy))' : 'transparent',
                    color: isActive ? 'var(--p-accent-contrast, #fff)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid transparent' : '1px solid var(--rule-light)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}


// ─── Dashboard View ───────────────────────────────────────────

const FORMAT_LABELS: Record<string, string> = {
  MC: 'Multi-session', OL: 'Online Live', OP: 'Online Prerecorded', WS: 'Workshop/Seminar',
};

const EVENT_STATUS_LABELS: Record<string, string> = {
  OP: 'Open', CL: 'Closed', FU: 'Full', CA: 'Canceled', PO: 'Postponed', NA: 'No eCenter', PH: 'Phone Reg.',
};

const EVENT_STATUS_COLORS: Record<string, string> = {
  OP: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  CL: 'bg-gray-50 text-gray-600 border-gray-200',
  FU: 'bg-amber-50 text-amber-700 border-amber-200/60',
  CA: 'bg-red-50 text-red-600 border-red-200/60',
};

function DashboardView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'centers' | 'training' | 'capital'>('overview');

  useEffect(() => {
    setLoading(true);
    fetchNeoserraDashboard()
      .then(setData)
      .catch(() => setError('Failed to load dashboard. The Neoserra API may not support bulk queries.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading network dashboard..." />;
  if (error) return <ErrorBanner message={error} />;
  if (!data) return <ErrorBanner message="No dashboard data" />;

  const { overview } = data;

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Tab row */}
      <div className="flex gap-1.5">
        {([
          ['overview', 'Overview'],
          ['centers', 'Centers'],
          ['training', 'Training'],
          ['capital', 'Capital'],
        ] as const).map(([key, label]) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="px-3 py-[5px] rounded-full text-[11px] font-semibold transition-all cursor-pointer"
              style={{
                fontFamily: 'var(--sans)',
                background: isActive ? 'var(--p-accent, var(--navy))' : 'transparent',
                color: isActive ? 'var(--p-accent-contrast, #fff)' : 'var(--text-tertiary)',
                border: isActive ? '1px solid transparent' : '1px solid var(--rule-light)',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <KpiCard label="New Clients (90d)" value={overview.new_clients_90d} color="royal" />
            <KpiCard label="New Clients (30d)" value={overview.new_clients_30d} color="emerald" />
            {overview.new_clients_12mo > 0 && (
              <KpiCard label="New Clients (12mo)" value={overview.new_clients_12mo} color="blue" />
            )}
            <KpiCard label="Open Events" value={overview.upcoming_events} color="purple" />
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Centers" value={overview.total_centers} />
            <MiniStat label="Counselors" value={overview.active_counselors} />
            <MiniStat label="Open Events" value={overview.upcoming_events} />
          </div>

          {/* Capital headline */}
          {overview.total_capital_funded > 0 && (
            <div
              className="rounded-[12px] p-3.5"
              style={{
                background: 'var(--p-soft-amber, rgba(254,249,236,0.8))',
                border: '1px solid var(--p-line)',
              }}
            >
              <p className="text-[10px] font-medium tracking-[0.06em] uppercase mb-0.5" style={{ color: 'var(--p-stroke-amber, #d97706)' }}>
                Total Capital Funded
              </p>
              <p className="text-[22px] font-bold leading-tight" style={{ fontFamily: 'var(--sans)', color: 'var(--text-primary)' }}>
                ${overview.total_capital_funded.toLocaleString()}
              </p>
              <p className="text-[11px] font-light mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {overview.total_investments} approved investments
              </p>
            </div>
          )}

          {/* Upcoming events preview */}
          {data.upcoming_events.length > 0 && (
            <div>
              <h4 className="text-[11px] font-medium tracking-[0.06em] uppercase text-[var(--text-tertiary)] mb-2">
                Upcoming Events
              </h4>
              <div className="space-y-1.5">
                {data.upcoming_events.slice(0, 5).map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center gap-2.5 rounded-[8px] border border-[var(--rule-light)] px-3 py-2 hover:border-[var(--royal)]/15 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[var(--text-primary)] truncate">
                        {ev.title}
                      </p>
                      <p className="text-[10px] text-[var(--text-tertiary)] font-light">
                        {ev.startDate}
                        {ev.format && ` · ${FORMAT_LABELS[ev.format] || ev.format}`}
                      </p>
                    </div>
                    {ev.status && (
                      <span className={`shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded border ${EVENT_STATUS_COLORS[ev.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {EVENT_STATUS_LABELS[ev.status] || ev.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Centers Tab ── */}
      {activeTab === 'centers' && (
        <div className="space-y-2">
          <p className="text-[12px] text-[var(--text-tertiary)] font-light">
            {data.center_stats.length} centers with recent clients · sorted by 12-month intake
          </p>
          {data.center_stats.map((c) => (
            <CenterScorecard key={c.id} center={c} />
          ))}
          {data.center_stats.length === 0 && (
            <p className="text-[13px] text-[var(--text-tertiary)] text-center py-8 font-light italic">
              No center data available. The API may require different query parameters.
            </p>
          )}
        </div>
      )}

      {/* ── Training Tab ── */}
      {activeTab === 'training' && (
        <div className="space-y-3">
          <p className="text-[12px] text-[var(--text-tertiary)] font-light">
            Open events · sorted by attendance
          </p>
          {data.training_leaderboard.length > 0 ? (
            <div className="space-y-2">
              {data.training_leaderboard.map((ev, i) => (
                <TrainingCard key={ev.id || i} event={ev} rank={i + 1} />
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[var(--text-tertiary)] text-center py-8 font-light italic">
              No recent events found.
            </p>
          )}
        </div>
      )}

      {/* ── Capital Tab ── */}
      {activeTab === 'capital' && (
        <div className="space-y-4">
          {data.capital.total_funded > 0 ? (
            <>
              <div
                className="rounded-[12px] p-4 text-center"
                style={{
                  background: 'var(--p-soft-amber, rgba(254,249,236,0.8))',
                  border: '1px solid var(--p-line)',
                }}
              >
                <p className="text-[10px] font-medium tracking-[0.06em] uppercase mb-1" style={{ color: 'var(--p-stroke-amber, #d97706)' }}>
                  Total Capital Funded (Approved)
                </p>
                <p className="text-[28px] font-bold" style={{ fontFamily: 'var(--sans)', color: 'var(--text-primary)' }}>
                  ${data.capital.total_funded.toLocaleString()}
                </p>
                <p className="text-[12px] font-light" style={{ color: 'var(--text-tertiary)' }}>
                  {data.capital.investment_count} investments
                </p>
              </div>
              {data.capital.by_type.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-medium tracking-[0.06em] uppercase text-[var(--text-tertiary)] mb-2">
                    By Funding Type
                  </h4>
                  <div className="space-y-1.5">
                    {data.capital.by_type.map((item) => {
                      const pct = data.capital.total_funded > 0
                        ? (item.amount / data.capital.total_funded) * 100
                        : 0;
                      return (
                        <div key={item.type} className="rounded-[8px] border border-[var(--rule-light)] px-3 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[12px] font-medium text-[var(--text-primary)]">
                              {item.type}
                            </span>
                            <span className="text-[12px] text-[var(--text-secondary)] font-mono">
                              ${item.amount.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[var(--cream)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all"
                              style={{ width: `${Math.max(pct, 2)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <svg className="w-8 h-8 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p className="text-[13px] text-[var(--text-tertiary)] font-light text-center max-w-[260px]">
                Capital funding data is not available via the Neoserra list API. Individual investment records can still be viewed on client profiles.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function KpiCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    royal: 'border-[var(--royal)]/15 bg-[var(--royal)]/[0.04]',
    emerald: 'border-emerald-200/60 bg-emerald-50/50',
    blue: 'border-blue-200/60 bg-blue-50/50',
    purple: 'border-purple-200/60 bg-purple-50/50',
  };
  const textMap: Record<string, string> = {
    royal: 'text-[var(--royal)]',
    emerald: 'text-emerald-700',
    blue: 'text-blue-700',
    purple: 'text-purple-700',
  };
  return (
    <div className={`rounded-[12px] border p-3 ${colorMap[color] || ''}`}>
      <p className="text-[10px] font-medium tracking-[0.04em] uppercase text-[var(--text-tertiary)] mb-0.5">
        {label}
      </p>
      <p className={`text-[24px] font-[var(--sans)] font-bold leading-tight ${textMap[color] || ''}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}


function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[10px] border border-[var(--rule-light)] bg-[var(--cream)]/30 px-2.5 py-2 text-center">
      <p className="text-[18px] font-[var(--sans)] font-bold text-[var(--text-primary)] leading-tight">
        {value.toLocaleString()}
      </p>
      <p className="text-[9px] font-medium tracking-[0.04em] uppercase text-[var(--text-tertiary)] mt-0.5">
        {label}
      </p>
    </div>
  );
}


function CenterScorecard({ center }: { center: CenterStat }) {
  return (
    <div className="rounded-[12px] border border-[var(--rule-light)] p-3 hover:border-[var(--royal)]/15 hover:shadow-[0_1px_6px_rgba(29,90,167,0.06)] transition-all">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[13px] font-[var(--sans)] font-semibold text-[var(--text-primary)] truncate flex-1">
          {center.name}
        </p>
        <span className="text-[18px] font-bold text-[var(--royal)] ml-2 shrink-0">
          {center.new_clients_12mo}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-[11px] text-[var(--text-secondary)]">
            <span className="font-semibold text-emerald-700">{center.new_clients_30d}</span> last 30d
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
          <span className="text-[11px] text-[var(--text-secondary)]">
            <span className="font-semibold text-blue-700">{center.new_clients_90d}</span> last 90d
          </span>
        </div>
      </div>
    </div>
  );
}


function TrainingCard({ event, rank }: { event: TrainingEntry; rank: number }) {
  const hasDemographics = event.att_women > 0 || event.att_minorities > 0 || event.att_veterans > 0;
  return (
    <div className="rounded-[12px] border border-[var(--rule-light)] p-3 hover:border-[var(--royal)]/15 transition-colors">
      <div className="flex items-start gap-2.5">
        {/* Rank badge */}
        <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
          rank <= 3
            ? 'bg-amber-100 text-amber-700 border border-amber-200/60'
            : 'bg-[var(--cream)] text-[var(--text-tertiary)] border border-[var(--rule-light)]'
        }`}>
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[var(--text-primary)] leading-snug">
            {event.title}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] text-[var(--text-tertiary)] font-light">
              {event.startDate}
            </span>
            {event.format && (
              <span className="text-[10px] text-[var(--text-tertiary)] font-light">
                {FORMAT_LABELS[event.format] || event.format}
              </span>
            )}
            {event.topic && (
              <span className="inline-flex text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200/60">
                {event.topic}
              </span>
            )}
          </div>
          {/* Demographics */}
          {hasDemographics && (
            <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
              {event.att_women > 0 && (
                <span className="text-[9px] text-purple-600">
                  <span className="font-semibold">{event.att_women}</span> women
                </span>
              )}
              {event.att_minorities > 0 && (
                <span className="text-[9px] text-amber-600">
                  <span className="font-semibold">{event.att_minorities}</span> minorities
                </span>
              )}
              {event.att_veterans > 0 && (
                <span className="text-[9px] text-emerald-600">
                  <span className="font-semibold">{event.att_veterans}</span> veterans
                </span>
              )}
            </div>
          )}
        </div>
        {/* Attendance */}
        <div className="shrink-0 text-right">
          <p className="text-[16px] font-bold text-[var(--text-primary)] leading-tight">
            {event.attended}
          </p>
          <p className="text-[8px] font-medium tracking-[0.04em] uppercase text-[var(--text-tertiary)]">
            attended
          </p>
        </div>
      </div>
    </div>
  );
}


// ─── Search View ──────────────────────────────────────────────

function SearchView({
  onNavigate,
  onAction,
}: {
  onNavigate: (v: View) => void;
  onAction?: (context: string, action: NeoserraAction) => void;
}) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<{ contacts: Record<string, unknown>[]; clients: Record<string, unknown>[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const data = await searchNeoserra(query.trim());
      setResults(data);
    } catch {
      setError('Search failed. Check the backend connection.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="px-5 py-4">
      {/* Search input */}
      <div className="flex gap-2 mb-4">
        <input
          type="email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search by email address..."
          className="flex-1 px-4 py-2.5 rounded-full text-[14px] focus:outline-none focus:ring-2"
          style={{
            fontFamily: 'var(--sans)',
            border: '1px solid var(--rule-light)',
            background: 'transparent',
            color: 'var(--text-primary)',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="px-5 py-2.5 rounded-full text-[13px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          style={{ fontFamily: 'var(--sans)', background: 'var(--p-accent, var(--navy))', color: 'var(--p-accent-contrast, #fff)' }}
        >
          {searching ? '...' : 'Search'}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {/* Contacts */}
          <div>
            <h3 className="text-[11px] font-medium tracking-[0.06em] uppercase text-[var(--text-tertiary)] mb-2">
              Contacts ({results.contacts.length})
            </h3>
            {results.contacts.length === 0 ? (
              <p className="text-[13px] text-[var(--text-tertiary)] font-light italic">No contacts found</p>
            ) : (
              <div className="space-y-2">
                {results.contacts.map((c, i) => (
                  <RecordCard
                    key={i}
                    type="contact"
                    title={`${c.first || ''} ${c.last || ''}`.trim() || 'Unknown'}
                    subtitle={String(c.email || '')}
                    meta={c.phone ? String(c.phone) : undefined}
                    onView={() => {
                      const ref = String(c.indivId || c._ref || c.id || '');
                      if (ref) onNavigate({ kind: 'contact', id: ref });
                    }}
                    onAskAI={onAction ? () => {
                      const details = `Contact: ${c.first || ''} ${c.last || ''}\nEmail: ${c.email || ''}\nPhone: ${c.phone || ''}`;
                      onAction(details, 'ask-ai');
                    } : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Clients */}
          <div>
            <h3 className="text-[11px] font-medium tracking-[0.06em] uppercase text-[var(--text-tertiary)] mb-2">
              Clients ({results.clients.length})
            </h3>
            {results.clients.length === 0 ? (
              <p className="text-[13px] text-[var(--text-tertiary)] font-light italic">No clients found</p>
            ) : (
              <div className="space-y-2">
                {results.clients.map((c, i) => (
                  <RecordCard
                    key={i}
                    type="client"
                    title={String(c.company || 'Unknown Business')}
                    subtitle={c.client ? `ID: ${c.client}` : ''}
                    meta={c.status === 'B' ? 'In Business' : c.status === 'S' ? 'Start-up' : c.status === 'P' ? 'Pre-venture' : undefined}
                    onView={() => {
                      const ref = String(c.clientId || c._ref || c.id || c.client || '');
                      if (ref) onNavigate({ kind: 'client', id: ref });
                    }}
                    onAskAI={onAction ? () => {
                      const details = `Client: ${c.company || ''}\nID: ${c.client || ''}\nStatus: ${c.status || ''}`;
                      onAction(details, 'ask-ai');
                    } : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!results && !searching && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <svg className="w-10 h-10 text-[var(--text-tertiary)]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p className="text-[13px] text-[var(--text-tertiary)] font-light text-center">
            Search by email to find contacts and clients in Neoserra
          </p>
        </div>
      )}
    </div>
  );
}


// ─── Contact Detail View ──────────────────────────────────────

function ContactDetailView({
  contactId,
  onNavigate,
  onAction,
}: {
  contactId: string;
  onNavigate: (v: View) => void;
  onAction?: (context: string, action: NeoserraAction) => void;
}) {
  const [contact, setContact] = useState<Record<string, unknown> | null>(null);
  const [clients, setClients] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchNeoserraRecord('contacts', contactId),
      fetchNeoserraList(`contacts/${contactId}/clients`),
    ])
      .then(([rec, list]) => {
        setContact(rec.data);
        setClients(list.data);
      })
      .catch(() => setError('Failed to load contact'))
      .finally(() => setLoading(false));
  }, [contactId]);

  if (loading) return <LoadingState message="Loading contact..." />;
  if (error) return <ErrorBanner message={error} />;
  if (!contact) return <ErrorBanner message="Contact not found" />;

  const name = `${contact.first || ''} ${contact.last || ''}`.trim();

  const askAI = onAction
    ? () => {
        const details = [
          `Contact: ${name}`,
          contact.email ? `Email: ${contact.email}` : '',
          contact.phone ? `Phone: ${contact.phone}` : '',
          contact.owner === 'true' ? 'Business Owner: Yes' : '',
          contact.veteran && contact.veteran !== 'N' ? `Veteran: Yes` : '',
        ].filter(Boolean).join('\n');
        onAction(details, 'ask-ai');
      }
    : undefined;

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Name header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[16px] font-[var(--sans)] font-semibold text-[var(--text-primary)]">
            {name || 'Unknown Contact'}
          </h3>
          {!!contact.email && (
            <p className="text-[13px] text-[var(--text-secondary)] font-light">{String(contact.email)}</p>
          )}
        </div>
        {askAI && (
          <button
            onClick={askAI}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold rounded-full transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--sans)', background: 'var(--p-accent, var(--navy))', color: 'var(--p-accent-contrast, #fff)' }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
            Ask AI
          </button>
        )}
      </div>

      {/* Contact details */}
      <FieldGroup title="Contact Info" fields={[
        { label: 'Phone', value: contact.phone },
        { label: 'Mobile', value: contact.mobileph },
        { label: 'Alt Email', value: contact.emailAlt },
        { label: 'Position', value: contact.position },
        { label: 'Pronouns', value: contact.pronouns },
        { label: 'Language', value: contact.language },
      ]} />

      <FieldGroup title="Address" fields={[
        { label: 'Street', value: contact.mailaddr },
        { label: 'City', value: contact.mailcity },
        { label: 'State', value: contact.mailst },
        { label: 'ZIP', value: contact.mailzip },
        { label: 'County', value: contact.county },
      ]} />

      <FieldGroup title="Demographics" fields={[
        { label: 'Gender', value: contact.gender },
        { label: 'Race', value: contact.ethnic },
        { label: 'Hispanic', value: contact.hispanic },
        { label: 'Veteran', value: contact.veteran },
        { label: 'Education', value: contact.education },
        { label: 'Disabled', value: contact.handicapped },
      ]} />

      {/* Linked Clients */}
      {clients.length > 0 && (
        <div>
          <h4 className="text-[11px] font-medium tracking-[0.06em] uppercase text-[var(--text-tertiary)] mb-2">
            Linked Clients ({clients.length})
          </h4>
          <div className="space-y-2">
            {clients.map((c, i) => (
              <RecordCard
                key={i}
                type="client"
                title={String(c.company || 'Unknown Business')}
                subtitle={c.client ? `ID: ${c.client}` : ''}
                onView={() => {
                  const ref = String(c.clientId || c._ref || c.id || c.client || '');
                  if (ref) onNavigate({ kind: 'client', id: ref });
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Code-to-Label Maps ──────────────────────────────────────

const TYPE2_LABELS: Record<string, string> = {
  AC: 'Active Client', IC: 'Inactive Client', PC: 'Pre-client',
  PI: 'Pre-client (Inactive)', '10': 'Stakeholder',
};

const STATUS_LABELS: Record<string, string> = {
  P: 'Pre-venture / Nascent', S: 'Start-up (< 1 year)', B: 'In Business (> 1 year)',
};

const CASE_END_LABELS: Record<string, string> = {
  NQ: 'Does not qualify', H: 'Did not show', NS: 'No longer interested',
  NP: 'No longer pursuing business', U: 'Client unresponsive',
  O: 'In Operation', N: 'Out of Business', E: 'Still Exploring/Planning',
};

const BUSTYPE_LABELS: Record<string, string> = {
  FS: 'Accommodation & Food Services', AS: 'Administrative & Support',
  AG: 'Agriculture, Forestry, Fishing & Hunting', AE: 'Arts, Entertainment & Recreation',
  CO: 'Construction', ED: 'Educational Services', FI: 'Finance & Insurance',
  HC: 'Health Care & Social Assistance', IN: 'Information',
  MG: 'Management of Companies', MF: 'Manufacturer', MN: 'Mining',
  PT: 'Professional, Scientific & Technical', PA: 'Public Administration',
  RE: 'Real Estate & Rental', RD: 'Research & Development',
  D: 'Retail Trade', SV: 'Service Establishment',
  TW: 'Transportation & Warehousing', UT: 'Utilities',
  WM: 'Waste Management', W: 'Wholesale Trade',
};

const ORGTYPE_LABELS: Record<string, string> = {
  BC: 'B Corporation', CC: 'C Corporation', CO: 'Corporation',
  L: 'Limited Liability Co.', NP: 'Non-profit', P: 'Partnership',
  I: 'Sole Proprietorship', S: 'Sub S Corporation', UN: 'Unknown',
};

const SBA_CLIENT_LABELS: Record<string, string> = {
  F: 'Face to Face', O: 'Online', T: 'Telephone', C: 'Training',
};

const OWNER_GENDER_LABELS: Record<string, string> = {
  E: 'EDWOSB Certified', M: 'Male-Owned', B: 'Male/Female-Owned',
  F: 'Woman-Owned', W: 'WOSB Certified', WB: 'WBE Certified',
};

const OWNER_VET_LABELS: Record<string, string> = {
  NA: 'Non-veteran', SD: 'SDVOSB Certified', DS: 'Service-Disabled Veteran',
  VE: 'Veteran', VO: 'VOSB Certified',
};

function codeLabel(map: Record<string, string>, code: unknown): string | undefined {
  if (!code || code === '-' || code === '?') return undefined;
  const s = String(code);
  return map[s] || s;
}

// Category badge colors
const CATEGORY_COLORS: Record<string, string> = {
  'New Employees': 'bg-blue-50 text-blue-700 border-blue-200/60',
  'Increased Sales': 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  'Started a Business': 'bg-purple-50 text-purple-700 border-purple-200/60',
  'Business Funded': 'bg-amber-50 text-amber-700 border-amber-200/60',
};

function formatCurrency(val: string | undefined): string | null {
  if (!val) return null;
  const n = Number(val.replace(/[^0-9.-]/g, ''));
  if (isNaN(n)) return val;
  return `$${n.toLocaleString()}`;
}

function formatDelta(val: string | undefined, prefix = ''): string | null {
  if (!val || val === '0') return null;
  const n = Number(val);
  if (isNaN(n)) return val;
  const sign = n > 0 ? '+' : '';
  return `${prefix}${sign}${n.toLocaleString()}`;
}

function MilestoneHistorySection({
  milestones,
  configured,
}: {
  milestones: MilestoneSubmission[];
  configured: boolean;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!configured) {
    return (
      <div className="rounded-[10px] border border-amber-200/60 bg-amber-50/50 px-3 py-2.5">
        <p className="text-[11px] text-amber-700 font-light leading-relaxed">
          <span className="font-medium">Milestones:</span> Google Sheets integration not configured. Set GOOGLE_SHEET_ID and GOOGLE_SHEETS_CREDENTIALS env vars to enable milestone history.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-[11px] font-medium tracking-[0.06em] uppercase text-[var(--text-tertiary)] mb-2">
        Milestone Submissions ({milestones.length})
      </h4>

      {milestones.length === 0 ? (
        <div className="rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-secondary)] px-3 py-3">
          <p className="text-[12px] text-[var(--text-tertiary)] text-center">
            No milestone submissions found for this client.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {milestones.map((m) => {
            const isOpen = expanded === m.entry_id;
            return (
              <div
                key={m.entry_id}
                className="rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-primary)] overflow-hidden"
              >
                {/* Summary row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : m.entry_id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {m.categories.map((cat) => (
                        <span
                          key={cat}
                          className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[cat] || 'bg-gray-50 text-gray-600 border-gray-200'}`}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-[var(--text-tertiary)]">
                      {m.entry_date || 'Unknown date'}
                      {m.signature ? ` — ${m.signature}` : ''}
                    </p>
                  </div>
                  <span className="text-[var(--text-tertiary)] text-[12px] ml-2 flex-shrink-0">
                    {isOpen ? '▾' : '▸'}
                  </span>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-[var(--border-light)] px-3 py-2.5 space-y-2.5 bg-[var(--bg-secondary)]">
                    {/* Employees */}
                    {m.employees && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 mb-1">Employees</p>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                          <span className="text-[var(--text-tertiary)]">Full-Time:</span>
                          <span className="text-[var(--text-primary)]">
                            {m.employees.total_ft || '—'}
                            {formatDelta(m.employees.delta_ft) && (
                              <span className={`ml-1 ${Number(m.employees.delta_ft) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                ({formatDelta(m.employees.delta_ft)})
                              </span>
                            )}
                          </span>
                          <span className="text-[var(--text-tertiary)]">Part-Time:</span>
                          <span className="text-[var(--text-primary)]">
                            {m.employees.total_pt || '—'}
                            {formatDelta(m.employees.delta_pt) && (
                              <span className={`ml-1 ${Number(m.employees.delta_pt) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                ({formatDelta(m.employees.delta_pt)})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Sales */}
                    {m.sales && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mb-1">Revenue</p>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                          <span className="text-[var(--text-tertiary)]">Gross Revenue:</span>
                          <span className="text-[var(--text-primary)]">{formatCurrency(m.sales.gross_revenue) || '—'}</span>
                          <span className="text-[var(--text-tertiary)]">Change:</span>
                          <span className={Number(m.sales.delta_revenue) >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                            {formatDelta(m.sales.delta_revenue, '$') || '—'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* New Business */}
                    {m.new_business && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-600 mb-1">New Business</p>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                          <span className="text-[var(--text-tertiary)]">Verified:</span>
                          <span className="text-[var(--text-primary)]">{m.new_business.verified || '—'}</span>
                          {m.new_business.legal_structure && (
                            <>
                              <span className="text-[var(--text-tertiary)]">Structure:</span>
                              <span className="text-[var(--text-primary)]">{m.new_business.legal_structure}</span>
                            </>
                          )}
                          {m.new_business.start_date && (
                            <>
                              <span className="text-[var(--text-tertiary)]">Start Date:</span>
                              <span className="text-[var(--text-primary)]">{m.new_business.start_date}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Funding */}
                    {m.funding && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 mb-1">Capital Funding</p>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                          {m.funding.amount && (
                            <>
                              <span className="text-[var(--text-tertiary)]">Amount:</span>
                              <span className="text-[var(--text-primary)] font-medium">{formatCurrency(m.funding.amount)}</span>
                            </>
                          )}
                          {m.funding.type && (
                            <>
                              <span className="text-[var(--text-tertiary)]">Type:</span>
                              <span className="text-[var(--text-primary)]">{m.funding.type}</span>
                            </>
                          )}
                          {m.funding.institution && (
                            <>
                              <span className="text-[var(--text-tertiary)]">Institution:</span>
                              <span className="text-[var(--text-primary)]">{m.funding.institution}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Testimonial */}
                    {m.testimonial && (
                      <div className="pt-1 border-t border-[var(--border-light)]">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Testimonial</p>
                        <p className="text-[11px] text-[var(--text-secondary)] italic leading-relaxed">
                          &ldquo;{m.testimonial}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ─── Client Detail View ───────────────────────────────────────

function ClientDetailView({
  clientId,
  onNavigate,
  onAction,
}: {
  clientId: string;
  onNavigate: (v: View) => void;
  onAction?: (context: string, action: NeoserraAction) => void;
}) {
  const [client, setClient] = useState<Record<string, unknown> | null>(null);
  const [contacts, setContacts] = useState<Record<string, unknown>[]>([]);
  const [counselorName, setCounselorName] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<MilestoneSubmission[]>([]);
  const [milestonesConfigured, setMilestonesConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    // Fetch profile and milestones in parallel
    Promise.all([
      fetchNeoserraClientProfile(clientId),
      fetchClientMilestones(clientId).catch(() => ({ configured: false, milestones: [], count: 0 })),
    ])
      .then(([profile, milestoneData]) => {
        setClient(profile.client);
        setContacts(profile.contacts);
        setCounselorName(profile.counselorName);
        setMilestones(milestoneData.milestones);
        setMilestonesConfigured(milestoneData.configured);
      })
      .catch(() => setError('Failed to load client'))
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) return <LoadingState message="Loading client profile..." />;
  if (error) return <ErrorBanner message={error} />;
  if (!client) return <ErrorBanner message="Client not found" />;

  const type2Label = codeLabel(TYPE2_LABELS, client.type2);
  const statusLabel = codeLabel(STATUS_LABELS, client.status);
  const caseEndLabel = codeLabel(CASE_END_LABELS, client.caseend);
  const bustypeLabel = codeLabel(BUSTYPE_LABELS, client.bustype);
  const orgtypeLabel = codeLabel(ORGTYPE_LABELS, client.orgtype);

  // Determine the status badge color
  const isActive = String(client.type2) === 'AC';
  const isInactive = String(client.type2) === 'IC' || String(client.type2) === 'PI';
  const statusColor = isActive
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
    : isInactive
      ? 'bg-red-50 text-red-600 border-red-200/60'
      : 'bg-[var(--royal)]/[0.08] text-[var(--royal)] border-[var(--royal)]/10';

  const askAI = onAction
    ? () => {
        const details = [
          `Client: ${client.company || ''}`,
          `Client ID: ${client.client || ''}`,
          type2Label ? `Client Status: ${type2Label}` : '',
          statusLabel ? `Business Stage: ${statusLabel}` : '',
          client.product ? `Product/Service: ${client.product}` : '',
          counselorName ? `Primary Counselor: ${counselorName}` : '',
          client.estab ? `Established: ${client.estab}` : '',
          client.ftEmps ? `FT Employees: ${client.ftEmps}` : '',
          client.ptEmps ? `PT Employees: ${client.ptEmps}` : '',
          client.grossSales ? `Gross Revenue: $${client.grossSales}` : '',
          client.grossProfits ? `Profits/Losses: $${client.grossProfits}` : '',
          bustypeLabel ? `Industry: ${bustypeLabel}` : '',
          orgtypeLabel ? `Organization: ${orgtypeLabel}` : '',
          caseEndLabel ? `Case End: ${caseEndLabel}` : '',
          client.notes ? `Notes: ${String(client.notes).slice(0, 500)}` : '',
        ].filter(Boolean).join('\n');
        onAction(details, 'ask-ai');
      }
    : undefined;

  return (
    <div className="px-5 py-4 space-y-4">
      {/* ── Company Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[16px] font-[var(--sans)] font-semibold text-[var(--text-primary)]">
            {String(client.company || 'Unknown Business')}
          </h3>
          {!!client.dba && (
            <p className="text-[13px] text-[var(--text-secondary)] font-light">
              DBA: {String(client.dba)}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {!!client.client && (
              <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
                ID: {String(client.client)}
              </span>
            )}
            {type2Label && (
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColor}`}>
                {type2Label}
              </span>
            )}
            {statusLabel && (
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--cream)] text-[var(--text-secondary)] border border-[var(--rule-light)]">
                {statusLabel}
              </span>
            )}
          </div>
        </div>
        {askAI && (
          <button
            onClick={askAI}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold rounded-full transition-colors cursor-pointer shrink-0"
            style={{ fontFamily: 'var(--sans)', background: 'var(--p-accent, var(--navy))', color: 'var(--p-accent-contrast, #fff)' }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
            Ask AI
          </button>
        )}
      </div>

      {/* ── Status & Activity ── */}
      <FieldGroup title="Status & Activity" fields={[
        { label: 'Client Status', value: type2Label },
        { label: 'Business Stage', value: statusLabel },
        { label: 'Primary Counselor', value: counselorName || (client.counselId ? `ID: ${client.counselId}` : undefined) },
        { label: 'SBA Client Type', value: codeLabel(SBA_CLIENT_LABELS, client.sbaClientType) },
        { label: 'Client Start', value: client.started },
        { label: 'Expiration', value: client.expires },
        { label: 'Case End', value: caseEndLabel },
        { label: 'Verified In Business', value: client.verifiedInBusiness === 'true' ? 'Yes' : undefined },
        { label: 'Impact Date', value: client.impactDate },
      ]} />

      {/* ── Client Notes ── */}
      {!!client.notes && String(client.notes).trim() !== '' && (
        <div>
          <h4 className="text-[11px] font-medium tracking-[0.06em] uppercase text-[var(--text-tertiary)] mb-2">
            Client Notes
          </h4>
          <div className="rounded-[10px] border border-[var(--rule-light)] bg-[var(--cream)]/30 p-3">
            <p className="text-[13px] text-[var(--text-primary)] font-light whitespace-pre-wrap leading-relaxed">
              {String(client.notes)}
            </p>
          </div>
        </div>
      )}

      {/* ── Business Profile ── */}
      <FieldGroup title="Business Profile" fields={[
        { label: 'Product/Service', value: client.product },
        { label: 'Industry', value: bustypeLabel },
        { label: 'Organization Type', value: orgtypeLabel },
        { label: 'Business Size', value: client.bussize },
        { label: 'Established', value: client.estab },
        { label: 'Website', value: client.url },
        { label: 'Phone', value: client.busphone },
        { label: 'Email', value: client.busemail },
        { label: 'Home-based', value: client.homebased === 'true' ? 'Yes' : undefined },
        { label: 'Online Business', value: client.busonline === 'true' ? 'Yes' : undefined },
        { label: 'International Trade', value: client.intlTrade && client.intlTrade !== 'N' ? String(client.intlTrade) : undefined },
        { label: 'NAICS', value: client.primaryNaics || client.naics },
      ]} />

      {/* ── Financial Metrics ── */}
      <FieldGroup title="Financial Metrics" fields={[
        { label: 'Gross Revenue', value: client.grossSales ? `$${Number(client.grossSales).toLocaleString()}` : undefined },
        { label: 'Revenue Date', value: client.grossSalesDate },
        { label: 'Profits/Losses', value: client.grossProfits ? `$${Number(client.grossProfits).toLocaleString()}` : undefined },
        { label: 'Profits Date', value: client.grossProfitsDate },
        { label: 'FT Employees', value: client.ftEmps },
        { label: 'PT Employees', value: client.ptEmps },
        { label: 'Export Revenue', value: client.grossSalesExport ? `$${Number(client.grossSalesExport).toLocaleString()}` : undefined },
        { label: 'Export Employees', value: client.empsExport },
        { label: 'Funding Sought', value: client.funding2 ? `$${Number(client.funding2).toLocaleString()}` : undefined },
      ]} />

      {/* ── Address ── */}
      <FieldGroup title="Address" fields={[
        { label: 'Street', value: client.physaddr },
        { label: 'City', value: client.physcity },
        { label: 'State', value: client.physst },
        { label: 'ZIP', value: client.physzip },
        { label: 'County', value: client.county },
      ]} />

      {/* ── Ownership & Certifications ── */}
      <FieldGroup title="Ownership & Certifications" fields={[
        { label: 'Ownership Gender', value: codeLabel(OWNER_GENDER_LABELS, client.ownerGender) },
        { label: 'Veteran Status', value: codeLabel(OWNER_VET_LABELS, client.ownerVeteran) },
        { label: 'Disadvantage Status', value: client.disadvStatus && client.disadvStatus !== 'NA' ? String(client.disadvStatus) : undefined },
        { label: 'HUBZone', value: client.hubzone === 'C' ? 'Certified' : client.hubzone === 'Y' ? 'Location Only' : undefined },
        { label: 'Employee Owned', value: client.employeeOwned === 'true' ? 'Yes' : undefined },
        { label: 'Very Small Business', value: client.vsb === 'true' ? 'Yes' : undefined },
      ]} />

      {/* ── Programs & Funding ── */}
      <FieldGroup title="Programs & Funding" fields={[
        { label: 'Center', value: client.centerId },
        { label: 'Funding Source', value: client.defaultfundarea },
        { label: 'Special Programs', value: client.sbdcsp },
        { label: 'Funding Program', value: client.fundpgm },
        { label: 'Referral From', value: client.reffrom },
        { label: 'Services Sought', value: client.step2 },
      ]} />

      {/* ── Linked Contacts ── */}
      {contacts.length > 0 && (
        <div>
          <h4 className="text-[11px] font-medium tracking-[0.06em] uppercase text-[var(--text-tertiary)] mb-2">
            Linked Contacts ({contacts.length})
          </h4>
          <div className="space-y-2">
            {contacts.map((c, i) => (
              <RecordCard
                key={i}
                type="contact"
                title={`${c.first || ''} ${c.last || ''}`.trim() || 'Unknown'}
                subtitle={String(c.email || '')}
                meta={c.position ? String(c.position) : undefined}
                onView={() => {
                  const ref = String(c.indivId || c._ref || c.id || '');
                  if (ref) onNavigate({ kind: 'contact', id: ref });
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Milestone History ── */}
      <MilestoneHistorySection
        milestones={milestones}
        configured={milestonesConfigured}
      />
    </div>
  );
}


// ─── Centers View ─────────────────────────────────────────────

function CentersView() {
  const [centers, setCenters] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNeoserraList('centers')
      .then((d) => setCenters(d.data))
      .catch(() => setError('Failed to load centers'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading centers..." />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="px-5 py-4 space-y-2">
      <p className="text-[12px] text-[var(--text-tertiary)] font-light mb-2">
        {centers.length} active centers
      </p>
      {centers.map((c, i) => (
        <div
          key={i}
          className="rounded-[12px] border border-[var(--rule-light)] p-3 hover:border-[var(--royal)]/15 transition-colors"
        >
          <p className="text-[14px] font-[var(--sans)] font-medium text-[var(--text-primary)]">
            {String(c.centerName || 'Unknown Center')}
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {!!c.dirname && (
              <span className="text-[12px] text-[var(--text-secondary)] font-light">
                Dir: {String(c.dirname)}
              </span>
            )}
            {!!c.phone && (
              <span className="text-[12px] text-[var(--text-tertiary)] font-light">
                {String(c.phone)}
              </span>
            )}
            {!!c.email && (
              <span className="text-[12px] text-[var(--text-tertiary)] font-light">
                {String(c.email)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


// ─── Shared Components ────────────────────────────────────────

function RecordCard({
  type,
  title,
  subtitle,
  meta,
  onView,
  onAskAI,
}: {
  type: 'contact' | 'client';
  title: string;
  subtitle?: string;
  meta?: string;
  onView?: () => void;
  onAskAI?: () => void;
}) {
  const badgeColor = type === 'contact'
    ? { bg: 'rgba(59,130,246,0.08)', text: 'var(--royal)' }
    : { bg: 'rgba(16,185,129,0.08)', text: '#059669' };

  return (
    <div
      className="rounded-xl p-3 transition-all hover:-translate-y-px"
      style={{
        border: '1px solid var(--rule-light)',
        background: 'var(--p-white, #fff)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold tracking-[0.06em] uppercase"
              style={{ background: badgeColor.bg, color: badgeColor.text, fontFamily: 'var(--sans)' }}
            >
              {type}
            </span>
            {meta && (
              <span className="text-[11px] font-light" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--sans)' }}>{meta}</span>
            )}
          </div>
          <p className="text-[14px] font-semibold mt-1 truncate" style={{ fontFamily: 'var(--sans)', color: 'var(--text-primary)' }}>
            {title}
          </p>
          {subtitle && (
            <p className="text-[12px] font-light truncate" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--sans)' }}>{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          {onAskAI && (
            <button
              onClick={onAskAI}
              className="p-1.5 rounded-full transition-colors cursor-pointer"
              title="Ask AI about this record"
              style={{ color: 'var(--royal)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </button>
          )}
          {onView && (
            <button
              onClick={onView}
              className="p-1.5 rounded-full transition-colors cursor-pointer"
              title="View full record"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


function FieldGroup({
  title,
  fields,
}: {
  title: string;
  fields: { label: string; value: unknown }[];
}) {
  const visible = fields.filter((f) => f.value && f.value !== '' && f.value !== 'null' && f.value !== 'undefined');
  if (visible.length === 0) return null;

  return (
    <div>
      <h4 className="text-[11px] font-medium tracking-[0.06em] uppercase text-[var(--text-tertiary)] mb-2">
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {visible.map((f) => (
          <div key={f.label}>
            <span className="text-[11px] text-[var(--text-tertiary)] font-light">{f.label}</span>
            <p className="text-[13px] text-[var(--text-primary)] font-light truncate">
              {String(f.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}


function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--rule)', borderTopColor: 'var(--navy)' }} />
      <span className="text-[13px] font-light" style={{ fontFamily: 'var(--sans)', color: 'var(--text-tertiary)' }}>{message}</span>
    </div>
  );
}


function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mx-5 my-4 px-4 py-3 rounded-xl text-[13px] font-light" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.12)', color: '#dc2626', fontFamily: 'var(--sans)' }}>
      {message}
    </div>
  );
}
