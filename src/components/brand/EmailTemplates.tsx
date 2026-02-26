'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
    src: '/brand/emails/welcome-email-1.html',
    height: 720,
  },
  {
    label: 'Email 2 of 3',
    subject: "You're getting a person.",
    description: 'Advisor intro — emphasizes personal matching with a real advisor who\'s been there, includes client testimonial, and sets expectations for first session.',
    src: '/brand/emails/welcome-email-2.html',
    height: 700,
  },
  {
    label: 'Email 3 of 3',
    subject: 'One question to answer.',
    description: 'Pre-session prep — asks the client to identify their one key challenge before meeting their advisor. Hands off to the advisor relationship.',
    src: '/brand/emails/welcome-email-3.html',
    height: 720,
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
    src: '/brand/emails/sbdc-day-emails.html',
    height: 2400,
  },
  {
    name: 'Small Business Week',
    description: 'Celebratory email for National Small Business Week. Poetic, owner-focused tone — "This week is yours." Mist-to-cream color transition.',
    meta: 'HTML Email · 560px',
    badge: 'Event',
    badgeType: 'maroon',
    src: '/brand/emails/sbw-email-v3.html',
    height: 700,
  },
  {
    name: 'The Brief — Newsletter',
    description: 'Full-featured monthly newsletter with masthead, hero story, stats strip, network news, upcoming events calendar, success spotlight, and quick links.',
    meta: 'Newsletter · 600px',
    badge: 'Newsletter',
    badgeType: 'pool',
    src: '/brand/newsletters/the-brief-newsletter.html',
    height: 2200,
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
    src: '/brand/newsletters/newsletter-minimal.html',
    height: 1400,
  },
  {
    name: 'The Brief — Zag',
    description: 'Alternative newsletter variant with bolder copy, asymmetric stats strip, pull quote section, and more editorial voice. Same structure, different energy.',
    meta: 'Newsletter · 600px',
    badge: 'Variant',
    badgeType: 'maroon',
    src: '/brand/newsletters/the-brief-zag.html',
    height: 2400,
  },
] as const;

// ── Scaled Iframe Preview ──
function IframePreview({
  src,
  iframeWidth = 600,
  containerHeight = 380,
  scale,
}: {
  src: string;
  iframeWidth?: number;
  containerHeight?: number;
  scale?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [computedScale, setComputedScale] = useState(scale || 0.5);

  useEffect(() => {
    if (scale) return;
    const el = containerRef.current;
    if (!el) return;
    const updateScale = () => {
      const w = el.clientWidth;
      setComputedScale(w / iframeWidth);
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [iframeWidth, scale]);

  const iframeHeight = containerHeight / computedScale;

  return (
    <div
      ref={containerRef}
      className="et-iframe-wrap"
      style={{ height: containerHeight, position: 'relative' }}
    >
      <iframe
        src={src}
        style={{
          width: iframeWidth,
          height: iframeHeight,
          transform: `scale(${computedScale})`,
        }}
        loading="lazy"
        title={src}
      />
    </div>
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
              key={email.src}
              href={email.src}
              target="_blank"
              rel="noopener noreferrer"
              className="et-onboarding-card"
              style={{ background: 'var(--p-cream, #faf8f4)' }}
            >
              {/* Iframe preview */}
              <div style={{ position: 'relative' }}>
                <IframePreview src={email.src} containerHeight={360} />
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
                  color: 'var(--p-ink)', marginBottom: 6,
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
          className="et-preview-card"
          style={{ background: 'var(--p-cream, #faf8f4)' }}
        >
          <div className="et-sig-wrap" style={{ height: 520, position: 'relative' }}>
            <IframePreview
              src="/brand/emails/email-signatures.html"
              iframeWidth={900}
              containerHeight={520}
            />
            <span
              className="et-tag"
              style={{ position: 'absolute', top: 10, right: 10 }}
            >
              8 Styles
            </span>
          </div>
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
              key={item.src}
              href={item.src}
              target="_blank"
              rel="noopener noreferrer"
              className="et-preview-card"
              style={{ background: 'var(--p-cream, #faf8f4)' }}
            >
              <div style={{ position: 'relative' }}>
                <IframePreview src={item.src} containerHeight={360} />
                <span
                  className={`et-tag ${item.badgeType === 'pool' ? 'et-tag-pool' : item.badgeType === 'maroon' ? 'et-tag-maroon' : ''}`}
                  style={{ position: 'absolute', top: 10, right: 10 }}
                >
                  {item.badge}
                </span>
              </div>
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
              key={item.src}
              href={item.src}
              target="_blank"
              rel="noopener noreferrer"
              className="et-preview-card"
              style={{ background: 'var(--p-cream, #faf8f4)' }}
            >
              <div style={{ position: 'relative' }}>
                <IframePreview src={item.src} containerHeight={420} />
                <span
                  className={`et-tag ${item.badgeType === 'pool' ? 'et-tag-pool' : item.badgeType === 'maroon' ? 'et-tag-maroon' : ''}`}
                  style={{ position: 'absolute', top: 10, right: 10 }}
                >
                  {item.badge}
                </span>
              </div>
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
