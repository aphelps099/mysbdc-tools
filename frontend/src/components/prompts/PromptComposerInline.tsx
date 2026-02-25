'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import Modal from '../ui/Modal';
import { uploadDocument } from '@/lib/api';
import type { Prompt, PromptBodyElement } from '@/lib/types';

/* ═══════════════════════════════════════════════════════════════
   Props
   ═══════════════════════════════════════════════════════════════ */

interface PromptComposerInlineProps {
  open: boolean;
  prompt: Prompt;
  onClose: () => void;
  onSend: (populatedPrompt: string) => void;
}

/* ═══════════════════════════════════════════════════════════════
   Color tokens  (inline — no extra CSS file)
   ═══════════════════════════════════════════════════════════════ */

const C = {
  // Token states
  unfilled:    { bg: '#eef2ff', border: '#b4c6fc', text: '#4a6fa5' },
  editing:     { bg: '#fef9ec', border: '#fbbf24', text: '#92400e' },
  filled:      { bg: '#ecfdf5', border: '#86efac', text: '#166534' },
  // Pill states
  pillIdle:    { bg: 'transparent', border: 'var(--p-line, #e7e2da)', text: 'var(--p-ink, #1a1a1a)' },
  pillActive:  { bg: '#ecfdf5', border: '#86efac', text: '#166534' },
  // Upload
  uploadIdle:  { bg: '#fefce8', border: '#fde68a', text: '#92400e' },
  uploadDone:  { bg: '#ecfdf5', border: '#86efac', text: '#166534' },
  // Progress
  progressBg:  'var(--p-line, #e7e2da)',
  progressFill:'var(--p-navy, #162d50)',
};

/* ═══════════════════════════════════════════════════════════════
   Progress calculation
   ═══════════════════════════════════════════════════════════════ */

function calcProgress(
  body: PromptBodyElement[],
  values: Record<string, string>,
  files: Record<string, File>,
  multiValues: Record<string, string[]>,
): { filled: number; total: number } {
  let filled = 0;
  let total = 0;

  for (let i = 0; i < body.length; i++) {
    const el = body[i];
    switch (el.t) {
      case 'token':
      case 'pills':
        total++;
        if (values[el.id]?.trim()) filled++;
        break;
      case 'block':
        if (!el.opt) {
          total++;
          if (values[el.id]?.trim()) filled++;
        }
        break;
      case 'upload': {
        // upload is required, but satisfied if paired or-block has text
        total++;
        if (files[el.id]) {
          filled++;
        } else {
          // check if next elements are or + block with content
          const next1 = body[i + 1];
          const next2 = body[i + 2];
          if (next1?.t === 'or' && next2?.t === 'block' && values[next2.id]?.trim()) {
            filled++;
          }
        }
        break;
      }
      case 'multi':
        total++;
        if (multiValues[el.id]?.some((v) => v.trim())) filled++;
        break;
    }
  }

  return { filled, total };
}

/* ═══════════════════════════════════════════════════════════════
   Compile body → prompt string
   ═══════════════════════════════════════════════════════════════ */

function compilePrompt(
  body: PromptBodyElement[],
  values: Record<string, string>,
  files: Record<string, File>,
  multiValues: Record<string, string[]>,
): string {
  const parts: string[] = [];

  for (const el of body) {
    switch (el.t) {
      case 'text':
        parts.push(el.c);
        break;
      case 'token':
      case 'pills':
        parts.push(values[el.id]?.trim() || `[${el.label}]`);
        break;
      case 'block':
        parts.push(values[el.id]?.trim() || `[${el.label}]`);
        break;
      case 'upload':
        if (files[el.id]) {
          parts.push(`[Attached: ${files[el.id].name} — indexed for reference]`);
        }
        break;
      case 'multi': {
        const vals = (multiValues[el.id] || []).filter((v) => v.trim());
        parts.push(vals.length > 0 ? vals.join(', ') : `[${el.label}]`);
        break;
      }
      // label, or → omitted from compiled output
    }
  }

  return parts.join('');
}

/* ═══════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════ */

/* ─── InlineToken ─── */

