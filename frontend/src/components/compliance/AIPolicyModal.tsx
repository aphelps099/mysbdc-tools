'use client';

import Modal from '../ui/Modal';
import { useTheme } from '@/context/ThemeContext';

interface AIPolicyModalProps {
  open: boolean;
  onClose: () => void;
}

const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
const fadeUp = (delay: number, dur = 0.4) =>
  `policyFadeUp ${dur}s ${ease} ${delay}s both` as const;

/* ── Color palettes ── */
const dark = {
  bg: '#0d1117',
  border: '#25292e',
  shadow: '0 25px 80px -16px rgba(0,0,0,0.7)',
  title: '#ffffff',
  subtitle: 'rgba(255,255,255,0.25)',
  rule: '#25292e',
  closeIdle: 'rgba(255,255,255,0.35)',
  closeHover: 'rgba(255,255,255,0.75)',
  closeBorder: 'rgba(255,255,255,0.10)',
  closeBorderHover: 'rgba(255,255,255,0.22)',
  approvedHeading: '#86efac',
  approvedBorder: 'rgba(134,239,172,0.4)',
  approvedDot: '#6ee7b7',
  prohibitedHeading: '#f9a8b4',
  prohibitedBorder: 'rgba(248,113,113,0.4)',
  prohibitedDot: '#f9a8b4',
  itemText: 'rgba(255,255,255,0.6)',
  emText: 'rgba(255,255,255,0.85)',
  warnText: '#f9a8b4',
  warnUnderline: 'rgba(248,113,113,0.35)',
  footerMuted: 'rgba(255,255,255,0.25)',
  footerGrey: 'rgba(255,255,255,0.5)',
  footerSep: 'rgba(255,255,255,0.1)',
};

const light = {
  bg: '#ffffff',
  border: '#e7e2da',
  shadow: '0 25px 80px -16px rgba(0,0,0,0.12)',
  title: '#1a1a1a',
  subtitle: 'rgba(0,0,0,0.35)',
  rule: '#e7e2da',
  closeIdle: 'rgba(0,0,0,0.35)',
  closeHover: 'rgba(0,0,0,0.75)',
  closeBorder: 'rgba(0,0,0,0.12)',
  closeBorderHover: 'rgba(0,0,0,0.28)',
  approvedHeading: '#16a34a',
  approvedBorder: 'rgba(22,163,74,0.3)',
  approvedDot: '#22c55e',
  prohibitedHeading: '#dc2626',
  prohibitedBorder: 'rgba(220,38,38,0.25)',
  prohibitedDot: '#ef4444',
  itemText: 'rgba(0,0,0,0.55)',
  emText: 'rgba(0,0,0,0.8)',
  warnText: '#dc2626',
  warnUnderline: 'rgba(220,38,38,0.25)',
  footerMuted: 'rgba(0,0,0,0.3)',
  footerGrey: 'rgba(0,0,0,0.5)',
  footerSep: 'rgba(0,0,0,0.1)',
};

