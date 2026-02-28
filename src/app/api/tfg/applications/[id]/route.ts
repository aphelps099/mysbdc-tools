/**
 * TFG Application One-Pager — renders a full HTML summary of a submission.
 *
 * Accessed by admin team from links in notification emails.
 * Uses unguessable UUIDs for security (no auth required).
 */

import { NextRequest } from 'next/server';
import { loadApplication, type StoredApplication } from '@/lib/tfg-storage';

export const dynamic = 'force-dynamic';

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
            ? `<a href="${esc(li)}" style="color:#4eff00;text-decoration:none;">${esc(m.name!)}</a>`
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
    hour: '2-digit',
    minute: '2-digit',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(str(d.companyName))} — TFG Application</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0d0d0d;
    color: #e2e6eb;
    font-family: 'GT America Extended', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  .container {
    max-width: 720px;
    margin: 0 auto;
    padding: 40px 24px 80px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  .tfg-mark {
    font-family: 'Roboto Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #6e7681;
  }
  .submitted-at {
    font-family: 'Roboto Mono', monospace;
    font-size: 10px;
    color: #6e7681;
  }
  h1 {
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -1px;
    margin-bottom: 8px;
  }
  .score-badge {
    display: inline-block;
    font-family: 'Roboto Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 4px 12px;
    border-radius: 4px;
    margin-bottom: 32px;
  }
  .divider {
    width: 48px;
    height: 3px;
    background: #4eff00;
    margin-bottom: 32px;
  }
  .section {
    margin-bottom: 28px;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .section:first-of-type { border-top: none; padding-top: 0; }
  .section-label {
    font-family: 'Roboto Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #6e7681;
    margin-bottom: 12px;
  }
  .fields { width: 100%; border-collapse: collapse; }
  .field-label {
    font-size: 12px;
    color: #6e7681;
    padding: 5px 16px 5px 0;
    vertical-align: top;
    white-space: nowrap;
    width: 140px;
  }
  .field-value {
    font-size: 13px;
    color: #e2e6eb;
    font-weight: 500;
    padding: 5px 0;
    word-break: break-word;
  }
  .field-long {
    font-size: 13px;
    color: #c0c8d0;
    padding: 4px 0 12px;
    line-height: 1.7;
  }
  a { color: #4eff00; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .pitch-deck-btn {
    display: inline-block;
    padding: 10px 20px;
    background: #4eff00;
    color: #0d0d0d;
    font-size: 13px;
    font-weight: 700;
    border-radius: 6px;
    text-decoration: none;
    margin-top: 8px;
  }
  .pitch-deck-btn:hover { background: #3dcc00; text-decoration: none; }
  .footer {
    margin-top: 48px;
    padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
    text-align: center;
  }
  .footer p {
    font-size: 11px;
    color: #6e7681;
  }
  @media (max-width: 600px) {
    h1 { font-size: 24px; }
    .field-label { display: block; width: auto; padding-bottom: 0; }
    .field-value { display: block; padding-bottom: 8px; }
  }
</style>
</head>
<body>
<div class="container">

  <!-- Header -->
  <div class="header">
    <img src="https://www.techfuturesgroup.org/wp-content/uploads/2026/01/TFG-lightning@4x.png" alt="TFG" height="28" style="display:block;height:28px;width:auto;" />
    <span class="submitted-at">${esc(submittedDate)}</span>
  </div>

  <h1>${esc(str(d.companyName))}</h1>

  <div class="score-badge" style="background:rgba(255,255,255,0.06);color:${scoreColor};">
    Readiness: ${scoreNum} &mdash; ${esc(scoreLabel)}
  </div>

  <div class="divider"></div>

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
    fieldHtml('Members', team || '—'),
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
    <div class="section-label">PITCH DECK</div>
    <a href="${esc(app.pitchDeckUrl)}" target="_blank" rel="noopener noreferrer" class="pitch-deck-btn">
      ${esc(app.pitchDeckFileName || 'Download Pitch Deck')} &rarr;
    </a>
  </div>
  ` : ''}

  <!-- Footer -->
  <div class="footer">
    <p>Tech Futures Group &mdash; A program of the NorCal SBDC</p>
    <p style="margin-top:4px;">Application ID: ${esc(app.id)}</p>
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
<title>Not Found — TFG</title>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;color:#6e7681;font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
<div style="text-align:center;">
  <img src="https://www.techfuturesgroup.org/wp-content/uploads/2026/01/TFG-lightning@4x.png" alt="TFG" height="32" style="display:block;margin:0 auto 16px;height:32px;width:auto;" />
  <h1 style="font-size:24px;color:#e2e6eb;margin-bottom:8px;">Application not found</h1>
  <p style="font-size:14px;">This link may have expired or the ID is invalid.</p>
</div>
</body>
</html>`;
}
