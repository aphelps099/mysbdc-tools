'use client';

import { useState, useCallback } from 'react';
import './brand.css';

/* ═══════════════════════════════════════════════════════
   ContentWall — LinkedIn Social Content Toolkit
   Ready-to-post partner & lender content for SBDC
   advisors and staff. Download PNG + copy caption.
   ═══════════════════════════════════════════════════════ */

// ── Brand Colors ──
const C = {
  navy: '#162d50',
  deepNavy: '#0f1c2e',
  dusty: '#5d7a9c',
  pool: '#8FC5D9',
  cream: '#faf8f4',
  sand: '#f3efe8',
  brick: '#b54a4a',
  white: '#ffffff',
} as const;

// ── Post Visual Types ──

type PostVisual =
  | { layout: 'stat'; bg: string; fg: string; kicker: string; number: string; context: string; tagline: string }
  | { layout: 'statement'; bg: string; fg: string; kicker?: string; lines: string[]; tagline?: string }
  | { layout: 'quote'; bg: string; fg: string; text: string; attr: string }
  | { layout: 'headline'; bg: string; fg: string; kicker: string; headline: string; em?: string; context: string }
  | { layout: 'badge'; bg: string; fg: string; badge: string; text: string; tagline?: string };

interface SocialPost {
  id: string;
  filename: string;
  caption: string;
  tags: string;
  visual: PostVisual;
}

type BillboardVisual =
  | { layout: 'hero'; bg: string; fg: string; accent: string; number: string; headline: string; sub: string }
  | { layout: 'banner'; bg: string; fg: string; headline: string; sub: string; brand: string };

interface SocialBillboard {
  id: string;
  filename: string;
  caption: string;
  tags: string;
  visual: BillboardVisual;
}

// ── Post Content (10 curated LinkedIn posts) ──