function InlineToken({
  el,
  value,
  onChange,
  onTab,
}: {
  el: Extract<PromptBodyElement, { t: 'token' }>;
  value: string;
  onChange: (v: string) => void;
  onTab: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFilled = value.trim().length > 0;

  const colors = editing ? C.editing : isFilled ? C.filled : C.unfilled;

  const handleClick = () => {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleBlur = () => setEditing(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      setEditing(false);
      onTab();
    }
    if (e.key === 'Escape') {
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={el.ph}
        title={el.tip}
        style={{
          display: 'inline-block',
          fontFamily: 'var(--sans)',
          fontSize: 14,
          fontWeight: 400,
          lineHeight: '1.7',
          padding: '1px 8px',
          margin: '0 2px',
          borderRadius: 6,
          border: `1.5px solid ${colors.border}`,
          background: colors.bg,
          color: colors.text,
          outline: 'none',
          minWidth: 100,
          width: Math.max(100, (value.length + 2) * 8),
          maxWidth: '100%',
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={el.tip}
      style={{
        display: 'inline-block',
        fontFamily: 'var(--sans)',
        fontSize: 14,
        fontWeight: isFilled ? 500 : 400,
        lineHeight: '1.7',
        padding: '1px 8px',
        margin: '0 2px',
        borderRadius: 6,
        border: `1.5px ${isFilled ? 'solid' : 'dashed'} ${colors.border}`,
        background: colors.bg,
        color: colors.text,
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
    >
      {isFilled ? value : el.label}
    </button>
  );
}

/* ─── PillSelector ─── */

function PillSelector({
  el,
  value,
  onChange,
}: {
  el: Extract<PromptBodyElement, { t: 'pills' }>;
  value: string;
  onChange: (v: string) => void;
}) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isCustom = value.trim() !== '' && !el.opts.includes(value);

  const handlePill = (opt: string) => {
    onChange(value === opt ? '' : opt);
    setCustomOpen(false);
  };

  const handleCustomClick = () => {
    setCustomOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange(customValue.trim());
    }
    setCustomOpen(false);
  };

  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, margin: '2px 0', verticalAlign: 'middle' }}>
      {el.opts.map((opt) => {
        const active = value === opt;
        const colors = active ? C.pillActive : C.pillIdle;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => handlePill(opt)}
            title={el.tip}
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 13,
              fontWeight: active ? 500 : 400,
              padding: '3px 12px',
              borderRadius: 20,
              border: `1.5px solid ${colors.border}`,
              background: colors.bg,
              color: colors.text,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            {opt}
          </button>
        );
      })}
      {el.custom && !customOpen && (
        <button
          type="button"
          onClick={handleCustomClick}
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 13,
            fontWeight: isCustom ? 500 : 400,
            padding: '3px 12px',
            borderRadius: 20,
            border: `1.5px ${isCustom ? 'solid' : 'dashed'} ${isCustom ? C.pillActive.border : C.pillIdle.border}`,
            background: isCustom ? C.pillActive.bg : 'transparent',
            color: isCustom ? C.pillActive.text : 'var(--p-muted, #a8a29e)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          {isCustom ? value : '+ Other'}
        </button>
      )}
      {el.custom && customOpen && (
        <input
          ref={inputRef}
          type="text"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onBlur={handleCustomSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleCustomSubmit(); }
            if (e.key === 'Escape') setCustomOpen(false);
          }}
          placeholder="Type custom…"
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 13,
            padding: '3px 12px',
            borderRadius: 20,
            border: `1.5px solid ${C.editing.border}`,
            background: C.editing.bg,
            color: C.editing.text,
            outline: 'none',
            width: 140,
          }}
        />
      )}
    </span>
  );
}

/* ─── BlockToken ─── */

