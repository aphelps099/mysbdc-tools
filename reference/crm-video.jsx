/* NorCal SBDC Partnership CRM — 60s product walkthrough.
   Persistent stage: a browser window holding the CRM, on a navy desk.
   Scenes are camera moves + UI deltas on that one shared set. */

const { Easing, clamp, useScene } = window;

const C = {
  navy: '#0f1c2d', navySoft: '#253247', cobalt: '#1b5faf', cobaltDark: '#144b8c',
  pool: '#8fc5d9', poolPale: '#dcecf2', berry: '#c23c3c', paper: '#fdfdfd',
  white: '#ffffff', slate: '#2c3240', slateLight: '#687080', line: '#0f1c2d29',
  evergreen: '#00675c', silver: '#d8d8d8'
};
const SERA = '"proxima-sera",Georgia,"Times New Roman",serif';
const NOVA = '"proxima-nova",Arial,Helvetica,sans-serif';

const W = 1920, H = 1080;
const WIN = { w: 1600, h: 1040 };
const CH = 40; // browser chrome

/* ── camera presets (window coords) ────────────────────────────── */
const CAM = {
  wide:      { x: 800, y: 520, s: 0.94 },
  wideLow:   { x: 800, y: 560, s: 0.99 },
  metrics:   { x: 800, y: 372, s: 1.16 },
  attention: { x: 420, y: 600, s: 1.72 },
  modal:     { x: 800, y: 470, s: 1.12 },
  modalTop:  { x: 800, y: 300, s: 1.34 },
  modalFoot: { x: 820, y: 690, s: 1.34 },
  log:       { x: 800, y: 500, s: 1.26 },
  logNote:   { x: 800, y: 520, s: 1.58 },
  logFoot:   { x: 950, y: 760, s: 1.50 },
  stageSel:  { x: 640, y: 600, s: 1.62 },
  tabs:      { x: 660, y: 370, s: 1.48 },
  board:     { x: 800, y: 560, s: 1.00 },
  boardCol:  { x: 930, y: 430, s: 1.48 }
};

/* ── click / cursor targets (window coords) ────────────────────── */
const HIT = {
  attnRow:  { x: 300, y: 601 },
  logBtn:   { x: 893, y: 915 },
  noteBox:  { x: 800, y: 524 },
  saveAct:  { x: 1010, y: 775 },
  stageSel: { x: 640, y: 607 },
  saveDet:  { x: 1063, y: 915 },
  pipeTab:  { x: 430, y: 100 }
};

/* ── the only three motion helpers ─────────────────────────────── */
const MOTION = {
  // eased 0→1 ramp
  enter: (t, start, dur, ease) => (ease || Easing.easeOutCubic)(clamp((t - start) / dur, 0, 1)),
  // keyframe track over objects {t, ...fields}
  track: (keys, t) => {
    if (t <= keys[0].t) return keys[0];
    const last = keys[keys.length - 1];
    if (t >= last.t) return last;
    let i = 0;
    while (i < keys.length - 1 && t > keys[i + 1].t) i++;
    const a = keys[i], b = keys[i + 1];
    const k = Easing.easeInOutCubic(clamp((t - a.t) / (b.t - a.t), 0, 1));
    const out = {};
    Object.keys(a).forEach(f => { if (f !== 't') out[f] = typeof a[f] === 'number' ? a[f] + (b[f] - a[f]) * k : b[f]; });
    return out;
  },
  // click emphasis 0→1→0 over 0.42s
  pop: (t, at) => {
    const d = (t - at) / 0.42;
    return d < 0 || d > 1 ? 0 : Math.sin(Math.PI * d);
  }
};

/* ── data ──────────────────────────────────────────────────────── */
const METRICS = [
  { label: 'Active partnerships', value: 8, sub: '▲ 2 vs. last quarter', c: C.evergreen },
  { label: 'In pipeline', value: 5, sub: '2 at agreement stage', c: C.slateLight },
  { label: 'Client referrals YTD', value: 70, sub: '▲ 18% vs. same period 2025', c: C.evergreen },
  { label: 'Overdue follow-ups', value: 3, sub: 'Needs attention', c: C.berry }
];
const ATTN = [
  ['Shasta Cascade Economic Development District', 'Follow-up was due Jul 24 · Scott'],
  ['Golden Valley Community Loan Fund', 'Follow-up was due Jul 22 · Gustavo'],
  ['CA GO-Biz — Small Business Unit', 'Follow-up was due Jul 25 · Preet']
];
const STAGE_ROWS = [
  ['Prospect', 1, '#dcecf2'], ['Outreach', 0, '#b9d9e6'], ['In Discussion', 2, '#8fc5d9'],
  ['MOU / Agreement', 2, '#4f8fc4'], ['Active', 8, '#1b5faf'], ['Dormant', 1, '#d8d8d8']
];
const REF_ROWS = [
  ['Redwood Coast Community Bank', 14], ['Shasta Cascade EDD', 11], ['Six Rivers Federal CU', 9],
  ['SBA Sacramento District Office', 8], ['Redding Startup Week', 7], ['Chico Chamber of Commerce', 6]
];
const TYPE_ROWS = [['Referral partner', 4, C.cobalt], ['Funding & host', 4, C.evergreen], ['Community & events', 4, C.navySoft]];
const BOARD = [
  { name: 'Prospect', cards: [['Northern Rivers Tribal Business Fund', 'CDFI / grantor · Hoopa', C.evergreen, 'ER']] },
  { name: 'Outreach', cards: [] },
  { name: 'In Discussion', cards: [['Mendocino Wine & Ag Collective', 'Industry association · Ukiah', C.navySoft, 'PR']] },
  { name: 'MOU / Agreement', cards: [['Butte College Foundation', 'Host institution · Oroville', C.evergreen, 'GU'], ['Valley Oak Bank', 'Community bank · Woodland', C.cobalt, 'PR']] },
  { name: 'Active', cards: [['Redwood Coast Community Bank', 'Community bank · Eureka', C.cobalt, 'AA'], ['Chico Chamber of Commerce', 'Chamber · Chico', C.navySoft, 'GU']] },
  { name: 'Dormant', cards: [['Pacific Gateway Ports Alliance', 'Trade group · Crescent City', C.navySoft, 'AA']] }
];
const NOTE_TEXT = 'Counsel cleared the 48-hour warm-handoff SLA. Moving to agreement.';

