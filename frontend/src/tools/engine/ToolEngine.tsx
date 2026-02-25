'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { ToolDefinition, BodyElement } from '../types';
import './tool-engine.css';

/* ═══════════════════════════════════════════════════════
   Tool Engine — One component that renders any tool
   ═══════════════════════════════════════════════════════ */

interface ToolEngineProps {
  definition: ToolDefinition;
  onSend?: (compiledPrompt: string) => void;
  onBack?: () => void;
  backLabel?: string;
}

// Map tagColor names → hex
const TAG_COLORS: Record<string, string> = {
  blue: '#2456e3',
  green: '#16a34a',
  coral: '#e05a6f',
  red: '#e05a6f',
  amber: '#d97706',
  purple: '#8b5cf6',
};

// ─── Helpers ─────────────────────────────────────────

function getInteractiveElements(body: BodyElement[]): BodyElement[] {
  return body.filter(
    (el) =>
      el.type === 'token' ||
      el.type === 'pills' ||
      el.type === 'block' ||
      el.type === 'upload' ||
      el.type === 'multi'
  );
}

function getInteractiveIds(body: BodyElement[]): string[] {
  return getInteractiveElements(body).map((el) => {
    if ('id' in el) return el.id;
    return '';
  }).filter(Boolean);
}

// ─── Sub-components ──────────────────────────────────

function TokenChip({
  el,
  value,
  editing,
  onStartEdit,
  onChange,
  onCommit,
  onNext,
  onCancel,
}: {
  el: Extract<BodyElement, { type: 'token' }>;
  value: string;
  editing: boolean;
  onStartEdit: () => void;
  onChange: (v: string) => void;
  onCommit: () => void;
  onNext: () => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (editing) {
    return (
      <span className="te-token--editing">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              onNext();
            } else if (e.key === 'Enter') {
              e.preventDefault();
              onNext();
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
          onBlur={onCommit}
          placeholder={el.placeholder}
          style={{ width: Math.max(100, (value || el.placeholder || '').length * 8.5) }}
        />
        {el.tip && <span className="te-token-tip">{el.tip}</span>}
      </span>
    );
  }

  const state = value ? 'filled' : 'empty';
  return (
    <span
      className={`te-token te-token--${state}`}
      onClick={onStartEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onStartEdit();
      }}
    >
      {value || el.label}
      {el.tip && <span className="te-token-tip">{el.tip}</span>}
    </span>
  );
}

function PillsSelector({
  el,
  value,
  onChange,
}: {
  el: Extract<BodyElement, { type: 'pills' }>;
  value: string;
  onChange: (v: string) => void;
}) {
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const customRef = useRef<HTMLInputElement>(null);
  const hasSelection = !!value;
  const isCustomValue = hasSelection && !el.options.includes(value);

  useEffect(() => {
    if (customMode && customRef.current) {
      customRef.current.focus();
    }
  }, [customMode]);

  return (
    <span className="te-pills">
      {el.options.map((opt) => {
        const isSelected = value === opt;
        let cls = 'te-pill';
        if (isSelected) cls += ' te-pill--selected';
        else if (hasSelection) cls += ' te-pill--dimmed';
        return (
          <button
            key={opt}
            className={cls}
            onClick={() => {
              setCustomMode(false);
              onChange(isSelected ? '' : opt);
            }}
            type="button"
          >
            {opt}
          </button>
        );
      })}
      {el.allowCustom && !customMode && (
        <button
          className={`te-pill te-pill--custom${hasSelection && !isCustomValue ? ' te-pill--dimmed' : ''}${isCustomValue ? ' te-pill--selected' : ''}`}
          onClick={() => setCustomMode(true)}
          type="button"
        >
          {isCustomValue ? value : 'Other...'}
        </button>
      )}
      {customMode && (
        <span className="te-pill-input">
          <input
            ref={customRef}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customValue.trim()) {
                onChange(customValue.trim());
                setCustomMode(false);
              } else if (e.key === 'Escape') {
                setCustomMode(false);
                setCustomValue('');
              }
            }}
            onBlur={() => {
              if (customValue.trim()) {
                onChange(customValue.trim());
              }
              setCustomMode(false);
            }}
            placeholder="Type custom..."
          />
        </span>
      )}
    </span>
  );
}

