'use client';

import { useState } from 'react';
import type { EventItem } from '@/lib/api';

export type EventAction = 'promote' | 'learn';

interface EventsFeedProps {
  open: boolean;
  onClose: () => void;
  onEventAction?: (event: EventItem, action: EventAction) => void;
  /** Pre-fetched data from useEvents */
  events: EventItem[];
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
  error: string | null;
  onPageChange: (p: number) => void;
}

export default function EventsFeed({
  open,
  onClose,
  onEventAction,
  events,
  page,
  totalPages,
  total,
  loading,
  error,
  onPageChange,
}: EventsFeedProps) {
  const [showLeavePrompt, setShowLeavePrompt] = useState(false);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
        style={{ animation: 'backdropIn 200ms ease both' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="
          fixed inset-x-0 bottom-0 z-50 sm:inset-auto sm:right-4 sm:top-4 sm:bottom-4
          sm:w-[440px] sm:rounded-2xl rounded-t-2xl
          flex flex-col overflow-hidden
          max-h-[85vh] sm:max-h-none
        "
        style={{
          animation: 'modalIn 250ms cubic-bezier(0.16,1,0.3,1) both',
          background: 'var(--p-white, #fff)',
          boxShadow: '0 20px 60px -12px rgba(0,0,0,0.18), 0 0 0 1px var(--p-line, rgba(0,0,0,0.06))',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--rule-light)]">
          <div>
            <div className="flex items-baseline gap-2.5">
              <h2
                className="text-[13px] uppercase text-[var(--text-primary)]"
                style={{
                  fontFamily: 'var(--era-text)',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                }}
              >
                Events
              </h2>
              {total > 0 && (
                <span
                  className="text-[10px] uppercase text-[var(--text-tertiary)]"
                  style={{
                    fontFamily: 'var(--era-text)',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                  }}
                >
                  {total}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowLeavePrompt(true)}
              className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--royal)] transition-colors cursor-pointer mt-0.5"
              style={{ fontFamily: 'var(--era-text)', fontWeight: 400, letterSpacing: '0.02em' }}
            >
              norcalsbdc.org/events
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Leave-site prompt */}
        {showLeavePrompt && (
          <div className="px-5 py-2.5 bg-[var(--cream)] border-b border-[var(--rule-light)] flex items-center gap-3">
            <p
              className="flex-1 text-[11px] text-[var(--text-secondary)]"
              style={{ fontFamily: 'var(--era-text)' }}
            >
              Opens norcalsbdc.org in a new tab.
            </p>
            <a
              href="https://www.norcalsbdc.org/events"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowLeavePrompt(false)}
              className="px-3 py-1 text-[10px] font-medium uppercase text-white bg-[var(--royal)] rounded-md hover:bg-[#1a4f96] transition-colors shrink-0"
              style={{ fontFamily: 'var(--era-text)', letterSpacing: '0.06em' }}
            >
              Go
            </a>
            <button
              onClick={() => setShowLeavePrompt(false)}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
          {loading && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <svg className="w-5 h-5 animate-spin text-[var(--royal)]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span
                className="text-[11px] text-[var(--text-tertiary)]"
                style={{ fontFamily: 'var(--era-text)', fontWeight: 400 }}
              >
                Loading...
              </span>
            </div>
          )}

          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200/60 text-[12px] text-red-600" style={{ fontFamily: 'var(--era-text)' }}>
              {error}
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-1">
              <span
                className="text-[11px] text-[var(--text-tertiary)]"
                style={{ fontFamily: 'var(--era-text)', fontWeight: 400 }}
              >
                No upcoming events
              </span>
            </div>
          )}

          {events.map((event, i) => (
            <EventCard key={`${event.event_url}-${i}`} event={event} onAction={onEventAction} />
          ))}
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-[var(--rule-light)]">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="text-[10px] uppercase text-[var(--royal)] disabled:text-[var(--text-tertiary)]/30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              style={{ fontFamily: 'var(--era-text)', fontWeight: 500, letterSpacing: '0.08em' }}
            >
              Prev
            </button>
            <span
              className="text-[10px] text-[var(--text-tertiary)] tabular-nums"
              style={{ fontFamily: 'var(--era-text)', fontWeight: 400 }}
            >
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="text-[10px] uppercase text-[var(--royal)] disabled:text-[var(--text-tertiary)]/30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              style={{ fontFamily: 'var(--era-text)', fontWeight: 500, letterSpacing: '0.08em' }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}


function EventCard({ event, onAction }: { event: EventItem; onAction?: (event: EventItem, action: EventAction) => void }) {
  return (
    <div className="
      group px-3.5 py-3
      rounded-lg
      border border-transparent
      hover:bg-[var(--cream)]/50
      transition-colors duration-150
    ">
      {/* Top row: center + cost */}
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-[9px] uppercase text-[var(--text-tertiary)]"
          style={{ fontFamily: 'var(--era-text)', fontWeight: 500, letterSpacing: '0.06em' }}
        >
          {event.center || 'NorCal SBDC'}
        </span>
        {event.cost && (
          <span
            className={`
              text-[9px] uppercase px-1.5 py-px rounded
              ${event.cost.toLowerCase() === 'free'
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-amber-600 bg-amber-50'}
            `}
            style={{ fontFamily: 'var(--era-text)', fontWeight: 500, letterSpacing: '0.04em' }}
          >
            {event.cost}
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        className="text-[15px] text-[var(--text-primary)] leading-snug mb-1"
        style={{ fontFamily: 'var(--era-text)', fontWeight: 700 }}
      >
        {event.title}
      </h3>

      {/* Date / time — single line */}
      {(event.date || event.time) && (
        <p
          className="text-[11px] text-[var(--text-secondary)] mb-1.5"
          style={{ fontFamily: 'var(--era-text)', fontWeight: 400 }}
        >
          {[event.date, event.time].filter(Boolean).join(' · ')}
        </p>
      )}

      {/* Summary — 2 lines max */}
      {event.summary && (
        <p
          className="text-[12px] text-[var(--text-secondary)] leading-relaxed mb-2.5 line-clamp-2"
          style={{ fontFamily: 'var(--era-text)', fontWeight: 400 }}
        >
          {event.summary}
        </p>
      )}

      {/* Actions — compact, mobile-first */}
      {onAction && (
        <div className="flex items-center gap-4">
          <button
            onClick={() => onAction(event, 'promote')}
            className="text-[10px] uppercase text-[var(--royal)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--era-text)', fontWeight: 600, letterSpacing: '0.08em' }}
          >
            Promote
          </button>
          <button
            onClick={() => onAction(event, 'learn')}
            className="text-[10px] uppercase text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--era-text)', fontWeight: 500, letterSpacing: '0.08em' }}
          >
            Details
          </button>
        </div>
      )}
    </div>
  );
}
