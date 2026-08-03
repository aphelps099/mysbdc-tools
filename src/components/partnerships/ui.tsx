'use client';

import { useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════
   Partnership CRM — shared primitives.
   Btn: the three handoff button variants (primary /
   secondary / pool). The "arrow" is CSS, not an icon.
   ModalScrim: scrim + dialog chrome with focus trap,
   Esc-to-close, and focus return to the invoking element.
   ═══════════════════════════════════════════════════════ */

export function Btn({
  variant,
  small,
  arrow,
  type = 'button',
  onClick,
  children,
}: {
  variant: 'primary' | 'secondary' | 'pool';
  small?: boolean;
  arrow?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`pcrm-btn pcrm-btn--${variant}${small ? ' pcrm-btn--sm' : ''}`}
    >
      {children}
      {arrow && (
        <span className="pcrm-btn-arrow" aria-hidden="true">
          →
        </span>
      )}
    </button>
  );
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ModalScrim({
  label,
  widthClass = '',
  onClose,
  children,
}: {
  label: string;
  widthClass?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusables = () =>
      dialog ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];

    (focusables()[0] ?? dialog)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="pcrm-scrim" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`pcrm-modal ${widthClass}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" className="pcrm-close" onClick={onClose} aria-label="Close">
      ✕
    </button>
  );
}
