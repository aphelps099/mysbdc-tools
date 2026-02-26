'use client';

import Link from 'next/link';
import Image from 'next/image';

/* ═══════════════════════════════════════════════════════
   / — NorCal SBDC Tools Index
   Landing page with links to every tool in the suite.
   ═══════════════════════════════════════════════════════ */

const tools = [
  {
    href: '/intake',
    name: 'Smart 641 Intake',
    description: 'Client intake wizard — collects info for the SBA 641 form in a guided, conversational flow.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M9 12h6" /><path d="M9 16h4" />
      </svg>
    ),
  },
  {
    href: '/milestones',
    name: 'Milestone Collection',
    description: 'Collect client milestones — jobs created, capital accessed, revenue changes, and more.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4" /><path d="M12 18v4" />
        <path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" />
        <path d="M2 12h4" /><path d="M18 12h4" />
        <path d="M4.93 19.07l2.83-2.83" /><path d="M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
  {
    href: '/milestone-log',
    name: 'Milestone Log',
    description: 'Review and manage submitted milestones — search, filter, and track client impact over time.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
      </svg>
    ),
  },
  {
    href: '/atlas',
    name: 'Atlas Dashboard',
    description: 'NorCal SBDC impact dashboard — capital accessed, jobs created, and regional performance at a glance.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/titles',
    name: 'Title Card Generator',
    description: 'Animated title cards for video — motion graphics-style text you can screen-record.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M7 8h10" /><path d="M12 8v8" />
      </svg>
    ),
  },
  {
    href: '/brand/email',
    name: 'Email Templates',
    description: 'Client onboarding emails, signatures, event campaigns, and newsletter templates — preview and reference.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    href: '/brand',
    name: 'Brand House',
    description: 'Visual identity, voice, and design system reference — colors, typography, logo usage, and more.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--cream, #f0efeb)',
        fontFamily: 'var(--sans)',
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          padding: '48px 24px 0',
          maxWidth: 820,
          margin: '0 auto',
        }}
      >
        <Image
          src="/sbdc-blue-2026.png"
          alt="NorCal SBDC"
          width={180}
          height={48}
          style={{ marginBottom: 32 }}
          priority
        />
        <h1
          style={{
            fontFamily: 'var(--display, var(--sans))',
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'var(--navy, #0f1c2e)',
            margin: 0,
          }}
        >
          Tools
        </h1>
        <p
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 15,
            color: 'var(--text-secondary, #4a5568)',
            marginTop: 8,
            marginBottom: 0,
            fontWeight: 300,
            lineHeight: 1.6,
          }}
        >
          Client-facing SBDC tools — intake, milestones, impact tracking, and more.
        </p>

        <hr
          style={{
            border: 'none',
            borderTop: '1px solid var(--rule, rgba(0,0,0,0.12))',
            margin: '24px 0 0',
          }}
        />
      </header>

      {/* ── Tool cards ── */}
      <main
        style={{
          maxWidth: 820,
          margin: '0 auto',
          padding: '24px 24px 64px',
          display: 'grid',
          gap: 16,
        }}
      >
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
              padding: '20px 24px',
              background: 'var(--white, #ffffff)',
              borderRadius: 'var(--radius-lg, 12px)',
              textDecoration: 'none',
              color: 'inherit',
              boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
              transition:
                'transform var(--duration-normal, 250ms) var(--ease, cubic-bezier(0.16,1,0.3,1)), box-shadow var(--duration-normal, 250ms) var(--ease, cubic-bezier(0.16,1,0.3,1))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow =
                'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))';
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: 48,
                height: 48,
                borderRadius: 10,
                background: 'var(--cream, #f0efeb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--royal, #1D5AA7)',
              }}
            >
              {tool.icon}
            </span>
            <span>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--sans)',
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'var(--navy, #0f1c2e)',
                  lineHeight: 1.3,
                }}
              >
                {tool.name}
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: 14,
                  color: 'var(--text-secondary, #4a5568)',
                  fontWeight: 300,
                  lineHeight: 1.5,
                  marginTop: 4,
                }}
              >
                {tool.description}
              </span>
            </span>
          </Link>
        ))}
      </main>
    </div>
  );
}
