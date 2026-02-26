'use client';

import { useState, useEffect, useCallback } from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import './brand.css';
import './email-templates.css';

/* ═══════════════════════════════════════════════════════
   EmailTemplates — Email & Newsletter preview page
   Sub-page of Brand House. Same design system.
   ═══════════════════════════════════════════════════════ */

// ── Section Nav ──
const SECTIONS = [
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'signatures', label: 'Signatures' },
  { id: 'events',     label: 'Special Events' },
  { id: 'trainings',  label: 'Trainings' },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

// ── Onboarding Emails ──
const ONBOARDING_EMAILS = [
  {
    label: 'Email 1 of 3',
    subject: "You're in.",
    description: 'Welcome email — announces access to 300+ advisors, features stat highlights ($547M capital, $0 cost), and sets expectations for advisor outreach within 48 hours.',
    href: '/brand/emails/welcome-email-1.html',
    preview: 'onboarding',
  },
  {
    label: 'Email 2 of 3',
    subject: "You're getting a person.",
    description: 'Advisor intro — emphasizes personal matching with a real advisor who\'s been there, includes client testimonial, and sets expectations for first session.',
    href: '/brand/emails/welcome-email-2.html',
    preview: 'onboarding-dark',
  },
  {
    label: 'Email 3 of 3',
    subject: 'One question to answer.',
    description: 'Pre-session prep — asks the client to identify their one key challenge before meeting their advisor. Hands off to the advisor relationship.',
    href: '/brand/emails/welcome-email-3.html',
    preview: 'onboarding-dark',
  },
] as const;

// ── Special Events ──
const SPECIAL_EVENTS = [
  {
    name: 'SBDC Day Campaign',
    description: 'Two-email campaign celebrating SBDC Day and 20 years of momentum. Email 1: kick-off with impact stats. Email 2: success stories from across the network.',
    meta: 'HTML Email · 600px · 2 Emails',
    badge: 'Campaign',
    badgeType: 'pool',
    href: '/brand/emails/sbdc-day-emails.html',
    preview: 'campaign',
  },
  {
    name: 'Small Business Week',
    description: 'Celebratory email for National Small Business Week. Poetic, owner-focused tone — "This week is yours." Mist-to-cream color transition.',
    meta: 'HTML Email · 560px',
    badge: 'Event',
    badgeType: 'maroon',
    href: '/brand/emails/sbw-email-v3.html',
    preview: 'event',
  },
  {
    name: 'The Brief — Newsletter',
    description: 'Full-featured monthly newsletter with masthead, hero story, stats strip, network news, upcoming events calendar, success spotlight, and quick links.',
    meta: 'Newsletter · 600px',
    badge: 'Newsletter',
    badgeType: 'pool',
    href: '/brand/newsletters/the-brief-newsletter.html',
    preview: 'newsletter',
  },
] as const;

// ── Trainings & Events ──
const TRAININGS = [
  {
    name: 'Newsletter — Minimal',
    description: 'Compact, events-focused newsletter with featured training, event listings, client story quote, and CTA. Clean Inter + JetBrains Mono typography.',
    meta: 'Newsletter · 600px',
    badge: 'Newsletter',
    badgeType: 'pool',
    href: '/brand/newsletters/newsletter-minimal.html',
    preview: 'newsletter-minimal',
  },
  {
    name: 'The Brief — Zag',
    description: 'Alternative newsletter variant with bolder copy, asymmetric stats strip, pull quote section, and more editorial voice. Same structure, different energy.',
    meta: 'Newsletter · 600px',
    badge: 'Variant',
    badgeType: 'maroon',
    href: '/brand/newsletters/the-brief-zag.html',
    preview: 'newsletter',
  },
] as const;

// ── Preview background colors ──
const PREVIEW_BG: Record<string, string> = {
  onboarding: '#f8f7f4',
  'onboarding-dark': '#f8f7f4',
  signatures: '#0a0a0a',
  campaign: '#e8e8e8',
  event: '#c8d5e3',
  newsletter: '#1a1a1a',
  'newsletter-minimal': '#ddd',
};

