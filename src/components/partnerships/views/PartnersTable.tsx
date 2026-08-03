'use client';

import { filterPartners, fmt, isOverdue, partnersToCsv, sortPartners, todayISO } from '../logic';
import { track } from '../track';
import {
  COLUMNS,
  OWNERS,
  STAGES,
  TYPES,
  type Partner,
  type PartnerType,
  type SortKey,
} from '../types';

/* ═══════════════════════════════════════════════════════
   Partners — filterable, sortable table. Header click (or
   Enter/Space — headers are real buttons) sorts asc, click
   again to flip; active column goes navy with ↑/↓. Rows
   open the detail modal.
   ═══════════════════════════════════════════════════════ */

export function PartnersTable({
  partners,
  today,
  q,
  fType,
  fStage,
  fOwner,
  sortKey,
  sortDir,
  onQ,
  onFType,
  onFStage,
  onFOwner,
  onSort,
  onOpenPartner,
}: {
  partners: Partner[];
  today: string;
  q: string;
  fType: string;
  fStage: string;
  fOwner: string;
  sortKey: SortKey;
  sortDir: 1 | -1;
  onQ: (v: string) => void;
  onFType: (v: string) => void;
  onFStage: (v: string) => void;
  onFOwner: (v: string) => void;
  onSort: (key: SortKey) => void;
  onOpenPartner: (id: number) => void;
}) {
  const rows = sortPartners(filterPartners(partners, { q, fType, fStage, fOwner }), sortKey, sortDir);

  const exportCsv = () => {
    const blob = new Blob([partnersToCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partners-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    track('csv_export', { rows: rows.length });
  };

  return (
    <div>
      <div className="pcrm-filters">
        <input
          type="search"
          className="pcrm-input pcrm-search"
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="Search partners, contacts, cities"
          aria-label="Search partners"
        />
        <select
          className="pcrm-input"
          value={fType}
          onChange={(e) => onFType(e.target.value)}
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          {(Object.keys(TYPES) as PartnerType[]).map((t) => (
            <option value={t} key={t}>
              {TYPES[t].label}
            </option>
          ))}
        </select>
        <select
          className="pcrm-input"
          value={fStage}
          onChange={(e) => onFStage(e.target.value)}
          aria-label="Filter by stage"
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option value={s} key={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="pcrm-input"
          value={fOwner}
          onChange={(e) => onFOwner(e.target.value)}
          aria-label="Filter by owner"
        >
          <option value="">All owners</option>
          {OWNERS.map((o) => (
            <option value={o} key={o}>
              {o}
            </option>
          ))}
        </select>
        <span className="pcrm-count">
          {rows.length} of {partners.length} partners
        </span>
        <button type="button" className="pcrm-btn pcrm-btn--secondary pcrm-btn--sm" onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      <div className="pcrm-tablewrap">
        <table className="pcrm-table">
          <thead>
            <tr>
              {COLUMNS.map((c) => {
                const sorted = sortKey === c.key;
                return (
                  <th
                    className={`pcrm-th${sorted ? ' is-sorted' : ''}`}
                    key={c.key}
                    aria-sort={sorted ? (sortDir === 1 ? 'ascending' : 'descending') : undefined}
                  >
                    <button type="button" className="pcrm-th-btn" onClick={() => onSort(c.key)}>
                      {c.label}
                      {sorted ? (sortDir === 1 ? '  ↑' : '  ↓') : ''}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                className="pcrm-tr"
                key={p.id}
                tabIndex={0}
                onClick={() => onOpenPartner(p.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenPartner(p.id);
                  }
                }}
              >
                <td className="pcrm-td">
                  <div className="pcrm-org">
                    <span className="pcrm-org-bar" style={{ background: TYPES[p.type].color }} />
                    <div>
                      <div className="pcrm-org-name">{p.name}</div>
                      <div className="pcrm-cell-sub">
                        {p.subtype} · {p.city}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="pcrm-td">
                  <span
                    className="pcrm-chip"
                    style={{ color: TYPES[p.type].color, background: `${TYPES[p.type].color}14` }}
                  >
                    {TYPES[p.type].short}
                  </span>
                </td>
                <td className="pcrm-td">
                  <span className="pcrm-chip pcrm-chip--stage">{p.stage}</span>
                </td>
                <td className="pcrm-td">
                  <div>{p.contact}</div>
                  <div className="pcrm-cell-sub">{p.contactTitle}</div>
                </td>
                <td className="pcrm-td">{p.owner}</td>
                <td className="pcrm-td pcrm-td--num">{p.referrals || 0}</td>
                <td className="pcrm-td pcrm-td--num">{fmt(p.lastContact, today)}</td>
                <td
                  className={`pcrm-td pcrm-td--num${isOverdue(p, today) ? ' pcrm-td--due-overdue' : ''}`}
                >
                  {fmt(p.nextFollowUp, today)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="pcrm-table-empty">No partners match these filters.</div>
        )}
      </div>
    </div>
  );
}
