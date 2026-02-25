'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import ThemeToggle from '@/components/ui/ThemeToggle';
import './brand.css';

/* ═══════════════════════════════════════════════════════
   BrandHouse — NorCal SBDC Visual Identity Reference
   Single-page scrollable brand guide with 7 sections.
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
  { name: 'Cream', hex: '#f0efeb', css: '--cream', text: '#0f1c2e', usage: 'Page backgrounds, cards, subtle surfaces' },
  { name: 'Brick', hex: '#a82039', css: '--brick', text: '#ffffff', usage: 'Alerts, warnings, emphasis moments' },
] as const;

// ── Font Families ──
const FONTS = [
  {
    name: 'GT Era Display',
    css: '--display',
    role: 'Display & Headlines',
    weights: [
      { label: 'Thin', value: 100 },
      { label: 'Light', value: 300 },
      { label: 'Medium', value: 500 },
    ],
    sample: 'Empowering Northern California Small Businesses',
    description: 'The hero font. Used for page titles, section headings, and brand moments.',
  },
  {
    name: 'GT Era Text',
    css: '--era-text',
    role: 'Body Text',
    weights: [
      { label: 'Thin', value: 100 },
      { label: 'Medium', value: 400 },
      { label: 'Bold', value: 700 },
      { label: 'Heavy', value: 900 },
    ],
    sample: 'The NorCal SBDC provides free, confidential business advising to entrepreneurs across 36 counties.',
    description: 'The workhorse. Used for body copy, form labels, descriptions, and extended reading.',
  },
  {
    name: 'GT America',
    css: '--sans',
    role: 'UI & Navigation',
    weights: [
      { label: 'Light', value: 300 },
      { label: 'Regular', value: 400 },
      { label: 'Medium', value: 500 },
      { label: 'Bold', value: 700 },
    ],
    sample: 'Navigation elements, buttons, form inputs, and system-level UI.',
    description: 'The system sans. Used for navigation, buttons, metadata, and small UI text.',
  },
  {
    name: 'Tobias',
    css: '--serif',
    role: 'Editorial & Accent',
    weights: [
      { label: 'Regular', value: 400 },
      { label: 'Regular Italic', value: 400, style: 'italic' as const },
      { label: 'Medium', value: 500 },
      { label: 'Bold', value: 700 },
    ],
    sample: 'Stories of real impact, told with warmth and credibility.',
    description: 'The editorial serif. Used for callouts, testimonials, and moments that need warmth.',
  },
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
    description: 'We let our impact numbers speak. $547M in capital accessed. 7,500+ entrepreneurs served. We state facts clearly without overselling or hedging.',
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
    description: 'Business owners learn about SBDC services through outreach, referrals, and online presence.',
    touchpoints: ['Website', 'Events', 'Partner referrals', 'Marketing'],
    color: '#8FC5D9',
    link: null,
  },
  {
    stage: 'Intake',
    description: 'New clients complete the guided SBA 641 intake form, capturing their business profile and goals.',
    touchpoints: ['Smart 641 Wizard', 'SBA 641 Form', 'Center assignment'],
    color: '#1D5AA7',
    link: '/intake',
  },
  {
    stage: 'Advising',
    description: 'Free, confidential one-on-one business consulting. Capital access support, specialist referrals, and accountability.',
    touchpoints: ['Advisory sessions', 'Action plans', 'Specialist referrals'],
    color: '#0f1c2e',
    link: null,
  },
  {
    stage: 'Milestones',
    description: 'Track concrete outcomes \u2014 capital accessed, jobs created, revenue growth, business starts.',
    touchpoints: ['Milestone wizard', 'Neoserra sync', 'Impact data'],
    color: '#a82039',
    link: '/milestones',
  },
  {
    stage: 'Impact',
    description: 'Aggregated data tells the story of SBDC impact across Northern California.',
    touchpoints: ['Atlas dashboard', 'SBA reporting', 'Success stories'],
    color: '#16a34a',
    link: '/atlas',
  },
] as const;

// ── Programs ──
const SPECIAL_PROGRAMS = [
  { name: 'TFG / FAST', description: 'SBIR/STTR application support. 57% win rate, $1B+ capital raised.', badge: 'Technology' },
  { name: 'Finance Center', description: 'Centralized capital access hub. Loan packaging, lender matching, SBA navigation. $240M+ capital accessed.', badge: 'Capital' },
  { name: 'Beauty Boss', description: 'Industry-specific program for beauty and personal care entrepreneurs. Branding, licensing, product development.', badge: 'Industry' },
  { name: 'APEX Accelerator', description: 'Federal contracting support. Helps businesses pursue DoD and other federal contract opportunities.', badge: 'Contracting' },
] as const;

const NETWORK_STATS = [
  { num: '14', label: 'Centers' },
  { num: '63', label: 'Advisors' },
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
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
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
          height: 48,
          background: 'var(--p-cream, #faf8f4)',
          borderBottom: '1px solid var(--p-line, #e7e2da)',
          padding: '0 24px',
          gap: 0,
        }}
      >
        <a
          href="/"
          className="shrink-0 no-underline transition-colors duration-150"
          style={{ fontFamily: 'var(--sans)', color: 'var(--p-muted, #a8a29e)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 16 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--p-ink, #1a1a1a)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--p-muted, #a8a29e)'; }}
        >
          &larr; Back
        </a>
        <div className="shrink-0" style={{ width: 1, height: 16, background: 'var(--p-line, #e7e2da)', marginRight: 8 }} />
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`bh-nav-item cursor-pointer whitespace-nowrap shrink-0 ${activeSection === id ? 'bh-active' : ''}`}
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 11,
              fontWeight: activeSection === id ? 700 : 400,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '14px 10px',
              background: 'none',
              border: 'none',
              color: activeSection === id ? 'var(--p-ink, #1a1a1a)' : 'var(--p-muted, #a8a29e)',
              transition: 'color 0.2s ease',
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
         S1: HERO
         ════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative flex flex-col items-center justify-center"
        style={{ minHeight: 'calc(100dvh - 48px)', background: 'var(--p-sand, #f3efe8)', padding: '80px 24px 48px' }}
      >
        <div className="pv-stagger-1" style={{ marginBottom: 48 }}>
          <Image
            src="/sbdc-blue-2026.png"
            alt="NorCal SBDC"
            width={280}
            height={72}
            style={{ height: 64, width: 'auto' }}
            priority
          />
        </div>

        <h1
          className="pv-stagger-2"
          style={{
            fontFamily: 'var(--display)',
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 300,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'var(--p-ink, #1a1a1a)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Brand House
        </h1>

        <p
          className="pv-stagger-3"
          style={{
            fontFamily: 'var(--era-text)',
            fontSize: 16,
            fontWeight: 400,
            color: 'var(--p-mid, #57534e)',
            textAlign: 'center',
            maxWidth: 480,
            marginTop: 16,
            lineHeight: 1.6,
          }}
        >
          Visual identity, voice, and design system for NorCal SBDC.
        </p>

        {/* Scroll indicator */}
        <div
          className="bh-scroll-indicator absolute"
          style={{ bottom: 40, color: 'var(--p-muted, #a8a29e)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════════
         S2: COLORS
         ════════════════════════════════════════════ */}
      <section id="colors" className="bh-section" style={{ padding: '96px 24px', maxWidth: 960, margin: '0 auto' }}>
        <span className="learn-kicker" style={{ color: 'var(--p-muted)' }}>Visual Identity</span>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(24px, 4vw, 40px)',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          color: 'var(--p-ink)',
          margin: '12px 0 48px',
        }}>
          Color Palette
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {PALETTE.map((color) => (
            <button
              key={color.hex}
              className={`bh-swatch ${copiedHex === color.hex ? 'bh-copy-success' : ''}`}
              onClick={() => copyHex(color.hex)}
              style={{
                background: color.hex,
                borderRadius: 12,
                padding: '32px 20px 20px',
                border: 'none',
                textAlign: 'left',
                position: 'relative',
              }}
            >
              <span style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 500, color: color.text, display: 'block' }}>
                {color.name}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.06em', color: color.text, opacity: 0.7, display: 'block', marginTop: 4 }}>
                {copiedHex === color.hex ? 'Copied!' : color.hex}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: color.text, opacity: 0.45, display: 'block', marginTop: 2 }}>
                {color.css}
              </span>
              <span style={{ fontFamily: 'var(--era-text)', fontSize: 12, color: color.text, opacity: 0.6, display: 'block', marginTop: 12, lineHeight: 1.4 }}>
                {color.usage}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
         S3: TYPOGRAPHY
         ════════════════════════════════════════════ */}
      <section id="typography" className="bh-section" style={{ padding: '96px 24px', maxWidth: 960, margin: '0 auto' }}>
        <span className="learn-kicker" style={{ color: 'var(--p-muted)' }}>Visual Identity</span>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(24px, 4vw, 40px)',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          color: 'var(--p-ink)',
          margin: '12px 0 48px',
        }}>
          Typography
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
          {FONTS.map((font) => (
            <div key={font.name} className="bh-type-specimen">
              <div className="flex items-baseline gap-3 flex-wrap" style={{ marginBottom: 8 }}>
                <h3 style={{ fontFamily: `var(${font.css})`, fontSize: 20, fontWeight: 500, color: 'var(--p-ink)', margin: 0 }}>
                  {font.name}
                </h3>
                <span className="learn-label" style={{ color: 'var(--p-muted)' }}>{font.role}</span>
              </div>

              <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', marginBottom: 24, maxWidth: 520, lineHeight: 1.5 }}>
                {font.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {font.weights.map((w) => (
                  <div key={w.label} className="flex items-baseline gap-4 flex-wrap">
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 400, color: 'var(--p-muted)',
                      width: 120, flexShrink: 0, letterSpacing: '0.04em',
                    }}>
                      {w.label} ({w.value})
                    </span>
                    <span style={{
                      fontFamily: `var(${font.css})`, fontSize: 22, fontWeight: w.value,
                      fontStyle: ('style' in w ? w.style : 'normal') as string,
                      color: 'var(--p-ink)', lineHeight: 1.3,
                    }}>
                      {font.sample}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Type Scale */}
        <div style={{ marginTop: 64 }}>
          <h3 style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 500, color: 'var(--p-ink)', marginBottom: 24 }}>
            Type Scale
          </h3>
          {[
            { cls: '.learn-display', font: 'var(--display)', size: '48px', weight: 300, tracking: '-0.035em', sample: 'Display heading' },
            { cls: '.text-heading',  font: 'var(--serif)',   size: '28px', weight: 500, tracking: '0', sample: 'Section heading' },
            { cls: '.text-body',     font: 'var(--sans)',    size: '15px', weight: 300, tracking: '0', sample: 'Body text \u2014 the workhorse of the design system.' },
            { cls: '.text-label',    font: 'var(--mono)',    size: '11px', weight: 400, tracking: '0.08em', sample: 'LABEL TEXT' },
            { cls: '.text-kicker',   font: 'var(--mono)',    size: '12px', weight: 400, tracking: '0.06em', sample: 'KICKER TEXT' },
          ].map((t) => (
            <div key={t.cls} className="flex items-baseline gap-6 flex-wrap" style={{ marginBottom: 16, borderBottom: '1px solid var(--p-line)', paddingBottom: 16 }}>
              <code style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--p-blue, #2456e3)', width: 110, flexShrink: 0 }}>{t.cls}</code>
              <span style={{ fontFamily: t.font, fontSize: t.size, fontWeight: t.weight, letterSpacing: t.tracking, color: 'var(--p-ink)' }}>
                {t.sample}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
         S4: LOGO USAGE
         ════════════════════════════════════════════ */}
      <section id="logo" className="bh-section" style={{ padding: '96px 24px', maxWidth: 960, margin: '0 auto' }}>
        <span className="learn-kicker" style={{ color: 'var(--p-muted)' }}>Identity</span>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(24px, 4vw, 40px)',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: 'var(--p-ink)',
          margin: '12px 0 48px',
        }}>
          Logo Usage
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {/* Blue on White */}
          <div className="bh-logo-item" style={{ background: '#ffffff', borderRadius: 12, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--p-line)', position: 'relative' }}>
            <Image src="/sbdc-blue-2026.png" alt="SBDC Blue Logo" width={200} height={50} style={{ height: 44, width: 'auto' }} />
            <span className="learn-label" style={{ position: 'absolute', bottom: 12, left: 16, color: '#a8a29e' }}>Blue on White</span>
          </div>

          {/* White on Navy */}
          <div className="bh-logo-item" style={{ background: '#0f1c2e', borderRadius: 12, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Image src="/sbdc-white-2026.png" alt="SBDC White Logo" width={200} height={50} style={{ height: 44, width: 'auto' }} />
            <span className="learn-label" style={{ position: 'absolute', bottom: 12, left: 16, color: 'rgba(255,255,255,0.45)' }}>White on Navy</span>
          </div>

          {/* White on Royal */}
          <div className="bh-logo-item" style={{ background: '#1D5AA7', borderRadius: 12, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Image src="/sbdc-white-2026.png" alt="SBDC White Logo on Royal" width={200} height={50} style={{ height: 44, width: 'auto' }} />
            <span className="learn-label" style={{ position: 'absolute', bottom: 12, left: 16, color: 'rgba(255,255,255,0.45)' }}>White on Royal</span>
          </div>

          {/* Blue on Cream */}
          <div className="bh-logo-item" style={{ background: '#f0efeb', borderRadius: 12, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--p-line)', position: 'relative' }}>
            <Image src="/sbdc-blue-2026.png" alt="SBDC Blue Logo on Cream" width={200} height={50} style={{ height: 44, width: 'auto' }} />
            <span className="learn-label" style={{ position: 'absolute', bottom: 12, left: 16, color: '#a8a29e' }}>Blue on Cream</span>
          </div>
        </div>

        {/* Guidelines */}
        <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 700, color: 'var(--p-ink)', marginBottom: 8 }}>Clear Space</h3>
            <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6 }}>
              Maintain minimum clear space equal to the height of the &ldquo;S&rdquo; in SBDC around all sides of the logo.
            </p>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 700, color: 'var(--p-ink)', marginBottom: 8 }}>Minimum Size</h3>
            <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6 }}>
              Never smaller than 120px wide for digital or 1.5 inches for print to ensure legibility.
            </p>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 700, color: 'var(--p-ink)', marginBottom: 8 }}>Don&apos;ts</h3>
            <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6 }}>
              Do not stretch, rotate, add effects, change colors arbitrarily, or place on busy backgrounds.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
         S5: BRAND VOICE
         ════════════════════════════════════════════ */}
      <section id="voice" className="bh-section" style={{ padding: '96px 24px', maxWidth: 960, margin: '0 auto' }}>
        <span className="learn-kicker" style={{ color: 'var(--p-muted)' }}>Tone</span>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(24px, 4vw, 40px)',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: 'var(--p-ink)',
          margin: '12px 0 48px',
        }}>
          Brand Voice
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {VOICE_ATTRIBUTES.map((attr) => (
            <div
              key={attr.trait}
              style={{
                background: 'var(--p-cream, #faf8f4)',
                borderRadius: 12,
                padding: '28px 28px 24px',
                border: '1px solid var(--p-line, #e7e2da)',
              }}
            >
              <div className="flex items-baseline gap-3 flex-wrap" style={{ marginBottom: 12 }}>
                <h3 style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 500, color: 'var(--p-ink)', margin: 0 }}>
                  {attr.trait}
                </h3>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--p-muted)', textTransform: 'uppercase' }}>
                  {attr.contrast}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--era-text)', fontSize: 14, color: 'var(--p-mid)', lineHeight: 1.6, margin: 0 }}>
                {attr.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
         S6: CLIENT JOURNEY
         ════════════════════════════════════════════ */}
      <section id="journey" className="bh-section" style={{ padding: '96px 24px', maxWidth: 960, margin: '0 auto' }}>
        <span className="learn-kicker" style={{ color: 'var(--p-muted)' }}>Architecture</span>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(24px, 4vw, 40px)',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: 'var(--p-ink)',
          margin: '12px 0 48px',
        }}>
          Client Journey
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {JOURNEY_STAGES.map((stage, i) => (
            <div
              key={stage.stage}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 20,
                padding: '24px 0',
                borderBottom: i < JOURNEY_STAGES.length - 1 ? '1px solid var(--p-line)' : 'none',
              }}
            >
              {/* Stage number */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 4, flexShrink: 0 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: stage.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                    {i + 1}
                  </span>
                </div>
                {i < JOURNEY_STAGES.length - 1 && (
                  <div style={{ width: 1, height: 24, background: 'var(--p-line)' }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h3 style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 500, color: 'var(--p-ink)', margin: 0 }}>
                    {stage.stage}
                  </h3>
                  {stage.link && (
                    <a
                      href={stage.link}
                      style={{
                        fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: 'var(--p-blue, #2456e3)', textDecoration: 'none',
                      }}
                    >
                      View tool &rarr;
                    </a>
                  )}
                </div>
                <p style={{ fontFamily: 'var(--era-text)', fontSize: 14, color: 'var(--p-mid)', lineHeight: 1.6, margin: '8px 0 12px' }}>
                  {stage.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {stage.touchpoints.map((tp) => (
                    <span
                      key={tp}
                      style={{
                        fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 400, letterSpacing: '0.04em',
                        padding: '3px 10px', borderRadius: 99, background: 'var(--p-tint, #eae5dd)', color: 'var(--p-mid)',
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
      <section id="programs" className="bh-section" style={{ padding: '96px 24px 128px', maxWidth: 960, margin: '0 auto' }}>
        <span className="learn-kicker" style={{ color: 'var(--p-muted)' }}>Network</span>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(24px, 4vw, 40px)',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          color: 'var(--p-ink)',
          margin: '12px 0 16px',
        }}>
          14 Centers. 36 Counties. One Network.
        </h2>
        <p style={{ fontFamily: 'var(--era-text)', fontSize: 15, color: 'var(--p-mid)', lineHeight: 1.6, maxWidth: 640, marginBottom: 40 }}>
          NorCal SBDC operates 14 service centers spanning Northern California &mdash; from the Oregon border to the Sacramento Valley.
        </p>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16, marginBottom: 48 }}>
          {NETWORK_STATS.map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 500, color: 'var(--p-ink)', letterSpacing: '-0.02em' }}>
                {stat.num}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--p-muted)', marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Special Programs */}
        <h3 style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 500, color: 'var(--p-ink)', marginBottom: 20 }}>
          Special Programs
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {SPECIAL_PROGRAMS.map((prog) => (
            <div
              key={prog.name}
              className="learn-card-hover"
              style={{
                background: 'var(--p-cream, #faf8f4)',
                borderRadius: 12,
                padding: '24px 24px 20px',
                border: '1px solid var(--p-line, #e7e2da)',
              }}
            >
              <span className="learn-label" style={{ color: 'var(--p-blue, #2456e3)', marginBottom: 8, display: 'block' }}>
                {prog.badge}
              </span>
              <h4 style={{ fontFamily: 'var(--display)', fontSize: 17, fontWeight: 500, color: 'var(--p-ink)', margin: '0 0 8px' }}>
                {prog.name}
              </h4>
              <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.5, margin: 0 }}>
                {prog.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: 24,
          textAlign: 'center',
          fontFamily: 'var(--era-text)',
          fontSize: 11,
          color: 'var(--p-muted, #a8a29e)',
          borderTop: '1px solid var(--p-line, #e7e2da)',
          letterSpacing: '0.02em',
        }}
      >
        NorCal SBDC Brand House &mdash; Internal reference
      </footer>
    </div>
  );
}
