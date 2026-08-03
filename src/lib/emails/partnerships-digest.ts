import { buildCalendarUrl } from '@/components/partnerships/calendar';
import { fmt, fmtLong } from '@/components/partnerships/logic';
import { TYPES } from '@/components/partnerships/types';
import type { DigestData } from '@/lib/partnerships-digest';

/* ═══════════════════════════════════════════════════════
   Partnership CRM — weekly digest email.
   FAV NorCal SBDC visual language, translated to email-
   safe HTML: single 620px table, inline styles only, and
   the system's own font fallbacks (Georgia for display,
   Arial for UI) since mail clients won't load Typekit.
   ═══════════════════════════════════════════════════════ */

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'https://tools.norcalsbdc.org';
const CRM_URL = `${APP_ORIGIN}/partnerships`;

const NAVY = '#0f1c2d';
const SLATE = '#2c3240';
const SLATE_LIGHT = '#687080';
const LINE = '#e2e4e8';
const BERRY = '#c23c3c';
const COBALT = '#1b5faf';
const POOL = '#8fc5d9';

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = 'Arial, Helvetica, sans-serif';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const capsLabel = (color: string) =>
  `font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${color};`;

function sectionHead(label: string, count: number, color: string): string {
  return `
    <tr><td style="padding:28px 0 10px;border-bottom:2px solid ${NAVY};">
      <span style="${capsLabel(color)}">${esc(label)} (${count})</span>
    </td></tr>`;
}

function row(name: string, detail: string, right = ''): string {
  return `
    <tr><td style="padding:13px 0;border-bottom:1px solid ${LINE};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td>
          <span style="font-family:${SANS};font-size:14px;font-weight:bold;color:${NAVY};">${esc(name)}</span><br>
          <span style="font-family:${SANS};font-size:12.5px;color:${SLATE_LIGHT};">${esc(detail)}</span>
        </td>
        ${right ? `<td align="right" valign="top" style="white-space:nowrap;padding-left:14px;">${right}</td>` : ''}
      </tr></table>
    </td></tr>`;
}

function tag(text: string, color: string, bg: string): string {
  return `<span style="font-family:${SANS};font-size:10px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${color};background:${bg};padding:4px 9px;border-radius:3px;">${esc(text)}</span>`;
}

