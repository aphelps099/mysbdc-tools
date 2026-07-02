import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {z} from 'zod';
import {zColor} from '@remotion/zod-types';
import {COLORS, FONTS, contrastOn} from './brand';

export const teaserSchema = z.object({
  eyebrow: z.string(),
  hook: z.string(),
  title: z.string(),
  date: z.string(),
  time: z.string(),
  location: z.string(),
  speakers: z.array(z.object({name: z.string(), role: z.string()})),
  bullets: z.array(z.string()).min(2).max(4),
  cta: z.string(),
  url: z.string(),
  accent: zColor(),
});

export type TeaserProps = z.infer<typeof teaserSchema>;

export const TEASER_DEFAULTS: TeaserProps = {
  eyebrow: 'Free webinar',
  hook: 'Is your business ready for funding?',
  title: 'Capital Readiness: What Lenders Look For',
  date: 'Thu, July 24',
  time: '12:00–1:00 PM PT',
  location: 'Live on Zoom',
  speakers: [{name: 'Jane Rivera', role: 'SBDC Capital Advisor'}],
  bullets: [
    'The 5 numbers every lender checks first',
    'How to package an SBA loan application',
    'Red flags that stall funding — and fixes',
  ],
  cta: 'Register free',
  url: 'norcalsbdc.org/events',
  accent: COLORS.pool,
};

// Scene boundaries (30 fps, 450 frames = 15 s total)
const HOOK_END = 80;
const TITLE_END = 220;
const LEARN_END = 330;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Gently shrink type when copy runs longer than the comfortable char count
const fitText = (text: string, base: number, comfortable: number) =>
  base * Math.sqrt(Math.min(1, comfortable / Math.max(text.length, 1)));

// Fade+rise entrance for a scene's content; fades out before scene end
const useScene = (localFrame: number, duration: number) => {
  const {fps} = useVideoConfig();
  const enter = spring({frame: localFrame, fps, config: {damping: 200}});
  const exit = interpolate(localFrame, [duration - 12, duration - 2], [1, 0], clamp);
  const drift = interpolate(localFrame, [0, duration], [1, 1.03]);
  return {
    opacity: enter * exit,
    transform: `translateY(${(1 - enter) * 40}px) scale(${drift})`,
  };
};

const Eyebrow: React.FC<{children: React.ReactNode; s: number; color: string}> = ({
  children,
  s,
  color,
}) => (
  <div
    style={{
      fontFamily: FONTS.mono,
      fontSize: 30 * s,
      letterSpacing: '0.35em',
      textTransform: 'uppercase',
      color,
      marginBottom: 36 * s,
    }}
  >
    {children}
  </div>
);

const Hook: React.FC<{p: TeaserProps; s: number}> = ({p, s}) => {
  const frame = useCurrentFrame();
  const style = useScene(frame, HOOK_END);
  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: 90 * s, ...style}}>
      <Eyebrow s={s} color={p.accent}>
        {p.eyebrow}
      </Eyebrow>
      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 900,
          fontSize: fitText(p.hook, 92, 42) * s,
          lineHeight: 1.08,
          color: COLORS.cream,
          textTransform: 'uppercase',
        }}
      >
        {p.hook}
      </div>
    </AbsoluteFill>
  );
};

const TitleScene: React.FC<{p: TeaserProps; s: number}> = ({p, s}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const style = useScene(frame, TITLE_END - HOOK_END);
  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: 90 * s, ...style}}>
      <div
        style={{
          fontFamily: FONTS.serif,
          fontWeight: 500,
          fontSize: fitText(p.title, 84, 48) * s,
          lineHeight: 1.12,
          color: COLORS.cream,
          marginBottom: 56 * s,
        }}
      >
        {p.title}
      </div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 20 * s, marginBottom: 48 * s}}>
        {[p.date, p.time, p.location].filter(Boolean).map((chip, i) => {
          const pop = spring({frame: frame - 12 - i * 6, fps, config: {damping: 200}});
          return (
            <div
              key={chip}
              style={{
                fontFamily: FONTS.mono,
                fontSize: 30 * s,
                color: contrastOn(p.accent),
                background: p.accent,
                padding: `${14 * s}px ${28 * s}px`,
                borderRadius: 999,
                opacity: pop,
                transform: `translateY(${(1 - pop) * 24}px)`,
              }}
            >
              {chip}
            </div>
          );
        })}
      </div>
      {p.speakers.map((sp) => (
        <div key={sp.name} style={{fontFamily: FONTS.sans, fontSize: 34 * s, color: COLORS.cream}}>
          <span style={{fontWeight: 700}}>with {sp.name}</span>
          <span style={{opacity: 0.7}}> · {sp.role}</span>
        </div>
      ))}
    </AbsoluteFill>
  );
};

