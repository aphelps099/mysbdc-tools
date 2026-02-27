'use client';

import Link from 'next/link';
import Image from 'next/image';

/* ═══════════════════════════════════════════════════════
   / — NorCal SBDC Tools Index
   Landing page with links to every tool in the suite.
   ═══════════════════════════════════════════════════════ */

const tools = [
  {
    href: '/chat',
    name: 'Brand Chat',
    description: 'AI-powered brand content assistant — draft social posts, emails, talking points, and more via chat.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
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
    href: '/tfg-apply',
    name: 'TFG Application',
    description: 'Tech Futures Group application — multi-step startup intake with Neoserra PIN integration.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
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
    <div className="tools-page">
      {/* ── Header ── */}
      <header className="tools-header">
        <Image
          src="/sbdc-blue-2026.png"
          alt="NorCal SBDC"
          width={180}
          height={48}
          style={{ marginBottom: 32 }}
          priority
        />
        <h1 className="tools-title">Tools</h1>
        <p className="tools-desc">
          Internal tools for the NorCal SBDC team — content generation,
          client intake, milestone tracking, and brand resources.
        </p>
        <hr className="tools-rule" />
      </header>

      {/* ── Tool cards ── */}
      <main className="tools-grid">
        {tools.map((tool, i) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="tools-card"
            style={{ animationDelay: `${0.08 + i * 0.04}s` }}
          >
            <span className="tools-card-icon">
              {tool.icon}
            </span>
            <span>
              <span className="tools-card-name">{tool.name}</span>
              <span className="tools-card-desc">{tool.description}</span>
            </span>
          </Link>
        ))}
      </main>
    </div>
  );
}