function BlockToken({
  el,
  value,
  onChange,
}: {
  el: Extract<PromptBodyElement, { t: 'block' }>;
  value: string;
  onChange: (v: string) => void;
}) {
  const isFilled = value.trim().length > 0;
  const colors = isFilled ? C.filled : C.editing;

  return (
    <div style={{ margin: '6px 0' }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={el.ph}
        title={el.tip}
        rows={3}
        style={{
          width: '100%',
          fontFamily: 'var(--sans)',
          fontSize: 14,
          fontWeight: 300,
          lineHeight: '1.7',
          padding: '8px 12px',
          borderRadius: 8,
          border: `1.5px ${isFilled ? 'solid' : 'dashed'} ${colors.border}`,
          background: colors.bg,
          color: isFilled ? colors.text : 'var(--p-ink, #1a1a1a)',
          outline: 'none',
          resize: 'vertical',
          transition: 'border-color 150ms ease, background 150ms ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = C.editing.border;
          e.currentTarget.style.borderStyle = 'solid';
        }}
        onBlur={(e) => {
          const filled = e.currentTarget.value.trim().length > 0;
          e.currentTarget.style.borderColor = filled ? C.filled.border : C.editing.border;
          e.currentTarget.style.borderStyle = filled ? 'solid' : 'dashed';
        }}
      />
    </div>
  );
}

/* ─── UploadZone ─── */

function UploadZone({
  el,
  file,
  onFileChange,
}: {
  el: Extract<PromptBodyElement, { t: 'upload' }>;
  file: File | undefined;
  onFileChange: (f: File | undefined) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = file ? C.uploadDone : C.uploadIdle;

  const handleFile = async (f: File) => {
    setUploading(true);
    setError('');
    try {
      await uploadDocument(f);
      onFileChange(f);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div style={{ margin: '6px 0' }}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
        style={{
          padding: '16px 20px',
          borderRadius: 8,
          border: `1.5px dashed ${dragOver ? C.editing.border : colors.border}`,
          background: dragOver ? C.editing.bg : colors.bg,
          cursor: file ? 'default' : 'pointer',
          textAlign: 'center',
          transition: 'all 150ms ease',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={el.accept}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--p-muted)' }}>
            Uploading…
          </p>
        ) : file ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={C.uploadDone.text} strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500, color: C.uploadDone.text }}>
              {file.name}
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFileChange(undefined); }}
              style={{
                marginLeft: 4,
                padding: 2,
                borderRadius: 4,
                border: 'none',
                background: 'transparent',
                color: 'var(--p-muted)',
                cursor: 'pointer',
                fontSize: 14,
              }}
              title="Remove file"
            >
              &times;
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500, color: colors.text }}>
              {el.label}
            </p>
            <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--p-muted)', marginTop: 2 }}>
              {el.hint}
            </p>
          </>
        )}

        {error && (
          <p style={{ fontFamily: 'var(--sans)', fontSize: 12, color: '#dc2626', marginTop: 4 }}>{error}</p>
        )}
      </div>
    </div>
  );
}

/* ─── MultiField ─── */