// ── Mini Preview Mockups ──

function EmailPreview({ type }: { type: string }) {
  const line = (w: string, o = 0.08): React.CSSProperties => ({ width: w, height: 2, background: `rgba(0,0,0,${o})`, borderRadius: 1 });

  if (type === 'onboarding') {
    return (
      <div style={{ width: '38%', height: '76%', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', borderRadius: 2, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ height: '8%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5px' }}>
          <div style={{ width: '25%', height: 2, background: '#0f1c2e', borderRadius: 1 }} />
          <div style={{ width: '12%', height: 2, background: 'rgba(0,0,0,0.12)', borderRadius: 1 }} />
        </div>
        {/* Headline */}
        <div style={{ padding: '4px 5px 3px' }}>
          <div style={{ width: '60%', height: 3, background: '#0f1c2e', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '40%', height: 3, background: '#0f1c2e', borderRadius: 1 }} />
        </div>
        {/* Body lines */}
        <div style={{ padding: '4px 5px', flex: 1 }}>
          <div style={{ ...line('90%'), marginBottom: 2 }} />
          <div style={{ ...line('75%'), marginBottom: 2 }} />
          <div style={{ ...line('85%'), marginBottom: 4 }} />
          {/* Divider */}
          <div style={{ width: '20%', height: 2, background: '#c41230', borderRadius: 1, marginBottom: 4 }} />
          {/* Stats */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
            <div style={{ flex: 1, height: 12, background: '#0f1c2e', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '40%', height: 2, background: 'rgba(255,255,255,0.4)', borderRadius: 1 }} />
            </div>
            <div style={{ flex: 1, height: 12, background: '#0f1c2e', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '40%', height: 2, background: 'rgba(255,255,255,0.4)', borderRadius: 1 }} />
            </div>
          </div>
        </div>
        {/* Footer */}
        <div style={{ height: '10%', background: '#0f1c2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '35%', height: 2, background: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
        </div>
      </div>
    );
  }

  if (type === 'onboarding-dark') {
    return (
      <div style={{ width: '38%', height: '76%', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', borderRadius: 2, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ height: '8%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5px' }}>
          <div style={{ width: '25%', height: 2, background: '#0f1c2e', borderRadius: 1 }} />
          <div style={{ width: '12%', height: 2, background: 'rgba(0,0,0,0.12)', borderRadius: 1 }} />
        </div>
        {/* Headline */}
        <div style={{ padding: '4px 5px 3px' }}>
          <div style={{ width: '55%', height: 3, background: '#0f1c2e', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '35%', height: 3, background: '#0f1c2e', borderRadius: 1 }} />
        </div>
        {/* Body */}
        <div style={{ padding: '4px 5px 2px' }}>
          <div style={{ ...line('90%'), marginBottom: 2 }} />
          <div style={{ ...line('70%'), marginBottom: 3 }} />
          <div style={{ width: '20%', height: 2, background: '#c41230', borderRadius: 1, marginBottom: 3 }} />
        </div>
        {/* Dark quote block */}
        <div style={{ margin: '0 5px', background: '#0f1c2e', padding: 4, flex: 1 }}>
          <div style={{ width: '85%', height: 2, background: 'rgba(255,255,255,0.5)', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '65%', height: 2, background: 'rgba(255,255,255,0.5)', borderRadius: 1, marginBottom: 3 }} />
          <div style={{ width: '30%', height: 2, background: 'rgba(255,255,255,0.2)', borderRadius: 1 }} />
        </div>
        {/* Footer */}
        <div style={{ height: '10%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ width: '35%', height: 2, background: '#0f1c2e', borderRadius: 1 }} />
        </div>
      </div>
    );
  }

  if (type === 'signatures') {
    return (
      <div style={{ width: '62%', height: '62%', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
        {/* Sig 1: text only */}
        <div style={{ background: '#ffffff', borderRadius: 2, padding: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ width: '60%', height: 2, background: '#0f1c2e', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '80%', height: 1.5, background: 'rgba(0,0,0,0.12)', borderRadius: 1, marginBottom: 1 }} />
          <div style={{ width: '50%', height: 1.5, background: 'rgba(0,0,0,0.08)', borderRadius: 1 }} />
        </div>
        {/* Sig 2: gradient line */}
        <div style={{ background: '#ffffff', borderRadius: 2, padding: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ width: '60%', height: 2, background: '#0f1c2e', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '100%', height: 2, background: 'linear-gradient(90deg, #8FC5D9, #1D5AA7)', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '70%', height: 1.5, background: 'rgba(0,0,0,0.08)', borderRadius: 1 }} />
        </div>
        {/* Sig 3: bold card */}
        <div style={{ background: '#0f1c2e', borderRadius: 2, padding: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ width: '50%', height: 2, background: '#ffffff', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '70%', height: 1.5, background: 'rgba(255,255,255,0.3)', borderRadius: 1, marginBottom: 1 }} />
          <div style={{ width: '40%', height: 1.5, background: '#8FC5D9', borderRadius: 1 }} />
        </div>
        {/* Sig 4: compact */}
        <div style={{ background: '#ffffff', borderRadius: 2, padding: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: '#0f1c2e', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: '80%', height: 2, background: '#0f1c2e', borderRadius: 1, marginBottom: 1.5 }} />
              <div style={{ width: '50%', height: 1.5, background: 'rgba(0,0,0,0.1)', borderRadius: 1 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'campaign') {
    return (
      <div style={{ width: '38%', height: '76%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Email 1 */}
        <div style={{ flex: 1, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: '10%', background: '#0a0a0a', display: 'flex', alignItems: 'center', padding: '0 4px' }}>
            <div style={{ width: '30%', height: 2, background: '#8FC5D9', borderRadius: 1 }} />
          </div>
          <div style={{ height: '30%', background: '#0f1c2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '50%', height: 3, background: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
          </div>
          <div style={{ padding: 3, flex: 1 }}>
            <div style={{ width: '80%', height: 2, background: 'rgba(0,0,0,0.1)', borderRadius: 1, marginBottom: 2 }} />
            <div style={{ width: '60%', height: 2, background: 'rgba(0,0,0,0.06)', borderRadius: 1 }} />
          </div>
        </div>
        {/* Email 2 */}
        <div style={{ flex: 1, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: '10%', background: '#0a0a0a', display: 'flex', alignItems: 'center', padding: '0 4px' }}>
            <div style={{ width: '30%', height: 2, background: '#8FC5D9', borderRadius: 1 }} />
          </div>
          <div style={{ height: '24%', background: 'linear-gradient(135deg, #0f1c2e, #8FC5D9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '40%', height: 3, background: 'rgba(255,255,255,0.5)', borderRadius: 1 }} />
          </div>
          <div style={{ padding: 3, flex: 1 }}>
            <div style={{ width: '90%', height: 2, background: 'rgba(0,0,0,0.08)', borderRadius: 1, marginBottom: 2 }} />
            <div style={{ width: '70%', height: 2, background: 'rgba(0,0,0,0.06)', borderRadius: 1 }} />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'event') {
    return (
      <div style={{ width: '38%', height: '76%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 2 }}>
        {/* Mist top */}
        <div style={{ height: '35%', background: 'linear-gradient(to bottom, #c8d5e3, #e8e6e0)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 5 }}>
          <div style={{ width: '30%', height: 2, background: 'rgba(30,58,95,0.3)', borderRadius: 1, marginBottom: 3 }} />
          <div style={{ width: '55%', height: 4, background: '#1e3a5f', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '40%', height: 4, background: '#1e3a5f', borderRadius: 1 }} />
        </div>
        {/* Cream body */}
        <div style={{ flex: 1, background: '#f8f7f4', padding: 5 }}>
          <div style={{ width: '85%', height: 2, background: 'rgba(0,0,0,0.1)', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '70%', height: 2, background: 'rgba(0,0,0,0.08)', borderRadius: 1, marginBottom: 4 }} />
          <div style={{ width: '20%', height: 2, background: '#c23a3a', borderRadius: 1, marginBottom: 4 }} />
          <div style={{ width: '90%', height: 2, background: 'rgba(0,0,0,0.06)', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '65%', height: 2, background: 'rgba(0,0,0,0.06)', borderRadius: 1 }} />
        </div>
        {/* Gradient footer */}
        <div style={{ height: '12%', background: 'linear-gradient(135deg, #1e3a5f 0%, #4a6580 50%, #c23a3a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '40%', height: 2, background: 'rgba(255,255,255,0.5)', borderRadius: 1 }} />
        </div>
      </div>
    );
  }

  if (type === 'newsletter') {
    return (
      <div style={{ width: '38%', height: '76%', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', borderRadius: 2, overflow: 'hidden' }}>
        {/* Masthead */}
        <div style={{ height: '18%', background: '#0f1c2e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <div style={{ width: '20%', height: 2, background: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
          <div style={{ width: '40%', height: 3, background: '#ffffff', borderRadius: 1 }} />
        </div>
        {/* Hero story */}
        <div style={{ padding: '4px 5px 3px' }}>
          <div style={{ width: '80%', height: 3, background: '#0f1c2e', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '90%', height: 2, background: 'rgba(0,0,0,0.08)', borderRadius: 1, marginBottom: 1.5 }} />
          <div style={{ width: '70%', height: 2, background: 'rgba(0,0,0,0.08)', borderRadius: 1 }} />
        </div>
        {/* Stats strip */}
        <div style={{ display: 'flex', gap: 1, margin: '3px 5px', padding: '3px 0', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ width: '40%', height: 3, background: '#8FC5D9', borderRadius: 1, margin: '0 auto 1px' }} />
              <div style={{ width: '60%', height: 1.5, background: 'rgba(0,0,0,0.08)', borderRadius: 1, margin: '0 auto' }} />
            </div>
          ))}
        </div>
        {/* Content rows */}
        <div style={{ padding: '3px 5px', flex: 1 }}>
          <div style={{ width: '90%', height: 2, background: 'rgba(0,0,0,0.06)', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '75%', height: 2, background: 'rgba(0,0,0,0.06)', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '85%', height: 2, background: 'rgba(0,0,0,0.06)', borderRadius: 1 }} />
        </div>
        {/* Footer */}
        <div style={{ height: '8%', background: '#0f1c2e' }} />
      </div>
    );
  }

  if (type === 'newsletter-minimal') {
    return (
      <div style={{ width: '38%', height: '76%', background: '#F5F5ED', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderRadius: 2, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '4px 5px', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: '30%', height: 2, background: '#152445', borderRadius: 1 }} />
          <div style={{ width: '20%', height: 2, background: 'rgba(0,0,0,0.1)', borderRadius: 1 }} />
        </div>
        {/* Featured event */}
        <div style={{ padding: '5px 5px 3px' }}>
          <div style={{ width: '25%', height: 1.5, background: '#C23A3A', borderRadius: 1, marginBottom: 3 }} />
          <div style={{ width: '70%', height: 3, background: '#152445', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '85%', height: 2, background: 'rgba(0,0,0,0.08)', borderRadius: 1, marginBottom: 1.5 }} />
          <div style={{ width: '65%', height: 2, background: 'rgba(0,0,0,0.06)', borderRadius: 1 }} />
        </div>
        {/* Event list */}
        <div style={{ padding: '3px 5px', flex: 1, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', gap: 3, alignItems: 'center', marginBottom: 3 }}>
              <div style={{ width: 3, height: 3, borderRadius: 1, background: '#C23A3A', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: '70%', height: 2, background: 'rgba(0,0,0,0.1)', borderRadius: 1 }} />
              </div>
            </div>
          ))}
        </div>
        {/* Footer */}
        <div style={{ padding: '4px 5px', borderTop: '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
          <div style={{ width: '50%', height: 2, background: '#152445', borderRadius: 1, margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  return null;
}

// ── Hooks ──

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('bh-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    );
    const targets = document.querySelectorAll('.bh-section');
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);
}

function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>('onboarding');
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActive(visible[0].target.id as SectionId);
        }
      },
      { threshold: [0.2, 0.5, 0.8] },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return active;
}

// ═══════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════

export default function EmailTemplates() {
  useScrollReveal();
  const activeSection = useActiveSection();

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="bh-scroll" style={{ minHeight: '100dvh' }}>
      {/* ── Sticky Navigation ── */}
      <nav
        className="bh-nav sticky top-0 z-40 flex items-center overflow-x-auto"
        style={{
          height: 56,
          background: 'var(--p-cream, #faf8f4)',
          borderBottom: '1px solid var(--p-line, #e7e2da)',
          padding: '0 24px',
        }}
      >
        <a
          href="/brand"
          className="shrink-0 no-underline"
          style={{
            fontFamily: 'var(--era-text)',
            color: 'var(--p-muted, #a8a29e)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            marginRight: 20,
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--p-ink, #1a1a1a)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--p-muted, #a8a29e)'; }}
        >
          &larr; Brand House
        </a>
        <div className="shrink-0" style={{ width: 1, height: 20, background: 'var(--p-line, #e7e2da)', marginRight: 8 }} />
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`bh-nav-item cursor-pointer whitespace-nowrap shrink-0 ${activeSection === id ? 'bh-active' : ''}`}
            style={{
              fontFamily: 'var(--era-text)',
              fontSize: 10,
              fontWeight: activeSection === id ? 700 : 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              padding: '20px 12px',
              background: 'none',
              border: 'none',
              color: activeSection === id ? 'var(--p-ink, #1a1a1a)' : 'var(--p-muted, #a8a29e)',
              transition: 'color 0.25s ease',
            }}
          >
            {label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <ThemeToggle />
        </div>
      </nav>

      {/* ════════════════════════════════════════════
         HERO — Navy banner
         ════════════════════════════════════════════ */}
      <section
        className="et-hero relative"
        style={{
          background: '#0f1c2e',
          padding: 'clamp(56px, 8vw, 96px) 24px',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Breadcrumb */}
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 400,
            color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em',
            marginBottom: 24,
          }}>
            <a href="/brand" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
            >Brand House</a>
            {' / '}Email
          </div>

          <h1 style={{
            fontFamily: 'var(--display)',
            fontSize: 'clamp(32px, 6vw, 64px)',
            fontWeight: 100,
            color: '#ffffff',
            letterSpacing: '-0.035em',
            lineHeight: 1.05,
            margin: '0 0 20px',
          }}>
            Email Templates<br />&amp; Newsletters
          </h1>

          <p style={{
            fontFamily: 'var(--era-text)', fontSize: 15, fontWeight: 400,
            lineHeight: 1.7, color: 'rgba(255,255,255,0.4)',
            maxWidth: 520, margin: '0 0 40px',
          }}>
            Client onboarding sequences, email signatures, special event campaigns, and newsletter templates. Click any preview to view the full HTML.
          </p>

          {/* Stats */}
          <div
            className="et-hero-stats"
            style={{
              display: 'flex', gap: 48,
              paddingTop: 28,
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {[
              { num: '3', label: 'Onboarding Emails' },
              { num: '8', label: 'Signature Styles' },
              { num: '3', label: 'Event Campaigns' },
              { num: '2', label: 'Newsletter Variants' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{
                  fontFamily: 'var(--display)', fontWeight: 100,
                  fontSize: 'clamp(24px, 3.5vw, 40px)',
                  color: '#8FC5D9', lineHeight: 1, letterSpacing: '-0.02em',
                  marginBottom: 6,
                }}>
                  {stat.num}
                </div>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700,
                  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
                  color: 'rgba(255,255,255,0.3)',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
         CLIENT ONBOARDING
         ════════════════════════════════════════════ */}
      <section id="onboarding" className="bh-section" style={{ padding: '96px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ borderTop: '1px solid var(--p-line)', paddingTop: 28, marginBottom: 56 }}>
          <h2 style={{
            fontFamily: 'var(--display)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 300,
            color: 'var(--p-ink)', letterSpacing: '-0.015em', marginBottom: 8,
          }}>
            Client Onboarding
          </h2>
          <p style={{
            fontFamily: 'var(--era-text)', fontSize: 14, color: 'var(--p-mid)',
            lineHeight: 1.6, maxWidth: 520,
          }}>
            Three-email welcome sequence triggered after intake. Builds trust, sets expectations, and hands off to the assigned advisor.
          </p>
        </div>

        <div className="et-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {ONBOARDING_EMAILS.map((email) => (
            <a
              key={email.href}
              href={email.href}
              target="_blank"
              rel="noopener noreferrer"
              className="et-card"
              style={{ background: 'var(--p-cream, #faf8f4)', borderRadius: 0 }}
            >
              {/* Preview area */}
              <div style={{
                aspectRatio: '16/10',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
                background: PREVIEW_BG[email.preview],
              }}>
                <EmailPreview type={email.preview} />
                <span
                  className="et-tag et-tag-pool"
                  style={{ position: 'absolute', top: 10, right: 10 }}
                >
                  {email.label}
                </span>
              </div>
              {/* Card body */}
              <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 10,
                  textTransform: 'uppercase' as const, letterSpacing: '0.04em',
                  color: 'var(--p-ink)', marginBottom: 4,
                }}>
                  {email.subject}
                </div>
                <div style={{
                  fontFamily: 'var(--era-text)', fontWeight: 400, fontSize: 13,
                  lineHeight: 1.5, color: 'var(--p-mid)', marginBottom: 12,
                }}>
                  {email.description}
                </div>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 400,
                  color: 'var(--p-muted)', marginTop: 'auto',
                }}>
                  HTML Email · 560px
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
         EMAIL SIGNATURES
         ════════════════════════════════════════════ */}
      <section id="signatures" className="bh-section" style={{ padding: '96px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ borderTop: '1px solid var(--p-line)', paddingTop: 28, marginBottom: 56 }}>
          <h2 style={{
            fontFamily: 'var(--display)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 300,
            color: 'var(--p-ink)', letterSpacing: '-0.015em', marginBottom: 8,
          }}>
            Email Signatures
          </h2>
          <p style={{
            fontFamily: 'var(--era-text)', fontSize: 14, color: 'var(--p-mid)',
            lineHeight: 1.6, maxWidth: 520,
          }}>
            Eight signature styles from ultra-minimal text-only to bold card layouts. Includes implementation notes for Gmail, Outlook, and Apple Mail.
          </p>
        </div>

        <a
          href="/brand/emails/email-signatures.html"
          target="_blank"
          rel="noopener noreferrer"
          className="et-card"
          style={{ background: 'var(--p-cream, #faf8f4)', borderRadius: 0 }}
        >
          {/* Preview area */}
          <div style={{
            aspectRatio: '16/10',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
            background: PREVIEW_BG.signatures,
          }}>
            <EmailPreview type="signatures" />
            <span
              className="et-tag"
              style={{ position: 'absolute', top: 10, right: 10 }}
            >
              8 Styles
            </span>
          </div>
          {/* Card body */}
          <div style={{ padding: '20px 24px' }}>
            <div style={{
              fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 10,
              textTransform: 'uppercase' as const, letterSpacing: '0.04em',
              color: 'var(--p-ink)', marginBottom: 4,
            }}>
              Signature Gallery
            </div>
            <div style={{
              fontFamily: 'var(--era-text)', fontWeight: 400, fontSize: 13,
              lineHeight: 1.5, color: 'var(--p-mid)', marginBottom: 12,
            }}>
              S1 Text Only &middot; S2 Logo + Divider &middot; S3 Gradient Line &middot; S4 Logo + Gradient &middot; S5 Stacked Minimal &middot; S6 Bold Card &middot; S7 Horizontal &middot; S8 Compact Row
            </div>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 400,
              color: 'var(--p-muted)',
            }}>
              Web Preview · 8 Signatures · Implementation Notes
            </div>
          </div>
        </a>
      </section>

      {/* ════════════════════════════════════════════
         SPECIAL EVENTS
         ════════════════════════════════════════════ */}
      <section id="events" className="bh-section" style={{ padding: '96px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ borderTop: '1px solid var(--p-line)', paddingTop: 28, marginBottom: 56 }}>
          <h2 style={{
            fontFamily: 'var(--display)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 300,
            color: 'var(--p-ink)', letterSpacing: '-0.015em', marginBottom: 8,
          }}>
            Special Events
          </h2>
          <p style={{
            fontFamily: 'var(--era-text)', fontSize: 14, color: 'var(--p-mid)',
            lineHeight: 1.6, maxWidth: 520,
          }}>
            Campaign emails and newsletters for SBDC Day, Small Business Week, and recurring network communications.
          </p>
        </div>

        <div className="et-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {SPECIAL_EVENTS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="et-card"
              style={{ background: 'var(--p-cream, #faf8f4)', borderRadius: 0 }}
            >
              {/* Preview area */}
              <div style={{
                aspectRatio: '16/10',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
                background: PREVIEW_BG[item.preview],
              }}>
                <EmailPreview type={item.preview} />
                <span
                  className={`et-tag ${item.badgeType === 'pool' ? 'et-tag-pool' : item.badgeType === 'maroon' ? 'et-tag-maroon' : ''}`}
                  style={{ position: 'absolute', top: 10, right: 10 }}
                >
                  {item.badge}
                </span>
              </div>
              {/* Card body */}
              <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 10,
                  textTransform: 'uppercase' as const, letterSpacing: '0.04em',
                  color: 'var(--p-ink)', marginBottom: 4,
                }}>
                  {item.name}
                </div>
                <div style={{
                  fontFamily: 'var(--era-text)', fontWeight: 400, fontSize: 13,
                  lineHeight: 1.5, color: 'var(--p-mid)', marginBottom: 12,
                }}>
                  {item.description}
                </div>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 400,
                  color: 'var(--p-muted)', marginTop: 'auto',
                }}>
                  {item.meta}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
         TRAININGS & EVENTS
         ════════════════════════════════════════════ */}
      <section id="trainings" className="bh-section" style={{ padding: '96px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ borderTop: '1px solid var(--p-line)', paddingTop: 28, marginBottom: 56 }}>
          <h2 style={{
            fontFamily: 'var(--display)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 300,
            color: 'var(--p-ink)', letterSpacing: '-0.015em', marginBottom: 8,
          }}>
            Trainings &amp; Events
          </h2>
          <p style={{
            fontFamily: 'var(--era-text)', fontSize: 14, color: 'var(--p-mid)',
            lineHeight: 1.6, maxWidth: 520,
          }}>
            Newsletter templates for promoting workshops, training series, and upcoming events across the network.
          </p>
        </div>

        <div className="et-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {TRAININGS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="et-card"
              style={{ background: 'var(--p-cream, #faf8f4)', borderRadius: 0 }}
            >
              {/* Preview area */}
              <div style={{
                aspectRatio: '16/10',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
                background: PREVIEW_BG[item.preview],
              }}>
                <EmailPreview type={item.preview} />
                <span
                  className={`et-tag ${item.badgeType === 'pool' ? 'et-tag-pool' : item.badgeType === 'maroon' ? 'et-tag-maroon' : ''}`}
                  style={{ position: 'absolute', top: 10, right: 10 }}
                >
                  {item.badge}
                </span>
              </div>
              {/* Card body */}
              <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 10,
                  textTransform: 'uppercase' as const, letterSpacing: '0.04em',
                  color: 'var(--p-ink)', marginBottom: 4,
                }}>
                  {item.name}
                </div>
                <div style={{
                  fontFamily: 'var(--era-text)', fontWeight: 400, fontSize: 13,
                  lineHeight: 1.5, color: 'var(--p-mid)', marginBottom: 12,
                }}>
                  {item.description}
                </div>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 400,
                  color: 'var(--p-muted)', marginTop: 'auto',
                }}>
                  {item.meta}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: '28px 24px',
          textAlign: 'center',
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--p-muted, #a8a29e)',
          borderTop: '1px solid var(--p-line, #e7e2da)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
        }}
      >
        NorCal SBDC &mdash; Email Templates &amp; Newsletters &mdash; 2026
      </footer>
    </div>
  );
}