export function buildDigestHtml(d: DigestData): string {
  const sections: string[] = [];

  if (d.overdue.length) {
    sections.push(sectionHead('Overdue follow-ups', d.overdue.length, BERRY));
    for (const a of d.overdue) {
      sections.push(
        row(a.partner.name, `${a.detail} · ${a.partner.owner}`, tag('Overdue', BERRY, '#f9ecec')),
      );
    }
  }

  if (d.stale.length) {
    sections.push(sectionHead('Going stale', d.stale.length, NAVY));
    for (const a of d.stale) {
      sections.push(
        row(a.partner.name, `${a.detail} · ${a.partner.owner}`, tag('Going stale', SLATE, '#dcecf2')),
      );
    }
  }

  if (d.dueSoon.length) {
    sections.push(sectionHead('Due this week', d.dueSoon.length, NAVY));
    for (const item of d.dueSoon) {
      const p = item.partner;
      const dormant = p.stage === 'Dormant' ? ' · Dormant — scheduled revisit' : '';
      sections.push(
        row(
          p.name,
          `${TYPES[p.type].short} · ${p.owner}${dormant}`,
          `<span style="font-family:${SANS};font-size:13px;font-weight:bold;color:${NAVY};">${esc(fmt(item.date, d.today))}</span><br>
           <a href="${esc(buildCalendarUrl(p, item.date))}" target="_blank" style="font-family:${SANS};font-size:11px;font-weight:bold;color:${COBALT};text-decoration:none;">Add to calendar</a>`,
        ),
      );
    }
  }

  if (d.recentActivity.length) {
    sections.push(sectionHead('Logged last week', d.recentActivity.length, NAVY));
    for (const f of d.recentActivity.slice(0, 10)) {
      sections.push(`
        <tr><td style="padding:12px 0;border-bottom:1px solid ${LINE};">
          <span style="font-family:${SANS};font-size:12px;color:${SLATE_LIGHT};">${esc(fmt(f.date, d.today))}</span>
          &nbsp;<span style="${capsLabel(COBALT)}font-size:10px;">${esc(f.type)}</span><br>
          <span style="font-family:${SANS};font-size:13.5px;font-weight:bold;color:${NAVY};">${esc(f.partner.name)}</span>
          <span style="font-family:${SANS};font-size:13px;color:${SLATE};"> — ${esc(f.note)}</span>
        </td></tr>`);
    }
  }

  if (!sections.length) {
    sections.push(`
      <tr><td style="padding:30px 0;font-family:${SANS};font-size:14px;color:${SLATE_LIGHT};">
        All caught up — nothing needs attention this week.
      </td></tr>`);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f5f6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f6;">
    <tr><td align="center" style="padding:28px 14px 48px;">
      <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="width:620px;max-width:100%;background:#ffffff;border:1px solid ${LINE};border-top:5px solid ${BERRY};">
        <tr><td style="padding:30px 36px 40px;">

          <!-- lockup -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding-bottom:6px;">
              <span style="font-family:${SERIF};font-size:19px;color:${NAVY};">NorCal <b>SBDC</b></span>
            </td></tr>
            <tr><td style="border-top:1px solid ${LINE};padding-top:6px;">
              <span style="${capsLabel(SLATE_LIGHT)}font-size:9px;">Partnership CRM · Weekly digest</span>
            </td></tr>
          </table>

          <!-- hero -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:30px 0 8px;">
              <span style="display:inline-block;width:33px;height:3px;background:${BERRY};font-size:0;line-height:0;">&nbsp;</span>
            </td></tr>
            <tr><td>
              <span style="font-family:${SERIF};font-size:32px;color:${NAVY};letter-spacing:-1px;">Partner follow-ups</span><br>
              <span style="font-family:${SANS};font-size:13.5px;color:${SLATE};">Week of ${esc(fmtLong(d.today))}</span>
            </td></tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${sections.join('\n')}
          </table>

          <!-- CTA -->
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:32px;">
            <tr><td style="background:${COBALT};border-radius:4px;">
              <a href="${CRM_URL}" target="_blank" style="display:inline-block;padding:14px 24px;font-family:${SANS};font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;">Open the Partnership CRM</a>
            </td></tr>
          </table>

          <p style="margin:30px 0 0;font-family:${SANS};font-size:11.5px;line-height:1.6;color:${SLATE_LIGHT};border-top:1px solid ${LINE};padding-top:14px;">
            You get this every Monday because you work the NorCal SBDC partner pipeline.
            Log activities and set follow-up dates in the CRM to keep this digest accurate.
          </p>

        </td></tr>
      </table>
      <p style="margin:14px 0 0;font-family:${SANS};font-size:10.5px;color:#9aa1ab;">
        NorCal SBDC · <a href="${CRM_URL}" style="color:${POOL};text-decoration:none;">${esc(CRM_URL.replace('https://', ''))}</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Plain-text alternative for deliverability + accessibility. */
export function buildDigestText(d: DigestData): string {
  const lines: string[] = [
    'NorCal SBDC — Partnership CRM weekly digest',
    `Week of ${fmtLong(d.today)}`,
    '',
  ];
  if (d.overdue.length) {
    lines.push(`OVERDUE FOLLOW-UPS (${d.overdue.length})`);
    for (const a of d.overdue) lines.push(`- ${a.partner.name} — ${a.detail} · ${a.partner.owner}`);
    lines.push('');
  }
  if (d.stale.length) {
    lines.push(`GOING STALE (${d.stale.length})`);
    for (const a of d.stale) lines.push(`- ${a.partner.name} — ${a.detail} · ${a.partner.owner}`);
    lines.push('');
  }
  if (d.dueSoon.length) {
    lines.push(`DUE THIS WEEK (${d.dueSoon.length})`);
    for (const i of d.dueSoon) {
      lines.push(`- ${fmt(i.date, d.today)} — ${i.partner.name} · ${i.partner.owner}`);
    }
    lines.push('');
  }
  if (d.recentActivity.length) {
    lines.push(`LOGGED LAST WEEK (${d.recentActivity.length})`);
    for (const f of d.recentActivity.slice(0, 10)) {
      lines.push(`- ${fmt(f.date, d.today)} ${f.type} — ${f.partner.name}: ${f.note}`);
    }
    lines.push('');
  }
  if (!d.hasActionable && !d.recentActivity.length) {
    lines.push('All caught up — nothing needs attention this week.', '');
  }
  lines.push(`Open the CRM: ${CRM_URL}`);
  return lines.join('\n');
}
