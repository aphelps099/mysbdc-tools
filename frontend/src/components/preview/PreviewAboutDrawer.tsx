'use client';

import { useEffect, useCallback, useState } from 'react';
import SbdcLogo from './SbdcLogo';
import { useTheme } from '@/context/ThemeContext';

/* ═══════════════════════════════════════════════════════
   PreviewAboutDrawer — compact, disciplined, Pentagram restraint.
   ═══════════════════════════════════════════════════════ */

interface PreviewAboutDrawerProps {
  open: boolean;
  onClose: () => void;
}

/* ── Color palettes ── */
const darkPalette = {
  backdrop: 'rgba(13,17,23,0.4)',
  bg: '#0d1117',
  border: 'rgba(255,255,255,0.06)',
  closeBorder: 'rgba(255,255,255,0.10)',
  closeBorderHover: 'rgba(255,255,255,0.22)',
  closeColor: 'rgba(255,255,255,0.35)',
  closeColorHover: 'rgba(255,255,255,0.75)',
  blurb: 'rgba(255,255,255,0.4)',
  version: 'rgba(255,255,255,0.12)',
  divider: 'rgba(143, 197, 217, 0.2)',
  sectionLabel: 'rgba(255,255,255,0.18)',
  link: 'rgba(255,255,255,0.88)',
  linkHover: '#fff',
  linkBorder: 'rgba(143, 197, 217, 0.3)',
  linkBorderHover: 'rgba(143, 197, 217, 0.85)',
  contactName: 'rgba(255,255,255,0.88)',
  contactTitle: 'rgba(255,255,255,0.22)',
  password: 'rgba(255,255,255,0.2)',
  copyright: 'rgba(255,255,255,0.08)',
  advisorText: 'rgba(255,255,255,0.92)',
  aiText: 'rgba(143, 197, 217, 0.7)',
};

const lightPalette = {
  backdrop: 'rgba(0,0,0,0.12)',
  bg: '#ffffff',
  border: 'rgba(0,0,0,0.08)',
  closeBorder: 'rgba(0,0,0,0.12)',
  closeBorderHover: 'rgba(0,0,0,0.28)',
  closeColor: 'rgba(0,0,0,0.35)',
  closeColorHover: 'rgba(0,0,0,0.75)',
  blurb: 'rgba(0,0,0,0.42)',
  version: 'rgba(0,0,0,0.15)',
  divider: 'rgba(29, 90, 167, 0.15)',
  sectionLabel: 'rgba(0,0,0,0.25)',
  link: 'rgba(0,0,0,0.82)',
  linkHover: '#1a1a1a',
  linkBorder: 'rgba(29, 90, 167, 0.25)',
  linkBorderHover: 'rgba(29, 90, 167, 0.7)',
  contactName: 'rgba(0,0,0,0.82)',
  contactTitle: 'rgba(0,0,0,0.35)',
  password: 'rgba(0,0,0,0.3)',
  copyright: 'rgba(0,0,0,0.12)',
  advisorText: 'rgba(0,0,0,0.85)',
  aiText: 'rgba(29, 90, 167, 0.7)',
};