const SCENE_STARTS = (() => {
  try {
    const list = JSON.parse(window.OM_SCENES); let acc = 0;
    return list.map(s => { const v = acc; acc += s.dur; return v; });
  } catch (e) { return []; }
})();

/* ── atoms ─────────────────────────────────────────────────────── */
const Label = ({ children, color, size, style }) => (
  <div style={{ fontFamily: NOVA, fontSize: size || 12, fontWeight: 800, letterSpacing: '.13em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: color || C.slateLight, ...style }}>{children}</div>
);

function Panel({ x = 0, y = 0, w = '100%', h = '100%', label, note, children }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: C.white, padding: '22px 26px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, paddingBottom: 14, borderBottom: `1px solid ${C.line}` }}>
        <Label color={C.navy}>{label}</Label>
        <div style={{ fontFamily: NOVA, fontSize: 13, color: C.slateLight, whiteSpace: 'nowrap' }}>{note}</div>
      </div>
      {children}
    </div>
  );
}

function BarRow({ label, n, color, pct, labelW, pad }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `${labelW}px 1fr 30px`, alignItems: 'center', gap: 14, padding: `${pad}px 0` }}>
      <div style={{ fontFamily: NOVA, fontSize: 14, color: C.slate, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ height: 14, borderLeft: `2px solid ${C.line}`, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: pct + '%', minWidth: 2, background: color, borderRadius: '0 2px 2px 0' }} />
      </div>
      <div style={{ fontFamily: NOVA, fontSize: 14, fontWeight: 700, color: C.navy }}>{n}</div>
    </div>
  );
}

