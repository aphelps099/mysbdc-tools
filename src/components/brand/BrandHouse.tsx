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
  { id: 'manifesto',  label: 'Manifesto' },
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
    description: 'We let our impact numbers speak. $549M in capital accessed. 8,500+ entrepreneurs served. We state facts clearly without overselling.',
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
  { name: 'TFG / FAST',       category: 'Technology',     description: 'SBIR/STTR application support. 57% win rate, $1B+ capital raised.' },
  { name: 'AI University',     category: 'Technology',     description: 'AI readiness training and implementation guidance for small businesses.' },
  { name: 'Finance Center',    category: 'Capital',        description: 'Centralized capital access hub. Loan packaging, lender matching, SBA loan navigation.' },
  { name: 'SSBCI',             category: 'Capital',        description: 'State Small Business Credit Initiative — federal funds for underserved markets.' },
  { name: 'R4I',               category: 'Manufacturing',  description: 'Resources for Innovation — manufacturing and innovation support for NorCal businesses.' },
  { name: 'APEX Accelerator',  category: 'Contracting',    description: 'Federal contracting support for DoD and government contract opportunities.' },
  { name: 'Beauty Boss',       category: 'Industry',       description: 'Beauty and personal care entrepreneurs — branding, licensing, product development.' },
  { name: 'SBDC Health',       category: 'Industry',       description: 'Healthcare business advising — compliance, operations, growth strategy.' },
  { name: 'SBDC Eats',         category: 'Industry',       description: 'Food and beverage entrepreneurs — permitting, scaling, market access.' },
  { name: 'ProBiz',            category: 'Community',      description: 'Multilingual business support — serving diverse entrepreneur communities.' },
  { name: 'PRIME',             category: 'Community',      description: 'Microenterprise development — low-income and disadvantaged entrepreneurs.' },
] as const;

const NETWORK_STATS = [
  { num: '16',     label: 'Centers' },
  { num: '200+',   label: 'Advisors' },
  { num: '8,500+', label: 'Clients Served' },
  { num: '$549M',  label: 'Capital Accessed' },
] as const;