export default function PreviewAboutDrawer({ open, onClose }: PreviewAboutDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const t = theme === 'dark' ? darkPalette : lightPalette;

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, handleKey]);

  // Trigger animation sequence after drawer slides in
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setMounted(true), 80);
      return () => clearTimeout(timer);
    }
    setMounted(false);
  }, [open]);

  return (
    <>
      {/* Scoped keyframes */}
      <style>{`
        @keyframes aboutReveal {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes aboutLineExpand {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes aboutLogoReveal {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        @keyframes aboutCharIn {
          from { opacity: 0; transform: translateY(3px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .about-reveal {
          opacity: 0;
          animation: aboutReveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .about-line-expand {
          transform-origin: left;
          transform: scaleX(0);
          animation: aboutLineExpand 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .about-link {
          color: ${t.link};
          text-decoration: none;
          border-bottom: 1.5px solid ${t.linkBorder};
          transition: border-color 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                      color 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          padding-bottom: 1px;
        }
        .about-link:hover {
          color: ${t.linkHover};
          border-bottom-color: ${t.linkBorderHover};
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[500] transition-opacity duration-300"
        style={{
          background: t.backdrop,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
        }}
      />

      {/* Drawer */}
      <div
        className="preview-drawer fixed z-[501] overflow-y-auto transition-transform duration-[500ms]"
        style={{
          top: 8,
          bottom: 8,
          right: 8,
          width: 400,
          maxWidth: 'calc(100vw - 16px)',
          background: t.bg,
          border: `1px solid ${t.border}`,
          borderRadius: 16,
          padding: '36px 24px 28px',
          transform: open ? 'translateX(0)' : 'translateX(calc(100% + 16px))',
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute flex items-center justify-center cursor-pointer transition-all duration-200"
          style={{
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: 8,
            border: `1px solid ${t.closeBorder}`,
            background: 'transparent',
            color: t.closeColor,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.closeBorderHover; e.currentTarget.style.color = t.closeColorHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.closeBorder; e.currentTarget.style.color = t.closeColor; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        </button>

        {mounted && (
          <>
            {/* Logo — SVG clip-path draw-in, smaller */}
            <div
              style={{
                marginBottom: 14,
                clipPath: 'inset(0 100% 0 0)',
                animation: 'aboutLogoReveal 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both',
              }}
            >
              <SbdcLogo style={{ height: 36, width: 'auto', display: 'block' }} />
            </div>

            {/* ADVISOR AI — per-character stagger */}
            <div style={{ marginBottom: 16 }}>
              <AdvisorTitle tokens={t} />
            </div>

            {/* Blurb */}
            <p
              className="about-reveal"
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 14,
                fontWeight: 400,
                lineHeight: 1.7,
                color: t.blurb,
                marginBottom: 8,
                maxWidth: 300,
                animationDelay: '0.5s',
              }}
            >
              AI-powered advising assistant for SBDC advisors and staff. Built for the NorCal network.
            </p>

            {/* Version */}
            <p
              className="about-reveal"
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                fontWeight: 400,
                letterSpacing: '0.04em',
                color: t.version,
                marginBottom: 20,
                animationDelay: '0.55s',
              }}
            >
              v1.0.0 &middot; February 2026
            </p>

            {/* Divider */}
            <div
              className="about-line-expand"
              style={{
                height: 1,
                background: t.divider,
                marginBottom: 18,
                animationDelay: '0.6s',
              }}
            />

            {/* Links */}
            <div
              className="about-reveal"
              style={{ marginBottom: 14, animationDelay: '0.65s' }}
            >
              <p style={{
                fontFamily: 'var(--sans)',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: t.sectionLabel,
                marginBottom: 4,
              }}>
                Network
              </p>
              <a
                href="https://norcalsbdc.org"
                target="_blank"
                rel="noopener noreferrer"
                className="about-link"
                style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 700 }}
              >
                norcalsbdc.org
              </a>
            </div>

            <div
              className="about-reveal"
              style={{ marginBottom: 14, animationDelay: '0.72s' }}
            >
              <p style={{
                fontFamily: 'var(--sans)',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: t.sectionLabel,
                marginBottom: 4,
              }}>
                AI Strategy
              </p>
              <a
                href="https://hellosbdc.com/ai2026"
                target="_blank"
                rel="noopener noreferrer"
                className="about-link"
                style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 700 }}
              >
                Prompt House
              </a>
              <p style={{
                fontFamily: 'var(--sans)',
                fontSize: 10.5,
                color: t.password,
                marginTop: 3,
              }}>
                Password protected &middot; sbdc2026
              </p>
            </div>

            {/* Divider */}
            <div
              className="about-line-expand"
              style={{
                height: 1,
                background: t.divider,
                margin: '4px 0 18px',
                animationDelay: '0.8s',
              }}
            />

            {/* Contact */}
            <div
              className="about-reveal"
              style={{ marginBottom: 8, animationDelay: '0.85s' }}
            >
              <p style={{
                fontFamily: 'var(--sans)',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: t.sectionLabel,
                marginBottom: 4,
              }}>
                Questions?
              </p>
              <p style={{
                fontFamily: 'var(--sans)',
                fontSize: 15,
                fontWeight: 700,
                color: t.contactName,
                marginBottom: 1,
              }}>
                Aaron Phelps
              </p>
              <p style={{
                fontFamily: 'var(--sans)',
                fontSize: 11,
                color: t.contactTitle,
                marginBottom: 8,
              }}>
                Marketing &amp; Technology Director
              </p>
              <a
                href="https://linkedin.com/in/aaroncphelps"
                target="_blank"
                rel="noopener noreferrer"
                className="about-link"
                style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 700 }}
              >
                /in/aaroncphelps &#x2197;
              </a>
            </div>

            {/* Copyright */}
            <p
              className="about-reveal"
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 9,
                color: t.copyright,
                marginTop: 28,
                animationDelay: '0.95s',
              }}
            >
              &copy; 2026 NorCal SBDC
            </p>
          </>
        )}
      </div>
    </>
  );
}

/* ── ADVISOR AI — per-character stagger ── */

type Tokens = typeof darkPalette;

function AdvisorTitle({ tokens }: { tokens: Tokens }) {
  const word1 = 'ADVISOR';
  const word2 = 'AI';

  return (
    <h2
      style={{ fontFamily: 'var(--display)', fontWeight: 100, lineHeight: 1.05 }}
      aria-label="Advisor AI"
    >
      {/* ADVISOR */}
      <span className="block" style={{ fontSize: 36, letterSpacing: '0.05em' }}>
        {word1.split('').map((char, i) => (
          <span
            key={i}
            className="inline-block"
            style={{
              color: tokens.advisorText,
              opacity: 0,
              animation: `aboutCharIn 0.3s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.03}s both`,
            }}
          >
            {char}
          </span>
        ))}
      </span>
      {/* AI — accent */}
      <span className="block" style={{ fontSize: 36, letterSpacing: '0.05em' }}>
        {word2.split('').map((char, i) => (
          <span
            key={i}
            className="inline-block"
            style={{
              color: tokens.aiText,
              opacity: 0,
              animation: `aboutCharIn 0.3s cubic-bezier(0.16,1,0.3,1) ${0.2 + (word1.length + i) * 0.03}s both`,
            }}
          >
            {char}
          </span>
        ))}
      </span>
    </h2>
  );
}