/* ── the CRM screen ────────────────────────────────────────────── */
function Dashboard({ ui }) {
  const mp = ui.metricsP;
  return (
    <div style={{ position: 'absolute', left: 0, top: CH + 64, right: 0, bottom: 0 }}>
      {/* hero */}
      <div style={{ position: 'absolute', left: 44, top: 34, width: 1512 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 22, borderBottom: `3px solid ${C.navy}` }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ width: 33, height: 3, background: C.berry }} />
              <Label color={C.navy} style={{ letterSpacing: '.17em', fontSize: 12 }}>NorCal SBDC Network</Label>
            </div>
            <div style={{ fontFamily: SERA, fontSize: 62, letterSpacing: '-.05em', lineHeight: .93, color: C.navy }}>Partnerships</div>
            <div style={{ fontFamily: NOVA, fontSize: 16, color: C.slate, marginTop: 12 }}>14 partner organizations · Updated Jul 27, 2026</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ height: 50, padding: '0 23px', background: C.cobalt, color: C.white, borderRadius: 4, fontFamily: NOVA, fontSize: 15, fontWeight: 700, display: 'grid', placeItems: 'center' }}>Add partner</div>
            <div style={{ height: 50, padding: '0 23px', background: '#ffffff14', color: C.navy, border: `1px solid #0e1a2b5c`, borderRadius: 4, fontFamily: NOVA, fontSize: 15, fontWeight: 700, display: 'grid', placeItems: 'center' }}>View pipeline</div>
          </div>
        </div>
      </div>

      {/* metric strip — window y 292 */}
      <div style={{ position: 'absolute', left: 44, top: 188, width: 1512, height: 146, border: `1px solid ${C.line}`, borderTop: `5px solid ${C.berry}`, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: C.line }}>
        {METRICS.map((m, i) => (
          <div key={i} style={{ background: C.white, padding: '18px 24px', position: 'relative' }}>
            <Label>{m.label}</Label>
            <div style={{ fontFamily: SERA, fontSize: 54, lineHeight: .95, letterSpacing: '-.05em', color: C.navy, marginTop: 8 }}>{Math.round(m.value * (mp == null ? 1 : mp))}</div>
            <div style={{ fontFamily: NOVA, fontSize: 13.5, color: m.c, marginTop: 8 }}>{m.sub}</div>
            <div style={{ position: 'absolute', left: 24, bottom: 0, height: 3, width: `${(ui.sweep ? clamp(ui.sweep * 4 - i, 0, 1) : 0) * 62}%`, background: C.berry }} />
          </div>
        ))}
      </div>

      {/* panel grid — window y 462 */}
      <div style={{ position: 'absolute', left: 44, top: 358, width: 1512, height: 538, border: `1px solid ${C.line}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 1, background: C.line }}>
        <div style={{ position: 'relative', background: C.white }}>
          <Panel x={0} y={0} w="100%" h="100%" label="Needs attention" note="Overdue and stalling">
            {ATTN.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, height: 46, borderBottom: `1px solid ${C.line}`, background: ui.hoverRow === i ? '#dcecf24d' : 'transparent', paddingLeft: ui.hoverRow === i ? 8 : 0, marginLeft: ui.hoverRow === i ? -8 : 0, transition: 'none' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: C.berry, flex: 'none' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: NOVA, fontSize: 14.5, fontWeight: 700, color: C.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a[0]}</div>
                  <div style={{ fontFamily: NOVA, fontSize: 13, color: C.slateLight }}>{a[1]}</div>
                </div>
                <span style={{ fontFamily: NOVA, fontSize: 10.5, fontWeight: 800, letterSpacing: '.13em', color: C.berry, background: '#c23c3c14', padding: '5px 10px', borderRadius: 3 }}>OVERDUE</span>
              </div>
            ))}
            <div style={{ fontFamily: NOVA, fontSize: 13, color: C.slateLight, paddingTop: 14 }}>All other partnerships are on schedule.</div>
          </Panel>
        </div>
        <div style={{ position: 'relative', background: C.white }}>
          <Panel label="Pipeline stages" note="All partners">
            {STAGE_ROWS.map((r, i) => <BarRow key={i} label={r[0]} n={r[1]} color={r[2]} pct={(r[1] / 8) * 100} labelW={130} pad={5} />)}
          </Panel>
        </div>
        <div style={{ position: 'relative', background: C.white }}>
          <Panel label="Top referral sources" note="Jan–Jul 2026">
            {REF_ROWS.map((r, i) => <BarRow key={i} label={r[0]} n={r[1]} color={C.cobalt} pct={(r[1] / 14) * 100} labelW={210} pad={5} />)}
          </Panel>
        </div>
        <div style={{ position: 'relative', background: C.white }}>
          <Panel label="Partners by type" note="Excludes dormant">
            {TYPE_ROWS.map((r, i) => <BarRow key={i} label={r[0]} n={r[1]} color={r[2]} pct={(r[1] / 4) * 100} labelW={160} pad={12} />)}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Board({ ui }) {
  const hl = ui.boardHighlight || 0;
  return (
    <div style={{ position: 'absolute', left: 0, top: CH + 64, right: 0, bottom: 0 }}>
      <div style={{ position: 'absolute', left: 44, top: 34, display: 'flex', alignItems: 'center', gap: 22, width: 1512 }}>
        <span style={{ width: 33, height: 3, background: C.berry }} />
        <Label color={C.navy} style={{ letterSpacing: '.17em' }}>Pipeline</Label>
        <div style={{ marginLeft: 'auto' }}><Label>14 of 14 partners</Label></div>
      </div>
      <div style={{ position: 'absolute', left: 44, top: 84, width: 1512, height: 620, border: `1px solid ${C.line}`, borderTop: `5px solid ${C.berry}`, display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 1, background: C.line }}>
        {BOARD.map((col, ci) => {
          const cards = col.cards.slice();
          if (col.name === 'MOU / Agreement') cards.unshift(['Golden Valley Community Loan Fund', 'CDFI · Chico', C.cobalt, 'GU', true]);
          return (
            <div key={ci} style={{ background: C.white, padding: '16px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, marginBottom: 14, borderBottom: `1px solid ${C.line}` }}>
                <Label color={C.navy} size={11}>{col.name}</Label>
                <div style={{ fontFamily: NOVA, fontSize: 12, fontWeight: 800, color: C.slateLight }}>{cards.length}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cards.map((c, i) => (
                  <div key={i} style={{
                    background: C.paper, border: `1px solid ${c[4] ? `rgba(27,95,175,${0.25 + 0.75 * hl})` : C.line}`,
                    borderLeft: `3px solid ${c[2]}`, borderRadius: 3, padding: '12px 12px',
                    boxShadow: c[4] ? `0 ${10 * hl}px ${26 * hl}px rgba(14,26,43,${0.18 * hl})` : 'none',
                    transform: c[4] ? `translateY(${-3 * hl}px)` : 'none'
                  }}>
                    <div style={{ fontFamily: NOVA, fontSize: 13.5, fontWeight: 700, color: C.navy, lineHeight: 1.3 }}>{c[0]}</div>
                    <div style={{ fontFamily: NOVA, fontSize: 12, color: C.slateLight, marginTop: 5 }}>{c[1]}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                      <span style={{ fontFamily: NOVA, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', color: c[4] ? C.cobalt : C.slateLight }}>{c[4] ? 'Aug 1' : 'Aug 14'}</span>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: C.poolPale, color: C.navy, display: 'grid', placeItems: 'center', fontFamily: NOVA, fontSize: 9.5, fontWeight: 800 }}>{c[3]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const FIELD = (label, value, hint, color) => ({ label, value, hint, color });
const DETAIL_FIELDS = [
  FIELD('Primary contact', 'Sam Nakagawa', 'Lending Director'),
  FIELD('Reach', 'snakagawa@gvclf.example.org', '(530) 555-0167', C.cobalt),
  FIELD('Referrals YTD', '3', 'Clients sent to SBDC'),
  FIELD('Last contact', 'Jul 2', '25 days ago'),
  FIELD('Next follow-up', 'Jul 22', 'Overdue', C.berry),
  FIELD('Service center', 'Butte College SBDC', 'Chico')
];

function DetailModal({ ui }) {
  const p = ui.detailP;
  return (
    <div style={{
      position: 'absolute', left: 420, top: 110, width: 760, height: 840, background: C.white,
      borderRadius: 10, borderTop: `5px solid ${C.berry}`, overflow: 'hidden',
      boxShadow: '0 42px 85px #0e1a2b4d, 0 12px 28px #0e1a2b1a',
      opacity: p, transform: `translateY(${(1 - p) * 22}px) scale(${0.985 + 0.015 * p})`
    }}>
      <div style={{ padding: '28px 34px 0' }}>
        <Label size={11}>Referral partner</Label>
        <div style={{ fontFamily: SERA, fontSize: 38, lineHeight: 1.02, letterSpacing: '-.04em', color: C.navy, marginTop: 12 }}>Golden Valley Community Loan Fund</div>
        <div style={{ fontFamily: NOVA, fontSize: 14.5, color: C.slate, marginTop: 12 }}>CDFI · Chico · Butte College SBDC</div>
      </div>
      <div style={{ position: 'absolute', left: 34, top: 152, width: 692, borderTop: `1px solid ${C.line}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: C.line }}>
        {DETAIL_FIELDS.map((f, i) => (
          <div key={i} style={{ background: C.white, padding: '14px 0', height: 92 }}>
            <Label size={11}>{f.label}</Label>
            <div style={{ fontFamily: NOVA, fontSize: 16, fontWeight: 700, color: f.color || C.navy, marginTop: 7, paddingRight: 20 }}>{f.value}</div>
            <div style={{ fontFamily: NOVA, fontSize: 13, color: C.slateLight, marginTop: 2 }}>{f.hint}</div>
          </div>
        ))}
      </div>
      {/* stage + owner selects (rel y 450) */}
      <div style={{ position: 'absolute', left: 34, top: 450, width: 692, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <Label size={11} style={{ marginBottom: 7 }}>Stage</Label>
          <div style={{
            height: 46, border: `1px solid ${ui.stageFocus ? C.pool : C.line}`, borderRadius: 4, display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', fontFamily: NOVA, fontSize: 15,
            color: C.navy, fontWeight: ui.stagePicked ? 700 : 400, background: ui.stageFocus ? '#dcecf233' : C.white,
            outline: ui.stageFocus ? `3px solid ${C.pool}` : 'none', outlineOffset: 2
          }}>
            <span>{ui.stagePicked ? 'MOU / Agreement' : 'In Discussion'}</span><span style={{ color: C.slateLight, fontSize: 12 }}>▾</span>
          </div>
        </div>
        <div>
          <Label size={11} style={{ marginBottom: 7 }}>Owner</Label>
          <div style={{ height: 46, border: `1px solid ${C.line}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', fontFamily: NOVA, fontSize: 15, color: C.navy }}>
            <span>Gustavo</span><span style={{ color: C.slateLight, fontSize: 12 }}>▾</span>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 34, top: 550, width: 692 }}>
        <Label size={11}>Notes</Label>
        <div style={{ fontFamily: NOVA, fontSize: 15, lineHeight: 1.55, color: C.slate, marginTop: 8 }}>
          Negotiating formal referral agreement. They want a warm-handoff SLA (48h response). Draft shared 6/20.
        </div>
      </div>
      <div style={{ position: 'absolute', left: 34, top: 648, width: 692 }}>
        <div style={{ paddingBottom: 10, borderBottom: `1px solid ${C.line}` }}><Label size={11}>{`Activity history (${ui.logged ? 3 : 2})`}</Label></div>
        {(ui.logged ? [['Jul 27', 'Meeting', NOTE_TEXT]] : []).concat([
          ['Jul 2', 'Email', 'Sent revised referral agreement draft with 48-hour response commitment.'],
          ['Jun 20', 'Meeting', 'Reviewed handoff workflow; they asked for a named advisor per referral.']
        ]).slice(0, 3).map((a, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '88px 1fr', gap: 18, padding: '11px 0', borderBottom: `1px solid ${C.line}`, background: i === 0 && ui.logged ? '#dcecf24d' : 'transparent' }}>
            <div style={{ fontFamily: NOVA, fontSize: 13, color: C.slateLight }}>{a[0]}</div>
            <div style={{ fontFamily: NOVA, fontSize: 14, color: C.slate }}>
              <span style={{ fontWeight: 800, color: C.navy, fontSize: 10.5, letterSpacing: '.13em', textTransform: 'uppercase', marginRight: 9 }}>{a[1]}</span>{a[2]}
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, borderTop: `1px solid ${C.line}`, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, padding: '0 34px' }}>
        <div style={{ height: 43, padding: '0 18px', border: `1px solid #0e1a2b5c`, background: '#ffffff14', borderRadius: 4, fontFamily: NOVA, fontSize: 14, fontWeight: 700, color: C.navy, display: 'grid', placeItems: 'center' }}>Log activity</div>
        <div style={{ height: 43, padding: '0 18px', background: C.cobalt, borderRadius: 4, fontFamily: NOVA, fontSize: 14, fontWeight: 700, color: C.white, display: 'grid', placeItems: 'center' }}>Save changes</div>
      </div>
    </div>
  );
}

function LogModal({ ui }) {
  const p = ui.logP;
  const typed = NOTE_TEXT.slice(0, Math.round(NOTE_TEXT.length * clamp(ui.typeP || 0, 0, 1)));
  return (
    <div style={{
      position: 'absolute', left: 490, top: 230, width: 620, height: 580, background: C.white,
      borderRadius: 10, borderTop: `5px solid ${C.berry}`, overflow: 'hidden',
      boxShadow: '0 42px 85px #0e1a2b52, 0 12px 28px #0e1a2b1a',
      opacity: p, transform: `translateY(${(1 - p) * 24}px) scale(${0.985 + 0.015 * p})`
    }}>
      <div style={{ padding: '28px 34px 0' }}>
        <Label size={11}>Golden Valley Community Loan Fund</Label>
        <div style={{ fontFamily: SERA, fontSize: 38, lineHeight: 1.02, letterSpacing: '-.04em', color: C.navy, marginTop: 12 }}>Log activity</div>
      </div>
      <div style={{ position: 'absolute', left: 34, top: 130, width: 552, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div>
          <Label size={11} style={{ marginBottom: 7 }}>Type</Label>
          <div style={{ height: 46, border: `1px solid ${C.line}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', fontFamily: NOVA, fontSize: 15, color: C.navy }}><span>Meeting</span><span style={{ color: C.slateLight, fontSize: 12 }}>▾</span></div>
        </div>
        <div>
          <Label size={11} style={{ marginBottom: 7 }}>Date</Label>
          <div style={{ height: 46, border: `1px solid ${C.line}`, borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 14px', fontFamily: NOVA, fontSize: 15, color: C.navy }}>07 / 27 / 2026</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 34, top: 226, width: 552 }}>
        <Label size={11} style={{ marginBottom: 7 }}>What happened</Label>
        <div style={{
          minHeight: 104, border: `1px solid ${ui.noteFocus ? C.pool : C.line}`, borderRadius: 4, padding: '12px 14px',
          fontFamily: NOVA, fontSize: 15, lineHeight: 1.5, color: typed ? C.navy : C.slateLight,
          outline: ui.noteFocus ? `3px solid ${C.pool}` : 'none', outlineOffset: 2
        }}>
          {typed || 'Summary of the conversation'}
          {ui.noteFocus && ui.caret ? <span style={{ display: 'inline-block', width: 2, height: 17, background: C.cobalt, transform: 'translateY(3px)', marginLeft: 1 }} /> : null}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 34, top: 386, width: 268 }}>
        <Label size={11} style={{ marginBottom: 7 }}>Next follow-up</Label>
        <div style={{ height: 46, border: `1px solid ${C.line}`, borderRadius: 4, display: 'flex', alignItems: 'center', padding: '0 14px', fontFamily: NOVA, fontSize: 15, color: ui.dateSet ? C.navy : C.slateLight }}>{ui.dateSet ? '08 / 10 / 2026' : 'mm / dd / yyyy'}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, borderTop: `1px solid ${C.line}`, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, padding: '0 34px' }}>
        <div style={{ height: 43, padding: '0 18px', border: `1px solid #0e1a2b5c`, background: '#ffffff14', borderRadius: 4, fontFamily: NOVA, fontSize: 14, fontWeight: 700, color: C.navy, display: 'grid', placeItems: 'center' }}>Cancel</div>
        <div style={{ height: 43, padding: '0 18px', background: C.cobalt, borderRadius: 4, fontFamily: NOVA, fontSize: 14, fontWeight: 700, color: C.white, display: 'grid', placeItems: 'center' }}>Save activity</div>
      </div>
    </div>
  );
}

function Window({ ui }) {
  const tabs = ['Dashboard', 'Pipeline', 'Partners', 'Activity'];
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: WIN.w, height: WIN.h, background: C.paper, borderRadius: 10, overflow: 'hidden' }}>
      {/* chrome */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: CH, background: '#e7e9ec', borderBottom: '1px solid #00000014', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
        {['#f0655a', '#f4bf4f', '#61c554'].map(c => <span key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
        <div style={{ margin: '0 auto', background: '#fbfbfc', border: '1px solid #0000001a', borderRadius: 4, padding: '4px 90px', fontFamily: NOVA, fontSize: 12, color: C.slateLight }}>crm.norcalsbdc.org</div>
      </div>
      {/* app header */}
      <div style={{ position: 'absolute', left: 0, top: CH, width: '100%', height: 64, background: C.navy, display: 'flex', alignItems: 'center', gap: 30, padding: '0 34px' }}>
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontFamily: SERA, fontSize: 21, letterSpacing: '-.035em', color: C.white }}>NorCal <span style={{ fontWeight: 700 }}>SBDC</span></div>
          <div style={{ marginTop: 5, paddingTop: 5, borderTop: '1px solid #ffffff33', fontFamily: NOVA, fontSize: 8.5, fontWeight: 800, letterSpacing: '.19em', color: C.pool }}>PARTNERSHIP CRM</div>
        </div>
        <div style={{ display: 'flex', alignSelf: 'stretch' }}>
          {tabs.map(t => (
            <div key={t} style={{
              display: 'grid', placeItems: 'center', margin: '0 10px', padding: '0 4px',
              fontFamily: NOVA, fontSize: 11.5, fontWeight: 800, letterSpacing: '.13em', textTransform: 'uppercase',
              color: ui.tab === t ? C.white : '#ffffffa8',
              borderBottom: ui.tab === t ? `2px solid ${C.pool}` : '2px solid transparent'
            }}>{t}</div>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: NOVA, fontSize: 10, fontWeight: 800, letterSpacing: '.17em', color: C.pool, border: '1px solid #8fc5d959', padding: '6px 11px', borderRadius: 3 }}>SAMPLE DATA</span>
          <span style={{ height: 43, padding: '0 18px', background: C.pool, color: C.navy, borderRadius: 4, fontFamily: NOVA, fontSize: 14, fontWeight: 700, display: 'grid', placeItems: 'center' }}>Add partner</span>
        </div>
      </div>

      {ui.tab === 'Pipeline' ? <Board ui={ui} /> : <Dashboard ui={ui} />}

      {ui.detailP > 0 || ui.logP > 0 ? (
        <div style={{ position: 'absolute', inset: 0, background: `rgba(15,28,45,${0.55 * Math.max(ui.detailP, ui.logP)})`, backdropFilter: `blur(${7 * Math.max(ui.detailP, ui.logP)}px)` }} />
      ) : null}
      {ui.detailP > 0 ? <DetailModal ui={ui} /> : null}
      {ui.logP > 0 ? <LogModal ui={ui} /> : null}

      {ui.toastP > 0 ? (
        <div style={{
          position: 'absolute', left: '50%', bottom: 40, transform: `translateX(-50%) translateY(${(1 - ui.toastP) * 22}px)`,
          opacity: ui.toastP, background: C.navy, color: C.white, fontFamily: NOVA, fontSize: 15, fontWeight: 700,
          padding: '15px 26px', borderRadius: 4, boxShadow: '0 18px 40px #0e1a2b52'
        }}>{ui.toast}</div>
      ) : null}
    </div>
  );
}

/* ── cursor ────────────────────────────────────────────────────── */
function Cursor({ x, y, s, click }) {
  const inv = 1 / s;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `scale(${inv})`, transformOrigin: '0 0', pointerEvents: 'none' }}>
      {click > 0 ? (
        <div style={{
          position: 'absolute', left: -6, top: -6, width: 12 + 74 * click, height: 12 + 74 * click,
          marginLeft: -(6 + 37 * click), marginTop: -(6 + 37 * click),
          border: `3px solid ${C.pool}`, borderRadius: '50%', opacity: 0.85 * (1 - click)
        }} />
      ) : null}
      <div style={{ transform: `scale(${1 - 0.14 * click})`, transformOrigin: '2px 2px' }}>
        <svg width="30" height="42" viewBox="0 0 30 42" style={{ display: 'block', filter: 'drop-shadow(0 3px 6px rgba(14,26,43,.45))' }}>
          <path d="M2 2 L2 30 L9.5 23.5 L14.5 35.5 L19.5 33.2 L14.7 21.7 L24 21 Z" fill="#fdfdfd" stroke="#0f1c2d" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

/* ── caption (one element, one at a time) ──────────────────────── */
function Caption({ label, text, o }) {
  if (o <= 0.001) return null;
  return (
    <React.Fragment>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 420, opacity: o, background: 'linear-gradient(to top, rgba(7,13,22,.94) 0%, rgba(7,13,22,.82) 34%, rgba(7,13,22,0) 100%)' }} />
    <div style={{ position: 'absolute', left: 108, bottom: 74, opacity: o, transform: `translateY(${(1 - o) * 16}px)`, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <span style={{ width: 40, height: 4, background: C.berry }} />
        <span style={{ fontFamily: NOVA, fontSize: 14, fontWeight: 800, letterSpacing: '.19em', textTransform: 'uppercase', color: C.pool }}>{label}</span>
      </div>
      <div style={{ fontFamily: SERA, fontSize: 50, lineHeight: 1.02, letterSpacing: '-.04em', color: C.white, textShadow: '0 6px 30px rgba(6,12,22,.7)' }}>{text}</div>
    </div>
    </React.Fragment>
  );
}

/* ── bookend card (opening + closing, identical → seamless loop) ─ */
function TitleCard({ o }) {
  if (o <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.navy, opacity: o, display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center', transform: `translateY(${(1 - o) * -14}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center', marginBottom: 26 }}>
          <span style={{ width: 44, height: 4, background: C.berry }} />
          <span style={{ fontFamily: NOVA, fontSize: 15, fontWeight: 800, letterSpacing: '.21em', color: C.pool }}>NORCAL SBDC</span>
          <span style={{ width: 44, height: 4, background: C.berry }} />
        </div>
        <div style={{ fontFamily: SERA, fontSize: 104, lineHeight: .92, letterSpacing: '-.05em', color: C.white }}>Partnership CRM</div>
        <div style={{ fontFamily: SERA, fontSize: 40, letterSpacing: '-.03em', color: C.pool, marginTop: 26 }}>Your Business, Better.</div>
      </div>
    </div>
  );
}

/* ── the persistent stage ──────────────────────────────────────── */
function Shot({ cam, cursor, ui, caption, title }) {
  const sc = useScene();
  const s = cam.s;
  const stamp = `${Math.round((SCENE_STARTS[sc.index] || 0) + sc.localTime)}s · ${sc.scene.name}`;
  return (
    <div data-screen-label={stamp} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'radial-gradient(120% 90% at 50% 0%, #17293f 0%, #0b1420 60%, #070d16 100%)' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: WIN.w, height: WIN.h, transformOrigin: '0 0', transform: `translate(${W / 2 - cam.x * s}px, ${H / 2 - cam.y * s}px) scale(${s})`, filter: 'drop-shadow(0 60px 120px rgba(0,0,0,.55))' }}>
        <Window ui={ui} />
        {cursor ? <Cursor x={cursor.x} y={cursor.y} s={s} click={cursor.click || 0} /> : null}
      </div>
      {caption ? <Caption {...caption} /> : null}
      <TitleCard o={title || 0} />
    </div>
  );
}