function MultiField({
  el,
  values: rows,
  onChange,
}: {
  el: Extract<PromptBodyElement, { t: 'multi' }>;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const safeRows = rows.length > 0 ? rows : [''];

  const handleChange = (i: number, val: string) => {
    const next = [...safeRows];
    next[i] = val;
    onChange(next);
  };

  const addRow = () => {
    if (safeRows.length < el.max) {
      onChange([...safeRows, '']);
    }
  };

  const removeRow = (i: number) => {
    const next = safeRows.filter((_, idx) => idx !== i);
    onChange(next.length > 0 ? next : ['']);
  };

  return (
    <div style={{ margin: '6px 0' }}>
      {safeRows.map((val, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{
            fontFamily: 'var(--mono, monospace)',
            fontSize: 11,
            color: 'var(--p-muted)',
            width: 18,
            textAlign: 'right',
            flexShrink: 0,
          }}>
            {i + 1}.
          </span>
          <input
            type="text"
            value={val}
            onChange={(e) => handleChange(i, e.target.value)}
            placeholder={el.ph}
            title={el.tip}
            style={{
              flex: 1,
              fontFamily: 'var(--sans)',
              fontSize: 14,
              fontWeight: 300,
              lineHeight: '1.7',
              padding: '4px 10px',
              borderRadius: 6,
              border: `1.5px ${val.trim() ? 'solid' : 'dashed'} ${val.trim() ? C.filled.border : C.unfilled.border}`,
              background: val.trim() ? C.filled.bg : C.unfilled.bg,
              color: val.trim() ? C.filled.text : 'var(--p-ink)',
              outline: 'none',
              transition: 'all 150ms ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = C.editing.border;
              e.currentTarget.style.borderStyle = 'solid';
              e.currentTarget.style.background = C.editing.bg;
            }}
            onBlur={(e) => {
              const filled = e.currentTarget.value.trim().length > 0;
              e.currentTarget.style.borderColor = filled ? C.filled.border : C.unfilled.border;
              e.currentTarget.style.borderStyle = filled ? 'solid' : 'dashed';
              e.currentTarget.style.background = filled ? C.filled.bg : C.unfilled.bg;
            }}
          />
          {safeRows.length > 1 && (
            <button
              type="button"
              onClick={() => removeRow(i)}
              style={{
                padding: '0 4px',
                border: 'none',
                background: 'transparent',
                color: 'var(--p-muted)',
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1,
              }}
              title="Remove"
            >
              &times;
            </button>
          )}
        </div>
      ))}
      {safeRows.length < el.max && (
        <button
          type="button"
          onClick={addRow}
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 12,
            color: 'var(--p-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 0',
            marginLeft: 26,
          }}
        >
          + Add another (up to {el.max})
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main: PromptComposerInline
   ═══════════════════════════════════════════════════════════════ */

export default function PromptComposerInline({
  open,
  prompt,
  onClose,
  onSend,
}: PromptComposerInlineProps) {
  const body = prompt.body!;

  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [multiValues, setMultiValues] = useState<Record<string, string[]>>({});
  const [showRaw, setShowRaw] = useState(false);

  // Collect all token/pill IDs for Tab navigation
  const tokenIds = useMemo(
    () => body.filter((el): el is Extract<PromptBodyElement, { t: 'token' }> => el.t === 'token').map((el) => el.id),
    [body],
  );

  const focusNextToken = useCallback(
    (currentId: string) => {
      const idx = tokenIds.indexOf(currentId);
      if (idx >= 0 && idx < tokenIds.length - 1) {
        // Next token — simulate click by finding the button/input
        const nextId = tokenIds[idx + 1];
        const target = document.querySelector(`[data-token-id="${nextId}"]`) as HTMLElement;
        target?.click();
      }
    },
    [tokenIds],
  );

  const setValue = (id: string, v: string) =>
    setValues((prev) => ({ ...prev, [id]: v }));

  const setFile = (id: string, f: File | undefined) =>
    setFiles((prev) => {
      const next = { ...prev };
      if (f) next[id] = f;
      else delete next[id];
      return next;
    });

  const setMulti = (id: string, v: string[]) =>
    setMultiValues((prev) => ({ ...prev, [id]: v }));

  const { filled, total } = calcProgress(body, values, files, multiValues);
  const progressPct = total > 0 ? (filled / total) * 100 : 0;
  const allFilled = filled === total && total > 0;

  const compiled = useMemo(
    () => compilePrompt(body, values, files, multiValues),
    [body, values, files, multiValues],
  );

  const handleSend = () => {
    onSend(compiled);
    setValues({});
    setFiles({});
    setMultiValues({});
    onClose();
  };

  const handleCancel = () => {
    setValues({});
    setFiles({});
    setMultiValues({});
    onClose();
  };

  /* ─── Render body elements ─── */

  const renderElement = (el: PromptBodyElement, i: number) => {
    switch (el.t) {
      case 'text':
        // Render static text — preserve whitespace and newlines
        return (
          <span key={i} style={{ whiteSpace: 'pre-wrap' }}>
            {el.c}
          </span>
        );

      case 'label':
        return (
          <div key={i} style={{ width: '100%', margin: '12px 0 4px' }}>
            <span style={{
              fontFamily: 'var(--sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
              color: 'var(--p-muted, #a8a29e)',
            }}>
              {el.c}
            </span>
          </div>
        );

      case 'token':
        return (
          <span key={i} data-token-id={el.id} style={{ display: 'inline' }}>
            <InlineToken
              el={el}
              value={values[el.id] || ''}
              onChange={(v) => setValue(el.id, v)}
              onTab={() => focusNextToken(el.id)}
            />
          </span>
        );

      case 'pills':
        return (
          <PillSelector
            key={i}
            el={el}
            value={values[el.id] || ''}
            onChange={(v) => setValue(el.id, v)}
          />
        );

      case 'block':
        return (
          <BlockToken
            key={i}
            el={el}
            value={values[el.id] || ''}
            onChange={(v) => setValue(el.id, v)}
          />
        );

      case 'upload':
        return (
          <UploadZone
            key={i}
            el={el}
            file={files[el.id]}
            onFileChange={(f) => setFile(el.id, f)}
          />
        );

      case 'or':
        return (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '6px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--p-line, #e7e2da)' }} />
            <span style={{
              fontFamily: 'var(--sans)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase' as const,
              color: 'var(--p-muted, #a8a29e)',
            }}>
              or
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--p-line, #e7e2da)' }} />
          </div>
        );

      case 'multi':
        return (
          <MultiField
            key={i}
            el={el}
            values={multiValues[el.id] || ['']}
            onChange={(v) => setMulti(el.id, v)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal open={open} onClose={handleCancel} size="full">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '94vh' }}>
        {/* ─── Header ─── */}
        <div style={{
          padding: '20px 28px 16px',
          borderBottom: '1px solid var(--p-line, #e7e2da)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <span style={{
                display: 'inline-block',
                fontFamily: 'var(--mono, monospace)',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
                padding: '2px 8px',
                borderRadius: 4,
                background: 'var(--p-navy, #162d50)',
                color: 'var(--p-accent-contrast, #fff)',
                opacity: 0.85,
                marginBottom: 8,
              }}>
                {prompt.categoryLabel}
              </span>
              <h2 style={{
                fontFamily: 'var(--display)',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--p-ink, #1a1a1a)',
                margin: 0,
              }}>
                {prompt.title}
              </h2>
              <p style={{
                fontFamily: 'var(--sans)',
                fontSize: 14,
                fontWeight: 300,
                color: 'var(--p-muted, #a8a29e)',
                margin: '4px 0 0',
              }}>
                {prompt.description}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: 6,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                color: 'var(--p-muted)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <div style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: C.progressBg,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${progressPct}%`,
                borderRadius: 2,
                background: allFilled ? C.filled.border : C.progressFill,
                transition: 'width 300ms ease, background 300ms ease',
              }} />
            </div>
            <span style={{
              fontFamily: 'var(--mono, monospace)',
              fontSize: 11,
              color: 'var(--p-muted)',
              flexShrink: 0,
            }}>
              {filled} of {total}
            </span>
          </div>
        </div>

        {/* ─── Body: inline editor ─── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
        }}>
          <div style={{
            fontFamily: 'var(--sans)',
            fontSize: 14,
            fontWeight: 300,
            lineHeight: '1.7',
            color: 'var(--p-ink, #1a1a1a)',
          }}>
            {body.map((el, i) => renderElement(el, i))}
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div style={{
          padding: '14px 28px 18px',
          borderTop: '1px solid var(--p-line, #e7e2da)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          {/* Raw preview toggle */}
          <button
            type="button"
            onClick={() => setShowRaw(!showRaw)}
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--p-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
          >
            {showRaw ? 'Hide raw prompt' : 'Show raw prompt'}
          </button>

          <div style={{ flex: 1 }} />

          <button
            type="button"
            onClick={handleCancel}
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 14,
              fontWeight: 600,
              padding: '8px 20px',
              borderRadius: 999,
              border: 'none',
              background: 'var(--p-cream, #faf8f4)',
              color: 'var(--p-ink, #1a1a1a)',
              cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--p-line, #e7e2da)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--p-cream, #faf8f4)'; }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!allFilled}
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 14,
              fontWeight: 600,
              padding: '8px 28px',
              borderRadius: 999,
              border: 'none',
              background: allFilled ? 'var(--p-navy, #162d50)' : 'var(--p-line, #e7e2da)',
              color: allFilled ? '#fff' : 'var(--p-muted, #a8a29e)',
              cursor: allFilled ? 'pointer' : 'default',
              opacity: allFilled ? 1 : 0.7,
              transition: 'all 200ms ease',
            }}
          >
            Send to AI
          </button>
        </div>

        {/* ─── Raw prompt drawer ─── */}
        {showRaw && (
          <div style={{
            padding: '0 28px 18px',
            borderTop: '1px solid var(--p-line, #e7e2da)',
          }}>
            <p style={{
              fontFamily: 'var(--sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase' as const,
              color: 'var(--p-muted)',
              margin: '12px 0 6px',
            }}>
              Compiled Prompt
            </p>
            <pre style={{
              fontFamily: 'var(--mono, monospace)',
              fontSize: 12,
              lineHeight: '1.6',
              color: 'var(--p-ink)',
              background: 'var(--p-cream, #faf8f4)',
              border: '1px solid var(--p-line, #e7e2da)',
              borderRadius: 8,
              padding: 14,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: 200,
              overflowY: 'auto',
              margin: 0,
            }}>
              {compiled}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}