const POSTS: SocialPost[] = [
  {
    id: 'post-549m',
    filename: 'norcal-sbdc-549m-funded',
    caption: '$549M in capital accessed by NorCal SBDC clients. That\u2019s not a projection \u2014 it\u2019s what happens when small businesses get the right support at the right time.\n\nYour business, funded.',
    tags: '#SBDC #SmallBusiness #NorCalSBDC #CapitalAccess #YourBusinessFunded',
    visual: {
      layout: 'stat',
      bg: C.navy, fg: C.cream,
      kicker: 'NORCAL SBDC',
      number: '$549M',
      context: 'in capital accessed by our clients',
      tagline: 'Your business, funded.',
    },
  },
  {
    id: 'post-58roi',
    filename: 'norcal-sbdc-58-roi',
    caption: 'For every $1 invested in SBDC, the economy gets $58 back. That\u2019s not a talking point \u2014 it\u2019s SBA-verified impact.\n\nYour business, funded.',
    tags: '#SBDC #EconomicImpact #SmallBusiness #ROI #SBAVerified',
    visual: {
      layout: 'stat',
      bg: C.deepNavy, fg: C.cream,
      kicker: 'SBA VERIFIED',
      number: '$58',
      context: 'return for every $1 invested in SBDC',
      tagline: 'Your business, funded.',
    },
  },
  {
    id: 'post-network',
    filename: 'norcal-sbdc-network-connected',
    caption: 'From Shasta to Solano \u2014 16 centers, 36 counties, one mission. No-fee advising for every small business in Northern California.\n\nYour business, connected.',
    tags: '#NorCalSBDC #SmallBusiness #NorthernCalifornia #BusinessAdvising #YourBusinessConnected',
    visual: {
      layout: 'statement',
      bg: C.cream, fg: C.deepNavy,
      kicker: 'THE NETWORK',
      lines: ['16 centers.', '36 counties.', 'One network.'],
      tagline: 'Your business, connected.',
    },
  },
  {
    id: 'post-lenders',
    filename: 'norcal-sbdc-lender-prep-work',
    caption: 'We don\u2019t compete with lenders \u2014 we make your pipeline stronger. Clean financials. Solid plans. Realistic asks. All prepped before they reach your desk.\n\nYour business, funded.',
    tags: '#LenderPartners #SBDC #LoanPackaging #SmallBusinessLending #YourBusinessFunded',
    visual: {
      layout: 'headline',
      bg: C.deepNavy, fg: C.cream,
      kicker: 'FOR LENDERS',
      headline: 'We do the prep work.',
      em: 'You close the deal.',
      context: 'No-fee loan packaging, financial projections, and business plan review.',
    },
  },
  {
    id: 'post-8500',
    filename: 'norcal-sbdc-8500-people',
    caption: 'Behind every number is a person with a plan. 8,500+ entrepreneurs advised last year \u2014 each one closer to their goal.\n\nYour business, people.',
    tags: '#SBDC #Entrepreneurs #SmallBusiness #NorCalSBDC #YourBusinessPeople',
    visual: {
      layout: 'stat',
      bg: C.brick, fg: C.white,
      kicker: 'LAST YEAR',
      number: '8,500+',
      context: 'entrepreneurs advised across the network',
      tagline: 'Your business, people.',
    },
  },
  {
    id: 'post-nofee',
    filename: 'norcal-sbdc-no-fee-better',
    caption: 'Expert business advising doesn\u2019t have to cost a thing. Loan packaging, financial projections, business plans, and training \u2014 all at no fee to you.\n\nYour business, better.',
    tags: '#SBDC #NoFeeAdvising #SmallBusiness #BusinessAdvising #YourBusinessBetter',
    visual: {
      layout: 'statement',
      bg: C.dusty, fg: C.white,
      lines: ['Expert advising.', 'Loan packaging.', 'Financial projections.', 'All at no fee.'],
      tagline: 'Your business, better.',
    },
  },
  {
    id: 'post-testimonial',
    filename: 'norcal-sbdc-lender-testimonial',
    caption: 'When lenders trust the pipeline, deals close faster. That\u2019s what happens when borrowers show up prepared.\n\nPartner with NorCal SBDC.',
    tags: '#LenderPartners #SBDC #SmallBusinessLending #CommunityBanking',
    visual: {
      layout: 'quote',
      bg: C.navy, fg: C.cream,
      text: '\u201CSBDC referrals close faster. The prep work is already done.\u201D',
      attr: '\u2014 Community Bank Lender',
    },
  },
  {
    id: 'post-cdfi',
    filename: 'norcal-sbdc-cdfi-partnership',
    caption: 'CDFIs and SBDCs \u2014 same mission, different tools. You provide the capital, we provide the preparation. Together we reach the businesses that need it most.\n\nYour business, connected.',
    tags: '#CDFI #SBDC #CommunityLending #SmallBusiness #YourBusinessConnected',
    visual: {
      layout: 'headline',
      bg: C.deepNavy, fg: C.cream,
      kicker: 'FOR CDFIs',
      headline: 'You lend. We advise.',
      context: 'Together we reach the businesses that need capital most.',
    },
  },
  {
    id: 'post-20years',
    filename: 'norcal-sbdc-20-years',
    caption: 'Two decades of helping small businesses access capital, build plans, and grow. 20 years of trusted partnerships with lenders across Northern California.\n\nHere\u2019s to 20 more.',
    tags: '#NorCalSBDC #20Years #SmallBusiness #Anniversary #Partnership',
    visual: {
      layout: 'badge',
      bg: C.deepNavy, fg: C.cream,
      badge: '20 YEARS',
      text: 'of trusted partnership across Northern California.',
      tagline: 'norcalsbdc.org',
    },
  },
  {
    id: 'post-pipeline',
    filename: 'norcal-sbdc-pipeline',
    caption: 'Complete packages. Realistic asks. Prepared borrowers. That\u2019s what NorCal SBDC delivers to lending partners.\n\nLess back-and-forth, faster closes, better outcomes.\n\nYour business, funded.',
    tags: '#LenderPartners #SBDC #SmallBusinessLending #LoanPackaging #YourBusinessFunded',
    visual: {
      layout: 'statement',
      bg: C.cream, fg: C.deepNavy,
      kicker: 'FOR LENDERS',
      lines: ['Less back-and-forth.', 'Faster closes.', 'Better clients.'],
      tagline: 'Partner with NorCal SBDC.',
    },
  },
];

