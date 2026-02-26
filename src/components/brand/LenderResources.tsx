'use client';

import { useState, useEffect, useCallback } from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import './brand.css';
import './lender-resources.css';

/* ═══════════════════════════════════════════════════════
   LenderResources — Lender & Partner outreach toolkit
   Sub-page of Brand House. Same design system.
   ═══════════════════════════════════════════════════════ */

// ── Section Nav ──
const SECTIONS = [
  { id: 'resources', label: 'Resources' },
  { id: 'value',     label: 'Value' },
  { id: 'talking',   label: 'Talking Points' },
  { id: 'phrases',   label: 'Quick Copy' },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

// ── Hero Stats ──
const HERO_STATS = [
  { num: '$549M', label: 'Capital Accessed' },
  { num: '$58', label: 'Return per $1' },
  { num: '16', label: 'Centers' },
  { num: '36', label: 'Counties Served' },
] as const;

// ── Resource Library ──
const RESOURCES = [
  {
    name: 'Lender Partnership Guide',
    description: 'Comprehensive sponsorship and partnership guide with value propositions, impact data, and partnership tiers.',
    meta: '8.5 \u00d7 11 \u00b7 PDF',
    badge: 'Multi-Page',
    badgePool: true,
    href: '/brand/lender-guides/lender-guide-design-v2.html',
    preview: 'guide',
  },
  {
    name: 'Editorial Guide',
    description: 'Long-form editorial version with narrative content, data storytelling, and detailed partnership framework.',
    meta: 'Multi-page \u00b7 PDF',
    badge: 'Editorial',
    badgePool: false,
    href: '/brand/lender-guides/lender-guide-editorial.html',
    preview: 'editorial',
  },
  {
    name: 'Spotlight Campaign',
    description: 'Multi-page lender spotlight campaign with hero layouts, stat highlights, and testimonial sections.',
    meta: 'Multiple formats',
    badge: 'Campaign',
    badgePool: true,
    href: '/brand/lender-guides/lender-spotlight-campaign.html',
    preview: 'spotlight',
  },
  {
    name: 'Content Wall',
    description: 'Full grid of outreach ad concepts \u2014 billboards, value props, CDFI messaging, and social content.',
    meta: 'Ads \u00b7 Multiple Formats',
    badge: 'Ad Grid',
    badgePool: true,
    href: '/brand/lender-guides/partner-lender-content-wall.html',
    preview: 'wall',
  },
  {
    name: '20 Years Partnership Email',
    description: 'Anniversary milestone email template celebrating 20 years of lending partnerships with NorCal SBDC.',
    meta: 'HTML Email \u00b7 600px',
    badge: 'Email',
    badgePool: false,
    href: '/brand/lender-guides/20-years-partnership-email.html',
    preview: 'email',
  },
] as const;

// ── Value Proposition ──
const VALUE_STATS = [
  { num: '$58', label: 'Return for every $1 invested in SBDC \u2014 SBA verified' },
  { num: '$549M', label: 'Capital accessed by NorCal SBDC clients last year' },
  { num: '7,500+', label: 'Entrepreneurs served annually across the network' },
  { num: '20 yrs', label: 'Partnering with lenders across Northern California' },
] as const;

// ── Talking Points ──
const TALKING_POINTS = [
  {
    title: 'For Banks & Lenders',
    lead: 'We don\u2019t compete with you \u2014 we make your pipeline stronger.',
    body: 'SBDC referrals come with clean financials, solid business plans, and realistic loan amounts. Our advisors do the prep work so your underwriters can close faster.',
  },
  {
    title: 'For CDFIs',
    lead: 'Same mission, different tools.',
    body: 'You lend, we advise. Together we reach the businesses that need capital most. Our 16 centers across NorCal are embedded in the communities you serve.',
  },
  {
    title: 'For Cities & Counties',
    lead: 'Your constituents, our advisors.',
    body: 'No-fee small business support for your community. We serve 36 counties and generate measurable economic impact: job creation, revenue growth, and business starts.',
  },
  {
    title: 'The ROI Conversation',
    lead: '$58 back for every $1 invested',
    body: '\u2014 that\u2019s the SBA-verified return. Our no-fee advising model doesn\u2019t just help entrepreneurs, it creates measurable economic impact that benefits the entire lending ecosystem.',
  },
] as const;

// ── Quick-Copy Phrases ──
const PHRASES = [
  { label: 'Headline', text: 'We send you loan-ready clients.' },
  { label: 'Headline', text: 'We do the prep work. You close the deal.' },
  { label: 'Value', text: 'Less back-and-forth. Faster closes. Better clients.' },
  { label: 'Trust', text: 'Complete packages. Realistic asks. Prepared borrowers.' },
  { label: 'CTA', text: 'Your business, funded.' },
  { label: 'Mission', text: 'We reach the businesses you want to fund.' },
  { label: 'Scale', text: '16 centers. 36 counties. One network.' },
  { label: 'Impact', text: '$549M in capital accessed. That\u2019s your pipeline, strengthened.' },
] as const;

// ── Mini Preview Mockups ──

function ResourcePreview({ type }: { type: string }) {
  const base: React.CSSProperties = { position: 'absolute', borderRadius: 1 };
  const line = (w: string, o = 0.08): React.CSSProperties => ({ ...base, width: w, height: 2, background: `rgba(0,0,0,${o})`, borderRadius: 1 });

  if (type === 'guide') {
    return (
      <div style={{ width: '38%', height: '74%', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '28%', background: 'linear-gradient(135deg, #1D5AA7, #8FC5D9)', display: 'flex', alignItems: 'flex-end', padding: 5 }}>
          <div style={{ width: '45%', height: 3, background: '#fff', borderRadius: 1 }} />
        </div>
        <div style={{ padding: 5, flex: 1 }}>
          <div style={{ width: '70%', height: 2, background: '#0f1c2e', borderRadius: 1, marginBottom: 3 }} />
          <div style={{ width: '90%', height: 2, background: 'rgba(0,0,0,0.08)', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '75%', height: 2, background: 'rgba(0,0,0,0.08)', borderRadius: 1, marginBottom: 4 }} />
          <div style={{ display: 'flex', gap: 3 }}>
            <div style={{ flex: 1, height: 10, background: 'rgba(29,90,167,0.08)', borderRadius: 1 }} />
            <div style={{ flex: 1, height: 10, background: 'rgba(29,90,167,0.08)', borderRadius: 1 }} />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'editorial') {
    return (
      <div style={{ width: '38%', height: '74%', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '22%', background: '#0f1c2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '30%', height: 2, background: 'rgba(255,255,255,0.4)', borderRadius: 1 }} />
        </div>
        <div style={{ padding: 6, flex: 1 }}>
          <div style={{ ...line('85%', 0.12), position: 'relative', marginBottom: 3 }} />
          <div style={{ ...line('90%'), position: 'relative', marginBottom: 2 }} />
          <div style={{ ...line('70%'), position: 'relative', marginBottom: 2 }} />
          <div style={{ ...line('80%'), position: 'relative', marginBottom: 2 }} />
          <div style={{ ...line('65%'), position: 'relative' }} />
        </div>
      </div>
    );
  }

  if (type === 'spotlight') {
    return (
      <div style={{ width: '62%', height: '62%', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
        <div style={{ width: '18%', height: 3, background: '#8FC5D9', borderRadius: 1, marginBottom: 4 }} />
        <div style={{ width: '50%', height: 3, background: '#fff', borderRadius: 1, marginBottom: 2 }} />
        <div style={{ width: '35%', height: 3, background: '#fff', borderRadius: 1, marginBottom: 5 }} />
        <div style={{ width: '25%', height: 2, background: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
      </div>
    );
  }

  if (type === 'wall') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, width: '62%', height: '62%' }}>
        <div style={{ background: '#0f1c2e', borderRadius: 1 }} />
        <div style={{ background: '#f0efeb', borderRadius: 1 }} />
        <div style={{ background: '#1D5AA7', borderRadius: 1 }} />
        <div style={{ background: '#a82039', borderRadius: 1 }} />
        <div style={{ background: '#5d7a9c', borderRadius: 1 }} />
        <div style={{ background: '#0f1c2e', borderRadius: 1 }} />
      </div>
    );
  }

  if (type === 'email') {
    return (
      <div style={{ width: '38%', height: '76%', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '10%', background: '#0f1c2e' }} />
        <div style={{ height: '24%', background: 'linear-gradient(to bottom, #8FC5D9, #1D5AA7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 10, color: '#fff', fontWeight: 400 }}>20</span>
        </div>
        <div style={{ padding: 4, flex: 1 }}>
          <div style={{ width: '80%', height: 2, background: 'rgba(0,0,0,0.12)', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '90%', height: 2, background: 'rgba(0,0,0,0.06)', borderRadius: 1, marginBottom: 2 }} />
          <div style={{ width: '35%', height: 4, background: '#8FC5D9', borderRadius: 1 }} />
        </div>
        <div style={{ height: '6%', background: '#0f1c2e' }} />
      </div>
    );
  }

  return null;
}

// Preview background colors
const PREVIEW_BG: Record<string, string> = {
  guide: '#0f1c2e',
  editorial: '#e8e7e3',
  spotlight: '#1D5AA7',
  wall: '#1a1a1a',
  email: '#e8e7e3',
};

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
  const [active, setActive] = useState<SectionId>('resources');
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

export default function LenderResources() {
  useScrollReveal();
  const activeSection = useActiveSection();
  const [toast, setToast] = useState<string | null>(null);

  const copyPhrase = useCallback((text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setToast(text);
    setTimeout(() => setToast(null), 2200);
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
          href="/brand"
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
          &larr; Brand House
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
         HERO — Navy banner
         ════════════════════════════════════════════ */}
      <section
        className="lr-hero relative"
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
            {' / '}Lender Resources
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
            Lender &amp; Partner<br />Resources
          </h1>

          <p style={{
            fontFamily: 'var(--era-text)', fontSize: 15, fontWeight: 400,
            lineHeight: 1.7, color: 'rgba(255,255,255,0.4)',
            maxWidth: 520, margin: '0 0 40px',
          }}>
            Guides, spotlights, outreach tools, and talking points for lender partnerships, CDFIs, and economic development organizations.
          </p>

          {/* Stats */}
          <div
            className="lr-hero-stats"
            style={{
              display: 'flex', gap: 48,
              paddingTop: 28,
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {HERO_STATS.map((stat) => (
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
         RESOURCE LIBRARY
         ════════════════════════════════════════════ */}
      <section id="resources" className="bh-section" style={{ padding: '96px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ borderTop: '1px solid var(--p-line)', paddingTop: 28, marginBottom: 56 }}>
          <h2 style={{
            fontFamily: 'var(--display)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 300,
            color: 'var(--p-ink)', letterSpacing: '-0.015em', marginBottom: 8,
          }}>
            Resource Library
          </h2>
          <p style={{
            fontFamily: 'var(--era-text)', fontSize: 14, color: 'var(--p-mid)',
            lineHeight: 1.6, maxWidth: 520,
          }}>
            Guides, spotlight campaigns, email templates, and outreach content. Click to preview each resource.
          </p>
        </div>

        <div className="lr-resource-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {RESOURCES.map((res) => (
            <a
              key={res.name}
              href={res.href}
              target="_blank"
              rel="noopener noreferrer"
              className="lr-resource-card"
              style={{ background: 'var(--p-cream, #faf8f4)', borderRadius: 0 }}
            >
              {/* Preview area */}
              <div style={{
                aspectRatio: '16/10',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
                background: PREVIEW_BG[res.preview],
              }}>
                <ResourcePreview type={res.preview} />
                <span
                  className={`lr-tag ${res.badgePool ? 'lr-tag-pool' : ''}`}
                  style={{ position: 'absolute', top: 10, right: 10 }}
                >
                  {res.badge}
                </span>
              </div>
              {/* Card body */}
              <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 10,
                  textTransform: 'uppercase' as const, letterSpacing: '0.04em',
                  color: 'var(--p-ink)', marginBottom: 4,
                }}>
                  {res.name}
                </div>
                <div style={{
                  fontFamily: 'var(--era-text)', fontWeight: 400, fontSize: 13,
                  lineHeight: 1.5, color: 'var(--p-mid)', marginBottom: 12,
                }}>
                  {res.description}
                </div>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 400,
                  color: 'var(--p-muted)', marginTop: 'auto',
                }}>
                  {res.meta}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
         VALUE PROPOSITION
         ════════════════════════════════════════════ */}
      <section id="value" className="bh-section" style={{ padding: '96px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ borderTop: '1px solid var(--p-line)', paddingTop: 28, marginBottom: 56 }}>
          <h2 style={{
            fontFamily: 'var(--display)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 300,
            color: 'var(--p-ink)', letterSpacing: '-0.015em', marginBottom: 8,
          }}>
            Value Proposition
          </h2>
          <p style={{
            fontFamily: 'var(--era-text)', fontSize: 14, color: 'var(--p-mid)',
            lineHeight: 1.6, maxWidth: 520,
          }}>
            The numbers that matter when talking to lenders and partners.
          </p>
        </div>

        <div className="lr-value-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
          {VALUE_STATS.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'var(--p-cream, #faf8f4)',
                padding: 32,
              }}
            >
              <div style={{
                fontFamily: 'var(--display)', fontWeight: 100,
                fontSize: 'clamp(28px, 4vw, 44px)',
                color: 'var(--p-blue, #2456e3)', lineHeight: 1,
                letterSpacing: '-0.02em',
                marginBottom: 10,
              }}>
                {stat.num}
              </div>
              <div style={{
                fontFamily: 'var(--era-text)', fontWeight: 400,
                fontSize: 13, lineHeight: 1.5,
                color: 'var(--p-mid)',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
         TALKING POINTS
         ════════════════════════════════════════════ */}
      <section id="talking" className="bh-section" style={{ padding: '96px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ borderTop: '1px solid var(--p-line)', paddingTop: 28, marginBottom: 56 }}>
          <h2 style={{
            fontFamily: 'var(--display)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 300,
            color: 'var(--p-ink)', letterSpacing: '-0.015em', marginBottom: 8,
          }}>
            Talking Points
          </h2>
          <p style={{
            fontFamily: 'var(--era-text)', fontSize: 14, color: 'var(--p-mid)',
            lineHeight: 1.6, maxWidth: 520,
          }}>
            Use these when reaching out to lenders, CDFIs, and economic development partners.
          </p>
        </div>

        <div className="lr-talk-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {TALKING_POINTS.map((point) => (
            <div
              key={point.title}
              className="lr-talk-cell"
              style={{
                background: 'var(--p-cream, #faf8f4)',
                padding: '28px 32px',
              }}
            >
              <div style={{
                fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 10,
                textTransform: 'uppercase' as const, letterSpacing: '0.04em',
                color: 'var(--p-ink)', marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {point.title}
              </div>
              <div style={{
                fontFamily: 'var(--era-text)', fontWeight: 400,
                fontSize: 14, lineHeight: 1.7,
                color: 'var(--p-mid)',
              }}>
                <strong style={{ fontWeight: 700, color: 'var(--p-ink)' }}>{point.lead}</strong>{' '}
                {point.body}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
         QUICK COPY
         ════════════════════════════════════════════ */}
      <section id="phrases" className="bh-section" style={{ padding: '96px 24px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ borderTop: '1px solid var(--p-line)', paddingTop: 28, marginBottom: 56 }}>
          <h2 style={{
            fontFamily: 'var(--display)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 300,
            color: 'var(--p-ink)', letterSpacing: '-0.015em', marginBottom: 8,
          }}>
            Quick Copy
          </h2>
          <p style={{
            fontFamily: 'var(--era-text)', fontSize: 14, color: 'var(--p-mid)',
            lineHeight: 1.6, maxWidth: 520,
          }}>
            Approved phrases for lender-facing communications. Click any card to copy.
          </p>
        </div>

        <div className="lr-phrase-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {PHRASES.map((phrase, i) => (
            <button
              key={i}
              className="lr-phrase-card"
              onClick={() => copyPhrase(phrase.text)}
              style={{
                background: 'var(--p-cream, #faf8f4)',
                padding: '24px 28px',
                textAlign: 'left',
                position: 'relative',
                border: 'none',
              }}
            >
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700,
                textTransform: 'uppercase' as const, letterSpacing: '0.06em',
                color: 'var(--p-muted)', marginBottom: 8,
              }}>
                {phrase.label}
              </div>
              <div style={{
                fontFamily: 'var(--serif)', fontWeight: 400, fontStyle: 'italic',
                fontSize: 'clamp(16px, 2vw, 22px)',
                color: 'var(--p-ink)', lineHeight: 1.3,
              }}>
                {phrase.text}
              </div>
              {/* Copy icon */}
              <span style={{
                position: 'absolute', top: 12, right: 12,
                fontFamily: 'var(--mono)', fontSize: 9,
                color: 'var(--p-muted)', opacity: 0.5,
              }}>
                {toast === phrase.text ? '\u2713' : 'COPY'}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
         CTA BAR
         ════════════════════════════════════════════ */}
      <div style={{ background: '#0f1c2e', padding: '56px 24px' }}>
        <div
          className="lr-cta-inner"
          style={{
            maxWidth: 1080, margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 32,
          }}
        >
          <div style={{
            fontFamily: 'var(--era-text)', fontWeight: 400,
            fontSize: 15, color: 'rgba(255,255,255,0.5)',
          }}>
            <strong style={{ fontWeight: 500, color: '#ffffff' }}>Ready to partner?</strong>{' '}
            Questions about lender resources, co-branded materials, or partnership opportunities.
          </div>
          <a
            href="mailto:phelps@norcalsbdc.org"
            className="lr-cta-link"
            style={{
              fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 400,
              color: '#8FC5D9', letterSpacing: '0.04em',
              padding: '10px 20px',
              border: '1px solid rgba(143,197,217,0.3)',
              borderRadius: 4,
              whiteSpace: 'nowrap' as const,
              textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            phelps@norcalsbdc.org
          </a>
        </div>
      </div>

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
        NorCal SBDC &mdash; Lender Resources &mdash; 2026
      </footer>

      {/* ── Toast ── */}
      {toast && (
        <div
          className="lr-toast"
          style={{
            position: 'fixed', bottom: 24, left: '50%',
            transform: 'translateX(-50%)',
            background: '#0f1c2e', color: '#ffffff',
            fontFamily: 'var(--mono)', fontSize: 11,
            padding: '10px 20px', borderRadius: 6,
            zIndex: 200,
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <span style={{ color: '#8FC5D9' }}>&check;</span> Copied
        </div>
      )}
    </div>
  );
}
