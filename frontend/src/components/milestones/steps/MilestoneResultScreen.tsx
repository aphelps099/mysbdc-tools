'use client';

import { useEffect, useRef } from 'react';
import type { MilestoneData, MilestoneResult } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  result: MilestoneResult;
  data: MilestoneData;
}

/* ── Confetti burst (pure canvas, no deps) ── */

const CONFETTI_COLORS = ['#16a34a', '#2456e3', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);

  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;

  interface Particle {
    x: number; y: number;
    vx: number; vy: number;
    w: number; h: number;
    color: string;
    rotation: number; spin: number;
    opacity: number;
  }

  const particles: Particle[] = [];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: W / 2 + (Math.random() - 0.5) * 40,
      y: H * 0.35,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 14 - 4,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 3,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 12,
      opacity: 1,
    });
  }

  let frame = 0;
  const maxFrames = 120;

  function tick() {
    if (frame > maxFrames) {
      ctx!.clearRect(0, 0, W, H);
      return;
    }
    ctx!.clearRect(0, 0, W, H);

    for (const p of particles) {
      p.x += p.vx;
      p.vy += 0.25;
      p.y += p.vy;
      p.rotation += p.spin;
      p.opacity = Math.max(0, 1 - frame / maxFrames);

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.globalAlpha = p.opacity;
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx!.restore();
    }

    frame++;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

export default function MilestoneResultScreen({ result, data }: Props) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (result.success && canvasRef.current) {
      launchConfetti(canvasRef.current);
    }
  }, [result.success]);

  const shareMoreUrl = data.contactId
    ? `/milestones?contact=${data.contactId}&first_name=${encodeURIComponent(data.firstName)}${data.program ? `&program=${data.program}` : ''}`
    : '/milestones';

  if (!result.success) {
    return (
      <div className="s641-result">
        <div className="s641-result-icon">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="26" stroke="#dc2626" strokeWidth="2"/>
            <path d="M28 18V32" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="28" cy="38" r="1.5" fill="#dc2626"/>
          </svg>
        </div>
        <h2 className="s641-result-title">{t('result.errorTitle')}</h2>
        <p className="s641-result-desc">{t('result.errorDesc')}</p>
        {result.error && (
          <div className="s641-result-error">
            {result.error}
          </div>
        )}
        <div style={{ marginTop: 24 }}>
          <a href={shareMoreUrl} className="s641-btn s641-btn-primary" style={{ textDecoration: 'none' }}>
            {t('result.tryAgain')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="s641-result" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Confetti canvas overlay */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div className="s641-result-icon">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="26" stroke="#16a34a" strokeWidth="2"/>
          <path d="M18 28L25 35L38 21" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <p style={{
        fontFamily: 'var(--era-text)',
        fontSize: 12,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
        fontWeight: 600,
        color: '#16a34a',
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {t('result.complete')}
      </p>

      <h2 className="s641-result-title">{t('result.thanks')}</h2>

      <p className="s641-result-desc">
        <strong>{t('result.shareMore')}</strong>{' '}
        {t('result.shareDesc')}
      </p>

      <div style={{ marginTop: 8 }}>
        <a
          href={shareMoreUrl}
          className="s641-btn s641-btn-primary"
          style={{ textDecoration: 'none' }}
        >
          {t('result.shareBtn')}
        </a>
      </div>
    </div>
  );
}