const baseUI = (over) => Object.assign({
  tab: 'Dashboard', metricsP: 1, sweep: 0, hoverRow: -1,
  detailP: 0, logP: 0, typeP: 0, noteFocus: false, caret: false, dateSet: false,
  stageFocus: false, stagePicked: false, logged: false,
  toast: '', toastP: 0, boardHighlight: 0
}, over || {});

/* ═══ SCENES ═══════════════════════════════════════════════════ */

// 1 · Open (6s) — title card wipes off, dashboard revealed, metrics count up
function SceneOpen() {
  const { localTime: t } = useScene();
  const title = 1 - MOTION.enter(t, 2.2, 1.1);
  const cam = MOTION.track([{ t: 2.2, ...CAM.wideLow }, { t: 6, ...CAM.wide }], t);
  const mp = MOTION.enter(t, 1.5, 1.9);
  return <Shot cam={cam} ui={baseUI({ metricsP: mp })} title={title} />;
}

// 2 · Portfolio (8s) — push into the metric strip, rules draw under each label
function ScenePortfolio() {
  const { localTime: t } = useScene();
  const cam = MOTION.track([{ t: 0, ...CAM.wide }, { t: 2.4, ...CAM.metrics }, { t: 8, x: 800, y: 382, s: 1.22 }], t);
  const o = MOTION.enter(t, 0.5, 0.8) * (1 - MOTION.enter(t, 6.6, 0.9));
  return <Shot cam={cam} ui={baseUI({ sweep: MOTION.enter(t, 2.2, 3.0, Easing.linear) })}
    caption={{ label: 'The portfolio', text: 'Every partnership, one number at a time.', o }} />;
}

