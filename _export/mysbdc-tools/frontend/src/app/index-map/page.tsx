'use client';

/* ══════════════════════════════════════════════════════════════════
   NorCal SBDC — System Index
   Editorial layout. Collins / Pentagram-inspired.
   ══════════════════════════════════════════════════════════════════ */

const c = {
  bg:    '#fafaf9',
  white: '#ffffff',
  black: '#111111',
  text:  '#333333',
  muted: '#888888',
  light: '#cccccc',
  rule:  '#e5e5e5',
  faint: '#f5f5f4',
  accent:'#1D5AA7',
};

/* ── Page links (clickable) ── */
const advisor = [
  { route: '/chat',         label: 'Chat',               note: 'Multi-turn AI advisor with RAG, prompt library, workflow engine, Neoserra panel, events feed' },
  { route: '/chat-legacy',  label: 'Chat Legacy',        note: 'Previous chat UI with guided onboarding tour' },
  { route: '/newtools',     label: 'Tools Browser',      note: 'Experimental standalone tool categories, voice transcription, tool engine' },
];

const forms = [
  { route: '/intake',       label: 'Smart 641 Intake',   note: 'Multi-step client intake — creates Contact + Client in Neoserra, readiness scoring, bilingual (EN/ES)' },
  { route: '/milestones',   label: 'Milestone Wizard',   note: 'Impact milestone collection — employees, sales, new business, capital, testimonials. Deep-linkable' },
];

const impact = [
  { route: '/atlas',        label: 'ATLAS',              note: 'Real-time aggregate impact — capital, jobs, businesses, revenue. Interactive NorCal map, 14 centers' },
  { route: '/dashboard',    label: 'Admin Dashboard',    note: 'LLM usage analytics — tokens, costs, latency. Gateway to ATLAS and Milestone Log' },
  { route: '/milestone-log',label: 'Milestone Log',      note: 'Rolling submission history with search, error tracking, email delivery status' },
];

const system = [
  { route: '/login',        label: 'Login',              note: 'Access-code authentication, JWT issuance' },
  { route: '/',             label: 'Home',               note: 'Redirects to /chat' },
];

/* ── API endpoints ── */
const api = [
  { m: 'POST', p: '/api/auth/login',            d: 'Password → JWT token' },
  { m: 'POST', p: '/api/auth/admin',            d: 'Verify admin password' },
  { m: 'POST', p: '/api/chat',                  d: 'Streaming LLM chat (SSE)' },
  { m: 'GET',  p: '/api/conversations',         d: 'List / create / manage conversations' },
  { m: 'POST', p: '/api/intake/submit',         d: 'Create Contact + Client in Neoserra' },
  { m: 'GET',  p: '/api/intake/lookup',         d: 'Look up existing client by email' },
  { m: 'POST', p: '/api/milestones/submit',     d: 'Create milestone + investment records' },
  { m: 'GET',  p: '/api/milestones/lookup',     d: 'Search existing clients' },
  { m: 'GET',  p: '/api/milestones/log',        d: 'Submission history with error detail' },
  { m: 'GET',  p: '/api/atlas/impact',          d: 'Aggregate KPIs by period' },
  { m: 'GET',  p: '/api/atlas/centers',         d: '14 SBDC centers with coordinates' },
  { m: 'GET',  p: '/api/prompts',               d: 'Prompt library (searchable, tagged)' },
  { m: 'GET',  p: '/api/workflows',             d: 'Workflow definitions + step execution' },
  { m: 'GET',  p: '/api/analytics/usage',       d: 'LLM token usage by period' },
  { m: 'GET',  p: '/api/events',                d: 'Upcoming events (WordPress)' },
  { m: 'POST', p: '/api/documents/upload',      d: 'PDF/text upload for RAG indexing' },
  { m: 'POST', p: '/api/transcribe',            d: 'Audio file transcription' },
  { m: 'GET',  p: '/api/health',                d: 'Backend status' },
];

/* ── Services ── */
const services = [
  { f: 'llm_client.py',      d: 'OpenAI streaming, token counting, cost estimation' },
  { f: 'rag.py',             d: 'Document embedding, vector search, context retrieval' },
  { f: 'conversations.py',   d: 'SQLite conversation + message persistence' },
  { f: 'workflow_engine.py',  d: 'JSON workflow state machine, guided prompts' },
  { f: 'neoserra_client.py', d: 'Neoserra CRM API — contacts, clients, milestones, investments' },
  { f: 'atlas.py',           d: 'SQLite impact aggregation, by-center rollup' },
  { f: 'milestone_email.py', d: 'Milestone submission notifications (SMTP)' },
  { f: 'intake_email.py',    d: 'Intake submission notifications (SMTP)' },
  { f: 'google_sheets.py',   d: 'Milestone history reader' },
  { f: 'zip_center_map.py',  d: 'ZIP code → nearest SBDC center routing' },
  { f: 'analytics.py',       d: 'LLM usage tracking and cost reporting' },
];

