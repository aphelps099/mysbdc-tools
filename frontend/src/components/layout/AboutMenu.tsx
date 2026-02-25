'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface AboutMenuProps {
  open: boolean;
  onClose: () => void;
}

const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

export default function AboutMenu({ open, onClose }: AboutMenuProps) {
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 250);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, handleClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] ${closing ? 'about-exit' : 'about-enter'}`}
      style={{
        background: 'linear-gradient(160deg, #0a1220 0%, #0f1c2e 50%, #142844 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Grain */}
      <div className="about-grain absolute inset-0 pointer-events-none" />

      {/* Close button */}
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 md:top-8 md:right-8 z-10 group flex items-center gap-3 cursor-pointer"
        aria-label="Close menu"
      >
        <span
          className="text-[11px] font-medium tracking-[0.06em] uppercase text-white/50 group-hover:text-white/80 transition-colors duration-200"
          style={{ fontFamily: 'var(--sans)' }}
        >
          close
        </span>
        <div className="relative w-9 h-9 flex items-center justify-center">
          <span className="block absolute w-[22px] h-[2px] rounded-full bg-white/75 rotate-45 group-hover:bg-[var(--pool)] transition-colors duration-200" />
          <span className="block absolute w-[22px] h-[2px] rounded-full bg-white/75 -rotate-45 group-hover:bg-[var(--pool)] transition-colors duration-200" />
        </div>
      </button>

      {/* Content — left-aligned; top-aligned on mobile, centered on desktop */}
      <div className="h-full flex items-start md:items-center overflow-y-auto">
        <div
          className={`w-full max-w-[520px] ml-[4vw] md:ml-[12vw] lg:ml-[16vw] px-3 md:px-6 py-8 md:py-0 ${
            closing ? 'about-snap-exit' : 'about-snap-enter'
          }`}
        >
          {/* Logo — clip-path reveal */}
          <div
            className="mb-2 md:mb-4"
            style={{ clipPath: 'inset(0 100% 0 0)', animation: `aboutLogoReveal 0.45s ${ease} 0.15s both` }}
          >
            <Image
              src="/sbdc-white-2026.png"
              alt="NorCal SBDC"
              width={120}
              height={33}
              className="opacity-90"
              priority
            />
          </div>

          {/* ADVISOR AI — per-character stagger */}
          <div className="mb-3 md:mb-5">
            <AdvisorTitle />
          </div>

          {/* Blurb */}
          <p
            className="text-white/60 text-[14px] md:text-[15px] leading-[1.7] font-light mb-4 md:mb-7 max-w-[380px]"
            style={{ fontFamily: 'var(--sans)', opacity: 0, animation: `aboutFadeIn 0.4s ${ease} 0.6s both` }}
          >
            AI-powered advisory platform for small business owners
            across Northern California. Curated prompts, strategic
            guidance, and instant answers — powered by the NorCal SBDC.
          </p>

          {/* Thin rule */}
          <div
            className="w-8 h-[1px] bg-white/10 mb-3 md:mb-6"
            style={{ opacity: 0, animation: `aboutFadeIn 0.3s ${ease} 0.65s both` }}
          />

          {/* Links */}
          <nav
            className="mb-4 md:mb-7 flex flex-col gap-3 md:gap-5"
            style={{ opacity: 0, animation: `aboutFadeIn 0.4s ${ease} 0.7s both` }}
          >
            <div>
              <p
                className="text-white/30 text-[10px] md:text-[11px] font-medium tracking-[0.06em] uppercase mb-1 md:mb-2"
                style={{ fontFamily: 'var(--sans)' }}
              >
                Visit our network website
              </p>
              <a
                href="https://www.norcalsbdc.org"
                target="_blank"
                rel="noopener noreferrer"
                className="about-link-item text-white/90 text-[15px] md:text-[16px] font-light"
                style={{ fontFamily: 'var(--sans)' }}
              >
                norcalsbdc.org
              </a>
            </div>

            <div>
              <p
                className="text-white/30 text-[10px] md:text-[11px] font-medium tracking-[0.06em] uppercase mb-1 md:mb-2"
                style={{ fontFamily: 'var(--sans)' }}
              >
                NorCal AI Strategy
              </p>
              <a
                href="https://sbdc-ai-production.up.railway.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="about-link-item text-white/90 text-[15px] md:text-[16px] font-light"
                style={{ fontFamily: 'var(--sans)' }}
              >
                Prompt House
              </a>
              <p
                className="text-white/25 text-[12px] font-light mt-1"
                style={{ fontFamily: 'var(--sans)' }}
              >
                Password protected &middot; sbdc2026
              </p>
            </div>
          </nav>

          {/* Thin rule */}
          <div
            className="w-8 h-[1px] bg-white/10 mb-3 md:mb-6"
            style={{ opacity: 0, animation: `aboutFadeIn 0.3s ${ease} 0.75s both` }}
          />

          {/* Contact */}
          <div
            className="mb-4 md:mb-7"
            style={{ opacity: 0, animation: `aboutFadeIn 0.4s ${ease} 0.8s both` }}
          >
            <p
              className="text-white/30 text-[10px] md:text-[11px] font-medium tracking-[0.06em] uppercase mb-1 md:mb-2"
              style={{ fontFamily: 'var(--sans)' }}
            >
              Questions?
            </p>
            <p
              className="text-white/80 text-[14px] md:text-[16px] font-light"
              style={{ fontFamily: 'var(--sans)' }}
            >
              Aaron Phelps
            </p>
            <p
              className="text-white/40 text-[13px] md:text-[14px] font-light"
              style={{ fontFamily: 'var(--sans)' }}
            >
              Marketing &amp; Technology Director
            </p>
            <a
              href="https://linkedin.com/in/aaroncphelps"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link-item inline-flex items-center gap-2 mt-2 text-white/50 hover:text-[var(--pool)] transition-colors duration-200"
            >
              <svg
                className="w-[13px] h-[13px]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span
                className="text-[13px] md:text-[14px] font-light"
                style={{ fontFamily: 'var(--sans)' }}
              >
                /in/aaroncphelps
              </span>
            </a>
          </div>

          {/* Copyright */}
          <p
            className="text-white/15 text-[11px] font-medium tracking-[0.04em]"
            style={{ fontFamily: 'var(--sans)', opacity: 0, animation: `aboutFadeIn 0.3s ${ease} 0.9s both` }}
          >
            &copy; 2026 NorCal SBDC
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── ADVISOR AI — per-character stagger animation ── */

function AdvisorTitle() {
  const text = 'ADVISOR AI';
  return (
    <h2
      className="text-[16px] md:text-[18px] font-bold tracking-[0.14em] uppercase"
      style={{ fontFamily: 'var(--display)', color: 'rgba(255,255,255,0.8)' }}
      aria-label={text}
    >
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            opacity: 0,
            animation: `aboutCharIn 0.3s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.035}s both`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h2>
  );
}