function BlockInput({
  el,
  value,
  onChange,
}: {
  el: Extract<BodyElement, { type: 'block' }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="te-block">
      <div className="te-block-label">{el.label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={el.placeholder}
        title={el.tip}
      />
    </div>
  );
}

function UploadZone({
  el,
  file,
  onFile,
  onRemove,
}: {
  el: Extract<BodyElement, { type: 'upload' }>;
  file: File | null;
  onFile: (f: File) => void;
  onRemove: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  return (
    <div className="te-upload">
      <input
        ref={inputRef}
        type="file"
        accept={el.accept}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = '';
        }}
        style={{ display: 'none' }}
      />
      <div
        className={`te-upload-zone${dragOver ? ' te-upload--dragover' : ''}${file ? ' te-upload--filled' : ''}`}
        onClick={() => !file && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') inputRef.current?.click();
        }}
      >
        {file ? (
          <div className="te-upload-file">
            <svg className="te-upload-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#158040" strokeWidth={2}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="te-upload-filename">{file.name}</span>
            <button
              className="te-upload-remove"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              type="button"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <svg className="te-upload-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="te-upload-text">{el.label}</span>
            <span className="te-upload-hint">{el.tip || `Drop a file or click to browse`}</span>
          </>
        )}
      </div>
    </div>
  );
}

function MultiInput({
  el,
  values,
  onChange,
}: {
  el: Extract<BodyElement, { type: 'multi' }>;
  values: string[];
  onChange: (vals: string[]) => void;
}) {
  const max = el.max || 5;

  const addRow = () => {
    if (values.length < max) {
      onChange([...values, '']);
    }
  };

  const updateRow = (index: number, val: string) => {
    const next = [...values];
    next[index] = val;
    onChange(next);
  };

  const removeRow = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="te-multi">
      <div className="te-block-label">{el.label}</div>
      {values.map((val, i) => (
        <div key={i} className="te-multi-row">
          <input
            value={val}
            onChange={(e) => updateRow(i, e.target.value)}
            placeholder={el.placeholder}
          />
          {values.length > 1 && (
            <button className="te-multi-remove" onClick={() => removeRow(i)} type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="4" y1="4" x2="20" y2="20" />
                <line x1="20" y1="4" x2="4" y2="20" />
              </svg>
            </button>
          )}
        </div>
      ))}
      <button className="te-multi-add" onClick={addRow} disabled={values.length >= max} type="button">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add another {values.length >= max ? `(max ${max})` : ''}
      </button>
    </div>
  );
}

function OrDivider() {
  return <div className="te-or">or</div>;
}

// ─── Main component ──────────────────────────────────