// ── Billboard Content (2 curated banners) ──

const BILLBOARDS: SocialBillboard[] = [
  {
    id: 'bb-funded',
    filename: 'norcal-sbdc-billboard-funded',
    caption: '$549M in capital accessed. 8,500+ entrepreneurs served. 16 centers across 36 counties. This is what happens when small businesses get the right support.\n\nYour business, funded.',
    tags: '#NorCalSBDC #SmallBusiness #CapitalAccess #YourBusinessFunded',
    visual: {
      layout: 'hero',
      bg: C.navy, fg: C.cream, accent: C.pool,
      number: '$549M',
      headline: 'Your business, funded.',
      sub: 'NorCal SBDC  \u00b7  norcalsbdc.org',
    },
  },
  {
    id: 'bb-loanready',
    filename: 'norcal-sbdc-billboard-loan-ready',
    caption: 'We don\u2019t compete with lenders \u2014 we make your pipeline stronger. Our advisors prepare borrowers with clean financials, solid plans, and realistic asks before they ever reach your desk.\n\nYour business, funded.',
    tags: '#LenderPartners #SBDC #LoanPackaging #SmallBusinessLending',
    visual: {
      layout: 'banner',
      bg: C.deepNavy, fg: C.cream,
      headline: 'We send you loan-ready clients.',
      sub: 'Clean financials. Solid plans. Realistic asks.',
      brand: 'norcalsbdc.org/partners',
    },
  },
];

// ── Visual Renderers ──

function PostVisualCard({ visual, id }: { visual: PostVisual; id: string }) {
  const base: React.CSSProperties = {
    width: '100%',
    aspectRatio: '1',
    borderRadius: 16,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  };

  switch (visual.layout) {
    case 'stat':
      return (
        <div id={id} style={{ ...base, background: visual.bg, color: visual.fg, padding: 48, justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5 }}>
            {visual.kicker}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 80, fontWeight: 100, lineHeight: 0.9, letterSpacing: '-0.03em' }}>
              {visual.number}
            </div>
            <div style={{ fontFamily: 'var(--era-text)', fontSize: 16, opacity: 0.7, lineHeight: 1.4, marginTop: 12 }}>
              {visual.context}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 200, fontStyle: 'italic', letterSpacing: '-0.01em' }}>
            {visual.tagline}
          </div>
        </div>
      );

    case 'statement':
      return (
        <div id={id} style={{ ...base, background: visual.bg, color: visual.fg, padding: 48, justifyContent: 'space-between' }}>
          {visual.kicker && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5 }}>
              {visual.kicker}
            </div>
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {visual.lines.map((line, i) => (
              <div key={i} style={{
                fontFamily: 'var(--display)',
                fontSize: 32,
                fontWeight: 200,
                lineHeight: 1.35,
                letterSpacing: '-0.015em',
              }}>
                {line}
              </div>
            ))}
          </div>
          {visual.tagline && (
            <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 200, fontStyle: 'italic', opacity: 0.7 }}>
              {visual.tagline}
            </div>
          )}
        </div>
      );

    case 'quote':
      return (
        <div id={id} style={{ ...base, background: visual.bg, color: visual.fg, padding: 48, justifyContent: 'center' }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 13, fontWeight: 200, letterSpacing: '0.2em', opacity: 0.3, marginBottom: 20 }}>
            \u275D
          </div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 200, fontStyle: 'italic', lineHeight: 1.35, marginBottom: 24 }}>
            {visual.text}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.05em', opacity: 0.5 }}>
            {visual.attr}
          </div>
        </div>
      );

    case 'headline':
      return (
        <div id={id} style={{ ...base, background: visual.bg, color: visual.fg, padding: 48, justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5 }}>
            {visual.kicker}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 36, fontWeight: 100, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              {visual.headline}
            </div>
            {visual.em && (
              <div style={{ fontFamily: 'var(--display)', fontSize: 36, fontWeight: 200, fontStyle: 'italic', lineHeight: 1.15, color: C.pool, letterSpacing: '-0.02em' }}>
                {visual.em}
              </div>
            )}
            <div style={{ fontFamily: 'var(--era-text)', fontSize: 15, opacity: 0.6, lineHeight: 1.5, marginTop: 16 }}>
              {visual.context}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, opacity: 0.4, letterSpacing: '0.04em' }}>
            norcalsbdc.org
          </div>
        </div>
      );

    case 'badge':
      return (
        <div id={id} style={{ ...base, background: visual.bg, color: visual.fg, padding: 48, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            border: '2px solid currentColor', padding: '10px 16px',
            opacity: 0.7,
          }}>
            {visual.badge}
          </div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 30, fontWeight: 200, fontStyle: 'italic', lineHeight: 1.25 }}>
            {visual.text}
          </div>
          {visual.tagline && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, opacity: 0.4, letterSpacing: '0.04em' }}>
              {visual.tagline}
            </div>
          )}
        </div>
      );
  }
}