const LearnScene: React.FC<{p: TeaserProps; s: number}> = ({p, s}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const style = useScene(frame, LEARN_END - TITLE_END);
  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: 90 * s, ...style}}>
      <Eyebrow s={s} color={p.accent}>
        You&apos;ll walk away with
      </Eyebrow>
      {p.bullets.map((b, i) => {
        const enter = spring({frame: frame - 8 - i * 9, fps, config: {damping: 200}});
        return (
          <div
            key={b}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 30 * s,
              marginBottom: 40 * s,
              opacity: enter,
              transform: `translateX(${(1 - enter) * 60}px)`,
            }}
          >
            <div style={{width: 14 * s, height: 60 * s, background: p.accent, borderRadius: 7 * s, flexShrink: 0}} />
            <div style={{fontFamily: FONTS.sans, fontWeight: 500, fontSize: 44 * s, lineHeight: 1.25, color: COLORS.cream}}>
              {b}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const CtaScene: React.FC<{p: TeaserProps; s: number}> = ({p, s}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 200}});
  const pulse = 1 + Math.sin((frame / fps) * Math.PI * 1.5) * 0.02;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: 90 * s, textAlign: 'center'}}>
      <Img src={staticFile('sbdc-white-2026.png')} style={{width: 360 * s, opacity: enter, marginBottom: 70 * s}} />
      <div
        style={{
          fontFamily: FONTS.display,
          fontWeight: 900,
          fontSize: 64 * s,
          textTransform: 'uppercase',
          color: contrastOn(p.accent),
          background: p.accent,
          padding: `${30 * s}px ${70 * s}px`,
          borderRadius: 999,
          opacity: enter,
          transform: `scale(${enter * pulse})`,
          marginBottom: 50 * s,
        }}
      >
        {p.cta}
      </div>
      <div style={{fontFamily: FONTS.mono, fontSize: 32 * s, color: COLORS.cream, opacity: enter * 0.85}}>
        {p.url}
      </div>
    </AbsoluteFill>
  );
};

export const WebinarTeaser: React.FC<TeaserProps> = (p) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const s = Math.min(width, height) / 1080; // scale factor vs 1080 base

  const progress = interpolate(frame, [0, durationInFrames], [0, 1]);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.navy}}>
      {/* Decorative drifting accents */}
      <div
        style={{
          position: 'absolute',
          width: 900 * s,
          height: 900 * s,
          borderRadius: '50%',
          border: `${3 * s}px solid ${COLORS.pool}`,
          opacity: 0.14,
          top: -300 * s + frame * 0.25 * s,
          right: -350 * s,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 500 * s,
          height: 500 * s,
          borderRadius: '50%',
          border: `${3 * s}px solid ${COLORS.brick}`,
          opacity: 0.18,
          bottom: -220 * s,
          left: -180 * s - frame * 0.15 * s,
        }}
      />

      <Sequence durationInFrames={HOOK_END}>
        <Hook p={p} s={s} />
      </Sequence>
      <Sequence from={HOOK_END} durationInFrames={TITLE_END - HOOK_END}>
        <TitleScene p={p} s={s} />
      </Sequence>
      <Sequence from={TITLE_END} durationInFrames={LEARN_END - TITLE_END}>
        <LearnScene p={p} s={s} />
      </Sequence>
      <Sequence from={LEARN_END}>
        <CtaScene p={p} s={s} />
      </Sequence>

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 10 * s,
          width: `${progress * 100}%`,
          background: p.accent,
        }}
      />
    </AbsoluteFill>
  );
};
