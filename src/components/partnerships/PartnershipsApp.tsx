'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { nextPartnerId, normalizeUrl, todayISO } from './logic';
import { SEED_PARTNERS } from './seed';
import { TABS, type ModalId, type Partner, type SortKey, type ViewId } from './types';
import { track } from './track';
import { Btn } from './ui';
import { DashboardView } from './views/DashboardView';
import { PipelineBoard } from './views/PipelineBoard';
import { PartnersTable } from './views/PartnersTable';
import { ActivityLog } from './views/ActivityLog';
import { AddPartnerModal, type AddPartnerValues } from './modals/AddPartnerModal';
import { LogActivityModal, type LogActivityValues } from './modals/LogActivityModal';
import { PartnerDetailModal } from './modals/PartnerDetailModal';
import './partnerships.css';

/* ═══════════════════════════════════════════════════════
   Partnership CRM — app shell.
   Sticky navy header + tabs; four views; three modals;
   toast. Data loads from /api/partnerships (SAMPLE_DATA
   seed until the first save) and every mutation PUTs the
   full collection back.
   ═══════════════════════════════════════════════════════ */

const TOAST_MS = 2600;

const VIEW_IDS: ViewId[] = ['dashboard', 'pipeline', 'partners', 'activity'];

function initialView(): ViewId {
  if (typeof window !== 'undefined') {
    const v = new URLSearchParams(window.location.search).get('view');
    if (v && (VIEW_IDS as string[]).includes(v)) return v as ViewId;
  }
  return 'dashboard';
}