function BillboardVisualCard({ visual, id }: { visual: BillboardVisual; id: string }) {
  const base: React.CSSProperties = {
    width: '100%',
    aspectRatio: '1.91 / 1',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  };

  if (visual.layout === 'hero') {
    return (
      <div id={id} style={{ ...base, background: visual.bg, color: visual.fg, display: 'flex', alignItems: 'center', padding: '0 64px' }}>
        {/* Background number */}
        <div style={{
          position: 'absolute', top: '50%', right: '-2%',
          transform: 'translateY(-50%)',
          fontFamily: 'var(--display)', fontSize: 280, fontWeight: 100,
          color: 'rgba(255,255,255,0.035)', lineHeight: 0.8, pointerEvents: 'none',
        }}>
          {visual.number}
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 80, fontWeight: 100, lineHeight: 0.9, letterSpacing: '-0.03em', marginBottom: 8 }}>
            {visual.number}
          </div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 42, fontWeight: 200, fontStyle: 'italic', color: visual.accent, marginBottom: 20 }}>
            {visual.headline}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, opacity: 0.4, letterSpacing: '0.06em' }}>
            {visual.sub}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id={id} style={{ ...base, background: visual.bg, color: visual.fg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 64px' }}>
      <div style={{ maxWidth: '55%' }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 44, fontWeight: 100, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          {visual.headline}
        </div>
      </div>
      <div style={{ textAlign: 'right', maxWidth: '38%' }}>
        <div style={{ fontFamily: 'var(--era-text)', fontSize: 18, opacity: 0.6, lineHeight: 1.4, marginBottom: 16 }}>
          {visual.sub}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, opacity: 0.4, letterSpacing: '0.04em' }}>
          {visual.brand}
        </div>
      </div>
    </div>
  );
}

// ── Action Buttons ──

function DownloadButton({ elementId, filename, loading, onDownload }: {
  elementId: string;
  filename: string;
  loading: boolean;
  onDownload: (id: string, name: string) => void;
}) {
  return (
    <button
      onClick={() => onDownload(elementId, filename)}
      disabled={loading}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: '8px 14px',
        color: loading ? 'rgba(255,255,255,0.3)' : C.pool,
        fontFamily: 'var(--mono)',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.06em',
        cursor: loading ? 'wait' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.2s ease',
      }}
    >
      {loading ? (
        <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(143,197,217,0.3)', borderTopColor: C.pool, borderRadius: '50%', animation: 'cw-spin 0.8s linear infinite' }} />
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      )}
      {loading ? 'Generating...' : 'Download PNG'}
    </button>
  );
}

function CopyButton({ text, copied, onCopy }: {
  text: string;
  copied: boolean;
  onCopy: (text: string) => void;
}) {
  return (
    <button
      onClick={() => onCopy(text)}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: '8px 14px',
        color: copied ? '#6ee7b7' : 'rgba(255,255,255,0.5)',
        fontFamily: 'var(--mono)',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.06em',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.2s ease',
      }}
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      {copied ? 'Copied!' : 'Copy Caption'}
    </button>
  );
}

