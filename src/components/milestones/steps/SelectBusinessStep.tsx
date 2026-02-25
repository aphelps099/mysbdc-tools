'use client';

import type { MilestoneData, NeoserraClientOption } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  data: MilestoneData;
  onChange: (patch: Partial<MilestoneData>) => void;
  onNext: () => void;
  onBack: () => void;
  clients: NeoserraClientOption[];
}

export default function SelectBusinessStep({ data, onChange, onNext, onBack, clients }: Props) {
  const { t } = useLanguage();

  const handleSelect = (client: NeoserraClientOption) => {
    onChange({
      clientId: client.id,
      clientPublicId: client.clientId,
      clientName: client.company,
      initialFtEmps: client.ftEmps,
      initialPtEmps: client.ptEmps,
      initialGrossSales: client.grossSales,
      clientCenterId: client.centerId || '',
      counselorId: client.counselorId || '',
    });
    setTimeout(onNext, 250);
  };

  return (
    <div className="s641-step">
      <h2 className="s641-question">{t('biz.title')}</h2>
      <p className="s641-subtitle">{t('biz.subtitle')}</p>

      <div className="s641-fields" style={{ gap: 12 }}>
        {clients.map((client) => (
          <button
            key={client.id}
            className={`s641-card ${data.clientId === client.id ? 'selected' : ''}`}
            onClick={() => handleSelect(client)}
          >
            <div className="s641-card-check">
              {data.clientId === client.id && (
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className="s641-card-content">
              <div className="s641-card-title">{client.company}</div>
              <div className="s641-card-desc">{client.clientId}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="s641-nav">
        <button className="s641-btn s641-btn-back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('nav.back')}
        </button>
        <div />
      </div>
    </div>
  );
}