// 3 · Attention (9s) — pan to the overdue list, cursor arrives, row lights up
function SceneAttention() {
  const { localTime: t } = useScene();
  const cam = MOTION.track([{ t: 0, x: 800, y: 382, s: 1.22 }, { t: 2.2, ...CAM.attention }, { t: 9, x: 415, y: 601, s: 1.78 }], t);
  const cur = MOTION.track([{ t: 1.4, x: 900, y: 880 }, { t: 3.4, ...HIT.attnRow }], t);
  const o = MOTION.enter(t, 0.6, 0.8) * (1 - MOTION.enter(t, 7.3, 0.9));
  return <Shot cam={cam} cursor={cur} ui={baseUI({ hoverRow: t > 3.3 ? 1 : -1 })}
    caption={{ label: 'Needs attention', text: 'Three follow-ups have gone past due.', o }} />;
}

// 4 · Partner (9s) — click the row, the record rises, camera reads it
function ScenePartner() {
  const { localTime: t } = useScene();
  const click = MOTION.pop(t, 0.7);
  const dp = MOTION.enter(t, 0.9, 0.7);
  const base = MOTION.track([
    { t: 0, x: 415, y: 601, s: 1.78 }, { t: 1.0, ...CAM.modal },
    { t: 3.6, ...CAM.modalTop }, { t: 6.4, ...CAM.modal }, { t: 8.0, ...CAM.modalFoot }, { t: 9, ...CAM.modalFoot }
  ], t);
  const cam = { x: base.x, y: base.y, s: base.s * (1 + 0.05 * click) };
  const cur = MOTION.track([{ t: 0, ...HIT.attnRow }, { t: 1.1, ...HIT.attnRow }, { t: 2.4, x: 700, y: 640 }, { t: 7.4, x: 760, y: 880 }, { t: 8.6, ...HIT.logBtn }], t);
  const o = MOTION.enter(t, 1.6, 0.8) * (1 - MOTION.enter(t, 5.4, 0.9));
  return <Shot cam={cam} cursor={{ ...cur, click }} ui={baseUI({ hoverRow: 1, detailP: dp })}
    caption={{ label: 'The record', text: 'Contact, history and next step in one card.', o }} />;
}

