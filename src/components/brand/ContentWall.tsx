'use client';

import './brand.css';

/* ═══════════════════════════════════════════════════════
   ContentWall — Partner & Lender Outreach Content Gallery
   Rebuilt from static HTML using the Brand House design system.
   ═══════════════════════════════════════════════════════ */

// ── Colors ──
const C = {
  navy: '#162d50',
  deepNavy: '#0f1c2e',
  royal: '#1D5AA7',
  dusty: '#5d7a9c',
  pool: '#8FC5D9',
  cream: '#faf8f4',
  sand: '#f3efe8',
  brick: '#b54a4a',
  white: '#ffffff',
} as const;

// ── Card Types ──

type CardData =
  | { type: 'bignumber'; bg: string; fg: string; grain?: boolean; eyebrow: string; number: string; label: string; cta: string }
  | { type: 'quote'; bg: string; fg: string; grain?: boolean; text: string; attr: string }
  | { type: 'headline'; bg: string; fg: string; grain?: boolean; brand: string; text: string; sub: string; cta: string }
  | { type: 'statement'; bg: string; fg: string; grain?: boolean; text: string }
  | { type: 'list'; bg: string; fg: string; brand: string; title: string; items: string[]; cta: string }
  | { type: 'minimal'; bg: string; fg: string; text: string }
  | { type: 'badge'; bg: string; fg: string; grain?: boolean; badge: string; text: string; cta: string }
  | { type: 'split'; topBg: string; topFg: string; num: string; label: string; botBg: string; botFg: string; text: string; cta: string };

type BillboardData =
  | { variant: 'stat'; bg: string; fg: string; grain?: boolean; eyebrow: string; number: string; context: string; brandUrl: string }
  | { variant: 'content'; bg: string; fg: string; grain?: boolean; brandTop: string; headline: string; em: string; stats: string; bgNum: string };

interface WallSection {
  label: string;
  billboards?: BillboardData[];
  cards?: CardData[];
}

// ── Content Data ──

