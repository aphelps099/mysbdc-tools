/* Card renderer harness — bundled to dist/render-harness.html.
   Given a brand-token JSON (EVENT-PROMO-SYSTEM.md §1), renders the
   sample card set through the REAL engine and returns PNG data URLs.
   Driven headlessly by render-cards.mjs; exposes window.__cards. */

import {
  MotionDoc, Scene, AssetMap, ImageAsset, CustomScheme,
  makeScene,
} from '../../src/lib/motion/types';
import { exportPng } from '../../src/lib/motion/export';
import { ensureFontsReady } from '../../src/lib/motion/fonts';

interface Brand {
  name: string;
  headingFont: string;
  bodyFont: string;
  dark: CustomScheme;
  light: CustomScheme;
  rule: string;
  logoLight?: string;
  logoDark?: string;
  eventUrlExample?: string;
}

async function loadFont(family: string): Promise<void> {
  if (!family.trim()) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=' +
    encodeURIComponent(family).replace(/%20/g, '+') +
    ':ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap';
  document.head.appendChild(link);
  await new Promise((r) => { link.onload = r; link.onerror = r; setTimeout(r, 4000); });
  await ensureFontsReady([family]);
}

function loadLogo(id: string, url: string): Promise<ImageAsset | null> {
  return new Promise((res) => {
    if (!url) { res(null); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res({ id, name: id, url, img });
    img.onerror = () => res(null); // missing logo just skips the mark
    img.src = url;
  });
}

/** The demo card set — one scene per card family, brand-token driven. */
function cardSet(b: Brand): { id: string; scene: Scene }[] {
  const url = b.eventUrlExample || 'yoursite.org/events';
  const mk = (overrides: Partial<Scene>): Scene =>
    makeScene(overrides.template ?? 'title', { anim: 'rise', ...overrides });
  return [
    { id: 'statement-hook', scene: mk({
      template: 'statement', customScheme: b.dark, serifTitle: true, anim: 'mask-reveal',
      title: 'Sell to state and local agencies',
    }) },
    { id: 'save-the-date-dark', scene: mk({
      template: 'calendar', customScheme: b.dark, align: 'lower-left',
      kicker: 'YOUR CENTER · FREE TRAINING', title: 'Procurement summit',
      subtitle: 'Thursday · 10:00 AM–4:00 PM · In person',
      statValue: 23, statSuffix: 'JUL', accentRule: b.rule, attribution: url,
    }) },
    { id: 'save-the-date-light', scene: mk({
      template: 'calendar', customScheme: b.light,
      kicker: 'YOUR CENTER · FREE TRAINING', title: 'Marketing bootcamp',
      subtitle: 'Monday · 10:00 AM–12:00 PM · Online',
      statValue: 12, statSuffix: 'AUG', accentRule: b.rule, attribution: url,
    }) },
    { id: 'title-card', scene: mk({
      template: 'title', customScheme: b.dark,
      kicker: 'THIS MONTH | FREE TRAININGS', title: 'Free trainings for your business',
      subtitle: 'Three live sessions this month', attribution: url, accentRule: b.rule,
    }) },
    { id: 'agenda', scene: mk({
      template: 'list', customScheme: b.dark, align: 'lower-left',
      kicker: 'THIS MONTH | FREE TRAININGS', title: 'Upcoming free trainings',
      body: '23 Jul | Procurement summit | Thu · 10:00 AM · In person\n12 Aug | Marketing bootcamp | Mon · 10:00 AM · Online\n26 Aug | Access to capital | Wed · 1:00 PM · Online',
      subtitle: 'Free · Register early', attribution: url, accentRule: b.rule, duration: 5000,
    }) },
    { id: 'endcard', scene: mk({
      template: 'endcard', customScheme: b.dark, backdrop: 'dot-grid',
      kicker: 'REGISTER TODAY', title: url,
      attribution: 'Confidential business advising. No fee.',
      subtitle: 'Funded in part through a cooperative agreement with the U.S. SBA.',
      accentRule: b.rule,
    }) },
  ];
}

async function render(brand: Brand): Promise<{ id: string; dataUrl: string }[]> {
  await Promise.all([loadFont(brand.headingFont), loadFont(brand.bodyFont)]);

  const assets: AssetMap = {};
  const light = await loadLogo('__logo-brand-light', brand.logoLight ?? '');
  const dark = await loadLogo('__logo-brand-dark', brand.logoDark ?? '');
  if (light) assets['__logo-brand-light'] = light;
  if (dark) assets['__logo-brand-dark'] = dark;
  if (light && !dark) assets['__logo-brand-dark'] = { ...light, id: '__logo-brand-dark' };
  if (dark && !light) assets['__logo-brand-light'] = { ...dark, id: '__logo-brand-light' };

  const out: { id: string; dataUrl: string }[] = [];
  for (const { id, scene } of cardSet(brand)) {
    const doc: MotionDoc = {
      aspect: '1:1', fps: 30, sceneStyle: 'editorial',
      scenes: [scene],
      fontHeading: brand.headingFont, fontBody: brand.bodyFont,
      watermark: '', showGrain: true,
      audioId: null, audioVolume: 0.8, audioFadeIn: 0, audioFadeOut: 0, duckLevel: 0.3,
    };
    // 75% through the scene = animation settled, same as studio previews.
    const blob = await exportPng(doc, assets, scene.duration * 0.75, {});
    const dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = () => rej(new Error('read failed'));
      r.readAsDataURL(blob);
    });
    out.push({ id, dataUrl });
  }
  return out;
}

(window as never as { __cards: unknown }).__cards = { render };