// 5 · Log (11s) — log activity, type the note, save, toast
function SceneLog() {
  const { localTime: t } = useScene();
  const clickOpen = MOTION.pop(t, 0.5);
  const clickSave = MOTION.pop(t, 8.3);
  const lp = MOTION.enter(t, 0.7, 0.6) * (1 - MOTION.enter(t, 8.6, 0.4));
  const base = MOTION.track([
    { t: 0, ...CAM.modalFoot }, { t: 1.2, ...CAM.log }, { t: 2.6, ...CAM.logNote },
    { t: 7.2, ...CAM.logNote }, { t: 8.0, ...CAM.logFoot }, { t: 9.4, ...CAM.modal }, { t: 11, ...CAM.modal }
  ], t);
  const punch = Math.max(clickOpen, clickSave);
  const cam = { x: base.x, y: base.y, s: base.s * (1 + 0.05 * punch) };
  const cur = MOTION.track([{ t: 0, ...HIT.logBtn }, { t: 0.9, ...HIT.logBtn }, { t: 2.2, ...HIT.noteBox }, { t: 7.4, ...HIT.noteBox }, { t: 8.2, ...HIT.saveAct }, { t: 10.4, x: 900, y: 640 }], t);
  const typeP = clamp((t - 2.6) / 3.6, 0, 1);
  const toastP = MOTION.enter(t, 8.7, 0.35) * (1 - MOTION.enter(t, 10.2, 0.6));
  const o = MOTION.enter(t, 3.0, 0.8) * (1 - MOTION.enter(t, 7.0, 0.9));
  return <Shot cam={cam} cursor={{ ...cur, click: punch }}
    ui={baseUI({
      detailP: 1, logP: lp, typeP, noteFocus: t > 2.4 && t < 8.2, caret: Math.floor(t * 2) % 2 === 0,
      dateSet: t > 7.6, logged: t > 8.6, toast: 'Activity logged for Golden Valley Community Loan Fund', toastP
    })}
    caption={{ label: 'Log it once', text: 'The note lands on the record, not in an inbox.', o }} />;
}