// ── Inline SVG Logo Component ──
function SbdcLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`sbdc-logo ${className}`}
      viewBox="-2 -14 226.28 122.92"
      xmlns="http://www.w3.org/2000/svg"
      overflow="visible"
      style={{ width: '100%', height: 'auto' }}
    >
      <g>
        {/* S */}
        <path d="M12.78,86.94c1.49,2.32,2.77,4.26,7.33,5.76,2.17.75,4.86,1.2,7.4,1.2,1.35,0,7.92-.15,7.92-3.96,0-.37,0-2.32-2.92-3.29-1.87-.67-11.59-2.39-13.75-2.92-4.86-1.27-14.35-4.26-14.35-15.4,0-2.32.52-4.71,1.49-6.8,3.44-7.78,12.33-10.84,21.83-10.84,6.06,0,11.59,1.2,15.92,3.36,3.96,1.94,5.91,4.04,7.77,5.98l-10.47,8.74c-.82-1.04-1.72-2.24-4.04-3.44-3.07-1.5-7.1-1.94-9.79-1.94-2.84,0-5.98.75-5.98,3.44,0,2.54,2.69,3.21,7.25,4.04,11.74,2.02,23.4,4.11,23.4,17.19,0,5.53-2.32,9.42-4.71,11.89-6.65,6.8-17.27,6.8-20.18,6.8-3.96,0-8.15-.37-12.26-1.57-8.37-2.39-12.26-7.1-14.65-10.02l12.78-8.22h0Z" />
        {/* B */}
        <path d="M75.12,64v8.97h9.19c1.57,0,5.46,0,5.46-4.41s-3.59-4.49-5.08-4.56h-9.57ZM75.04,84.04v10.24h10.47c1.5-.07,3.07-.15,4.34-1.57.82-.82,1.35-2.09,1.35-3.44,0-4.93-4.48-5.16-6.05-5.23h-10.09ZM58.45,52.86h31.25c3.29.15,9.42.38,13.38,4.26,2.39,2.24,3.59,5.76,3.59,9.12,0,3.89-1.65,7.18-3.74,9.27-1.42,1.42-2.77,2.02-4.49,2.84,2.17.6,4.11,1.12,6.2,3.21,2.99,2.92,3.51,6.35,3.51,8.97,0,3.96-1.2,8.07-3.89,10.76-3.96,4.04-9.42,4.19-13.53,4.34h-32.29v-52.78h0Z" />
        {/* D */}
        <path d="M131.18,65.61v28.33h6.35c2.39-.15,4.71-.23,7.03-2.47,2.54-2.39,3.96-6.88,3.96-11.81,0-3.07-.52-5.61-1.35-7.77-2.24-5.98-6.43-6.13-9.72-6.28h-6.28ZM114.44,53.28h17.94c11.81.15,19.44.22,25.64,6.05,5.46,5.08,7.33,12.63,7.33,20.11,0,11.14-4.19,21.68-14.8,25.19-4.26,1.42-8.97,1.42-14.13,1.42h-21.98v-52.78h0Z" />
        {/* C */}
        <path d="M222.28,91.67c-1.35,2.54-2.62,4.93-5.16,7.47-5.38,5.31-12.93,7.77-20.48,7.77-18.84,0-27.36-14.2-27.36-27.73,0-14.2,9.49-28.63,27.36-28.63,8,0,15.62,2.84,21.15,8.52,2.24,2.32,3.29,4.11,4.41,6.2l-13.98,6.95c-1.35-3.14-3.89-8.75-10.91-8.75-3.66,0-5.98,1.72-7.1,2.84-3.96,3.81-3.96,9.79-3.96,11.89,0,7.85,2.92,15.25,11.14,15.25,7.77,0,10.09-6.88,10.69-8.67l14.21,6.88h0Z" />
        {/* Star */}
        <polygon points="180.22 13.31 186.19 14.47 188.51 9.68 189.78 15.22 197.17 15.95 189.92 19.48 191.79 26.81 191.76 26.77 195.14 32.77 191.99 20.44 203.55 14.81 191.22 13.59 189.11 4.39 185.2 12.48 175.76 10.65 176.09 11.07 180.22 13.31" />
        {/* Swoosh */}
        <path d="M178.06,4.5S113.69-11.07,32.95,15.72c0,0,80.78-22.04,143.99-8.77l1.12-2.45h0Z" />
        {/* NORCAL text */}
        <g className="norcal-text">
          <path d="M20.9,29.39v12.38h-1.49l-6.79-10.06.14,10.06h-1.54v-12.38h1.54l6.72,9.92-.07-9.92h1.49Z" />
          <path d="M61.58,35.46c0,.94-.13,1.81-.4,2.61-.27.81-.67,1.51-1.19,2.1-.53.6-1.18,1.06-1.96,1.4s-1.69.51-2.72.51c-.95,0-1.8-.16-2.56-.47-.76-.32-1.41-.76-1.95-1.33-.54-.57-.95-1.26-1.24-2.05-.29-.79-.44-1.68-.44-2.65,0-1.15.18-2.13.54-2.95s.84-1.5,1.43-2.03c.59-.53,1.26-.91,2-.16.74-.25,1.5-.37,2.27-.37.87,0,1.68.14,2.44.43.76.29,1.42.7,1.98,1.25.56.54,1,1.21,1.32,2.01.32.79.48,1.69.48,2.7ZM59.79,35.48c0-.75-.1-1.43-.3-2.05-.2-.62-.48-1.15-.86-1.6-.37-.45-.84-.8-1.39-1.04-.55-.25-1.18-.37-1.89-.37-.78,0-1.46.14-2.02.42s-1.02.66-1.39,1.13c-.36.47-.63,1.02-.8,1.65-.17.63-.25,1.29-.25,1.99,0,.65.08,1.29.25,1.91.16.62.43,1.17.79,1.66s.83.88,1.39,1.17c.57.3,1.25.45,2.04.45s1.53-.16,2.1-.47c.57-.32,1.02-.72,1.37-1.23.34-.5.59-1.07.74-1.71.15-.64.22-1.27.22-1.9Z" />
          <path d="M91.38,36.51v5.26h-1.61v-12.38h4.59c.43,0,.82,0,1.17.02s.67.04.96.09c.30.05.57.12.82.22.25.1.50.24.75.43.46.34.79.76.99,1.25.2.50.31,1.03.31,1.6,0,.72-.12,1.3-.38,1.74-.25.43-.54.77-.87,1.01-.33.24-.65.4-.97.49-.32.09-.56.14-.71.17l3.47,5.37h-1.96l-3.37-5.26h-3.19ZM91.38,35.14h3.28c.27,0,.53,0,.77-.02.25-.01.49-.05.74-.11.57-.14.97-.4,1.2-.77.23-.37.34-.78.34-1.23,0-.08,0-.19-.02-.32-.01-.13-.04-.28-.09-.45s-.12-.33-.22-.50c-.10-.17-.24-.32-.41-.46-.33-.27-.69-.42-1.09-.46-.40-.04-.84-.06-1.31-.06h-3.19v4.38Z" />
          <path d="M139.06,37.28c-.13.58-.35,1.16-.67,1.74-.32.57-.73,1.09-1.24,1.54-.51.46-1.11.82-1.81,1.10-.70.28-1.49.42-2.39.42-1.02,0-1.91-.18-2.67-.53s-1.39-.83-1.89-1.43c-.50-.60-.88-1.29-1.12-2.07-.25-.78-.37-1.61-.37-2.47s.13-1.71.39-2.50c.26-.79.64-1.48,1.16-2.07.51-.59,1.17-1.06,1.96-1.41s1.71-.53,2.78-.53c.71,0,1.34.07,1.88.22.54.15,1.01.34,1.41.58.40.24.73.50,1.01.79.27.29.50.57.68.85.18.28.32.54.42.78s.17.43.22.57l-1.67.35c-.08-.23-.17-.46-.25-.67-.09-.21-.25-.45-.48-.72-.30-.37-.72-.71-1.26-1-.54-.29-1.20-.44-1.98-.44-.67,0-1.30.13-1.89.39-.60.26-1.10.65-1.51,1.17-.40.49-.67,1.05-.82,1.67-.15.62-.22,1.24-.22,1.88,0,.77.10,1.48.29,2.11.19.64.48,1.19.85,1.65.37.46.84.82,1.38,1.08.55.26,1.18.39,1.89.39.46,0,.91-.07,1.36-.20.45-.13.86-.35,1.24-.64.37-.29.70-.67.96-1.13s.45-1.02.54-1.67l1.81.21Z" />
          <path d="M173.18,37.98h-4.72l-1.38,3.79h-1.75l4.72-12.38h1.72l4.51,12.38h-1.74l-1.35-3.79ZM172.68,36.6l-1.81-5.15-1.89,5.15h3.7Z" />
          <path d="M205.26,40.32h6v1.46h-7.64v-12.4h1.65v10.94Z" />
        </g>
      </g>
    </svg>
  );
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
          &larr; Tools
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
         S1: HERO — Animated SVG Logo + Cinematic Entrance
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
        {/* Animated SVG Logo — draws itself via .sbdc-logo in globals.css */}
        <div style={{ width: 'clamp(200px, 40vw, 340px)', marginBottom: 64 }}>
          <SbdcLogo />
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
            fontFamily: 'var(--era-text)',
            fontSize: 'clamp(15px, 2vw, 19px)',
            fontWeight: 400,
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
         S2: MANIFESTO
         ════════════════════════════════════════════ */}
      <section
        id="manifesto"
        className="bh-section"
        style={{
          padding: 'clamp(80px, 12vw, 200px) 24px',
          background: '#0f1c2e',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <span
            className="bh-stagger-1"
            style={{
              fontFamily: 'var(--era-text)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
              color: '#8FC5D9',
              display: 'block',
              marginBottom: 40,
            }}
          >
            Our Manifesto
          </span>

          <h2
            className="bh-stagger-2"
            style={{
              fontFamily: 'var(--display)',
              fontSize: 'clamp(28px, 5vw, 56px)',
              fontWeight: 100,
              letterSpacing: '-0.035em',
              lineHeight: 1.15,
              color: '#ffffff',
              margin: '0 0 48px',
              maxWidth: 800,
            }}
          >
            Every small business in Northern California deserves a chance to grow. We exist to make that possible.
          </h2>

          <div style={{
            width: 40,
            height: 1,
            background: 'rgba(143, 197, 217, 0.4)',
            marginBottom: 40,
          }} />

          <p
            className="bh-stagger-3"
            style={{
              fontFamily: 'var(--era-text)',
              fontSize: 'clamp(14px, 1.8vw, 17px)',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.8,
              maxWidth: 600,
              margin: 0,
            }}
          >
            We are 16 centers, 200+ advisors, and one unified network spanning 36 counties
            from the Oregon border to the Sacramento Valley. We don&apos;t just consult &mdash;
            we walk alongside entrepreneurs through every milestone. $549M in capital accessed.
            8,500+ businesses served. That&apos;s not a pitch &mdash; it&apos;s our track record.
          </p>

          <div
            className="bh-stagger-4"
            style={{
              display: 'flex',
              gap: 32,
              marginTop: 56,
              flexWrap: 'wrap',
            }}
          >
            {['Connect', 'Prepare', 'Advise', 'Grow'].map((word, i) => (
              <span
                key={word}
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: 'clamp(16px, 2.5vw, 24px)',
                  fontWeight: 300,
                  color: i === 3 ? '#8FC5D9' : 'rgba(255,255,255,0.25)',
                  letterSpacing: '-0.02em',
                }}
              >
                {word}{i < 3 ? ' /' : ''}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
         S3: COLORS
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
                fontFamily: 'var(--era-text)',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.06em',
                color: color.text,
                opacity: 0.6,
                display: 'block',
                marginTop: 10,
              }}>
                {copiedHex === color.hex ? 'Copied!' : color.hex}
              </span>
              <span style={{
                fontFamily: 'var(--era-text)',
                fontSize: 9,
                fontWeight: 500,
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
         S4: TYPOGRAPHY — GT Era Display + GT America
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
          GT Era Display is the voice of the brand &mdash; geometric, modern, unmistakable.
          GT America provides clean utility for interfaces and supporting text.
        </p>

        {/* ── GT Era Display — Primary ── */}
        <div className="bh-type-block" style={{ marginBottom: 96 }}>
          <div className="flex items-baseline gap-4 flex-wrap" style={{ marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 500, color: 'var(--p-ink)', margin: 0, letterSpacing: '-0.01em' }}>
              GT Era Display
            </h3>
            <span className="learn-label" style={{ color: 'var(--p-blue, #2456e3)' }}>Primary &mdash; Display &amp; Headlines</span>
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
                  fontFamily: 'var(--era-text)', fontSize: 10, fontWeight: 500, color: 'var(--p-muted)',
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

        {/* ── GT America — System Sans ── */}
        <div className="bh-type-block" style={{ marginBottom: 96 }}>
          <div className="flex items-baseline gap-4 flex-wrap" style={{ marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'var(--sans)', fontSize: 18, fontWeight: 500, color: 'var(--p-ink)', margin: 0 }}>
              GT America
            </h3>
            <span className="learn-label" style={{ color: 'var(--p-muted)' }}>Secondary &mdash; UI, Navigation &amp; Body</span>
          </div>

          {/* Large glyph */}
          <div style={{
            fontFamily: 'var(--sans)',
            fontSize: 'clamp(64px, 12vw, 160px)',
            fontWeight: 300,
            letterSpacing: '-0.03em',
            lineHeight: 0.9,
            color: 'var(--p-ink)',
            margin: '24px 0 56px',
          }}>
            Aa
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              { label: 'Light', weight: 300, sample: 'Clean interfaces, clear communication.' },
              { label: 'Regular', weight: 400, sample: 'Clean interfaces, clear communication.' },
              { label: 'Medium', weight: 500, sample: 'Clean interfaces, clear communication.' },
            ].map((w) => (
              <div key={w.label} className="flex items-baseline gap-6 flex-wrap">
                <span style={{
                  fontFamily: 'var(--era-text)', fontSize: 10, fontWeight: 500, color: 'var(--p-muted)',
                  width: 80, flexShrink: 0, letterSpacing: '0.04em',
                }}>
                  {w.label} {w.weight}
                </span>
                <span style={{
                  fontFamily: 'var(--sans)', fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: w.weight,
                  color: 'var(--p-ink)', lineHeight: 1.35,
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
            <h4 style={{ fontFamily: 'var(--era-text)', fontSize: 14, fontWeight: 700, color: 'var(--p-ink)', margin: '0 0 8px' }}>
              GT Era Text
            </h4>
            <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Extended reading, descriptions, tags, kickers, labels, and metadata. The workhorse of the system.
            </p>
            <span style={{ fontFamily: 'var(--era-text)', fontSize: 15, fontWeight: 400, color: 'var(--p-ink)', display: 'block' }}>
              The quick brown fox jumps over the lazy dog
            </span>
          </div>
          <div>
            <h4 style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 400, fontStyle: 'italic', color: 'var(--p-ink)', margin: '0 0 8px' }}>
              Tobias
            </h4>
            <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Editorial accent for pull-quotes and select brand moments. Use sparingly.
            </p>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 400, fontStyle: 'italic', color: 'var(--p-ink)', display: 'block' }}>
              Stories of real impact, told with warmth.
            </span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
         S5: LOGO USAGE
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
         S6: BRAND VOICE
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
                  fontFamily: 'var(--era-text)', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
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
         S7: CLIENT JOURNEY — Architecture Node Diagram
         ════════════════════════════════════════════ */}
      <section id="journey" className="bh-section" style={{ padding: '140px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <span className="learn-kicker" style={{ color: 'var(--p-muted)' }}>Architecture</span>
        <h2 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(32px, 6vw, 64px)',
          fontWeight: 100,
          letterSpacing: '-0.035em',
          color: 'var(--p-ink)',
          margin: '16px 0 24px',
        }}>
          Client Journey
        </h2>
        <p style={{
          fontFamily: 'var(--era-text)',
          fontSize: 15,
          color: 'var(--p-mid)',
          lineHeight: 1.7,
          maxWidth: 520,
          marginBottom: 80,
        }}>
          Five stages from first contact to measurable impact. Each node represents
          a system touchpoint in the NorCal SBDC service architecture.
        </p>

        {/* Architecture Node Diagram */}
        <div className="bh-journey-flow" style={{
          alignItems: 'flex-start',
          gap: 0,
          marginBottom: 64,
        }}>
          {/* Horizontal connector line */}
          <div className="bh-journey-connector" />

          {JOURNEY_STAGES.map((stage, i) => (
            <div key={stage.stage} className="bh-journey-stage">
              {/* Node circle */}
              <div style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: stage.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 20px -4px ${stage.color}44`,
                marginBottom: 20,
                flexShrink: 0,
              }}>
                <span style={{
                  fontFamily: 'var(--display)',
                  fontSize: 18,
                  fontWeight: 300,
                  color: '#ffffff',
                }}>
                  {i + 1}
                </span>
              </div>

              {/* Stage name */}
              <h3 style={{
                fontFamily: 'var(--display)',
                fontSize: 'clamp(16px, 2vw, 20px)',
                fontWeight: 500,
                color: 'var(--p-ink)',
                margin: '0 0 8px',
                letterSpacing: '-0.01em',
              }}>
                {stage.stage}
              </h3>

              {/* Description */}
              <p style={{
                fontFamily: 'var(--era-text)',
                fontSize: 12,
                color: 'var(--p-mid)',
                lineHeight: 1.55,
                margin: '0 0 14px',
                maxWidth: 180,
              }}>
                {stage.description}
              </p>

              {/* Touchpoint pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                {stage.touchpoints.map((tp) => (
                  <span
                    key={tp}
                    style={{
                      fontFamily: 'var(--era-text)',
                      fontSize: 9,
                      fontWeight: 500,
                      letterSpacing: '0.02em',
                      padding: '3px 8px',
                      borderRadius: 99,
                      background: 'var(--p-tint, #eae5dd)',
                      color: 'var(--p-mid)',
                    }}
                  >
                    {tp}
                  </span>
                ))}
              </div>

              {/* Tool link */}
              {stage.link && (
                <a
                  href={stage.link}
                  style={{
                    fontFamily: 'var(--era-text)',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--p-blue, #2456e3)',
                    textDecoration: 'none',
                    marginTop: 10,
                    display: 'inline-block',
                  }}
                >
                  View tool &rarr;
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Data flow arrows */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
          padding: '24px 0',
          borderTop: '1px solid var(--p-line)',
          borderBottom: '1px solid var(--p-line)',
        }}>
          <span style={{
            fontFamily: 'var(--era-text)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            color: 'var(--p-muted)',
          }}>
            Data Flow
          </span>
          {['Neoserra', 'Smart 641', 'Milestone Wizard', 'Atlas Dashboard', 'SBA Reporting'].map((sys, i) => (
            <span key={sys} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && (
                <svg width="12" height="8" viewBox="0 0 12 8" style={{ color: 'var(--p-line)' }}>
                  <path d="M0 4h10M8 1l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
              )}
              <span style={{
                fontFamily: 'var(--era-text)',
                fontSize: 9,
                fontWeight: 500,
                letterSpacing: '0.02em',
                padding: '3px 10px',
                borderRadius: 4,
                border: '1px solid var(--p-line)',
                color: 'var(--p-mid)',
              }}>
                {sys}
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
         S8: PROGRAMS NETWORK
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
                fontFamily: 'var(--era-text)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
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
              <h4 style={{ fontFamily: 'var(--era-text)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--p-muted)', marginBottom: 10 }}>
                Federal &amp; State
              </h4>
              <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6, margin: 0 }}>
                SBA, California Governor&apos;s Office of Business and Economic Development (GO-Biz), Employment Development Department
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--era-text)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--p-muted)', marginBottom: 10 }}>
                Lending &amp; Capital
              </h4>
              <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6, margin: 0 }}>
                CDFIs, SBA-preferred lenders, community banks, microloan intermediaries
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--era-text)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--p-muted)', marginBottom: 10 }}>
                Higher Education
              </h4>
              <p style={{ fontFamily: 'var(--era-text)', fontSize: 13, color: 'var(--p-mid)', lineHeight: 1.6, margin: 0 }}>
                CSU, Chico (host institution), community colleges, university extension programs across Northern California
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--era-text)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--p-muted)', marginBottom: 10 }}>
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
            fontFamily: 'var(--era-text)', fontSize: 10, fontWeight: 700,
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
            fontFamily: 'var(--era-text)', fontSize: 10, fontWeight: 600,
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
          fontFamily: 'var(--era-text)',
          fontSize: 10,
          fontWeight: 500,
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