export function PartnershipsApp() {
  const [partners, setPartners] = useState<Partner[]>(SEED_PARTNERS);
  const [sampleData, setSampleData] = useState(true);
  const [view, setView] = useState<ViewId>('dashboard');

  // partners table state
  const [q, setQ] = useState('');
  const [fType, setFType] = useState('');
  const [fStage, setFStage] = useState('');
  const [fOwner, setFOwner] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  // pipeline + activity filters
  const [pipeType, setPipeType] = useState('');
  const [pipeOwner, setPipeOwner] = useState('');
  const [actType, setActType] = useState('');

  // modals + toast
  const [modal, setModal] = useState<ModalId>(null);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [dStage, setDStage] = useState('');
  const [dOwner, setDOwner] = useState('');
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = todayISO();

  useEffect(() => {
    const v = initialView();
    setView(v);
    track('app_open', { view: v });
    let cancelled = false;
    fetch('/api/partnerships')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || !Array.isArray(data.partners)) return;
        setPartners(data.partners);
        setSampleData(Boolean(data.sampleData));
      })
      .catch(() => {
        /* keep the local seed — the UI must run before the backend exists */
      });
    return () => {
      cancelled = true;
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), TOAST_MS);
  }, []);

  const persist = useCallback(
    (next: Partner[]) => {
      setPartners(next);
      fetch('/api/partnerships', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partners: next }),
      })
        .then((res) => {
          if (res.ok) setSampleData(false);
          else showToast('Changes are local only — save failed');
        })
        .catch(() => showToast('Changes are local only — save failed'));
    },
    [showToast],
  );

  const switchView = useCallback((v: ViewId) => {
    setView(v);
    track('view', { view: v });
  }, []);

  const openPartner = useCallback(
    (id: number) => {
      const p = partners.find((x) => x.id === id);
      if (!p) return;
      setCurrentId(id);
      setDStage(p.stage);
      setDOwner(p.owner);
      setModal('detail');
      track('partner_open', { id: p.id, name: p.name });
    },
    [partners],
  );

  const closeModal = useCallback(() => setModal(null), []);

  const current = currentId === null ? null : (partners.find((p) => p.id === currentId) ?? null);

  const saveDetail = () => {
    if (!current) return;
    const next = partners.map((p) =>
      p.id === current.id ? { ...p, stage: dStage as Partner['stage'], owner: dOwner } : p,
    );
    persist(next);
    setModal(null);
    showToast(`Saved ${current.name}`);
    track('partner_save', { id: current.id, name: current.name });
  };

  const submitLog = (values: LogActivityValues) => {
    if (!current) return;
    const next = partners.map((p) => {
      if (p.id !== current.id) return p;
      const updated: Partner = {
        ...p,
        activities: [
          ...p.activities,
          { date: values.date, type: values.type as Partner['activities'][number]['type'], note: values.note },
        ],
      };
      if (values.date > (p.lastContact || '')) updated.lastContact = values.date;
      if (values.nextFollowUp) updated.nextFollowUp = values.nextFollowUp;
      return updated;
    });
    persist(next);
    setModal(null);
    showToast(`Activity logged for ${current.name}`);
    track('activity_log', { id: current.id, name: current.name, type: values.type });
  };

  const submitAdd = (values: AddPartnerValues) => {
    const rec: Partner = {
      id: nextPartnerId(partners),
      name: values.name,
      type: values.type as Partner['type'],
      subtype: values.subtype || 'Organization',
      city: values.city || '—',
      center: values.center || 'Lead Center',
      contact: values.contact || '—',
      contactTitle: values.contactTitle,
      email: values.email,
      phone: values.phone,
      linkedin: normalizeUrl(values.linkedin),
      stage: values.stage as Partner['stage'],
      owner: values.owner,
      referrals: 0,
      lastContact: today,
      nextFollowUp: values.nextFollowUp,
      notes: values.notes,
      activities: [{ date: today, type: 'Email', note: 'Partner added to CRM.' }],
    };
    persist([...partners, rec]);
    setModal(null);
    showToast(`Added ${rec.name}`);
    track('partner_add', { id: rec.id, name: rec.name });
  };

  return (
    <div className="pcrm">
      <header className="pcrm-header">
        <div className="pcrm-lockup">
          <span className="pcrm-lockup-name">
            NorCal <b>SBDC</b>
          </span>
          <span className="pcrm-lockup-sub">Partnership CRM</span>
        </div>
        <nav className="pcrm-tabs" aria-label="Views">
          {TABS.map((t) => (
            <button
              type="button"
              key={t.id}
              className={`pcrm-tab${view === t.id ? ' is-active' : ''}`}
              aria-current={view === t.id ? 'page' : undefined}
              onClick={() => switchView(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="pcrm-header-spacer" />
        {sampleData && <span className="pcrm-sample-chip">Sample data</span>}
        <Btn variant="pool" small onClick={() => setModal('add')}>
          Add partner
        </Btn>
      </header>

      <main className="pcrm-main">
        {view === 'dashboard' && (
          <DashboardView
            partners={partners}
            today={today}
            onOpenPartner={openPartner}
            onAdd={() => setModal('add')}
            onGoPipeline={() => switchView('pipeline')}
          />
        )}
        {view === 'pipeline' && (
          <PipelineBoard
            partners={partners}
            today={today}
            pipeType={pipeType}
            pipeOwner={pipeOwner}
            onPipeType={setPipeType}
            onPipeOwner={setPipeOwner}
            onOpenPartner={openPartner}
          />
        )}
        {view === 'partners' && (
          <PartnersTable
            partners={partners}
            today={today}
            q={q}
            fType={fType}
            fStage={fStage}
            fOwner={fOwner}
            sortKey={sortKey}
            sortDir={sortDir}
            onQ={setQ}
            onFType={setFType}
            onFStage={setFStage}
            onFOwner={setFOwner}
            onSort={(key) => {
              if (key === sortKey) setSortDir((d) => (d === 1 ? -1 : 1));
              else {
                setSortKey(key);
                setSortDir(1);
              }
            }}
            onOpenPartner={openPartner}
          />
        )}
        {view === 'activity' && (
          <ActivityLog
            partners={partners}
            today={today}
            actType={actType}
            onActType={setActType}
            onOpenPartner={openPartner}
          />
        )}
      </main>

      {modal === 'detail' && current && (
        <PartnerDetailModal
          partner={current}
          today={today}
          dStage={dStage}
          dOwner={dOwner}
          onDStage={setDStage}
          onDOwner={setDOwner}
          onSave={saveDetail}
          onLogActivity={() => setModal('log')}
          onClose={closeModal}
        />
      )}
      {modal === 'add' && <AddPartnerModal onSubmit={submitAdd} onClose={closeModal} />}
      {modal === 'log' && current && (
        <LogActivityModal
          partnerName={current.name}
          today={today}
          onSubmit={submitLog}
          onClose={closeModal}
        />
      )}

      {toast && (
        <div className="pcrm-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}