export default function AIPolicyModal({ open, onClose }: AIPolicyModalProps) {
  const { theme } = useTheme();
  const t = theme === 'dark' ? dark : light;

  let idx = 0;
  const d = () => 0.28 + idx++ * 0.04;

  return (
    <Modal
      open={open}
      onClose={onClose}
      containerStyle={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        boxShadow: t.shadow,
      }}
    >
      <div style={{ overflowY: 'auto' }}>
        {/* Header */}
        <div className="px-4 pt-4 pb-2.5 flex items-start justify-between gap-4">
          <div>
            <h2
              className="text-[20px] font-bold tracking-[-0.02em]"
              style={{ fontFamily: 'var(--display)', color: t.title, opacity: 0, animation: fadeUp(0.06) }}
            >
              AI Usage Policy
            </h2>
            <p
              className="text-[11px] mt-0.5"
              style={{ fontFamily: 'var(--sans)', color: t.subtitle, opacity: 0, animation: fadeUp(0.15) }}
            >
              NorCal SBDC &middot; Internal Use
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: `1px solid ${t.closeBorder}`,
              background: 'transparent',
              color: t.closeIdle,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.closeBorderHover; e.currentTarget.style.color = t.closeHover; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.closeBorder; e.currentTarget.style.color = t.closeIdle; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>
        </div>

        <div style={{ height: 1, background: t.rule, transformOrigin: 'left', animation: `policyLineExpand 0.5s ${ease} 0.2s both` }} />

        {/* Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-3.5">

          {/* ── Approved ── */}
          <div>
            <div className="mb-3" style={{ opacity: 0, animation: fadeUp(0.24) }}>
              <h3
                className="text-[14px] font-bold tracking-[-0.01em] pb-1"
                style={{
                  fontFamily: 'var(--sans)',
                  color: t.approvedHeading,
                  borderBottom: `2px solid ${t.approvedBorder}`,
                  display: 'inline-block',
                }}
              >
                Approved
              </h3>
            </div>
            <ul className="space-y-2">
              <Item color={t.approvedDot} delay={d()} tokens={t}>Use <Em tokens={t}>ChatGPT Teams</Em> SBDC account</Item>
              <Item color={t.approvedDot} delay={d()} tokens={t}>Use <Em tokens={t}>Notebook LM</Em> for research</Item>
              <Item color={t.approvedDot} delay={d()} tokens={t}>Draft communications, reports &amp; training materials</Item>
              <Item color={t.approvedDot} delay={d()} tokens={t}>Process optimization &amp; de-identified analysis</Item>
            </ul>
          </div>

          {/* ── Prohibited ── */}
          <div>
            <div className="mb-3" style={{ opacity: 0, animation: fadeUp(0.28) }}>
              <h3
                className="text-[14px] font-bold tracking-[-0.01em] pb-1"
                style={{
                  fontFamily: 'var(--sans)',
                  color: t.prohibitedHeading,
                  borderBottom: `2px solid ${t.prohibitedBorder}`,
                  display: 'inline-block',
                }}
              >
                Prohibited
              </h3>
            </div>
            <ul className="space-y-2">
              <Item color={t.prohibitedDot} delay={d()} tokens={t}>No <Warn tokens={t}>client PII</Warn> in non-SBDC tools</Item>
              <Item color={t.prohibitedDot} delay={d()} tokens={t}>AI cannot replace <Warn tokens={t}>human judgment</Warn></Item>
              <Item color={t.prohibitedDot} delay={d()} tokens={t}>No <Warn tokens={t}>sensitive data</Warn> in screenshots</Item>
              <Item color={t.prohibitedDot} delay={d()} tokens={t}>Always <Warn tokens={t}>verify AI-generated facts</Warn></Item>
              <Item color={t.prohibitedDot} delay={d()} tokens={t}>No AI <Warn tokens={t}>legal or financial advice</Warn></Item>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mx-4" style={{ height: 1, background: t.rule, transformOrigin: 'right', animation: `policyLineExpand 0.5s ${ease} 0.65s both` }} />

        <div className="px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap" style={{ opacity: 0, animation: fadeUp(0.7) }}>
          <p className="text-[11px]" style={{ fontFamily: 'var(--sans)', color: t.footerMuted }}>
            2 CFR 130 &middot; When in doubt, ask first.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px]" style={{ fontFamily: 'var(--sans)', color: t.footerGrey, fontWeight: 500 }}>A. Phelps</span>
            <span style={{ color: t.footerSep }}>&middot;</span>
            <a
              href="mailto:phelps@norcalsbdc.org"
              className="text-[11px] transition-colors duration-150"
              style={{ fontFamily: 'var(--sans)', color: t.footerMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.color = t.title; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = t.footerMuted; }}
            >
              email
            </a>
            <span style={{ color: t.footerSep }}>/</span>
            <a
              href="https://linkedin.com/in/aaroncphelps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] transition-colors duration-150"
              style={{ fontFamily: 'var(--sans)', color: t.footerMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.color = t.title; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = t.footerMuted; }}
            >
              linkedin
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ── Shared sub-components ── */

type Tokens = typeof dark;

function Item({ children, color, delay, tokens }: { children: React.ReactNode; color: string; delay: number; tokens: Tokens }) {
  return (
    <li
      className="flex gap-2.5 items-start"
      style={{ opacity: 0, animation: `policyFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${delay}s both` }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-[6px]" style={{ background: color }} />
      <span className="text-[13px] font-light leading-[1.5]" style={{ fontFamily: 'var(--sans)', color: tokens.itemText }}>
        {children}
      </span>
    </li>
  );
}

function Em({ children, tokens }: { children: React.ReactNode; tokens: Tokens }) {
  return <span style={{ color: tokens.emText, fontWeight: 400 }}>{children}</span>;
}

function Warn({ children, tokens }: { children: React.ReactNode; tokens: Tokens }) {
  return (
    <span style={{
      color: tokens.warnText,
      textDecoration: 'underline',
      textDecorationColor: tokens.warnUnderline,
      textUnderlineOffset: 2,
      textDecorationThickness: 1.5,
    }}>
      {children}
    </span>
  );
}