/* ── Helpers ── */
const mono: React.CSSProperties = {
  fontFamily: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace',
};

function RouteRow({ route, label, note }: { route: string; label: string; note: string }) {
  return (
    <a
      href={route}
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        gap: 24,
        padding: '14px 0',
        borderBottom: `1px solid ${c.rule}`,
        textDecoration: 'none',
        color: c.text,
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.6'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      <span style={{ ...mono, fontSize: 13, color: c.accent, fontWeight: 500 }}>{route}</span>
      <span>
        <strong style={{ fontWeight: 600, color: c.black }}>{label}</strong>
        <br />
        <span style={{ fontSize: 13, color: c.muted, lineHeight: 1.5 }}>{note}</span>
      </span>
    </a>
  );
}

/* ── Page ── */
export default function IndexMapPage() {
  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { -webkit-font-smoothing: antialiased; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: c.bg,
        color: c.text,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: 15,
        lineHeight: 1.6,
        animation: 'fadeIn 0.5s ease both',
      }}>

        {/* ────────── Header ────────── */}
        <header style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '80px 24px 0',
        }}>
          <p style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: c.muted, marginBottom: 16 }}>
            NorCal SBDC
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: '-0.02em', color: c.black, lineHeight: 1.2 }}>
            System Index
          </h1>
          <p style={{ marginTop: 12, fontSize: 15, color: c.muted, maxWidth: 520 }}>
            A complete map of the application — every page, endpoint, and service organized by function.
          </p>
        </header>


        <main style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>

          {/* ──────────────────────────────────────────────
              01 — AI Advisor
              ────────────────────────────────────────────── */}
          <section style={{ marginTop: 80 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: c.light, ...mono }}>01</span>
              <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: c.black }}>
                AI Advisor
              </h2>
            </div>
            <p style={{ fontSize: 14, color: c.muted, marginBottom: 28, maxWidth: 600, lineHeight: 1.6 }}>
              The original product. A conversational AI assistant for SBDC business advisors —
              powered by GPT-4o with retrieval-augmented generation, a curated prompt library,
              guided workflow engine, live Neoserra CRM integration, and an events feed
              pulled from WordPress. Advisors authenticate with an access code.
            </p>

            <div style={{ borderTop: `1px solid ${c.rule}` }}>
              {advisor.map(p => <RouteRow key={p.route} {...p} />)}
            </div>

            <pre style={{
              ...mono,
              fontSize: 12,
              lineHeight: 1.8,
              color: c.muted,
              background: c.faint,
              border: `1px solid ${c.rule}`,
              borderRadius: 6,
              padding: '20px 24px',
              marginTop: 24,
              overflowX: 'auto',
            }}>
{`  Browser
     │
     ▼
  /chat  ──────────────────────────────────────────────
     │                                                 │
     │  Sidebar                                        │
     │  ├── Conversations (SQLite)                     │
     │  ├── Prompt Library (tagged, searchable)        │
     │  ├── Workflow Engine (guided multi-step)        │
     │  ├── Document Upload (RAG indexing)             │
     │  ├── Neoserra CRM Panel (live lookup)           │
     │  └── Events Feed (WordPress REST API)           │
     │                                                 │
     │  Chat Window                                    │
     │  └── Streaming SSE  ←──  LLM + RAG context     │
     │                                                 │
  ─────────────────────────────────────────────────────`}
            </pre>
          </section>


          {/* ──────────────────────────────────────────────
              02 — Forms & Intake
              ────────────────────────────────────────────── */}
          <section style={{ marginTop: 80 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: c.light, ...mono }}>02</span>
              <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: c.black }}>
                Forms &amp; Intake
              </h2>
            </div>
            <p style={{ fontSize: 14, color: c.muted, marginBottom: 28, maxWidth: 600, lineHeight: 1.6 }}>
              Public-facing, no authentication required. Two Typeform-style multi-step wizards
              that collect data from SBDC clients and write directly to the Neoserra CRM
              via API. The intake form supports English and Spanish and calculates a
              business-readiness score. Milestone submissions track jobs, revenue, capital,
              and new businesses for impact reporting. Both send email confirmations.
            </p>

            <div style={{ borderTop: `1px solid ${c.rule}` }}>
              {forms.map(p => <RouteRow key={p.route} {...p} />)}
            </div>

            <pre style={{
              ...mono,
              fontSize: 12,
              lineHeight: 1.8,
              color: c.muted,
              background: c.faint,
              border: `1px solid ${c.rule}`,
              borderRadius: 6,
              padding: '20px 24px',
              marginTop: 24,
              overflowX: 'auto',
            }}>
{`  Client (public)
     │
     ├── /intake ──── Smart641Wizard ─────────────────
     │                 ├── Contact Info                │
     │                 ├── Business Details             │
     │                 ├── Demographics                 │
     │                 ├── Needs Assessment             │
     │                 └── Readiness Score ──→ Neoserra │
     │                                                 │
     ├── /milestones ── MilestoneWizard ──────────────
     │                   ├── Contact Lookup             │
     │                   ├── Select Business            │
     │                   ├── Select Categories          │
     │                   │   ├── Employees              │
     │                   │   ├── Sales / Revenue        │
     │                   │   ├── New Business           │
     │                   │   ├── Capital / Funding      │
     │                   │   └── Testimonial            │
     │                   └── Submit ──→ Neoserra        │
     │                                                 │
     └── Both send email confirmations via SMTP        │
  ─────────────────────────────────────────────────────`}
            </pre>
          </section>


          {/* ──────────────────────────────────────────────
              03 — Impact & Analytics
              ────────────────────────────────────────────── */}
          <section style={{ marginTop: 80 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: c.light, ...mono }}>03</span>
              <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: c.black }}>
                Impact &amp; Analytics
              </h2>
            </div>
            <p style={{ fontSize: 14, color: c.muted, marginBottom: 28, maxWidth: 600, lineHeight: 1.6 }}>
              ATLAS is the public-facing impact dashboard — animated KPI counters, an interactive
              NorCal map with all 14 SBDC centers, a live activity feed, and period-based
              filtering (month / quarter / YTD / all time). The admin dashboard tracks LLM
              usage costs and links to the milestone log, which provides a searchable
              submission history with error and email delivery status.
            </p>

            <div style={{ borderTop: `1px solid ${c.rule}` }}>
              {impact.map(p => <RouteRow key={p.route} {...p} />)}
            </div>

            <pre style={{
              ...mono,
              fontSize: 12,
              lineHeight: 1.8,
              color: c.muted,
              background: c.faint,
              border: `1px solid ${c.rule}`,
              borderRadius: 6,
              padding: '20px 24px',
              marginTop: 24,
              overflowX: 'auto',
            }}>
{`  /atlas (public)
     │
     ├── KPIs ──── Capital · Jobs · Businesses · Revenue
     ├── Map ───── 14 NorCal SBDC centers (hover detail)
     ├── Feed ──── Last 50 submissions (color-coded)
     └── Period ── This Month │ Quarter │ YTD │ All Time
                       │
                       ▼
                  SQLite store  ←──  /milestones submissions

  /dashboard (admin)
     │
     ├── LLM Analytics ── tokens, cost, latency
     ├── → ATLAS
     └── → Milestone Log ── search, errors, email status`}
            </pre>
          </section>


          {/* ──────────────────────────────────────────────
              04 — System
              ────────────────────────────────────────────── */}
          <section style={{ marginTop: 80 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: c.light, ...mono }}>04</span>
              <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: c.black }}>
                System
              </h2>
            </div>
            <p style={{ fontSize: 14, color: c.muted, marginBottom: 28, maxWidth: 400, lineHeight: 1.6 }}>
              Authentication and routing.
            </p>

            <div style={{ borderTop: `1px solid ${c.rule}` }}>
              {system.map(p => <RouteRow key={p.route} {...p} />)}
            </div>
          </section>


          {/* ──────────────────────────────────────────────
              05 — API Reference
              ────────────────────────────────────────────── */}
          <section style={{ marginTop: 80 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: c.light, ...mono }}>05</span>
              <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: c.black }}>
                API
              </h2>
            </div>
            <p style={{ fontSize: 14, color: c.muted, marginBottom: 28, maxWidth: 520, lineHeight: 1.6 }}>
              All frontend requests proxy through <code style={{ ...mono, fontSize: 13, color: c.accent }}>/api/[...path]</code> to the FastAPI backend at runtime.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${c.black}`, textAlign: 'left' }}>
                  <th style={{ padding: '8px 0', fontWeight: 600, width: 56, color: c.black }}>Method</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, color: c.black }}>Endpoint</th>
                  <th style={{ padding: '8px 0', fontWeight: 600, color: c.black }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {api.map((ep, i) => (
                  <tr key={ep.p + ep.m} style={{ borderBottom: `1px solid ${c.rule}` }}>
                    <td style={{ padding: '10px 0', ...mono, fontSize: 12, fontWeight: 600, color: c.muted }}>{ep.m}</td>
                    <td style={{ padding: '10px 12px', ...mono, fontSize: 12, color: c.accent }}>{ep.p}</td>
                    <td style={{ padding: '10px 0', color: c.text }}>{ep.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>


          {/* ──────────────────────────────────────────────
              06 — Backend Services
              ────────────────────────────────────────────── */}
          <section style={{ marginTop: 80 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: c.light, ...mono }}>06</span>
              <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: c.black }}>
                Backend Services
              </h2>
            </div>
            <p style={{ fontSize: 14, color: c.muted, marginBottom: 28, maxWidth: 520, lineHeight: 1.6 }}>
              Python modules in <code style={{ ...mono, fontSize: 13, color: c.accent }}>backend/app/services/</code>
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${c.black}`, textAlign: 'left' }}>
                  <th style={{ padding: '8px 0', fontWeight: 600, color: c.black, width: 180 }}>File</th>
                  <th style={{ padding: '8px 0', fontWeight: 600, color: c.black }}>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {services.map(svc => (
                  <tr key={svc.f} style={{ borderBottom: `1px solid ${c.rule}` }}>
                    <td style={{ padding: '10px 0', ...mono, fontSize: 12, color: c.accent }}>{svc.f}</td>
                    <td style={{ padding: '10px 0', color: c.text }}>{svc.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>


          {/* ──────────────────────────────────────────────
              07 — Full Architecture
              ────────────────────────────────────────────── */}
          <section style={{ marginTop: 80 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: c.light, ...mono }}>07</span>
              <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: c.black }}>
                Architecture
              </h2>
            </div>

            <pre style={{
              ...mono,
              fontSize: 12,
              lineHeight: 1.9,
              color: c.text,
              background: c.white,
              border: `1px solid ${c.rule}`,
              borderRadius: 6,
              padding: '28px 28px',
              marginTop: 16,
              overflowX: 'auto',
            }}>
{`  ┌─────────────────────────────────────────────────────────────┐
  │                                                             │
  │   FRONTEND   Next.js 14 · React · Tailwind                 │
  │                                                             │
  │   /chat ···········  AI Advisor (auth required)             │
  │   /intake ·········  Smart 641 Form (public)                │
  │   /milestones ·····  Milestone Wizard (public)              │
  │   /atlas ··········  Impact Dashboard (public)              │
  │   /dashboard ······  Admin Analytics (admin)                │
  │   /milestone-log ··  Submission History (admin)             │
  │   /newtools ·······  Tool Browser (auth required)           │
  │                                                             │
  │   /api/[...path]  →  proxy to backend                      │
  │                                                             │
  └──────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
  ┌──────────────────────────┴──────────────────────────────────┐
  │                                                             │
  │   BACKEND   FastAPI · Python · SQLite                       │
  │                                                             │
  │   routes/                                                   │
  │   ├── chat.py ·········  LLM streaming (SSE)               │
  │   ├── conversations.py   CRUD + message history            │
  │   ├── intake.py ·······  641 form → Neoserra               │
  │   ├── milestones.py ···  Milestone → Neoserra              │
  │   ├── atlas.py ········  Impact aggregation                │
  │   ├── prompts.py ······  Prompt library                    │
  │   ├── workflows.py ····  Guided workflows                  │
  │   ├── analytics.py ····  Token / cost tracking             │
  │   └── auth.py ·········  JWT + admin auth                  │
  │                                                             │
  │   services/                                                 │
  │   ├── llm_client ······  OpenAI API + RAG                  │
  │   ├── neoserra_client ·  CRM read / write                  │
  │   ├── atlas ···········  SQLite impact store               │
  │   ├── *_email ·········  SMTP notifications                │
  │   └── zip_center_map ··  ZIP → center routing              │
  │                                                             │
  └─────────────────┬───────────────────┬───────────────────────┘
                    │                   │
                    ▼                   ▼
            ┌──────────────┐   ┌──────────────────┐
            │  Neoserra    │   │  External APIs   │
            │  CRM API     │   │  ├── OpenAI      │
            │              │   │  ├── WordPress   │
            │  Contacts    │   │  ├── Google Sheets│
            │  Clients     │   │  └── SMTP / Resend│
            │  Milestones  │   │                  │
            │  Investments │   │                  │
            └──────────────┘   └──────────────────┘`}
            </pre>
          </section>

        </main>


        {/* ────────── Footer ────────── */}
        <footer style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '80px 24px 40px',
        }}>
          <div style={{ borderTop: `1px solid ${c.rule}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: c.light }}>NorCal SBDC</span>
            <span style={{ fontSize: 12, color: c.light }}>sbdc-advisor</span>
          </div>
        </footer>

      </div>
    </>
  );
}