const WALL: WallSection[] = [
  {
    label: 'Billboards',
    billboards: [
      {
        variant: 'stat',
        bg: C.deepNavy, fg: C.cream, grain: true,
        eyebrow: 'We Send You',
        number: 'Loan-Ready',
        context: 'clients with clean financials, solid plans, and realistic asks.',
        brandUrl: 'norcalsbdc.org/partners',
      },
      {
        variant: 'content',
        bg: C.navy, fg: C.cream, grain: true,
        brandTop: 'For Lenders & Partners',
        headline: 'We do the prep work.',
        em: 'You close the deal.',
        stats: 'Free loan packaging. Financial projections. Business plan review. All before they reach your desk.',
        bgNum: '$58',
      },
    ],
  },
  {
    label: 'Value to Lenders',
    cards: [
      { type: 'bignumber', bg: C.navy, fg: C.cream, grain: true, eyebrow: 'ROI', number: '$58', label: 'return for every $1\ninvested in SBDC', cta: 'SBA verified →' },
      { type: 'headline', bg: C.cream, fg: C.deepNavy, brand: 'FOR LENDERS', text: 'We don\u2019t compete with you.', sub: 'We make your pipeline stronger.', cta: 'Partner with us →' },
      { type: 'quote', bg: C.brick, fg: C.white, grain: true, text: '\u201CSBDC referrals close faster. The prep work is already done.\u201D', attr: '— Community Bank Lender' },
      { type: 'bignumber', bg: C.deepNavy, fg: C.cream, eyebrow: 'Last Year', number: '$549M', label: 'Capital accessed\nby our clients', cta: 'Be part of it →' },
    ],
  },
  {
    label: 'What We Do (For Lenders)',
    cards: [
      { type: 'list', bg: C.sand, fg: C.deepNavy, brand: 'Before They Reach You', title: 'We prepare them.', items: ['Clean financial statements', 'Realistic loan amounts', 'Complete documentation', 'Solid business plans'], cta: 'norcalsbdc.org/partners' },
      { type: 'statement', bg: C.dusty, fg: C.white, grain: true, text: 'Less back-and-forth.\nFaster closes.\nBetter clients.' },
      { type: 'headline', bg: C.navy, fg: C.cream, brand: 'FOR LENDERS', text: 'Your underwriters will thank you.', sub: 'Complete packages. Realistic asks. Prepared borrowers.', cta: 'Learn more →' },
      { type: 'split', topBg: C.brick, topFg: C.white, num: 'Free', label: 'What we charge clients', botBg: C.deepNavy, botFg: C.cream, text: 'They get expert prep. You get loan-ready referrals. Everyone wins.', cta: 'Partner now →' },
    ],
  },
  {
    label: 'CDFIs & Mission Lenders',
    cards: [
      { type: 'headline', bg: C.deepNavy, fg: C.cream, grain: true, brand: 'FOR CDFIs', text: 'Same mission. Different tools.', sub: 'You lend. We advise. Together we build.', cta: 'Let\u2019s partner →' },
      { type: 'bignumber', bg: C.cream, fg: C.deepNavy, eyebrow: 'Network', number: '16', label: 'Centers across\nNorthern California', cta: 'Find your local center →' },
      { type: 'quote', bg: C.dusty, fg: C.white, text: '\u201CThey\u2019re an extension of our team. We couldn\u2019t serve this many small businesses without them.\u201D', attr: '— CDFI Partner' },
      { type: 'statement', bg: C.brick, fg: C.white, grain: true, text: 'We reach the businesses you want to fund.' },
    ],
  },
  {
    label: 'Economic Development Partners',
    cards: [
      { type: 'bignumber', bg: C.navy, fg: C.cream, grain: true, eyebrow: 'Coverage', number: '36', label: 'Counties across\nNorthern California', cta: 'See our network →' },
      { type: 'headline', bg: C.sand, fg: C.deepNavy, brand: 'FOR CITIES & COUNTIES', text: 'Your constituents. Our advisors.', sub: 'Free small business support for your community.', cta: 'Partner with us →' },
      { type: 'list', bg: C.deepNavy, fg: C.cream, brand: 'We Provide', title: 'At no cost to you.', items: ['One-on-one advising', 'Workshops & training', 'Loan packaging', 'Disaster recovery support'], cta: 'norcalsbdc.org' },
      { type: 'bignumber', bg: C.brick, fg: C.white, eyebrow: 'Businesses', number: '8,500+', label: 'Served last year\nacross the network', cta: 'Join us →' },
    ],
  },
  {
    label: 'Referral Partners (CPAs, Attorneys, Chambers)',
    cards: [
      { type: 'headline', bg: C.cream, fg: C.deepNavy, brand: 'FOR CPAs & ATTORNEYS', text: 'Send us the ones you can\u2019t bill.', sub: 'We\u2019ll get them ready for you.', cta: 'Refer a client →' },
      { type: 'statement', bg: C.navy, fg: C.cream, grain: true, text: 'Free for them.\nFree for you.\nFunded by SBA.' },
      { type: 'headline', bg: C.dusty, fg: C.white, brand: 'FOR CHAMBERS', text: 'Add value to your membership.', sub: 'Free expert advising for your members.', cta: 'Partner with SBDC →' },
      { type: 'badge', bg: C.deepNavy, fg: C.cream, grain: true, badge: '20 Years', text: 'Trusted by partners across Northern California.', cta: 'norcalsbdc.org' },
    ],
  },
  {
    label: 'The Ask',
    cards: [
      { type: 'headline', bg: C.brick, fg: C.white, grain: true, brand: 'NORCAL SBDC', text: 'Refer your clients.', sub: 'We\u2019ll send them back ready.', cta: 'Start referring →' },
      { type: 'headline', bg: C.cream, fg: C.deepNavy, brand: 'NORCAL SBDC', text: 'Co-host a workshop.', sub: 'Your audience. Our expertise. Shared impact.', cta: 'Let\u2019s plan one →' },
      { type: 'headline', bg: C.navy, fg: C.cream, brand: 'NORCAL SBDC', text: 'Join our lender network.', sub: 'Get referrals. Close more loans.', cta: 'Apply now →' },
      { type: 'minimal', bg: C.sand, fg: C.deepNavy, text: 'Questions?\n\npartners@norcalsbdc.org' },
    ],
  },
];

