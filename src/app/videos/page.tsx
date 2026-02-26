'use client';

import { useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';

/* ═══════════════════════════════════════════════════════
   /videos — SBDC Video Library
   Collection of all SBDC brand & training videos.
   ═══════════════════════════════════════════════════════ */

const featured = { id: 'NEUTodo7QU0', label: 'AI Masterclass' };

const videos = [
  { id: '94zN2ijDlD8' },
  { id: 'WcJOAKLsYPo' },
  { id: '5UIF4jBXutA' },
  { id: '5s8fBXxKaJc' },
  { id: 'c-pfUXkL_TU' },
  { id: 'yO9uhS7bfcI' },
  { id: 'cDSQ2C3kAXA' },
  { id: 'sEfJyYNaPm0' },
];

const olderVideos = [
  { id: 'bIVYCzbLmIc' },
  { id: 'zWgGYaOf_5k' },
  { id: 'lBA9wkQ-Wto' },
  { id: '9zXHPwsQoC0' },
  { id: 'taUTw5_vFSw' },
];

function VideoCard({ id }: { id: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg, 12px)',
        overflow: 'hidden',
        background: '#000',
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
      }}
    >
      <div style={{ position: 'relative', paddingTop: '56.25%' }}>
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              background: `url(https://img.youtube.com/vi/${id}/hqdefault.jpg) center/cover no-repeat`,
            }}
            aria-label="Play video"
          >
            {/* Play button overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.25)',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.40)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.25)'; }}
            >
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="32" fill="rgba(0,0,0,0.6)" />
                <path d="M26 20L46 32L26 44V20Z" fill="white" />
              </svg>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

export default function VideosPage() {
  return (
    <ThemeProvider>
      <div className="preview-theme" style={{ minHeight: '100dvh', background: 'var(--p-sand, #f0efeb)' }}>

        {/* Header */}
        <header
          className="shrink-0 flex items-center justify-between"
          style={{
            height: 48,
            padding: '0 24px',
            borderBottom: '1px solid var(--p-line, rgba(0,0,0,0.08))',
            background: 'var(--p-cream, #e8e7e3)',
          }}
        >
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-[10px] font-bold tracking-[0.1em] uppercase no-underline transition-colors duration-150"
              style={{ fontFamily: 'var(--sans)', color: 'var(--p-muted, #8a8a8a)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--p-ink, #0f1c2e)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--p-muted, #8a8a8a)'; }}
            >
              ← Back
            </a>
            <div className="w-px h-4" style={{ background: 'var(--p-line, rgba(0,0,0,0.1))' }} />
            <span
              className="text-[11px] font-bold tracking-[0.08em] uppercase"
              style={{ fontFamily: 'var(--sans)', color: 'var(--p-ink, #0f1c2e)' }}
            >
              Videos
            </span>
          </div>
          <span
            className="text-[9px] font-medium tracking-[0.08em] uppercase"
            style={{ fontFamily: 'var(--mono)', color: 'var(--p-muted, #8a8a8a)' }}
          >
            video library
          </span>
        </header>

        {/* Content */}
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 64px' }}>

          {/* Page heading */}
          <div style={{ marginBottom: 32 }}>
            <h1
              className="text-[28px] md:text-[36px] font-light tracking-tight"
              style={{ fontFamily: 'var(--serif, Tobias, Georgia, serif)', color: 'var(--p-ink, #0f1c2e)', margin: 0 }}
            >
              Video Library
            </h1>
            <p
              className="text-[13px] mt-2"
              style={{ fontFamily: 'var(--mono)', color: 'var(--p-muted, #8a8a8a)', margin: '8px 0 0' }}
            >
              SBDC brand & training videos
            </p>
          </div>

          {/* Featured video */}
          <section style={{ marginBottom: 48 }}>
            <p
              className="text-[10px] font-bold tracking-[0.12em] uppercase"
              style={{ fontFamily: 'var(--mono)', color: 'var(--royal, #1D5AA7)', margin: '0 0 12px' }}
            >
              Featured
            </p>
            <div style={{ maxWidth: 800 }}>
              <VideoCard id={featured.id} />
              <p
                className="text-[15px] font-medium mt-3"
                style={{ fontFamily: 'var(--sans)', color: 'var(--p-ink, #0f1c2e)', margin: '12px 0 0' }}
              >
                {featured.label}
              </p>
            </div>
          </section>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--p-line, rgba(0,0,0,0.08))', margin: '0 0 32px' }} />

          {/* Video grid */}
          <section>
            <p
              className="text-[10px] font-bold tracking-[0.12em] uppercase"
              style={{ fontFamily: 'var(--mono)', color: 'var(--p-muted, #8a8a8a)', margin: '0 0 16px' }}
            >
              All Videos
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))',
                gap: 24,
              }}
            >
              {videos.map((video) => (
                <VideoCard key={video.id} id={video.id} />
              ))}
            </div>
          </section>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--p-line, rgba(0,0,0,0.08))', margin: '48px 0 32px' }} />

          {/* Older videos */}
          <section>
            <p
              className="text-[10px] font-bold tracking-[0.12em] uppercase"
              style={{ fontFamily: 'var(--mono)', color: 'var(--p-muted, #8a8a8a)', margin: '0 0 16px' }}
            >
              Older Videos
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))',
                gap: 24,
              }}
            >
              {olderVideos.map((video) => (
                <VideoCard key={video.id} id={video.id} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </ThemeProvider>
  );
}
