'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ThemeToggle from '@/components/ui/ThemeToggle';
import './brand.css';

/* ═══════════════════════════════════════════════════════
   BrandHouse — NorCal SBDC Visual Identity Reference
   Collins & Co / Pentagram caliber brand guide.
   ═══════════════════════════════════════════════════════ */

// ── Section IDs ──
const SECTIONS = [
  { id: 'hero',       label: 'Home' },
  { id: 'colors',     label: 'Colors' },
  { id: 'typography', label: 'Type' },
  { id: 'logo',       label: 'Logo' },
  { id: 'voice',      label: 'Voice' },
  { id: 'journey',    label: 'Journey' },
  { id: 'programs',   label: 'Network' },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

// ── Color Palette ──
const PALETTE = [
  { name: 'Navy',  hex: '#0f1c2e', css: '--navy',  text: '#ffffff', usage: 'Primary backgrounds, headers, authority' },
  { name: 'Royal', hex: '#1D5AA7', css: '--royal', text: '#ffffff', usage: 'CTAs, links, interactive elements' },
  { name: 'Pool',  hex: '#8FC5D9', css: '--pool',  text: '#0f1c2e', usage: 'Accents, highlights, secondary actions' },
  { name: 'Cream', hex: '#f0efeb', css: '--cream', text: '#0f1c2e', usage: 'Page backgrounds, cards, surfaces' },
  { name: 'Brick', hex: '#a82039', css: '--brick', text: '#ffffff', usage: 'Alerts, emphasis, critical moments' },
] as const;

// ── Voice Attributes ──
const VOICE_ATTRIBUTES = [
  {
    trait: 'Expert',
    contrast: 'not academic',
    description: 'We know small business inside and out. We share knowledge practically, using language entrepreneurs actually use. No jargon, no theory for theory\u2019s sake.',
  },
  {
    trait: 'Warm',
    contrast: 'not casual',
    description: 'We care about the people behind the businesses. Our tone is approachable and encouraging, but always professional. We are advisors, not buddies.',
  },
  {
    trait: 'Confident',
    contrast: 'not boastful',
    description: 'We let our impact numbers speak. $240M+ in capital accessed. 8,500+ entrepreneurs served. We state facts clearly without overselling.',
  },
  {
    trait: 'Action-oriented',
    contrast: 'not passive',
    description: 'Every piece of messaging should move someone toward a next step. We connect, prepare, advise, and grow. Our language does something.',
  },
] as const;

// ── Client Journey ──
const JOURNEY_STAGES = [
  {
    stage: 'Discover',
    description: 'Business owners learn about SBDC services through outreach, referrals, and digital presence.',
    touchpoints: ['Website', 'Events', 'Partner Referrals', 'Marketing'],
    color: '#8FC5D9',
    link: null,
  },
  {
    stage: 'Intake',
    description: 'New clients complete the guided SBA 641 intake form — capturing business profile, goals, and needs.',
    touchpoints: ['Smart 641 Wizard', 'Center Assignment'],
    color: '#1D5AA7',
    link: '/intake',
  },
  {
    stage: 'Advising',
    description: 'Free, confidential one-on-one business consulting. Capital access, strategy, compliance, and growth.',
    touchpoints: ['Advisory Sessions', 'Action Plans', 'Specialist Referrals'],
    color: '#0f1c2e',
    link: null,
  },
  {
    stage: 'Milestones',
    description: 'Track concrete outcomes — capital accessed, jobs created, revenue growth, business starts.',
    touchpoints: ['Milestone Wizard', 'Neoserra Sync', 'Impact Data'],
    color: '#a82039',
    link: '/milestones',
  },
  {
    stage: 'Impact',
    description: 'Aggregated data tells the full story of SBDC impact across Northern California.',
    touchpoints: ['Atlas Dashboard', 'SBA Reporting', 'Success Stories'],
    color: '#16a34a',
    link: '/atlas',
  },
] as const;

// ── Special Programs ──
const PROGRAMS = [
  { name: 'TFG / FAST',       category: 'Technology',   description: 'SBIR/STTR application support. 57% win rate, $1B+ capital raised.' },
  { name: 'AI University',     category: 'Technology',   description: 'AI readiness training and implementation guidance for small businesses.' },
  { name: 'Finance Center',    category: 'Capital',      description: 'Centralized capital access hub. Loan packaging, lender matching, SBA loan navigation.' },
  { name: 'SSBCI',             category: 'Capital',      description: 'State Small Business Credit Initiative — federal funds for underserved markets.' },
  { name: 'APEX Accelerator',  category: 'Contracting',  description: 'Federal contracting support for DoD and government contract opportunities.' },
  { name: 'Beauty Boss',       category: 'Industry',     description: 'Beauty and personal care entrepreneurs — branding, licensing, product development.' },
  { name: 'SBDC Health',       category: 'Industry',     description: 'Healthcare business advising — compliance, operations, growth strategy.' },
  { name: 'SBDC Eats',         category: 'Industry',     description: 'Food and beverage entrepreneurs — permitting, scaling, market access.' },
  { name: 'ProBiz',            category: 'Community',    description: 'Multilingual business support — serving diverse entrepreneur communities.' },
  { name: 'PRIME',             category: 'Community',    description: 'Microenterprise development — low-income and disadvantaged entrepreneurs.' },
] as const;

const NETWORK_STATS = [
  { num: '16',     label: 'Centers' },
  { num: '200+',   label: 'Advisors' },
  { num: '8,500+', label: 'Clients Served' },
  { num: '$240M+', label: 'Capital Accessed' },
] as const;

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
      { threshold: 0.12, rootMargin: '0px 0px -80px 0px' },
    );
    const targets = document.querySelectorAll('.bh-section');
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);
}

