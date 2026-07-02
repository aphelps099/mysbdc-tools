---
name: remotion-video
description: Create programmatic videos with Remotion (React-based video framework). Use when asked to make a video, animation, motion graphic, promo, intro, title sequence, explainer, social media clip, slideshow, or data-driven video — or to preview, edit, or render an existing Remotion composition. Triggers on "make a video", "create an animation", "video for social", "render video", "Remotion", "motion graphics".
user_invocable: true
---

# Remotion Video Creation

Remotion makes videos from React components: a composition is a component rendered
once per frame, and `useCurrentFrame()` tells you which frame you're on. Animation =
mapping the frame number to styles. Docs: https://remotion.dev/docs

## Step 1: Locate or scaffold the project

Remotion lives in its own subproject at **`videos/`** (own `package.json`, independent
of the Next.js app at repo root). If `videos/` already exists, work inside it and skip
scaffolding. Otherwise create these exact files (verified working with Remotion 4.0.x,
React 19, Node 22):

```bash
mkdir -p videos/src videos/public && cd videos
```

**`videos/package.json`**

```json
{
  "name": "videos",
  "private": true,
  "scripts": {
    "studio": "remotion studio",
    "render": "remotion render"
  }
}
```

```bash
npm install remotion @remotion/cli react react-dom @types/react zod @remotion/zod-types
```

**`videos/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

**`videos/remotion.config.ts`**

```ts
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
```

**`videos/src/index.ts`**

```ts
import {registerRoot} from 'remotion';
import {Root} from './Root';

registerRoot(Root);
```

**`videos/src/Root.tsx`** — every video must be registered here as a `<Composition>`:

```tsx
import {Composition} from 'remotion';
import {MyVideo, myVideoSchema} from './MyVideo';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myVideoSchema}
        defaultProps={{title: 'Hello'}}
      />
    </>
  );
};
```

Add `videos/node_modules` and `videos/out` to `.gitignore` if not covered.

### Canvas sizes

| Use | width × height |
|---|---|
| YouTube / landscape | 1920 × 1080 |
| Reels / TikTok / Shorts | 1080 × 1920 |
| Instagram square | 1080 × 1080 |

30 fps is the default choice. Dimensions must be even numbers (h264 requirement).

## Step 2: Write the composition

### Core API

```tsx
import {
  AbsoluteFill,   // full-canvas <div>, use as the root layer; stack several for layers
  Sequence,       // <Sequence from={60} durationInFrames={90}> — child appears at frame 60, its own frame count restarts at 0
  Series,         // <Series><Series.Sequence durationInFrames={40}>…</Series.Sequence>…</Series> — back-to-back scenes
  useCurrentFrame,
  useVideoConfig, // {fps, durationInFrames, width, height}
  interpolate,
  spring,
  Easing,
  staticFile,     // resolves files in videos/public/
  Img,            // instead of <img> — waits for load before capturing the frame
  Audio,          // instead of <audio>
  OffthreadVideo, // instead of <video> — reliable frame-accurate embedding
  random,         // deterministic random: random(`seed-${i}`)
} from 'remotion';
```

### Animation patterns

```tsx
const frame = useCurrentFrame();
const {fps, durationInFrames} = useVideoConfig();

// Linear map, always clamp unless you want values to keep growing:
const opacity = interpolate(frame, [0, 20], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});

// Natural motion — springs, great for entrances:
const scale = spring({frame, fps, config: {damping: 200}}); // 0 → 1, no overshoot
const pop = spring({frame: frame - 15, fps});                // starts at frame 15, bouncy

// Fade out at the end:
const fadeOut = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});

// Eased curve:
const x = interpolate(frame, [0, 60], [0, 500], {easing: Easing.out(Easing.cubic)});

// Staggered list items:
{items.map((item, i) => {
  const enter = spring({frame: frame - i * 5, fps, config: {damping: 200}});
  return <div key={i} style={{opacity: enter, transform: `translateY(${(1 - enter) * 40}px)`}}>{item}</div>;
})}
```

### Iron rules (violating these produces broken/flickering renders)

1. **All motion derives from `useCurrentFrame()`.** Never use CSS animations,
   CSS transitions, `requestAnimationFrame`, `setTimeout`, or state that changes
   over time — frames render out of order and in parallel, so only pure
   frame → style functions work.
2. **Never `Math.random()`** — every frame re-renders the component. Use
   `random('some-seed')` from remotion for stable pseudo-randomness.
3. **Use `<Img>`, `<Audio>`, `<OffthreadVideo>`** instead of raw `<img>/<audio>/<video>`
   tags, and load assets from `videos/public/` via `staticFile('logo.png')`.
   Remote URLs are fine too, passed straight to `src`.
4. **Register every composition in `Root.tsx`** or it won't exist to the CLI.
5. Fonts: `npm i @remotion/google-fonts` then
   `import {loadFont} from '@remotion/google-fonts/Inter'; const {fontFamily} = loadFont();`
   — don't link stylesheets.

### Parameterized videos

Define a zod schema + `defaultProps` (see Root.tsx above). Override at render time
with `--props='{"title":"Q3 Results"}'` or `--props=./data.json`. For duration/size
driven by data, pass `calculateMetadata` to the `<Composition>`.

### Scene transitions

For crossfades/wipes/slides between scenes: `npm i @remotion/transitions`, then use
`<TransitionSeries>` with `fade()`/`slide()`/`wipe()` and `springTiming()`/`linearTiming()`.

### Audio

`<Audio src={staticFile('music.mp3')} volume={0.5} />` — trim with
`startFrom`/`endAt` (frames), fade volume by passing a function
`volume={(f) => interpolate(f, [0, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}`.
For background music, sound effects, or AI voiceover, generate tracks with the
**elevenlabs-music** skill and drop the MP3s into `videos/public/`.

## Step 3: Preview and iterate

**Interactive (user's machine):** `cd videos && npx remotion studio` — opens a
scrubbing preview UI with a props editor.

**Headless (remote/Claude Code on the web):** you cannot open Studio, so iterate
by rendering stills at key frames and reading them:

```bash
cd videos && npx remotion still MyVideo out/f0.png --frame=0 $BROWSER_FLAG
```

Render the first frame, a mid-animation frame, and the final frame. View the PNGs,
fix layout/timing, repeat. Check: nothing overflowing the canvas, text readable at a
glance, first frame not empty, comfortable margins (~5% of canvas).

### Browser executable (remote environments)

Rendering needs Chrome Headless Shell. On a local machine Remotion downloads it
automatically — no flag needed. In sandboxed environments where that download is
blocked, point at a preinstalled binary. The plain `chromium` binary will fail with
"Old Headless mode has been removed" — it must be a *headless shell* build. In
Claude Code remote sessions:

```bash
BROWSER_FLAG="--browser-executable=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)"
```

Append `$BROWSER_FLAG` to every `remotion render` / `remotion still` command.

## Step 4: Render and deliver

```bash
cd videos
npx remotion render MyVideo out/my-video.mp4 $BROWSER_FLAG            # H.264 MP4 (default)
npx remotion render MyVideo out/clip.gif --codec=gif $BROWSER_FLAG    # GIF
npx remotion render MyVideo out/alpha.webm --codec=vp8 --image-format=png --pixel-format=yuva420p $BROWSER_FLAG  # transparent
npx remotion still MyVideo out/thumb.png --frame=75 $BROWSER_FLAG     # thumbnail
```

No system ffmpeg is required — Remotion bundles its own encoder. After rendering,
send the output file to the user. Before delivering, spot-check 2–3 stills from the
final render for glitches.
