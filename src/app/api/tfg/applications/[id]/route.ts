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

function section(title: string, rows: string): string {
  return `
  <div class="section">
    <div class="section-label">${esc(title)}</div>
    <table class="fields">${rows}</table>
  </div>`;
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
    <tr>
      <td class="field-label" colspan="2">${esc(label)}</td>
    </tr>
    <tr>
      <td class="field-long" colspan="2">${esc(v)}</td>
    </tr>`;
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
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap');

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
    padding-bottom: 48px;
    margin-bottom: 48px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .masthead-logo {
    display: block;
    height: 56px;
    width: auto;
    margin-bottom: 48px;
  }

  .masthead-meta {
    display: flex;
    align-items: baseline;
    gap: 16px;
    margin-bottom: 24px;
  }

  .masthead-type {
    font-family: 'Roboto Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #4eff00;
  }

  .masthead-date {
    font-family: 'Roboto Mono', monospace;
    font-size: 10px;
    color: #484f58;
    letter-spacing: 0.02em;
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
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 6px 14px;
    border: 1px solid rgba(255,255,255,0.06);
  }

  .masthead-score-num {
    font-family: 'Roboto Mono', monospace;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .masthead-score-label {
    font-family: 'Roboto Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #6e7681;
  }

  /* ── Sections ── */
  .section {
    margin-bottom: 40px;
  }

  .section-label {
    font-family: 'Roboto Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #484f58;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }

  .fields {
    width: 100%;
    border-collapse: collapse;
  }

  .field-label {
    font-family: 'Roboto Mono', monospace;
    font-size: 11px;
    color: #6e7681;
    padding: 6px 24px 6px 0;
    vertical-align: top;
    white-space: nowrap;
    width: 140px;
  }

  .field-value {
    font-size: 14px;
    color: #e2e6eb;
    font-weight: 400;
    padding: 6px 0;
    word-break: break-word;
  }

  .field-long {
    font-size: 14px;
    color: #b0b8c4;
    padding: 4px 0 16px;
    line-height: 1.75;
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
    font-family: 'Roboto Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    margin-top: 8px;
  }
  .pitch-deck-btn:hover {
    background: #3dcc00;
    text-decoration: none;
  }

  .footer {
    margin-top: 64px;
    padding-top: 24px;
    border-top: 1px solid rgba(255,255,255,0.04);
  }
  .footer p {
    font-family: 'Roboto Mono', monospace;
    font-size: 10px;
    color: #333;
    letter-spacing: 0.04em;
  }
  .footer p + p { margin-top: 4px; }

  @media (max-width: 600px) {
    .page { padding: 40px 20px 64px; }
    .masthead h1 { font-size: 26px; }
    .masthead-logo { height: 44px; }
    .field-label { display: block; width: auto; padding-bottom: 2px; }
    .field-value { display: block; padding-bottom: 10px; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- Masthead -->
  <div class="masthead">
    <img src="${LOGO_URL}" alt="Tech Futures Group" class="masthead-logo" />

    <div class="masthead-meta">
      <span class="masthead-type">Application</span>
      <span class="masthead-date">${esc(submittedDate)} \u2014 ${esc(submittedTime)}</span>
    </div>

    <h1>${esc(str(d.companyName))}</h1>

    <div class="masthead-score">
      <span class="masthead-score-num" style="color:${scoreColor};">${scoreNum}</span>
      <span class="masthead-score-label">${esc(scoreLabel)}</span>
    </div>
  </div>

  <!-- Company & Contact -->
  ${section('Company & Contact', [
    field('Company', d.companyName),
    fieldHtml('Website', str(d.website) ? `<a href="${esc(str(d.website))}">${esc(str(d.website))}</a>` : ''),
    field('Name', `${str(d.firstName)} ${str(d.lastName)}`),
    fieldHtml('Email', str(d.email) ? `<a href="mailto:${esc(str(d.email))}">${esc(str(d.email))}</a>` : ''),
    field('Phone', d.phone),
    fieldHtml('LinkedIn', str(d.linkedin) ? `<a href="${esc(str(d.linkedin))}">${esc(str(d.linkedin))}</a>` : ''),
    field('Address', [str(d.streetAddress), str(d.city), str(d.state), str(d.zipCode)].filter(Boolean).join(', ')),
    field('State of Incorporation', d.stateOfIncorporation),
  ].join(''))}

  <!-- Industry -->
  ${section('Industry & Focus', [
    field('Sectors', sectors),
    field('Other Industry', d.otherIndustry),
  ].join(''))}

  <!-- Vision & Product -->
  ${section('Vision & Product', [
    longField('Vision', d.vision),
    longField('Problem', d.problem),
    longField('Solution', d.solution),
  ].join(''))}

  <!-- Market & Validation -->
  ${section('Market & Validation', [
    longField('Market Opportunity', d.marketOpportunity),
    field('I-Corps Status', d.icorpsStatus),
    longField('I-Corps Details', d.icorpsDetails),
    field('Customer Interviews', d.interviewStatus),
    field('# Interviews', d.interviewCount),
    longField('Interview Learnings', d.interviewLearnings),
    longField('Ideal Customer Profile', d.idealCustomerProfile),
  ].join(''))}

  <!-- Traction & Revenue -->
  ${section('Traction & Revenue', [
    field('Product Stage', d.productStage),
    longField('In-Market Status', d.inMarketStatus),
    field('Revenue Stage', d.revenueStage),
    longField('SBIR/STTR Status', d.sbirStatus),
    longField('Recent Achievements', d.recentAchievements),
  ].join(''))}

  <!-- Financing & Runway -->
  ${section('Financing & Runway', [
    field('Total Funding', d.totalFunding),
    field('Last Round', lastRound),
    field('Raising Capital', d.raisingCapital === 'true' ? 'Yes' : d.raisingCapital === 'false' ? 'No' : str(d.raisingCapital)),
    longField('Raise Details', d.raiseDetails),
    field('Runway (months)', d.runwayMonths),
  ].join(''))}

  <!-- Team -->
  ${section('Team', [
    fieldHtml('Members', team || '\u2014'),
    longField('Team Fit', d.teamFit),
    field('Time Working', d.timeWorking),
  ].join(''))}

  <!-- Support & Referral -->
  ${section('Support & Referral', [
    field('Support Needs', supportNeeds),
    field('Other Support', d.otherSupport),
    field('Referral Source', d.referralSource),
    field('Referrer', d.referrerName),
  ].join(''))}

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
