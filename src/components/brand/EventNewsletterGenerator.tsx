'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import './brand.css';
import './email-templates.css';
import './event-newsletter-generator.css';

/* ═══════════════════════════════════════════════════════
   EventNewsletterGenerator — Build Constant Contact–ready
   HTML event newsletters with live preview + AI assist.
   ═══════════════════════════════════════════════════════ */

// ── Types ──

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  registrationUrl: string;
}

interface AiSuggestions {
  subjectLine: string;
  preheaderText: string;
  heroTeaser: string;
  eventDescriptions: { title: string; teaser: string }[];
  ctaText: string;
  closingLine: string;
}

type LayoutStyle = 'minimal' | 'bold' | 'classic';
type ToneOption = 'professional' | 'friendly' | 'energetic';

// ── Constants ──

const EMPTY_EVENT: Omit<EventItem, 'id'> = {
  title: '',
  date: '',
  time: '',
  location: 'Virtual (Zoom)',
  description: '',
  registrationUrl: '',
};

const LAYOUT_OPTIONS: { id: LayoutStyle; label: string; description: string }[] = [
  { id: 'minimal', label: 'Clean Minimal', description: 'Cream background, clean lines, events-focused' },
  { id: 'bold', label: 'Bold Navy', description: 'Dark masthead, stats strip, editorial feel' },
  { id: 'classic', label: 'Classic Card', description: 'White cards on light background, structured layout' },
];

const TONE_OPTIONS: { id: ToneOption; label: string }[] = [
  { id: 'professional', label: 'Professional' },
  { id: 'friendly', label: 'Friendly' },
  { id: 'energetic', label: 'Energetic' },
];

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

// ── CSV / Paste Parser ──

function parseEventsFromText(text: string): Omit<EventItem, 'id'>[] {
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];

  // Try to detect delimiter (tab or comma)
  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/["']/g, ''));

  // Map header names to our fields
  const fieldMap: Record<string, keyof Omit<EventItem, 'id'>> = {};
  headers.forEach((h, i) => {
    if (/title|name|event/i.test(h)) fieldMap[String(i)] = 'title';
    else if (/date/i.test(h)) fieldMap[String(i)] = 'date';
    else if (/time/i.test(h)) fieldMap[String(i)] = 'time';
    else if (/location|venue|where|format/i.test(h)) fieldMap[String(i)] = 'location';
    else if (/desc|about|summary/i.test(h)) fieldMap[String(i)] = 'description';
    else if (/url|link|register|registration/i.test(h)) fieldMap[String(i)] = 'registrationUrl';
  });

  return lines.slice(1).map((line) => {
    const cols = line.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
    const event: Record<string, string> = { ...EMPTY_EVENT };
    Object.entries(fieldMap).forEach(([idx, field]) => {
      if (cols[Number(idx)]) event[field] = cols[Number(idx)];
    });
    return event as Omit<EventItem, 'id'>;
  }).filter((e) => e.title);
}

// ── HTML Generator ──

