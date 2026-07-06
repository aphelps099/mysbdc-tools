/**
 * Motion Scenes — prompt builder.
 * Turns a video script or timestamped transcript into a scene plan
 * for Motion Studio Pro (/motion/pro). The model acts as a motion
 * graphics designer: it storyboards the video beat by beat and
 * returns structured scenes the editor can load directly.
 */

import { SBDC_CONTEXT } from './index';
import type { ClaudeRequestOptions } from '../claude';

// ── Types ──

export interface MotionScenesInput {
  /** The script, talking points, or SRT-style transcript. */
  script: string;
  /** Optional creative direction ("punchy and energetic", "calm and minimal"…). */
  notes?: string;
  /** Canvas aspect, e.g. "16:9". Affects pacing/line-length advice only. */
  aspect?: string;
  /** Program/brand name to reference in copy (defaults to NorCal SBDC). */
  brandName?: string;
  /** Cap on generated scenes. */
  maxScenes?: number;
}

export interface GeneratedScene {
  template: 'title' | 'statement' | 'stat' | 'list' | 'quote' | 'image' | 'endcard';
  kicker?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  attribution?: string;
  statPrefix?: string;
  statValue?: number;
  statSuffix?: string;
  anim?: string;
  align?: string;
  scheme?: string;
  serifTitle?: boolean;
  durationMs?: number;
}

export interface MotionScenesOutput {
  scenes: GeneratedScene[];
}

// ── Prompt builder ──

const DESIGNER_CONTEXT = `You are also an expert motion graphics designer. You storyboard
short promotional and B-roll videos as a sequence of minimalist, text-forward scenes in the
style of modern kinetic typography: one idea per scene, few words, strong hierarchy, generous
negative space. Copy should be punchy — scenes are read in 2–5 seconds, not paragraphs.`;

export function buildMotionScenesPrompt(
  input: MotionScenesInput,
): Pick<ClaudeRequestOptions, 'system' | 'prompt' | 'maxTokens' | 'temperature'> {
  const {
    script,
    notes = '',
    aspect = '16:9',
    brandName = 'NorCal SBDC',
    maxScenes = 12,
  } = input;

  return {
    system: `${SBDC_CONTEXT}\n\n${DESIGNER_CONTEXT}`,
    maxTokens: 4000,
    temperature: 0.6,
    prompt: `Storyboard a motion graphics video from the script below for ${brandName}.

SCENE TEMPLATES (choose per beat):
- "title": kicker (short uppercase label) + title (headline) + subtitle (one supporting line). Use for openers and section intros.
- "statement": title only — one bold line, the star of the frame. Use for key claims and emphasis.
- "stat": statPrefix + statValue (number only) + statSuffix, with attribution as the label line (e.g. statPrefix "$", statValue 474, statSuffix "M", attribution "in capital accessed"). Use whenever the script cites a number.
- "list": kicker + body, where body is 2–4 short lines separated by \\n. Use for agendas, steps, or feature runs.
- "quote": title is the quote text (no surrounding quote marks) + attribution. Use for testimonials.
- "image": kicker + title + subtitle over a photo the editor will supply. Use sparingly, when a beat clearly calls for imagery.
- "endcard": kicker (call to action label), title (URL or CTA), subtitle (fine print). Always end the video with one.

ANIMATION PRESETS (field "anim"): "rise", "word-stagger", "letter-cascade", "typewriter", "wipe", "blur-in", "scale-in", "mask-reveal". Vary them with intent — e.g. typewriter for playful beats, mask-reveal for dramatic ones, rise for supporting copy.

OTHER FIELDS:
- "align": "center", "lower-left", or "lower-center"
- "scheme": one of "navy", "cream", "royal", "dark", "white" — vary for rhythm, keep it cohesive
- "serifTitle": true for elegant/editorial beats, false for punchy ones
- "durationMs": 2000–8000 per scene. If the transcript has timestamps, align scene durations to the beats they cover so the graphics track the voiceover; otherwise pace by reading time (roughly 1s per 2 words plus 1.5s).

RULES:
- ${maxScenes} scenes maximum; fewer is better than crowded.
- Do NOT transcribe the script verbatim — distill each beat to the fewest words that land the point. Voiceover words should only appear on screen to emphasize key moments.
- Numbers in the script become "stat" scenes.
- Canvas is ${aspect}.
${notes ? `\nCREATIVE DIRECTION FROM THE EDITOR:\n${notes}\n` : ''}
SCRIPT / TRANSCRIPT:
${script}

Respond with ONLY valid JSON, no commentary:
{"scenes": [{"template": "...", ...}, ...]}`,
  };
}
