/**
 * TFG Application One-Pager — renders a full HTML summary of a submission.
 *
 * Accessed by admin team from links in notification emails.
 * Uses unguessable UUIDs for security (no auth required).
 *
 * Design: Pentagram-minimal. Dark field. Typography-forward.
 */

import { NextRequest } from 'next/server';
import { loadApplication, type StoredApplication } from '@/lib/tfg-storage';

export const dynamic = 'force-dynamic';

const LOGO_URL =
  'https://www.techfuturesgroup.org/wp-content/uploads/2026/01/TFG-lightning@4x.png';

const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'https://tools.norcalsbdc.org';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const app = await loadApplication(id);

  if (!app) {
    return new Response(notFoundHtml(), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  return new Response(renderOnePager(app), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// ─── HTML Helpers ────────────────────────────────────────────

function esc(s: unknown): string {
  const str = typeof s === 'string' ? s : String(s ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function section(title: string, content: string): string {
  return `
  <div class="section">
    <div class="section-label">${esc(title)}</div>
    ${content}
  </div>`;
}

function kvBlock(rows: string): string {
  if (!rows.trim()) return '';
  return `<table class="fields">${rows}</table>`;
}

function field(label: string, value: unknown): string {
  const v = typeof value === 'string' ? value : Array.isArray(value) ? value.join(', ') : String(value ?? '');
  if (!v) return '';
  return `
    <tr>
      <td class="field-label">${esc(label)}</td>
      <td class="field-value">${esc(v)}</td>
    </tr>`;
}

function fieldHtml(label: string, html: string): string {
  if (!html) return '';
  return `
    <tr>
      <td class="field-label">${esc(label)}</td>
      <td class="field-value">${html}</td>
    </tr>`;
}

function longField(label: string, value: unknown): string {
  const v = str(value);
  if (!v) return '';
  return `
    <div class="prose-block">
      <div class="prose-label">${esc(label)}</div>
      <p class="prose-text">${esc(v)}</p>
    </div>`;
}

// ─── Main Renderer ───────────────────────────────────────────

function renderOnePager(app: StoredApplication): string {
  const d = app.data;

  const scoreNum = typeof d.readinessScore === 'number' ? d.readinessScore : 0;
  const scoreLabel = scoreNum >= 6 ? 'Investor-Ready' : scoreNum >= 3 ? 'Needs Assessment' : 'Catalyst';
  const scoreColor = scoreNum >= 6 ? '#4eff00' : scoreNum >= 3 ? '#f59e0b' : '#6e7681';

  // Team members
  const team = Array.isArray(d.teamMembers)
    ? (d.teamMembers as Array<{ name?: string; linkedinUrl?: string }>)
        .filter((m) => m.name?.trim())
        .map((m) => {
          const li = m.linkedinUrl?.trim();
          return li
            ? `<a href="${esc(li)}">${esc(m.name!)}</a>`
            : esc(m.name!);
        })
        .join('<br>')
    : '';

  const sectors = Array.isArray(d.industrySectors) ? d.industrySectors : [];
  const supportNeeds = Array.isArray(d.supportNeeds) ? d.supportNeeds : [];
  const lastRound = Array.isArray(d.lastRound) ? d.lastRound : [];

  const submittedDate = new Date(app.submittedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const submittedTime = new Date(app.submittedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const fontUrl = `${APP_ORIGIN}/fonts/GT-America-Extended-Regular.otf`;
  const fontMedUrl = `${APP_ORIGIN}/fonts/GT-America-Extended-Medium.otf`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(str(d.companyName))} \u2014 TFG Application</title>
<style>
  @font-face {
    font-family: 'GT America Extended';
    src: url('${fontUrl}') format('opentype');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'GT America Extended';
    src: url('${fontMedUrl}') format('opentype');
    font-weight: 500;
    font-style: normal;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: #0a0a0a;
    color: #e2e6eb;
    font-family: 'GT America Extended', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  .page {
    max-width: 680px;
    margin: 0 auto;
    padding: 64px 32px 96px;
  }

  /* ── Masthead ── */
  .masthead {
    padding-bottom: 40px;
    margin-bottom: 40px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .masthead-brand {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 48px;
  }

  .masthead-brand-name {
    font-size: 16px;
    font-weight: 500;
    color: #e2e6eb;
    letter-spacing: -0.01em;
  }

  .masthead-brand-sep {
    margin: 0 10px;
    color: rgba(255,255,255,0.12);
    font-size: 16px;
    font-weight: 300;
  }

  .masthead-brand-tag {
    font-family: inherit;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #4eff00;
  }

  .masthead-date {
    font-family: inherit;
    font-size: 11px;
    color: #484f58;
    letter-spacing: 0.01em;
    margin-bottom: 32px;
  }

  .masthead h1 {
    font-size: 36px;
    font-weight: 500;
    color: #ffffff;
    letter-spacing: -1.5px;
    line-height: 1.1;
    margin-bottom: 16px;
  }

  .masthead-score {
    font-family: inherit;
    font-size: 13px;
    color: #6e7681;
    letter-spacing: 0.01em;
  }

  .masthead-score-value {
    font-weight: 600;
    font-size: 14px;
  }

  /* ── Sections ── */
  .section {
    margin-bottom: 36px;
  }

  .section-label {
    font-family: inherit;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #484f58;
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  /* Key-value table — bordered container with row dividers */
  .fields {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid rgba(255,255,255,0.08);
    margin-bottom: 12px;
  }

  .fields tr {
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .fields tr:nth-child(even) {
    background: rgba(255,255,255,0.025);
  }

  .fields tr:last-child {
    border-bottom: none;
  }

  .field-label {
    font-family: inherit;
    font-size: 11px;
    font-weight: 500;
    color: #6e7681;
    padding: 10px 16px;
    vertical-align: top;
    white-space: nowrap;
    width: 140px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .field-value {
    font-size: 14px;
    color: #e2e6eb;
    font-weight: 400;
    padding: 10px 16px;
    word-break: break-word;
  }

  /* Long-form prose blocks */
  .prose-block {
    margin: 12px 0;
    padding: 12px 16px;
    border: 1px solid rgba(255,255,255,0.06);
    border-left: 2px solid rgba(78, 255, 0, 0.2);
  }

  .prose-label {
    font-family: inherit;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6e7681;
    margin-bottom: 6px;
  }

  .prose-text {
    font-size: 14px;
    color: #b0b8c4;
    line-height: 1.75;
    margin: 0;
  }

  a {
    color: #4eff00;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }

  .pitch-deck-btn {
    display: inline-block;
    padding: 12px 24px;
    background: #4eff00;
    color: #0a0a0a;
    font-family: inherit;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-decoration: none;
    margin-top: 8px;
  }
  .pitch-deck-btn:hover {
    background: #3dcc00;
    text-decoration: none;
  }

  .footer {
    margin-top: 48px;
    padding-top: 24px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .footer p {
    font-family: inherit;
    font-size: 10px;
    color: #333;
    letter-spacing: 0.04em;
  }
  .footer p + p { margin-top: 4px; }

  @media (max-width: 600px) {
    .page { padding: 40px 20px 64px; }
    .masthead h1 { font-size: 26px; }
    .masthead-logo { height: 44px; }
    .field-label { display: block; width: auto; padding: 10px 14px 2px; }
    .field-value { display: block; padding: 2px 14px 10px; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Masthead -->
  <div class="masthead">
    <div class="masthead-brand">
      <span class="masthead-brand-name">Tech Futures Group</span>
      <span class="masthead-brand-sep">|</span>
      <span class="masthead-brand-tag">Application</span>
    </div>

    <div class="masthead-date">${esc(submittedDate)} &middot; ${esc(submittedTime)}</div>

    <h1>${esc(str(d.companyName))}</h1>

    <div class="masthead-score">
      Readiness <span class="masthead-score-value" style="color:${scoreColor};">${scoreNum}/10</span>
      &mdash; ${esc(scoreLabel)}
    </div>
  </div>

  <!-- Company & Contact -->
  ${section('Company & Contact', kvBlock([
    field('Company', d.companyName),
    fieldHtml('Website', str(d.website) ? `<a href="${esc(str(d.website))}">${esc(str(d.website))}</a>` : ''),
    field('Name', `${str(d.firstName)} ${str(d.lastName)}`),
    fieldHtml('Email', str(d.email) ? `<a href="mailto:${esc(str(d.email))}">${esc(str(d.email))}</a>` : ''),
    field('Phone', d.phone),
    fieldHtml('LinkedIn', str(d.linkedin) ? `<a href="${esc(str(d.linkedin))}">${esc(str(d.linkedin))}</a>` : ''),
    field('Address', [str(d.streetAddress), str(d.city), str(d.state), str(d.zipCode)].filter(Boolean).join(', ')),
    field('State of Incorporation', d.stateOfIncorporation),
  ].join('')))}

  <!-- Industry -->
  ${section('Industry & Focus', kvBlock([
    field('Sectors', sectors),
    field('Other Industry', d.otherIndustry),
  ].join('')))}

  <!-- Vision & Product -->
  ${section('Vision & Product', [
    longField('Vision', d.vision),
    longField('Problem', d.problem),
    longField('Solution', d.solution),
  ].join(''))}

  <!-- Market & Validation -->
  ${section('Market & Validation', [
    kvBlock([
      field('I-Corps Status', d.icorpsStatus),
      field('Customer Interviews', d.interviewStatus),
      field('# Interviews', d.interviewCount),
    ].join('')),
    longField('Market Opportunity', d.marketOpportunity),
    longField('I-Corps Details', d.icorpsDetails),
    longField('Interview Learnings', d.interviewLearnings),
    longField('Ideal Customer Profile', d.idealCustomerProfile),
  ].join(''))}

  <!-- Traction & Revenue -->
  ${section('Traction & Revenue', [
    kvBlock([
      field('Product Stage', d.productStage),
      field('Revenue Stage', d.revenueStage),
    ].join('')),
    longField('In-Market Status', d.inMarketStatus),
    longField('SBIR/STTR Status', d.sbirStatus),
    longField('Recent Achievements', d.recentAchievements),
  ].join(''))}

  <!-- Financing & Runway -->
  ${section('Financing & Runway', [
    kvBlock([
      field('Total Funding', d.totalFunding),
      field('Last Round', lastRound),
      field('Raising Capital', d.raisingCapital === 'true' ? 'Yes' : d.raisingCapital === 'false' ? 'No' : str(d.raisingCapital)),
      field('Runway (months)', d.runwayMonths),
    ].join('')),
    longField('Raise Details', d.raiseDetails),
  ].join(''))}

  <!-- Team -->
  ${section('Team', [
    kvBlock([
      fieldHtml('Members', team || '\u2014'),
      field('Time Working', d.timeWorking),
    ].join('')),
    longField('Team Fit', d.teamFit),
  ].join(''))}

  <!-- Support & Referral -->
  ${section('Support & Referral', kvBlock([
    field('Support Needs', supportNeeds),
    field('Other Support', d.otherSupport),
    field('Referral Source', d.referralSource),
    field('Referrer', d.referrerName),
  ].join('')))}

  <!-- Pitch Deck -->
  ${app.pitchDeckUrl ? `
  <div class="section">
    <div class="section-label">Pitch Deck</div>
    <a href="${esc(app.pitchDeckUrl)}" target="_blank" rel="noopener noreferrer" class="pitch-deck-btn">
      ${esc(app.pitchDeckFileName || 'Download Pitch Deck')} &rarr;
    </a>
  </div>
  ` : ''}

  <!-- Footer -->
  <div class="footer">
    <p>Tech Futures Group \u2014 A program of the NorCal SBDC</p>
    <p>${esc(app.id)}</p>
  </div>

</div>
</body>
</html>`;
}

function notFoundHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Not Found \u2014 TFG</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#6e7681;font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
<div style="text-align:center;">
  <img src="${LOGO_URL}" alt="TFG" height="48" style="display:block;margin:0 auto 24px;height:48px;width:auto;" />
  <h1 style="font-size:20px;color:#e2e6eb;margin-bottom:8px;font-weight:500;">Application not found</h1>
  <p style="font-size:13px;">This link may have expired or the ID is invalid.</p>
</div>
</body>
</html>`;
}