function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>('hero');
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

export default function BrandHouse() {
  useScrollReveal();
  const activeSection = useActiveSection();
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyHex = useCallback((hex: string) => {
    navigator.clipboard.writeText(hex).catch(() => {});
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  }, []);

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
          href="/"
          className="shrink-0 no-underline"
          style={{
            fontFamily: 'var(--mono)',
            color: 'var(--p-muted, #a8a29e)',
            fontSize: 10,
            fontWeight: 400,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            marginRight: 20,
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--p-ink, #1a1a1a)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--p-muted, #a8a29e)'; }}
        >
          &larr; Tools
        </a>
        <div className="shrink-0" style={{ width: 1, height: 20, background: 'var(--p-line, #e7e2da)', marginRight: 8 }} />
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`bh-nav-item cursor-pointer whitespace-nowrap shrink-0 ${activeSection === id ? 'bh-active' : ''}`}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              fontWeight: activeSection === id ? 700 : 400,
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
         S1: HERO — Cinematic
         ════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative bh-grain flex flex-col items-center justify-center"
        style={{
          minHeight: 'calc(100dvh - 56px)',
          background: 'var(--p-sand, #f3efe8)',
          padding: '80px 24px 48px',
          overflow: 'hidden',
        }}
      >
        <div className="pv-stagger-1" style={{ marginBottom: 64 }}>
          <Image
            src="/sbdc-blue-2026.png"
            alt="NorCal SBDC"
            width={180}
            height={48}
            style={{ height: 44, width: 'auto', opacity: 0.8 }}
            priority
          />
        </div>

        <h1
          className="bh-hero-title"
          style={{
            fontFamily: 'var(--display)',
            fontSize: 'clamp(52px, 12vw, 140px)',
            fontWeight: 100,
            letterSpacing: '-0.045em',
            lineHeight: 0.88,
            color: 'var(--p-ink, #1a1a1a)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Brand<br />House
        </h1>

        {/* Animated rule */}
        <div
          className="bh-hero-rule"
          style={{
            width: 56,
            height: 1,
            background: 'var(--p-muted, #a8a29e)',
            margin: '48px 0 36px',
          }}
        />

        <p
          className="bh-hero-sub"
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(15px, 2vw, 19px)',
            fontWeight: 400,
            fontStyle: 'italic',
            color: 'var(--p-mid, #57534e)',
            textAlign: 'center',
            maxWidth: 400,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Visual identity, voice &amp; design system for NorCal SBDC
        </p>

        {/* Scroll indicator */}
        <div
          className="bh-scroll-indicator absolute"
          style={{ bottom: 32, color: 'var(--p-muted, #a8a29e)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
            <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════════
         S2: COLORS
         ════════════════════════════════════════════ */}
      <section id="colors" className="bh-section" style={{ padding: '140px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <span className="learn-kicker" style={{ color: 'var(--p-muted)' }}>Visual Identity</span>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(32px, 6vw, 64px)',
          fontWeight: 100,
          letterSpacing: '-0.035em',
          lineHeight: 1.05,
          color: 'var(--p-ink)',
          margin: '16px 0 72px',
        }}>
          Color Palette
        </h2>

        <div className="bh-color-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {PALETTE.map((color) => (
            <button
              key={color.hex}
              className={`bh-swatch ${copiedHex === color.hex ? 'bh-copy-success' : ''}`}
              onClick={() => copyHex(color.hex)}
              style={{
                background: color.hex,
                borderRadius: 16,
                padding: '56px 24px 24px',
                border: 'none',
                textAlign: 'left',
                minHeight: 220,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}
            >
              <span style={{
                fontFamily: 'var(--display)',
                fontSize: 32,
                fontWeight: 300,
                color: color.text,
                display: 'block',
                letterSpacing: '-0.02em',
              }}>
                {color.name}
              </span>
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.06em',
                color: color.text,
                opacity: 0.6,
                display: 'block',
                marginTop: 10,
              }}>
                {copiedHex === color.hex ? 'Copied!' : color.hex}
              </span>
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: 9,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color: color.text,
                opacity: 0.35,
                display: 'block',
                marginTop: 2,
              }}>
                var({color.css})
              </span>
              <span style={{
                fontFamily: 'var(--era-text)',
                fontSize: 12,
                color: color.text,
                opacity: 0.5,
                display: 'block',
                marginTop: 16,
                lineHeight: 1.4,
              }}>
                {color.usage}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
         S3: TYPOGRAPHY — GT Era Display + Tobias
         ════════════════════════════════════════════ */}
      <section id="typography" className="bh-section" style={{ padding: '140px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <span className="learn-kicker" style={{ color: 'var(--p-muted)' }}>Visual Identity</span>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(32px, 6vw, 64px)',
          fontWeight: 100,
          letterSpacing: '-0.035em',
          lineHeight: 1.05,
          color: 'var(--p-ink)',
          margin: '16px 0 24px',
        }}>
          Typography
        </h2>
        <p style={{
          fontFamily: 'var(--era-text)',
          fontSize: 15,
          color: 'var(--p-mid)',
          lineHeight: 1.7,
          maxWidth: 520,
          marginBottom: 96,
        }}>
          GT Era Display is the voice of the brand — geometric, modern, unmistakable.
          Tobias provides editorial warmth for moments that need a human touch.
        </p>

        {/* ── GT Era Display — Primary ── */}
        <div className="bh-type-block" style={{ marginBottom: 96 }}>
          <div className="flex items-baseline gap-4 flex-wrap" style={{ marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 500, color: 'var(--p-ink)', margin: 0, letterSpacing: '-0.01em' }}>
              GT Era Display
            </h3>
            <span className="learn-label" style={{ color: 'var(--p-blue, #2456e3)' }}>Primary — Display &amp; Headlines</span>
          </div>

          {/* Massive glyph */}
          <div style={{
            fontFamily: 'var(--display)',
            fontSize: 'clamp(80px, 16vw, 200px)',
            fontWeight: 100,
            letterSpacing: '-0.05em',
            lineHeight: 0.85,
            color: 'var(--p-ink)',
            margin: '24px 0 56px',
          }}>
            Aa
          </div>

          {/* Weight specimens */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              { label: 'Thin', weight: 100, sample: 'Empowering Northern California' },
              { label: 'Light', weight: 300, sample: 'Empowering Northern California' },
              { label: 'Medium', weight: 500, sample: 'Empowering Northern California' },
            ].map((w) => (
              <div key={w.label} className="flex items-baseline gap-6 flex-wrap">
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--p-muted)',
                  width: 80, flexShrink: 0, letterSpacing: '0.04em',
                }}>
                  {w.label} {w.weight}
                </span>
                <span style={{
                  fontFamily: 'var(--display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: w.weight,
                  color: 'var(--p-ink)', lineHeight: 1.15, letterSpacing: '-0.025em',
                }}>
                  {w.sample}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tobias — Pairing Font ── */}
        <div className="bh-type-block" style={{ marginBottom: 96 }}>
          <div className="flex items-baseline gap-4 flex-wrap" style={{ marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, color: 'var(--p-ink)', margin: 0 }}>
              Tobias
            </h3>
            <span className="learn-label" style={{ color: 'var(--p-muted)' }}>Pairing — Editorial &amp; Accent</span>
          </div>

          {/* Large italic glyph */}
          <div style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(64px, 12vw, 160px)',
            fontWeight: 400,
            fontStyle: 'italic',
            letterSpacing: '-0.03em',
            lineHeight: 0.9,
            color: 'var(--p-ink)',
            margin: '24px 0 56px',
          }}>
            Aa
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              { label: 'Regular', weight: 400, style: 'normal' as const, sample: 'Stories of real impact, told with warmth.' },
              { label: 'Italic', weight: 400, style: 'italic' as const, sample: 'Stories of real impact, told with warmth.' },
              { label: 'Medium', weight: 500, style: 'normal' as const, sample: 'Stories of real impact, told with warmth.' },
            ].map((w) => (
              <div key={w.label} className="flex items-baseline gap-6 flex-wrap">
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--p-muted)',
                  width: 80, flexShrink: 0, letterSpacing: '0.04em',
                }}>
                  {w.label} {w.weight}
                </span>
                <span style={{
                  fontFamily: 'var(--serif)', fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: w.weight,
                  fontStyle: w.style, color: 'var(--p-ink)', lineHeight: 1.35,
                }}>
                  {w.sample}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Supporting Fonts — Brief ── */}
        <div style={{
          borderTop: '1px solid var(--p-line)',
          paddingTop: 40,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 40,
        }}
          className="bh-support-grid"
        >
          <div>
            <h4 style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500, color: 'var(--p-ink)', margin: '0 0 8px' }}>
              GT America
            </h4>
            <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6, margin: '0 0 16px' }}>
              System sans-serif for navigation, buttons, form inputs, and UI text.
            </p>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 300, color: 'var(--p-ink)', display: 'block' }}>
              The quick brown fox jumps over the lazy dog
            </span>
          </div>
          <div>
            <h4 style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 400, color: 'var(--p-ink)', margin: '0 0 8px' }}>
              GT America Mono
            </h4>
            <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Monospace for labels, kickers, metadata, and data display.
            </p>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 400, color: 'var(--p-ink)', display: 'block', letterSpacing: '0.02em' }}>
              8,500+ clients &middot; $240M capital &middot; 16 centers
            </span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
         S4: LOGO USAGE
         ════════════════════════════════════════════ */}
      <section id="logo" className="bh-section" style={{ padding: '140px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <span className="learn-kicker" style={{ color: 'var(--p-muted)' }}>Identity</span>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(32px, 6vw, 64px)',
          fontWeight: 100,
          letterSpacing: '-0.035em',
          color: 'var(--p-ink)',
          margin: '16px 0 72px',
        }}>
          Logo Usage
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {/* Blue on White */}
          <div className="bh-logo-item" style={{
            background: '#ffffff', borderRadius: 16, padding: 56,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--p-line)', position: 'relative', minHeight: 200,
          }}>
            <Image src="/sbdc-blue-2026.png" alt="SBDC Blue Logo" width={220} height={56} style={{ height: 48, width: 'auto' }} />
            <span className="learn-label" style={{ position: 'absolute', bottom: 16, left: 20, color: '#a8a29e' }}>Blue on White</span>
          </div>

          {/* White on Navy */}
          <div className="bh-logo-item" style={{
            background: '#0f1c2e', borderRadius: 16, padding: 56,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', minHeight: 200,
          }}>
            <Image src="/sbdc-white-2026.png" alt="SBDC White Logo" width={220} height={56} style={{ height: 48, width: 'auto' }} />
            <span className="learn-label" style={{ position: 'absolute', bottom: 16, left: 20, color: 'rgba(255,255,255,0.35)' }}>White on Navy</span>
          </div>

          {/* White on Royal */}
          <div className="bh-logo-item" style={{
            background: '#1D5AA7', borderRadius: 16, padding: 56,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', minHeight: 200,
          }}>
            <Image src="/sbdc-white-2026.png" alt="SBDC White Logo on Royal" width={220} height={56} style={{ height: 48, width: 'auto' }} />
            <span className="learn-label" style={{ position: 'absolute', bottom: 16, left: 20, color: 'rgba(255,255,255,0.35)' }}>White on Royal</span>
          </div>

          {/* Blue on Cream */}
          <div className="bh-logo-item" style={{
            background: '#f0efeb', borderRadius: 16, padding: 56,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--p-line)', position: 'relative', minHeight: 200,
          }}>
            <Image src="/sbdc-blue-2026.png" alt="SBDC Blue Logo on Cream" width={220} height={56} style={{ height: 48, width: 'auto' }} />
            <span className="learn-label" style={{ position: 'absolute', bottom: 16, left: 20, color: '#a8a29e' }}>Blue on Cream</span>
          </div>
        </div>

        {/* Guidelines */}
        <div style={{ marginTop: 72, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }} className="bh-support-grid">
          <div>
            <h3 style={{ fontFamily: 'var(--display)', fontSize: 17, fontWeight: 500, color: 'var(--p-ink)', marginBottom: 10, letterSpacing: '-0.01em' }}>Clear Space</h3>
            <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6, margin: 0 }}>
              Maintain minimum clear space equal to the height of the &ldquo;S&rdquo; in SBDC around all sides.
            </p>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--display)', fontSize: 17, fontWeight: 500, color: 'var(--p-ink)', marginBottom: 10, letterSpacing: '-0.01em' }}>Minimum Size</h3>
            <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6, margin: 0 }}>
              120px minimum width for digital. 1.5 inches for print to ensure legibility.
            </p>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--display)', fontSize: 17, fontWeight: 500, color: 'var(--p-ink)', marginBottom: 10, letterSpacing: '-0.01em' }}>Don&apos;ts</h3>
            <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6, margin: 0 }}>
              Never stretch, rotate, recolor, add effects, or place on busy backgrounds.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
         S5: BRAND VOICE
         ════════════════════════════════════════════ */}
      <section id="voice" className="bh-section" style={{ padding: '140px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <span className="learn-kicker" style={{ color: 'var(--p-muted)' }}>Tone</span>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(32px, 6vw, 64px)',
          fontWeight: 100,
          letterSpacing: '-0.035em',
          color: 'var(--p-ink)',
          margin: '16px 0 72px',
        }}>
          Brand Voice
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {VOICE_ATTRIBUTES.map((attr, i) => (
            <div
              key={attr.trait}
              className="bh-voice-card bh-voice-layout"
              style={{
                padding: '44px 0',
                borderBottom: i < VOICE_ATTRIBUTES.length - 1 ? '1px solid var(--p-line, #e7e2da)' : 'none',
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: 32,
                alignItems: 'baseline',
              }}
            >
              <div>
                <h3 style={{
                  fontFamily: 'var(--display)',
                  fontSize: 'clamp(26px, 3.5vw, 40px)',
                  fontWeight: 300,
                  color: 'var(--p-ink)',
                  margin: 0,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                }}>
                  {attr.trait}
                </h3>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em',
                  color: 'var(--p-muted)', textTransform: 'uppercase' as const,
                  display: 'block', marginTop: 6,
                }}>
                  {attr.contrast}
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--era-text)', fontSize: 15, color: 'var(--p-mid)',
                lineHeight: 1.7, margin: 0, maxWidth: 520,
              }}>
                {attr.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
         S6: CLIENT JOURNEY
         ════════════════════════════════════════════ */}
      <section id="journey" className="bh-section" style={{ padding: '140px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <span className="learn-kicker" style={{ color: 'var(--p-muted)' }}>Architecture</span>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(32px, 6vw, 64px)',
          fontWeight: 100,
          letterSpacing: '-0.035em',
          color: 'var(--p-ink)',
          margin: '16px 0 72px',
        }}>
          Client Journey
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {JOURNEY_STAGES.map((stage, i) => (
            <div
              key={stage.stage}
              className="bh-stage"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 24,
                padding: '36px 0',
                borderBottom: i < JOURNEY_STAGES.length - 1 ? '1px solid var(--p-line)' : 'none',
              }}
            >
              {/* Stage indicator */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 8, flexShrink: 0 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: stage.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                    {i + 1}
                  </span>
                </div>
                {i < JOURNEY_STAGES.length - 1 && (
                  <div style={{ width: 1, height: 36, background: 'var(--p-line)' }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div className="flex items-baseline gap-4 flex-wrap">
                  <h3 style={{
                    fontFamily: 'var(--display)', fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 300,
                    color: 'var(--p-ink)', margin: 0, letterSpacing: '-0.015em',
                  }}>
                    {stage.stage}
                  </h3>
                  {stage.link && (
                    <a
                      href={stage.link}
                      style={{
                        fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em',
                        textTransform: 'uppercase' as const, color: 'var(--p-blue, #2456e3)', textDecoration: 'none',
                      }}
                    >
                      View tool &rarr;
                    </a>
                  )}
                </div>
                <p style={{ fontFamily: 'var(--era-text)', fontSize: 14, color: 'var(--p-mid)', lineHeight: 1.7, margin: '10px 0 16px' }}>
                  {stage.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {stage.touchpoints.map((tp) => (
                    <span
                      key={tp}
                      style={{
                        fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 400, letterSpacing: '0.04em',
                        padding: '4px 12px', borderRadius: 99,
                        background: 'var(--p-tint, #eae5dd)', color: 'var(--p-mid)',
                      }}
                    >
                      {tp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
         S7: PROGRAMS NETWORK
         ════════════════════════════════════════════ */}
      <section id="programs" className="bh-section" style={{ padding: '140px 24px 180px', maxWidth: 1080, margin: '0 auto' }}>
        <span className="learn-kicker" style={{ color: 'var(--p-muted)' }}>Network</span>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(32px, 6vw, 64px)',
          fontWeight: 100,
          letterSpacing: '-0.035em',
          color: 'var(--p-ink)',
          margin: '16px 0 20px',
          lineHeight: 1.05,
        }}>
          16 Centers.<br />36 Counties.<br />One Network.
        </h2>
        <p style={{
          fontFamily: 'var(--era-text)', fontSize: 15, color: 'var(--p-mid)',
          lineHeight: 1.7, maxWidth: 520, marginBottom: 64,
        }}>
          NorCal SBDC operates 16 service centers spanning Northern California &mdash; from the Oregon border to the Sacramento Valley and the coast.
        </p>

        {/* Stats */}
        <div className="bh-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 96 }}>
          {NETWORK_STATS.map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--display)',
                fontSize: 'clamp(32px, 5vw, 56px)',
                fontWeight: 100,
                color: 'var(--p-ink)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}>
                {stat.num}
              </div>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em',
                textTransform: 'uppercase' as const, color: 'var(--p-muted)', marginTop: 10,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Programs */}
        <h3 style={{
          fontFamily: 'var(--display)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 300,
          color: 'var(--p-ink)', marginBottom: 32, letterSpacing: '-0.015em',
        }}>
          Programs &amp; Initiatives
        </h3>
        <div className="bh-programs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {PROGRAMS.map((prog) => (
            <div
              key={prog.name}
              className="bh-program-card"
              style={{
                background: 'var(--p-cream, #faf8f4)',
                borderRadius: 16,
                padding: '24px 24px 20px',
                border: '1px solid var(--p-line, #e7e2da)',
              }}
            >
              <span className="learn-label" style={{ color: 'var(--p-blue, #2456e3)', marginBottom: 8, display: 'block' }}>
                {prog.category}
              </span>
              <h4 style={{
                fontFamily: 'var(--display)', fontSize: 17, fontWeight: 500,
                color: 'var(--p-ink)', margin: '0 0 8px', letterSpacing: '-0.01em',
              }}>
                {prog.name}
              </h4>
              <p style={{
                fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)',
                lineHeight: 1.5, margin: 0,
              }}>
                {prog.description}
              </p>
            </div>
          ))}
        </div>

        {/* Partner Ecosystem */}
        <div style={{ marginTop: 80, borderTop: '1px solid var(--p-line)', paddingTop: 48 }}>
          <h3 style={{
            fontFamily: 'var(--display)', fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 300,
            color: 'var(--p-ink)', marginBottom: 32, letterSpacing: '-0.015em',
          }}>
            Partner Ecosystem
          </h3>
          <div className="bh-partner-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 40 }}>
            <div>
              <h4 style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--p-muted)', marginBottom: 10 }}>
                Federal &amp; State
              </h4>
              <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6, margin: 0 }}>
                SBA, California Governor&apos;s Office of Business and Economic Development (GO-Biz), Employment Development Department
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--p-muted)', marginBottom: 10 }}>
                Lending &amp; Capital
              </h4>
              <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6, margin: 0 }}>
                CDFIs, SBA-preferred lenders, community banks, microloan intermediaries
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--p-muted)', marginBottom: 10 }}>
                Higher Education
              </h4>
              <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6, margin: 0 }}>
                CSU, Chico (host institution), community colleges, university extension programs across Northern California
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--p-muted)', marginBottom: 10 }}>
                Local &amp; Regional
              </h4>
              <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6, margin: 0 }}>
                Chambers of commerce, economic development corporations, workforce development boards, tribal organizations
              </p>
            </div>
          </div>
        </div>

        {/* Lender Resources CTA */}
        <a
          href="/brand/lender-resources"
          className="bh-program-card"
          style={{
            display: 'block',
            marginTop: 80,
            background: '#0f1c2e',
            borderRadius: 16,
            padding: 'clamp(40px, 5vw, 64px)',
            textDecoration: 'none',
            position: 'relative',
            overflow: 'hidden',
            border: 'none',
          }}
        >
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase' as const,
            color: '#8FC5D9', display: 'block', marginBottom: 12,
          }}>
            Resources
          </span>
          <span style={{
            fontFamily: 'var(--display)',
            fontSize: 'clamp(24px, 4vw, 40px)',
            fontWeight: 100,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            display: 'block',
            lineHeight: 1.1,
            marginBottom: 12,
          }}>
            Lender &amp; Partner Resources
          </span>
          <span style={{
            fontFamily: 'var(--era-text)', fontSize: 14, fontWeight: 400,
            color: 'rgba(255,255,255,0.45)', display: 'block',
            maxWidth: 440, lineHeight: 1.6, marginBottom: 24,
          }}>
            Guides, talking points, outreach templates, and quick-copy phrases for lending partnerships.
          </span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 400,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            color: '#8FC5D9',
          }}>
            View Resources &rarr;
          </span>
        </a>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: '36px 24px',
          textAlign: 'center',
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--p-muted, #a8a29e)',
          borderTop: '1px solid var(--p-line, #e7e2da)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
        }}
      >
        NorCal SBDC &mdash; Brand House &mdash; Internal Reference
      </footer>
    </div>
  );
}