// ── Card Renderer ──

function WallCard({ card }: { card: CardData }) {
  const base: React.CSSProperties = {
    borderRadius: 12,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    aspectRatio: '1',
    position: 'relative',
  };

  switch (card.type) {
    case 'bignumber':
      return (
        <div className={card.grain ? 'bh-grain' : ''} style={{ ...base, background: card.bg, color: card.fg, padding: 'clamp(20px, 3vw, 32px)', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.6 }}>{card.eyebrow}</div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(48px, 6vw, 72px)', lineHeight: 0.9, letterSpacing: '-0.03em', fontWeight: 100 }}>{card.number}</div>
            <div style={{ fontFamily: 'var(--era-text)', fontSize: 13, opacity: 0.8, lineHeight: 1.4, marginTop: 8, whiteSpace: 'pre-line' }}>{card.label}</div>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>{card.cta}</div>
        </div>
      );

    case 'quote':
      return (
        <div className={card.grain ? 'bh-grain' : ''} style={{ ...base, background: card.bg, color: card.fg, padding: 'clamp(24px, 3vw, 32px)', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(20px, 2.5vw, 24px)', fontWeight: 200, fontStyle: 'italic', lineHeight: 1.3, marginBottom: 16 }}>{card.text}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.05em', opacity: 0.6 }}>{card.attr}</div>
        </div>
      );

    case 'headline':
      return (
        <div className={card.grain ? 'bh-grain' : ''} style={{ ...base, background: card.bg, color: card.fg, padding: 'clamp(24px, 3vw, 32px)', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--era-text)', fontSize: 12, fontWeight: 700, letterSpacing: '0.02em', opacity: 0.8 }}>{card.brand}</div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 200, lineHeight: 1.15 }}>{card.text}</div>
            <div style={{ fontFamily: 'var(--era-text)', fontSize: 13, opacity: 0.7, lineHeight: 1.5, marginTop: 8 }}>{card.sub}</div>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600 }}>{card.cta}</div>
        </div>
      );

    case 'statement':
      return (
        <div className={card.grain ? 'bh-grain' : ''} style={{ ...base, background: card.bg, color: card.fg, padding: 'clamp(28px, 4vw, 40px)', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 200, fontStyle: 'italic', lineHeight: 1.2, whiteSpace: 'pre-line' }}>{card.text}</div>
        </div>
      );

    case 'list':
      return (
        <div style={{ ...base, background: card.bg, color: card.fg, padding: 'clamp(20px, 3vw, 28px)', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5 }}>{card.brand}</div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 200, fontStyle: 'italic', margin: '12px 0' }}>{card.title}</div>
            <ul style={{ listStyle: 'none', fontFamily: 'var(--era-text)', fontSize: 12, lineHeight: 1.8, opacity: 0.8, padding: 0 }}>
              {card.items.map((item) => (
                <li key={item} style={{ display: 'flex', gap: 6 }}>
                  <span style={{ opacity: 0.5 }}>&rarr;</span>{item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600, marginTop: 16 }}>{card.cta}</div>
        </div>
      );

    case 'minimal':
      return (
        <div style={{ ...base, background: card.bg, color: card.fg, padding: 32, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, letterSpacing: '0.05em', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{card.text}</div>
        </div>
      );

    case 'badge':
      return (
        <div className={card.grain ? 'bh-grain' : ''} style={{ ...base, background: card.bg, color: card.fg, padding: 'clamp(24px, 3vw, 32px)', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: '2px solid currentColor', padding: '8px 12px', opacity: 0.8 }}>{card.badge}</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 200, fontStyle: 'italic', lineHeight: 1.2 }}>{card.text}</div>
          <div style={{ fontFamily: 'var(--era-text)', fontSize: 12, fontWeight: 600 }}>{card.cta}</div>
        </div>
      );

    case 'split':
      return (
        <div style={{ ...base, aspectRatio: '1' }}>
          <div style={{ flex: 1, background: card.topBg, color: card.topFg, padding: 'clamp(16px, 2.5vw, 24px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 100, lineHeight: 0.9 }}>{card.num}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 8 }}>{card.label}</div>
          </div>
          <div style={{ flex: 1, background: card.botBg, color: card.botFg, padding: 'clamp(16px, 2.5vw, 24px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--era-text)', fontSize: 14, lineHeight: 1.5 }}>{card.text}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600 }}>{card.cta}</div>
          </div>
        </div>
      );
  }
}