export default function ToolEngine({ definition, onSend, onBack, backLabel }: ToolEngineProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [multiValues, setMultiValues] = useState<Record<string, string[]>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [sent, setSent] = useState(false);

  // Reset state when definition changes
  useEffect(() => {
    setValues({});
    setFiles({});
    setMultiValues({});
    setEditingId(null);
    setShowRaw(false);
    setSent(false);
  }, [definition.id]);

  const interactiveIds = useMemo(
    () => getInteractiveIds(definition.body),
    [definition.body]
  );

  const interactiveElements = useMemo(
    () => getInteractiveElements(definition.body),
    [definition.body]
  );

  // ── Progress ──
  const progress = useMemo(() => {
    const total = interactiveElements.length;
    let filled = 0;
    for (const el of interactiveElements) {
      if (!('id' in el)) continue;
      const id = el.id;
      if (el.type === 'upload') {
        if (files[id]) filled++;
      } else if (el.type === 'multi') {
        if (multiValues[id]?.some((v) => v.trim())) filled++;
      } else {
        if (values[id]?.trim()) filled++;
      }
    }
    return { filled, total, complete: filled === total && total > 0 };
  }, [interactiveElements, values, files, multiValues]);

  // ── Compile prompt ──
  const compiledPrompt = useMemo(() => {
    let result = '';
    for (const el of definition.body) {
      switch (el.type) {
        case 'text':
          result += el.content;
          break;
        case 'label':
          result += `\n\n## ${el.content}\n\n`;
          break;
        case 'static':
          result += `\n\n${el.content}`;
          break;
        case 'br':
          result += '\n';
          break;
        case 'token':
          result += values[el.id]?.trim() || `[${el.label}]`;
          break;
        case 'pills':
          result += values[el.id] || `[${el.label}]`;
          break;
        case 'block':
          result += values[el.id]?.trim() || `[${el.label}]`;
          break;
        case 'upload':
          result += files[el.id] ? `[Uploaded: ${files[el.id]!.name}]` : '';
          break;
        case 'multi': {
          const vals = multiValues[el.id]?.filter((v) => v.trim());
          result += vals?.length ? vals.join(', ') : `[${el.label}]`;
          break;
        }
        case 'or':
          break;
      }
    }
    return result.trim();
  }, [definition.body, values, files, multiValues]);

  // ── Keyboard navigation ──
  const focusNextField = useCallback(
    (currentId: string) => {
      const idx = interactiveIds.indexOf(currentId);
      if (idx < interactiveIds.length - 1) {
        setEditingId(interactiveIds[idx + 1]);
      } else {
        setEditingId(null);
      }
    },
    [interactiveIds]
  );

  // ── Send ──
  const handleSend = useCallback(() => {
    if (!progress.complete) return;
    setSent(true);
    onSend?.(compiledPrompt);
    setTimeout(() => setSent(false), 2500);
  }, [progress.complete, compiledPrompt, onSend]);

  // ── Render body elements ──
  const renderElement = (el: BodyElement, index: number) => {
    switch (el.type) {
      case 'text':
        return <span key={index}>{el.content}</span>;

      case 'label':
        return <div key={index} className="te-label">{el.content}</div>;

      case 'static':
        return <div key={index} className="te-static">{el.content}</div>;

      case 'br':
        return <br key={index} />;

      case 'token':
        return (
          <TokenChip
            key={el.id}
            el={el}
            value={values[el.id] || ''}
            editing={editingId === el.id}
            onStartEdit={() => setEditingId(el.id)}
            onChange={(v) => setValues((prev) => ({ ...prev, [el.id]: v }))}
            onCommit={() => setEditingId(null)}
            onNext={() => focusNextField(el.id)}
            onCancel={() => setEditingId(null)}
          />
        );

      case 'pills':
        return (
          <PillsSelector
            key={el.id}
            el={el}
            value={values[el.id] || ''}
            onChange={(v) => setValues((prev) => ({ ...prev, [el.id]: v }))}
          />
        );

      case 'block':
        return (
          <BlockInput
            key={el.id}
            el={el}
            value={values[el.id] || ''}
            onChange={(v) => setValues((prev) => ({ ...prev, [el.id]: v }))}
          />
        );

      case 'upload':
        return (
          <UploadZone
            key={el.id}
            el={el}
            file={files[el.id] || null}
            onFile={(f) => setFiles((prev) => ({ ...prev, [el.id]: f }))}
            onRemove={() => setFiles((prev) => ({ ...prev, [el.id]: null }))}
          />
        );

      case 'multi':
        return (
          <MultiInput
            key={el.id}
            el={el}
            values={multiValues[el.id] || ['']}
            onChange={(vals) => setMultiValues((prev) => ({ ...prev, [el.id]: vals }))}
          />
        );

      case 'or':
        return <OrDivider key={index} />;

      default:
        return null;
    }
  };

  const dotColor = TAG_COLORS[definition.tagColor] || TAG_COLORS.blue;
  const progressPct = progress.total > 0 ? (progress.filled / progress.total) * 100 : 0;

  let sendCls = 'te-send';
  if (sent) sendCls += ' te-send--sent';
  else if (progress.complete) sendCls += ' te-send--ready';
  else sendCls += ' te-send--disabled';

  return (
    <div className="tool-engine">
      {/* Back link */}
      <button className="te-back" onClick={onBack} type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {backLabel || 'All Tools'}
      </button>

      {/* Header */}
      <div className="te-header">
        <h1 className="te-title">{definition.title}</h1>
        <div className="te-badge">
          <span className="te-badge-dot" style={{ background: dotColor }} />
          {definition.tag}
        </div>
      </div>

      {/* Card */}
      <div className="te-card">
        <div className="te-body">
          {definition.body.map((el, i) => renderElement(el, i))}
        </div>
      </div>

      {/* Footer */}
      <div className="te-footer">
        {/* Progress */}
        <div className="te-progress">
          <div className="te-progress-bar">
            <div
              className={`te-progress-fill${progress.complete ? ' te-progress-fill--complete' : ''}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className={`te-progress-count${progress.complete ? ' te-progress-count--complete' : ''}`}>
            {progress.filled}/{progress.total}
          </span>
        </div>

        {/* Raw toggle */}
        <button className="te-raw-toggle" onClick={() => setShowRaw((v) => !v)} type="button">
          {showRaw ? 'Hide prompt' : 'View prompt'}
        </button>

        {/* Send */}
        <button className={sendCls} onClick={handleSend} disabled={!progress.complete && !sent} type="button">
          {sent ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Sent
            </>
          ) : (
            'Send to AI'
          )}
        </button>
      </div>

      {/* Raw prompt */}
      {showRaw && <div className="te-raw">{compiledPrompt}</div>}
    </div>
  );
}