// 6 · Advance (10s) — move the stage, save, jump to the pipeline board
function SceneAdvance() {
  const { localTime: t } = useScene();
  const clickStage = MOTION.pop(t, 1.5);
  const clickSave = MOTION.pop(t, 3.9);
  const clickTab = MOTION.pop(t, 6.2);
  const punch = Math.max(clickStage, clickSave, clickTab);
  const onBoard = t > 6.35;
  const base = MOTION.track([
    { t: 0, ...CAM.modal }, { t: 1.2, ...CAM.stageSel }, { t: 3.4, ...CAM.modalFoot },
    { t: 5.2, ...CAM.tabs }, { t: 6.4, ...CAM.tabs }, { t: 7.6, ...CAM.boardCol }, { t: 10, x: 940, y: 448, s: 1.52 }
  ], t);
  const cam = { x: base.x, y: base.y, s: base.s * (1 + 0.05 * punch) };
  const cur = MOTION.track([
    { t: 0, x: 900, y: 640 }, { t: 1.3, ...HIT.stageSel }, { t: 3.7, ...HIT.saveDet },
    { t: 6.0, ...HIT.pipeTab }, { t: 7.6, ...HIT.pipeTab }, { t: 9.0, x: 930, y: 392 }
  ], t);
  const dp = t < 4.1 ? 1 : 1 - MOTION.enter(t, 4.1, 0.35);
  const toastP = MOTION.enter(t, 4.3, 0.35) * (1 - MOTION.enter(t, 6.0, 0.5));
  const o = MOTION.enter(t, 0.4, 0.8) * (1 - MOTION.enter(t, 3.2, 0.7));
  return <Shot cam={cam} cursor={{ ...cur, click: punch }}
    ui={baseUI({
      tab: onBoard ? 'Pipeline' : 'Dashboard', detailP: dp, logged: true,
      stageFocus: t > 1.4 && t < 3.6, stagePicked: t > 1.7,
      toast: 'Saved Golden Valley Community Loan Fund', toastP,
      boardHighlight: MOTION.enter(t, 7.2, 1.2)
    })}
    caption={{ label: 'One change', text: 'In discussion becomes an agreement.', o }} />;
}

// 7 · Close (7s) — pull back over the board, bookend card returns
function SceneClose() {
  const { localTime: t } = useScene();
  const cam = MOTION.track([{ t: 0, x: 940, y: 448, s: 1.52 }, { t: 3.4, ...CAM.board }, { t: 7, x: 800, y: 545, s: 0.97 }], t);
  const o = MOTION.enter(t, 0.5, 0.8) * (1 - MOTION.enter(t, 3.0, 0.8));
  const title = MOTION.enter(t, 4.2, 1.2);
  return <Shot cam={cam} ui={baseUI({ tab: 'Pipeline', logged: true, boardHighlight: 1 - MOTION.enter(t, 0, 2.4) })}
    caption={{ label: 'Your next step', text: 'Nothing slips. Nobody re-asks.', o }} title={title} />;
}

window.CRMVideo = function CRMVideo() {
  return (
    <window.SceneStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg="#070d16">
      {{
        Open: SceneOpen, Portfolio: ScenePortfolio, Attention: SceneAttention,
        Partner: ScenePartner, Log: SceneLog, Advance: SceneAdvance, Close: SceneClose
      }}
    </window.SceneStage>
  );
};