// ═══════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════

export default function ContentWall() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDownload = useCallback(async (elementId: string, filename: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;

    setDownloadingId(elementId);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to generate PNG:', err);
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const handleCopy = useCallback((text: string, id: string) => {
    const full = text;
    navigator.clipboard.writeText(full).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }, []);

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100dvh' }}>
      {/* Spinner keyframe */}
      <style>{`@keyframes cw-spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Nav Bar ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(10,10,10,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 24px',
          gap: 12,
        }}
      >
        <a
          href="/brand/lender-resources"
          style={{
            fontFamily: 'var(--era-text)',
            color: 'rgba(255,255,255,0.35)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Lender Resources
        </a>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
        <span style={{
          fontFamily: 'var(--era-text)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.6)',
        }}>
          Social Content
        </span>
      </nav>

      {/* ── Page Header ── */}
      <header style={{ padding: 'clamp(40px, 6vw, 80px) clamp(24px, 4vw, 48px) 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: C.pool,
          marginBottom: 12,
        }}>
          LinkedIn Content Library
        </div>
        <h1 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 100,
          color: C.cream,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          margin: '0 0 16px',
        }}>
          Partner &amp; Lender Social Content
        </h1>
        <p style={{
          fontFamily: 'var(--era-text)',
          fontSize: 15,
          color: 'rgba(255,255,255,0.4)',
          maxWidth: 540,
          lineHeight: 1.6,
          margin: 0,
        }}>
          Ready-to-post content for SBDC advisors and staff. Download the image, copy the caption, and share on LinkedIn. That simple.
        </p>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(24px, 4vw, 48px) 96px' }}>

        {/* ════════════════════════════════════════════
           BILLBOARDS
           ════════════════════════════════════════════ */}
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#444',
          marginBottom: 20,
        }}>
          LinkedIn Banners
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginBottom: 64 }}>
          {BILLBOARDS.map((bb) => (
            <div key={bb.id} style={{ background: '#111', borderRadius: 16, overflow: 'hidden' }}>
              <BillboardVisualCard visual={bb.visual} id={bb.id} />
              {/* Caption + Actions */}
              <div style={{ padding: '20px 24px' }}>
                <div style={{
                  fontFamily: 'var(--era-text)', fontSize: 13, color: 'rgba(255,255,255,0.55)',
                  lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 8,
                }}>
                  {bb.caption}
                </div>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 11, color: C.pool,
                  opacity: 0.6, marginBottom: 16,
                }}>
                  {bb.tags}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <DownloadButton
                    elementId={bb.id}
                    filename={bb.filename}
                    loading={downloadingId === bb.id}
                    onDownload={handleDownload}
                  />
                  <CopyButton
                    text={`${bb.caption}\n\n${bb.tags}`}
                    copied={copiedId === bb.id}
                    onCopy={(text) => handleCopy(text, bb.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════════
           POSTS
           ════════════════════════════════════════════ */}
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#444',
          marginBottom: 20,
          paddingTop: 32,
          borderTop: '1px solid #1a1a1a',
        }}>
          Square Posts
        </div>

        <div
          className="cw-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}
        >
          {POSTS.map((post) => (
            <div key={post.id} style={{ background: '#111', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <PostVisualCard visual={post.visual} id={post.id} />
              {/* Caption + Actions */}
              <div style={{ padding: '20px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  fontFamily: 'var(--era-text)', fontSize: 12.5, color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 8, flex: 1,
                }}>
                  {post.caption}
                </div>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 10, color: C.pool,
                  opacity: 0.5, marginBottom: 16, lineHeight: 1.5,
                }}>
                  {post.tags}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <DownloadButton
                    elementId={post.id}
                    filename={post.filename}
                    loading={downloadingId === post.id}
                    onDownload={handleDownload}
                  />
                  <CopyButton
                    text={`${post.caption}\n\n${post.tags}`}
                    copied={copiedId === post.id}
                    onCopy={(text) => handleCopy(text, post.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