function generateNewsletterHtml(
  events: EventItem[],
  layout: LayoutStyle,
  focusIndex: number,
  customizations: {
    subjectLine: string;
    preheaderText: string;
    heroTeaser: string;
    ctaText: string;
    closingLine: string;
    eventTeasers: Record<string, string>;
    headerDate: string;
  },
): string {
  const focusEvent = events[focusIndex] || events[0];
  const otherEvents = events.filter((_, i) => i !== focusIndex);

  const colors = {
    minimal: { bg: '#F5F2EB', card: '#FFFFFF', navy: '#0F1C2E', accent: '#C23A3A', pool: '#8FC5D9', slate: '#446580', fog: '#C8D5E3' },
    bold: { bg: '#FFFFFF', card: '#F5F5F5', navy: '#0F1C2E', accent: '#8A2432', pool: '#8FC5D9', slate: '#446580', fog: '#C8D5E3' },
    classic: { bg: '#F8F7F4', card: '#FFFFFF', navy: '#152445', accent: '#C23A3A', pool: '#8FC5D9', slate: '#5A6B7B', fog: '#E2E8F0' },
  }[layout];

  const headerMonth = customizations.headerDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Generate event rows
  const eventRows = otherEvents.map((evt) => {
    const teaser = customizations.eventTeasers[evt.id] || evt.description;
    return `
        <tr>
          <td style="padding: 20px 0; border-bottom: 1px solid ${colors.fog};">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="vertical-align: top; width: 60px;">
                  <div style="background: ${colors.navy}; text-align: center; padding: 10px 8px; min-width: 52px;">
                    <div style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ${colors.pool};">${formatMonth(evt.date)}</div>
                    <div style="font-size: 26px; font-weight: 900; color: #ffffff; line-height: 1; margin-top: 2px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">${formatDay(evt.date)}</div>
                  </div>
                </td>
                <td style="padding-left: 16px; vertical-align: top;">
                  <div style="font-size: 15px; font-weight: 700; color: ${colors.navy}; margin-bottom: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(evt.title)}</div>
                  <div style="font-size: 13px; color: ${colors.slate}; line-height: 1.5; margin-bottom: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(teaser)}</div>
                  <div style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 10px; color: #999; margin-bottom: 8px;">${escapeHtml(evt.time)} · ${escapeHtml(evt.location)} · Free</div>
                  ${evt.registrationUrl ? `<a href="${escapeHtml(evt.registrationUrl)}" style="font-size: 12px; font-weight: 600; color: ${colors.accent}; text-decoration: none;">Register →</a>` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
  }).join('\n');

  const heroTeaser = customizations.heroTeaser || focusEvent.description;
  const ctaText = customizations.ctaText || 'Register Now →';
  const closingLine = customizations.closingLine || 'Free expert advice. Real results. Let\u2019s build something.';

  if (layout === 'minimal') {
    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(customizations.subjectLine || 'Upcoming Events — NorCal SBDC')}</title>
  <!--[if mso]><style>table,td,div,p,a,span{font-family:Arial,sans-serif!important;}</style><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background: #E8E6E0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
  ${customizations.preheaderText ? `<div style="display:none;font-size:1px;color:#F5F2EB;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${escapeHtml(customizations.preheaderText)}</div>` : ''}

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background: #E8E6E0;">
    <tr><td align="center" style="padding: 24px 16px;">

      <!-- NEWSLETTER -->
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; width: 100%; background: ${colors.bg};">

        <!-- HEADER -->
        <tr>
          <td style="padding: 28px 40px; border-bottom: 1px solid ${colors.fog};">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="font-size: 15px; font-weight: 600; color: ${colors.navy}; letter-spacing: -0.01em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">NorCal SBDC</td>
                <td align="right" style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 11px; font-weight: 500; color: ${colors.slate};">${escapeHtml(headerMonth)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FEATURED EVENT -->
        <tr>
          <td style="padding: 36px 40px; border-bottom: 1px solid ${colors.fog};">
            <div style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${colors.accent}; margin-bottom: 16px;">Featured Event</div>
            <div style="font-size: 24px; font-weight: 600; color: ${colors.navy}; letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(focusEvent.title)}</div>
            <div style="font-size: 14px; color: ${colors.slate}; line-height: 1.6; margin-bottom: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(heroTeaser)}</div>
            <div style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 11px; color: ${colors.slate}; margin-bottom: 20px;">
              <span style="margin-right: 16px;">${escapeHtml(formatDateShort(focusEvent.date))}</span>
              <span style="margin-right: 16px;">${escapeHtml(focusEvent.time)}</span>
              <span style="margin-right: 16px;">${escapeHtml(focusEvent.location)}</span>
              <span>Free</span>
            </div>
            ${focusEvent.registrationUrl ? `<a href="${escapeHtml(focusEvent.registrationUrl)}" style="display: inline-block; background: ${colors.accent}; color: #ffffff; font-size: 13px; font-weight: 600; padding: 12px 24px; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(ctaText)}</a>` : `<span style="font-size: 14px; font-weight: 600; color: ${colors.accent}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(ctaText)}</span>`}
          </td>
        </tr>

        ${otherEvents.length > 0 ? `
        <!-- MORE EVENTS -->
        <tr>
          <td style="padding: 32px 40px; border-bottom: 1px solid ${colors.fog};">
            <div style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${colors.slate}; margin-bottom: 20px;">Upcoming Events</div>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              ${eventRows}
            </table>
          </td>
        </tr>` : ''}

        <!-- CTA -->
        <tr>
          <td style="padding: 36px 40px; text-align: center; border-bottom: 1px solid ${colors.fog};">
            <div style="font-size: 15px; color: ${colors.slate}; margin-bottom: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;"><strong style="color: ${colors.navy}; font-weight: 600;">$0 advice.</strong> $547M in client capital last year.</div>
            <div style="font-size: 13px; color: ${colors.slate}; margin-top: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(closingLine)}</div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding: 28px 40px; text-align: center;">
            <div style="font-size: 13px; font-weight: 500; color: ${colors.navy}; margin-bottom: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">NorCal SBDC</div>
            <div style="font-size: 12px; color: ${colors.slate}; margin-bottom: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">Your Business People</div>
            <div style="margin-bottom: 16px;">
              <a href="https://www.norcalsbdc.org/events" style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 10px; font-weight: 500; color: ${colors.slate}; text-decoration: none; margin: 0 12px;">Events</a>
              <a href="https://www.norcalsbdc.org" style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 10px; font-weight: 500; color: ${colors.slate}; text-decoration: none; margin: 0 12px;">Resources</a>
              <a href="https://www.norcalsbdc.org/contact" style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 10px; font-weight: 500; color: ${colors.slate}; text-decoration: none; margin: 0 12px;">Contact</a>
            </div>
            <div style="font-size: 11px; color: ${colors.slate}; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              Funded in part through a Cooperative Agreement with the U.S. Small Business Administration.<br>
              All opinions, conclusions, or recommendations expressed are those of the author(s) and do not necessarily reflect the views of the SBA.<br><br>
              NorCal SBDC Network · Serving 36 counties across Northern California<br>
              <a href="#" style="color: ${colors.slate};">Unsubscribe</a> · <a href="#" style="color: ${colors.slate};">Update preferences</a> · <a href="#" style="color: ${colors.slate};">View in browser</a>
            </div>
          </td>
        </tr>

      </table>

    </td></tr>
  </table>
</body>
</html>`;
  }

  if (layout === 'bold') {
    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(customizations.subjectLine || 'Upcoming Events — NorCal SBDC')}</title>
  <!--[if mso]><style>table,td,div,p,a,span{font-family:Arial,sans-serif!important;}</style><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background: #1a1a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
  ${customizations.preheaderText ? `<div style="display:none;font-size:1px;color:#1a1a1a;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${escapeHtml(customizations.preheaderText)}</div>` : ''}

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background: #1a1a1a;">
    <tr><td align="center" style="padding: 24px 16px;">

      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; width: 100%; background: ${colors.bg};">

        <!-- MASTHEAD -->
        <tr>
          <td style="background: ${colors.navy}; padding: 28px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td>
                  <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">NorCal SBDC</div>
                  <div style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 9px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: ${colors.pool}; margin-top: 4px;">Events & Trainings</div>
                </td>
                <td align="right">
                  <div style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${colors.pool};">${escapeHtml(headerMonth)}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- STATS STRIP -->
        <tr>
          <td style="background: #F5F2EB; padding: 20px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td align="center" style="font-size: 22px; font-weight: 900; color: ${colors.navy}; letter-spacing: -0.02em; line-height: 1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">$547M<br><span style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 8px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${colors.navy}; opacity: 0.5;">Capital</span></td>
                <td align="center" style="font-size: 22px; font-weight: 900; color: ${colors.navy}; letter-spacing: -0.02em; line-height: 1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">12,400<br><span style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 8px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${colors.navy}; opacity: 0.5;">Businesses/Yr</span></td>
                <td align="center" style="font-size: 22px; font-weight: 900; color: ${colors.navy}; letter-spacing: -0.02em; line-height: 1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">300+<br><span style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 8px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${colors.navy}; opacity: 0.5;">Advisors</span></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FEATURED -->
        <tr>
          <td style="padding: 40px; border-bottom: 1px solid #eee;">
            <div style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: ${colors.accent}; margin-bottom: 12px;">Featured Event</div>
            <div style="font-size: 28px; font-weight: 800; color: ${colors.navy}; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(focusEvent.title)}</div>
            <div style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(heroTeaser)}</div>
            <div style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 11px; color: ${colors.slate}; margin-bottom: 20px;">
              ${escapeHtml(formatDateShort(focusEvent.date))} · ${escapeHtml(focusEvent.time)} · ${escapeHtml(focusEvent.location)} · Free
            </div>
            ${focusEvent.registrationUrl ? `<a href="${escapeHtml(focusEvent.registrationUrl)}" style="display: inline-block; background: ${colors.navy}; color: #ffffff; font-size: 13px; font-weight: 700; padding: 14px 28px; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(ctaText)}</a>` : `<span style="font-size: 14px; font-weight: 700; color: ${colors.navy}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(ctaText)}</span>`}
          </td>
        </tr>

        ${otherEvents.length > 0 ? `
        <!-- EVENTS -->
        <tr>
          <td style="background: ${colors.card}; padding: 32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="padding-bottom: 12px; margin-bottom: 20px; border-bottom: 2px solid ${colors.navy};">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="font-size: 14px; font-weight: 800; color: ${colors.navy}; letter-spacing: 0.02em; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">Upcoming Events</td>
                      <td align="right" style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 10px; font-weight: 500; color: #999;">${otherEvents.length} event${otherEvents.length !== 1 ? 's' : ''}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${eventRows}
            </table>
          </td>
        </tr>` : ''}

        <!-- CLOSING CTA -->
        <tr>
          <td style="background: ${colors.navy}; padding: 36px 40px; text-align: center;">
            <div style="font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">$0 advice. Real results.</div>
            <div style="font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(closingLine)}</div>
            <a href="https://www.norcalsbdc.org/events" style="display: inline-block; background: #ffffff; color: ${colors.navy}; font-size: 13px; font-weight: 700; padding: 12px 24px; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">Browse All Events →</a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding: 28px 40px; text-align: center; background: ${colors.bg};">
            <div style="font-size: 13px; font-weight: 500; color: ${colors.navy}; margin-bottom: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">NorCal SBDC</div>
            <div style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 9px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: ${colors.pool}; margin-bottom: 16px;">Your Business People</div>
            <div style="margin-bottom: 16px;">
              <a href="https://www.norcalsbdc.org/events" style="font-size: 13px; color: ${colors.slate}; text-decoration: none; margin: 0 12px;">Events</a>
              <a href="https://www.norcalsbdc.org" style="font-size: 13px; color: ${colors.slate}; text-decoration: none; margin: 0 12px;">Resources</a>
              <a href="https://www.norcalsbdc.org/contact" style="font-size: 13px; color: ${colors.slate}; text-decoration: none; margin: 0 12px;">Contact</a>
            </div>
            <div style="font-size: 11px; color: rgba(0,0,0,0.4); line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              Funded in part through a Cooperative Agreement with the U.S. Small Business Administration.<br>
              All opinions, conclusions, or recommendations expressed are those of the author(s) and do not necessarily reflect the views of the SBA.<br><br>
              NorCal SBDC Network · Serving 36 counties across Northern California<br>
              <a href="#" style="color: rgba(0,0,0,0.4);">Unsubscribe</a> · <a href="#" style="color: rgba(0,0,0,0.4);">Update preferences</a> · <a href="#" style="color: rgba(0,0,0,0.4);">View in browser</a>
            </div>
          </td>
        </tr>

      </table>

    </td></tr>
  </table>
</body>
</html>`;
  }

  // Classic layout
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(customizations.subjectLine || 'Upcoming Events — NorCal SBDC')}</title>
  <!--[if mso]><style>table,td,div,p,a,span{font-family:Arial,sans-serif!important;}</style><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background: #E0DDD6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
  ${customizations.preheaderText ? `<div style="display:none;font-size:1px;color:#E0DDD6;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${escapeHtml(customizations.preheaderText)}</div>` : ''}

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background: #E0DDD6;">
    <tr><td align="center" style="padding: 24px 16px;">

      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; width: 100%; background: ${colors.bg};">

        <!-- HEADER -->
        <tr>
          <td style="padding: 24px 40px; border-bottom: 1px solid ${colors.fog};">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="font-size: 14px; font-weight: 600; color: ${colors.navy}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">NorCal SBDC</td>
                <td align="right" style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 10px; color: ${colors.slate};">${escapeHtml(headerMonth)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- HEADING -->
        <tr>
          <td style="padding: 32px 40px 0;">
            <div style="font-size: 28px; font-weight: 300; color: ${colors.navy}; letter-spacing: -0.025em; line-height: 1.15; margin-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">Upcoming Events<br>&amp; Trainings</div>
            <div style="width: 40px; height: 3px; background: ${colors.accent}; margin-bottom: 16px;"></div>
            <div style="font-size: 14px; color: ${colors.slate}; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">Free workshops and trainings for small business owners across Northern California.</div>
          </td>
        </tr>

        <!-- FEATURED EVENT CARD -->
        <tr>
          <td style="padding: 28px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background: ${colors.card}; border: 1px solid ${colors.fog};">
              <tr>
                <td style="padding: 28px;">
                  <div style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${colors.accent}; margin-bottom: 12px;">★ Featured</div>
                  <div style="font-size: 22px; font-weight: 600; color: ${colors.navy}; letter-spacing: -0.015em; line-height: 1.2; margin-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(focusEvent.title)}</div>
                  <div style="font-size: 14px; color: ${colors.slate}; line-height: 1.6; margin-bottom: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(heroTeaser)}</div>
                  <div style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 11px; color: ${colors.slate}; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${colors.fog};">
                    ${escapeHtml(formatDateShort(focusEvent.date))} · ${escapeHtml(focusEvent.time)} · ${escapeHtml(focusEvent.location)} · Free
                  </div>
                  ${focusEvent.registrationUrl ? `<a href="${escapeHtml(focusEvent.registrationUrl)}" style="display: inline-block; background: ${colors.accent}; color: #ffffff; font-size: 13px; font-weight: 600; padding: 12px 24px; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(ctaText)}</a>` : `<span style="font-size: 14px; font-weight: 600; color: ${colors.accent}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(ctaText)}</span>`}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${otherEvents.length > 0 ? `
        <!-- MORE EVENTS -->
        <tr>
          <td style="padding: 0 40px 32px;">
            <div style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${colors.slate}; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid ${colors.fog};">More Events</div>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              ${eventRows}
            </table>
          </td>
        </tr>` : ''}

        <!-- CTA -->
        <tr>
          <td style="padding: 32px 40px; text-align: center; border-top: 1px solid ${colors.fog}; border-bottom: 1px solid ${colors.fog};">
            <div style="font-size: 15px; color: ${colors.slate}; margin-bottom: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;"><strong style="color: ${colors.navy}; font-weight: 600;">$0 advice.</strong> $547M in client capital last year.</div>
            <div style="font-size: 13px; color: ${colors.slate}; margin-top: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">${escapeHtml(closingLine)}</div>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding: 28px 40px; text-align: center;">
            <div style="font-size: 13px; font-weight: 500; color: ${colors.navy}; margin-bottom: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">NorCal SBDC</div>
            <div style="font-size: 12px; color: ${colors.slate}; margin-bottom: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">Your Business People</div>
            <div style="margin-bottom: 16px;">
              <a href="https://www.norcalsbdc.org/events" style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 10px; font-weight: 500; color: ${colors.slate}; text-decoration: none; margin: 0 12px;">Events</a>
              <a href="https://www.norcalsbdc.org" style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 10px; font-weight: 500; color: ${colors.slate}; text-decoration: none; margin: 0 12px;">Resources</a>
              <a href="https://www.norcalsbdc.org/contact" style="font-family: 'JetBrains Mono', 'Roboto Mono', monospace; font-size: 10px; font-weight: 500; color: ${colors.slate}; text-decoration: none; margin: 0 12px;">Contact</a>
            </div>
            <div style="font-size: 11px; color: ${colors.slate}; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              Funded in part through a Cooperative Agreement with the U.S. Small Business Administration.<br>
              All opinions, conclusions, or recommendations expressed are those of the author(s) and do not necessarily reflect the views of the SBA.<br><br>
              NorCal SBDC Network · Serving 36 counties across Northern California<br>
              <a href="#" style="color: ${colors.slate};">Unsubscribe</a> · <a href="#" style="color: ${colors.slate};">Update preferences</a> · <a href="#" style="color: ${colors.slate};">View in browser</a>
            </div>
          </td>
        </tr>

      </table>

    </td></tr>
  </table>
</body>
</html>`;
}

// ── Helpers ──

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMonth(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' });
  } catch { return ''; }
}

function formatDay(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { day: '2-digit' });
  } catch { return ''; }
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

// ═══════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════

export default function EventNewsletterGenerator() {
  // ── State ──
  const [events, setEvents] = useState<EventItem[]>([
    { ...EMPTY_EVENT, id: generateId(), title: 'Funding Your Growth: SBA Loans Demystified', date: '2026-03-15', time: '10:00 AM PST', location: 'Virtual (Zoom)', description: 'Think you don\'t qualify for an SBA loan? Think again. Join us for a practical breakdown of loan options and what lenders actually look for.', registrationUrl: '' },
    { ...EMPTY_EVENT, id: generateId(), title: 'Marketing on a Bootstrap Budget', date: '2026-03-22', time: '1:00 PM PST', location: 'Virtual (Zoom)', description: 'Learn proven strategies to grow your business without breaking the bank.' },
    { ...EMPTY_EVENT, id: generateId(), title: 'QuickBooks for Real People', date: '2026-03-29', time: '9:00 AM PST', location: 'Sacramento SBDC', description: 'Hands-on workshop to master the basics of QuickBooks for your small business.' },
  ]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [layout, setLayout] = useState<LayoutStyle>('minimal');
  const [tone, setTone] = useState<ToneOption>('professional');

  // Customization fields
  const [subjectLine, setSubjectLine] = useState('Your next move starts here — free SBDC workshops');
  const [preheaderText, setPreheaderText] = useState('SBA loans, marketing, QuickBooks and more. All free. All for you.');
  const [heroTeaser, setHeroTeaser] = useState('');
  const [ctaText, setCtaText] = useState('Register Now →');
  const [closingLine, setClosingLine] = useState('Free expert advice. Real results. Let\u2019s build something.');
  const [eventTeasers, setEventTeasers] = useState<Record<string, string>>({});
  const [headerDate, setHeaderDate] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState<'events' | 'layout' | 'copy' | 'ai'>('events');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [copied, setCopied] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const previewRef = useRef<HTMLIFrameElement>(null);

  // ── Generate HTML ──
  const generatedHtml = useMemo(() => {
    return generateNewsletterHtml(events, layout, focusIndex, {
      subjectLine,
      preheaderText,
      heroTeaser: heroTeaser || events[focusIndex]?.description || '',
      ctaText,
      closingLine,
      eventTeasers,
      headerDate,
    });
  }, [events, layout, focusIndex, subjectLine, preheaderText, heroTeaser, ctaText, closingLine, eventTeasers, headerDate]);

  // ── Event handlers ──

  const addEvent = useCallback(() => {
    setEvents((prev) => [...prev, { ...EMPTY_EVENT, id: generateId() }]);
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      return filtered.length > 0 ? filtered : prev;
    });
  }, []);

  const updateEvent = useCallback((id: string, field: keyof Omit<EventItem, 'id'>, value: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }, []);

  const handlePasteImport = useCallback(() => {
    const parsed = parseEventsFromText(pasteText);
    if (parsed.length > 0) {
      setEvents(parsed.map((e) => ({ ...e, id: generateId() })));
      setPasteMode(false);
      setPasteText('');
    }
  }, [pasteText]);

  const handleCopyHtml = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = generatedHtml;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [generatedHtml]);

  const handleDownloadHtml = useCallback(() => {
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sbdc-events-newsletter-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedHtml]);

  const handleAiGenerate = useCallback(async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/ai/newsletter-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: events.map(({ title, date, time, location, description, registrationUrl }) => ({
            title, date, time, location, description, registrationUrl,
          })),
          tone,
          focusEventIndex: focusIndex,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || 'Failed to generate suggestions');
        return;
      }
      const s = data.suggestions as AiSuggestions;
      if (s.subjectLine) setSubjectLine(s.subjectLine);
      if (s.preheaderText) setPreheaderText(s.preheaderText);
      if (s.heroTeaser) setHeroTeaser(s.heroTeaser);
      if (s.ctaText) setCtaText(s.ctaText);
      if (s.closingLine) setClosingLine(s.closingLine);
      if (s.eventDescriptions) {
        const teasers: Record<string, string> = {};
        s.eventDescriptions.forEach((ed, i) => {
          if (events[i]) teasers[events[i].id] = ed.teaser;
        });
        setEventTeasers(teasers);
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setAiLoading(false);
    }
  }, [events, tone, focusIndex]);

  // ── Render ──

  return (
    <div className="eng-root">
      {/* ── Nav ── */}
      <nav
        className="eng-nav"
        style={{
          position: 'sticky', top: 0, zIndex: 40,
          height: 56, display: 'flex', alignItems: 'center',
          background: 'var(--p-cream, #faf8f4)',
          borderBottom: '1px solid var(--p-line, #e7e2da)',
          padding: '0 24px',
        }}
      >
        <a
          href="/brand/email"
          className="shrink-0 no-underline"
          style={{
            fontFamily: 'var(--era-text)', color: 'var(--p-muted, #a8a29e)',
            fontSize: 10, fontWeight: 500, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginRight: 20, transition: 'color 0.2s ease',
            textDecoration: 'none',
          }}
        >
          &larr; Email Templates
        </a>
        <div style={{ width: 1, height: 20, background: 'var(--p-line, #e7e2da)', marginRight: 12, flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--era-text)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--p-ink, #1a1a1a)' }}>
          Event Newsletter Generator
        </span>
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <ThemeToggle />
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="et-hero relative"
        style={{ background: '#0f1c2e', padding: 'clamp(40px, 6vw, 72px) 24px', overflow: 'hidden' }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 400,
            color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', marginBottom: 20,
          }}>
            <a href="/brand" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Brand House</a>
            {' / '}
            <a href="/brand/email" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Email</a>
            {' / '}Event Newsletter Generator
          </div>
          <h1 style={{
            fontFamily: 'var(--display)', fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: 100, color: '#ffffff', letterSpacing: '-0.035em',
            lineHeight: 1.05, margin: '0 0 16px',
          }}>
            Event Newsletter<br />Generator
          </h1>
          <p style={{
            fontFamily: 'var(--era-text)', fontSize: 15, fontWeight: 400,
            lineHeight: 1.7, color: 'rgba(255,255,255,0.4)', maxWidth: 520, margin: 0,
          }}>
            Build Constant Contact-ready HTML event newsletters. Add your events, pick a layout, let AI write the copy, preview live, and copy the HTML.
          </p>
        </div>
      </section>

      {/* ── Main: Sidebar + Preview ── */}
      <div className="eng-main">
        {/* ── LEFT: Controls ── */}
        <div className="eng-sidebar">
          {/* Tab bar */}
          <div className="eng-tabs">
            {([
              { id: 'events', label: 'Events' },
              { id: 'layout', label: 'Layout & Copy' },
              { id: 'ai', label: 'AI Assist' },
              { id: 'copy', label: 'Export' },
            ] as { id: typeof activeTab; label: string }[]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`eng-tab ${activeTab === tab.id ? 'eng-tab-active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="eng-tab-content">
            {/* ══════ EVENTS TAB ══════ */}
            {activeTab === 'events' && (
              <div>
                <div className="eng-section-header">
                  <span>Events ({events.length})</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setPasteMode(!pasteMode)} className="eng-btn-sm eng-btn-ghost">
                      {pasteMode ? 'Cancel' : 'Paste / CSV'}
                    </button>
                    <button onClick={addEvent} className="eng-btn-sm eng-btn-accent">+ Add Event</button>
                  </div>
                </div>

                {pasteMode && (
                  <div className="eng-paste-area">
                    <label className="eng-label">Paste CSV or tab-separated events</label>
                    <p className="eng-hint">Include headers: Title, Date, Time, Location, Description, Registration URL</p>
                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder={'Title\tDate\tTime\tLocation\tDescription\tURL\nSBA Loans 101\t2026-03-15\t10:00 AM\tVirtual\tLearn about SBA loans\thttps://zoom.us/...'}
                      className="eng-textarea"
                      rows={5}
                    />
                    <button onClick={handlePasteImport} className="eng-btn-sm eng-btn-accent" style={{ marginTop: 8 }}>
                      Import Events
                    </button>
                  </div>
                )}

                {events.map((evt, idx) => (
                  <div key={evt.id} className={`eng-event-card ${idx === focusIndex ? 'eng-event-focus' : ''}`}>
                    <div className="eng-event-header">
                      <button
                        onClick={() => setFocusIndex(idx)}
                        className={`eng-focus-btn ${idx === focusIndex ? 'eng-focus-active' : ''}`}
                        title="Set as featured event"
                      >
                        {idx === focusIndex ? '★ Featured' : '☆ Feature'}
                      </button>
                      {events.length > 1 && (
                        <button onClick={() => removeEvent(evt.id)} className="eng-btn-remove" title="Remove event">×</button>
                      )}
                    </div>

                    <div className="eng-field">
                      <label className="eng-label">Title</label>
                      <input
                        type="text"
                        value={evt.title}
                        onChange={(e) => updateEvent(evt.id, 'title', e.target.value)}
                        className="eng-input"
                        placeholder="Event title"
                      />
                    </div>

                    <div className="eng-field-row">
                      <div className="eng-field" style={{ flex: 1 }}>
                        <label className="eng-label">Date</label>
                        <input
                          type="date"
                          value={evt.date}
                          onChange={(e) => updateEvent(evt.id, 'date', e.target.value)}
                          className="eng-input"
                        />
                      </div>
                      <div className="eng-field" style={{ flex: 1 }}>
                        <label className="eng-label">Time</label>
                        <input
                          type="text"
                          value={evt.time}
                          onChange={(e) => updateEvent(evt.id, 'time', e.target.value)}
                          className="eng-input"
                          placeholder="10:00 AM PST"
                        />
                      </div>
                    </div>

                    <div className="eng-field">
                      <label className="eng-label">Location</label>
                      <input
                        type="text"
                        value={evt.location}
                        onChange={(e) => updateEvent(evt.id, 'location', e.target.value)}
                        className="eng-input"
                        placeholder="Virtual (Zoom)"
                      />
                    </div>

                    <div className="eng-field">
                      <label className="eng-label">Description</label>
                      <textarea
                        value={evt.description}
                        onChange={(e) => updateEvent(evt.id, 'description', e.target.value)}
                        className="eng-textarea"
                        rows={2}
                        placeholder="Brief description of the event..."
                      />
                    </div>

                    <div className="eng-field">
                      <label className="eng-label">Registration URL</label>
                      <input
                        type="url"
                        value={evt.registrationUrl}
                        onChange={(e) => updateEvent(evt.id, 'registrationUrl', e.target.value)}
                        className="eng-input"
                        placeholder="https://zoom.us/meeting/..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ══════ LAYOUT TAB ══════ */}
            {activeTab === 'layout' && (
              <div>
                <div className="eng-section-header"><span>Layout</span></div>
                <div className="eng-layout-grid">
                  {LAYOUT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setLayout(opt.id)}
                      className={`eng-layout-option ${layout === opt.id ? 'eng-layout-active' : ''}`}
                    >
                      <div className="eng-layout-label">{opt.label}</div>
                      <div className="eng-layout-desc">{opt.description}</div>
                    </button>
                  ))}
                </div>

                <div className="eng-section-header" style={{ marginTop: 24 }}><span>Copy & Content</span></div>

                <div className="eng-field">
                  <label className="eng-label">Subject Line</label>
                  <input type="text" value={subjectLine} onChange={(e) => setSubjectLine(e.target.value)} className="eng-input" placeholder="Email subject line" />
                  <span className="eng-char-count">{subjectLine.length}/60</span>
                </div>

                <div className="eng-field">
                  <label className="eng-label">Preheader Text</label>
                  <input type="text" value={preheaderText} onChange={(e) => setPreheaderText(e.target.value)} className="eng-input" placeholder="Preview text shown in inbox" />
                  <span className="eng-char-count">{preheaderText.length}/100</span>
                </div>

                <div className="eng-field">
                  <label className="eng-label">Newsletter Date</label>
                  <input type="text" value={headerDate} onChange={(e) => setHeaderDate(e.target.value)} className="eng-input" placeholder="March 2026 (auto-detects if empty)" />
                </div>

                <div className="eng-field">
                  <label className="eng-label">Featured Event Teaser</label>
                  <textarea value={heroTeaser} onChange={(e) => setHeroTeaser(e.target.value)} className="eng-textarea" rows={3} placeholder="Compelling description for the featured event (uses event description if empty)" />
                </div>

                <div className="eng-field">
                  <label className="eng-label">CTA Button Text</label>
                  <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="eng-input" placeholder="Register Now →" />
                </div>

                <div className="eng-field">
                  <label className="eng-label">Closing Line</label>
                  <input type="text" value={closingLine} onChange={(e) => setClosingLine(e.target.value)} className="eng-input" placeholder="Closing message above footer" />
                </div>
              </div>
            )}

            {/* ══════ AI TAB ══════ */}
            {activeTab === 'ai' && (
              <div>
                <div className="eng-section-header"><span>AI Copy Assistant</span></div>
                <p className="eng-hint" style={{ marginBottom: 16 }}>
                  Let Claude generate subject lines, teaser text, and CTAs based on your events. Requires <code>ANTHROPIC_API_KEY</code> environment variable.
                </p>

                <div className="eng-field">
                  <label className="eng-label">Tone</label>
                  <div className="eng-tone-grid">
                    {TONE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setTone(opt.id)}
                        className={`eng-tone-btn ${tone === opt.id ? 'eng-tone-active' : ''}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAiGenerate}
                  disabled={aiLoading || events.length === 0}
                  className="eng-btn-ai"
                >
                  {aiLoading ? (
                    <span className="eng-spinner" />
                  ) : null}
                  {aiLoading ? 'Generating...' : 'Generate Copy with AI'}
                </button>

                {aiError && (
                  <div className="eng-error">{aiError}</div>
                )}

                <div className="eng-ai-note">
                  <strong>What AI generates:</strong>
                  <ul>
                    <li>Email subject line &amp; preheader</li>
                    <li>Featured event teaser copy</li>
                    <li>Per-event short descriptions</li>
                    <li>CTA button text</li>
                    <li>Closing line</li>
                  </ul>
                  <p>All generated text is editable in the Layout &amp; Copy tab.</p>
                </div>
              </div>
            )}

            {/* ══════ EXPORT TAB ══════ */}
            {activeTab === 'copy' && (
              <div>
                <div className="eng-section-header"><span>Export for Constant Contact</span></div>

                <div className="eng-export-actions">
                  <button onClick={handleCopyHtml} className="eng-btn-export eng-btn-primary">
                    {copied ? '✓ Copied!' : 'Copy HTML to Clipboard'}
                  </button>
                  <button onClick={handleDownloadHtml} className="eng-btn-export eng-btn-ghost">
                    Download HTML File
                  </button>
                </div>

                <div className="eng-export-instructions">
                  <h4>Pasting into Constant Contact</h4>
                  <ol>
                    <li>Click &ldquo;Copy HTML to Clipboard&rdquo; above</li>
                    <li>In Constant Contact, create a new email campaign</li>
                    <li>Choose &ldquo;Custom Code&rdquo; template</li>
                    <li>Paste the HTML into the code editor</li>
                    <li>Preview and test before sending</li>
                  </ol>
                </div>

                <div className="eng-export-instructions">
                  <h4>Subject Line</h4>
                  <div className="eng-subject-preview">{subjectLine || '(not set)'}</div>
                  <h4 style={{ marginTop: 12 }}>Preheader</h4>
                  <div className="eng-subject-preview eng-preheader-preview">{preheaderText || '(not set)'}</div>
                </div>

                <div className="eng-compliance-note">
                  <strong>Compliance</strong>
                  <p>This template includes SBA cooperative agreement disclaimer, unsubscribe link placeholder, and physical address placeholder. Update these before sending.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Preview ── */}
        <div className="eng-preview">
          <div className="eng-preview-header">
            <span className="eng-preview-label">Live Preview</span>
            <span className="eng-preview-meta">600px · {layout === 'minimal' ? 'Clean Minimal' : layout === 'bold' ? 'Bold Navy' : 'Classic Card'}</span>
          </div>
          <div className="eng-preview-frame">
            <iframe
              ref={previewRef}
              srcDoc={generatedHtml}
              title="Newsletter Preview"
              className="eng-iframe"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: '28px 24px', textAlign: 'center',
          fontFamily: 'var(--mono)', fontSize: 10,
          color: 'var(--p-muted, #a8a29e)',
          borderTop: '1px solid var(--p-line, #e7e2da)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}
      >
        NorCal SBDC &mdash; Event Newsletter Generator &mdash; 2026
      </footer>
    </div>
  );
}