// ── Billboard Renderer ──

function Billboard({ data }: { data: BillboardData }) {
  if (data.variant === 'stat') {
    return (
      <div
        className={data.grain ? 'bh-grain' : ''}
        style={{
          gridColumn: '1 / -1',
          aspectRatio: '4 / 1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'clamp(32px, 5vw, 64px)',
          borderRadius: 12,
          background: data.bg,
          color: data.fg,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(10px, 1.2vw, 14px)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 8 }}>{data.eyebrow}</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(64px, 10vw, 140px)', fontWeight: 100, lineHeight: 0.85, letterSpacing: '-0.03em' }}>{data.number}</div>
        </div>
        <div style={{ textAlign: 'right', maxWidth: 350 }}>
          <div style={{ fontFamily: 'var(--era-text)', fontSize: 'clamp(16px, 2vw, 24px)', lineHeight: 1.3, marginBottom: 16 }}>{data.context}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(10px, 1.2vw, 14px)', fontWeight: 600, letterSpacing: '0.03em' }}>{data.brandUrl}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={data.grain ? 'bh-grain' : ''}
      style={{
        gridColumn: '1 / -1',
        aspectRatio: '4 / 1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(32px, 5vw, 64px)',
        borderRadius: 12,
        background: data.bg,
        color: data.fg,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background number */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '-5%',
        transform: 'translateY(-50%)',
        fontFamily: 'var(--display)',
        fontSize: 'clamp(150px, 25vw, 300px)',
        fontWeight: 100,
        color: 'rgba(255,255,255,0.04)',
        lineHeight: 0.8,
        pointerEvents: 'none',
      }}>
        {data.bgNum}
      </div>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 750 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 24 }}>{data.brandTop}</div>
        <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 100, lineHeight: 1.1, marginBottom: 24 }}>
          {data.headline} <em style={{ fontStyle: 'italic', color: C.brick }}>{data.em}</em>
        </div>
        <div style={{ fontFamily: 'var(--era-text)', fontSize: 'clamp(14px, 1.5vw, 18px)', opacity: 0.7, lineHeight: 1.5 }}>{data.stats}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════

export default function ContentWall() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100dvh' }}>
      {/* ── Nav Bar ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(10,10,10,0.9)',
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
          Content Wall
        </span>
      </nav>

      {/* ── Page Header ── */}
      <header style={{ padding: 'clamp(40px, 6vw, 80px) 48px 48px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: C.brick,
          marginBottom: 12,
        }}>
          B2B Outreach
        </div>
        <h1 style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(36px, 6vw, 56px)',
          fontWeight: 100,
          color: C.cream,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          margin: 0,
        }}>
          Partner &amp; Lender Content
        </h1>
        <p style={{
          fontFamily: 'var(--era-text)',
          fontSize: 16,
          color: C.dusty,
          marginTop: 12,
          maxWidth: 600,
          lineHeight: 1.5,
        }}>
          Ads, one-pagers, and messaging for lenders, CDFIs, banks, economic development orgs, and referral partners.
        </p>
      </header>

      {/* ── Content Grid ── */}
      <div
        className="cw-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          padding: '0 48px 96px',
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        {WALL.map((section, si) => (
          <div key={si} style={{ display: 'contents' }}>
            {/* Row Label */}
            <div style={{
              gridColumn: '1 / -1',
              fontFamily: 'var(--mono)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#444',
              padding: si === 0 ? '0 0 16px' : '32px 0 16px',
              borderTop: si === 0 ? 'none' : '1px solid #222',
              marginTop: si === 0 ? 0 : 16,
            }}>
              {section.label}
            </div>

            {/* Billboards */}
            {section.billboards?.map((bb, bi) => (
              <Billboard key={`bb-${bi}`} data={bb} />
            ))}

            {/* Cards */}
            {section.cards?.map((card, ci) => (
              <WallCard key={`card-${ci}`} card={card} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
