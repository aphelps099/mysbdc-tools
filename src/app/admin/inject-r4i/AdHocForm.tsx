'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  COACHING_OPTIONS,
  GROUP_COURSE_OPTIONS,
  POSITION_OPTIONS,
  REFERRAL_SOURCES,
  YEARS_RANGES,
  type RoadmapApplicationData,
  createEmptyRoadmapApplication,
} from '@/components/roadmap/types';
import { isValidEmail } from '@/lib/validate';

/* ═══════════════════════════════════════════════════════
   AdHocForm — the inject-R4I editable form.

   - Paste a forwarded email → AI parse → auto-fill
   - Existing Client ID blank  → Create client + R4I PIN
   - Existing Client ID filled → PIN-only (recovery mode)
   - Dry run previews payloads without sending
   - Form + clientId persist to localStorage on every change
   ═══════════════════════════════════════════════════════ */

const STORAGE_KEY = 'r4i-adhoc-form-v1';

type FormState = RoadmapApplicationData;

/** Scalar form keys the AI parse may fill. */
const PARSE_SCALAR_KEYS: (keyof FormState)[] = [
  'firstName', 'lastName', 'email', 'phone', 'title',
  'companyName', 'website', 'streetAddress', 'city', 'state', 'zipCode',
  'dateEstablished', 'yearsInOperation', 'productDescription',
  'biggestChallenge', 'referralSource', 'referralOther',
  'signature', 'privacyRelease',
];

/** Array form keys the AI parse may fill. */
const PARSE_ARRAY_KEYS: (keyof FormState)[] = ['coachingInterests', 'groupCourses'];

interface InjectResponse {
  success: boolean;
  dryRun?: boolean;
  partial?: boolean;
  pinOnly?: boolean;
  clientId?: string;
  error?: string;
  intakePayload?: unknown;
  pinPayload?: unknown;
  intakeResult?: unknown;
  pinResult?: unknown;
  pinResponse?: unknown;
}

type Result =
  | { kind: 'success'; res: InjectResponse }
  | { kind: 'dry'; res: InjectResponse }
  | { kind: 'partial'; res: InjectResponse }
  | { kind: 'error'; message: string };

export default function AdHocForm() {
  const [form, setForm] = useState<FormState>(createEmptyRoadmapApplication);
  const [clientId, setClientId] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [parsedFields, setParsedFields] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const hydrated = useRef(false);

  // ── localStorage persistence ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === 'object') {
          if (saved.form && typeof saved.form === 'object') {
            setForm({ ...createEmptyRoadmapApplication(), ...saved.form });
          }
          if (typeof saved.clientId === 'string') setClientId(saved.clientId);
        }
      }
    } catch {
      // corrupt storage — start fresh
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, clientId }));
    } catch {
      // storage full / unavailable — non-fatal
    }
  }, [form, clientId]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleArrayItem = (key: 'coachingInterests' | 'groupCourses', id: string) =>
    setForm((f) => {
      const list = f[key];
      return {
        ...f,
        [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
      };
    });

  const clearForm = () => {
    if (!confirm('Clear the entire form? This cannot be undone.')) return;
    setForm(createEmptyRoadmapApplication());
    setClientId('');
    setParsedFields([]);
    setResult(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  // ── AI parse ──

  /** Merge parsed output into the form: only overwrite with non-empty values. */
  const mergeParsed = (parsed: Record<string, unknown>): string[] => {
    const filled: string[] = [];
    setForm((f) => {
      const next = { ...f };
      for (const key of PARSE_SCALAR_KEYS) {
        const v = parsed[key];
        if (typeof v === 'string' && v.trim()) {
          (next[key] as string) = v.trim();
          filled.push(key);
        }
      }
      for (const key of PARSE_ARRAY_KEYS) {
        const v = parsed[key];
        if (Array.isArray(v)) {
          const items = v.filter((x): x is string => typeof x === 'string' && !!x.trim());
          if (items.length) {
            (next[key] as string[]) = items;
            filled.push(key);
          }
        }
      }
      return next;
    });
    return filled;
  };

  const handleParse = async () => {
    if (!pasteText.trim() || parsing) return;
    setParsing(true);
    setParseError('');
    setParsedFields([]);
    try {
      const res = await fetch('/api/admin/parse-r4i-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.success) {
        setParseError(body.error || `Parse failed (${res.status})`);
        return;
      }
      const filled = mergeParsed(body.data || {});
      setParsedFields(filled);
      if (!filled.length) setParseError('Parsed, but no usable fields were found in the text.');
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setParsing(false);
    }
  };

  // ── Submit / dry run ──

  const handleSubmit = async (dryRun: boolean) => {
    if (submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/inject-r4i', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: form,
          dryRun,
          ...(clientId.trim() ? { clientId: clientId.trim() } : {}),
        }),
      });
      const body: InjectResponse = await res.json().catch(() => ({
        success: false,
        error: `Server returned ${res.status} with no JSON body`,
      }));

      if (body.success && body.dryRun) {
        setResult({ kind: 'dry', res: body });
      } else if (body.success) {
        setResult({ kind: 'success', res: body });
      } else if (body.partial && body.clientId) {
        // Intake succeeded, PIN failed — pre-fill the client ID for retry
        setClientId(body.clientId);
        setResult({ kind: 'partial', res: body });
      } else {
        setResult({ kind: 'error', message: body.error || `Request failed (${res.status})` });
      }
    } catch (e) {
      setResult({ kind: 'error', message: e instanceof Error ? e.message : 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  const pinOnly = Boolean(clientId.trim());

  return (
    <div>
      {/* ── Paste + AI parse panel ── */}
      <Panel accent="#34d399" title="1 · Paste a forwarded email (optional)">
        <p style={hintStyle}>
          Paste the raw application email below and let AI fill the form. Review every
          field before injecting — the AI omits anything it can&apos;t find.
        </p>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste the forwarded application email here…"
          rows={8}
          style={{ ...inputStyle, width: '100%', resize: 'vertical', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <button
            type="button"
            onClick={handleParse}
            disabled={!pasteText.trim() || parsing}
            style={buttonStyle('#34d399', !pasteText.trim() || parsing)}
          >
            {parsing ? 'Parsing…' : 'Parse with AI'}
          </button>
          {parsedFields.length > 0 && (
            <details style={{ fontSize: 13, color: '#34d399' }}>
              <summary style={{ cursor: 'pointer' }}>
                ✓ Filled {parsedFields.length} field{parsedFields.length === 1 ? '' : 's'}
              </summary>
              <span style={{ color: '#9aa6b2' }}>{parsedFields.join(', ')}</span>
            </details>
          )}
        </div>
        {parseError && <p style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>{parseError}</p>}
      </Panel>

      {/* ── Existing Client ID panel ── */}
      <Panel accent="#fbbf24" title="2 · Existing Client ID (optional)">
        <Row>
          <Field label="NeoSerra Client ID" hint="Leave blank to create a new client">
            <input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="e.g. 426342"
              style={inputStyle}
            />
          </Field>
          <div style={{ flex: 2, alignSelf: 'center', fontSize: 13, lineHeight: 1.5 }}>
            {pinOnly ? (
              <span style={{ color: '#fbbf24' }}>
                <strong>Mode: PIN-only.</strong> No new client will be created — only the
                R4I PIN form will be posted against client {clientId.trim()}. Use this to
                recover when intake succeeded but the PIN step failed.
              </span>
            ) : (
              <span style={{ color: '#9aa6b2' }}>
                <strong style={{ color: '#e5e9ee' }}>Mode: Create + PIN.</strong> A new NeoSerra
                client will be created via intake (lands in the New Sign-ups queue), then the
                R4I PIN form is posted against it.
              </span>
            )}
          </div>
        </Row>
      </Panel>

      {/* ── The form ── */}
      <Section title="Company & Contact">
        <Row>
          <Field label="First name">
            <input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Last name">
            <input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} style={inputStyle} />
          </Field>
        </Row>
        <Row>
          <Field label="Email">
            <input value={form.email} onChange={(e) => set('email', e.target.value)} style={inputStyle} />
            {form.email.trim() !== '' && !isValidEmail(form.email) && (
              <span style={{ display: 'block', color: '#f87171', fontSize: 12, marginTop: 4 }}>
                Not a valid email — NeoSerra will reject the intake step.
              </span>
            )}
          </Field>
          <Field label="Phone" hint="Digits only">
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Position">
            <select value={form.title} onChange={(e) => set('title', e.target.value)} style={inputStyle}>
              {POSITION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </Row>
        <Row>
          <Field label="Company name">
            <input value={form.companyName} onChange={(e) => set('companyName', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Website">
            <input value={form.website} onChange={(e) => set('website', e.target.value)} style={inputStyle} />
          </Field>
        </Row>
        <Row>
          <Field label="Street address" grow={2}>
            <input value={form.streetAddress} onChange={(e) => set('streetAddress', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="City">
            <input value={form.city} onChange={(e) => set('city', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="State">
            <input value={form.state} onChange={(e) => set('state', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="ZIP">
            <input value={form.zipCode} onChange={(e) => set('zipCode', e.target.value)} style={inputStyle} />
          </Field>
        </Row>
        <Row>
          <Field label="Date established" hint="YYYY-MM-DD">
            <input value={form.dateEstablished} onChange={(e) => set('dateEstablished', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Years in operation">
            <select value={form.yearsInOperation} onChange={(e) => set('yearsInOperation', e.target.value)} style={inputStyle}>
              <option value="">Select…</option>
              {YEARS_RANGES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </Row>
        <Field label="Products / what they manufacture">
          <textarea
            value={form.productDescription}
            onChange={(e) => set('productDescription', e.target.value)}
            rows={3}
            style={{ ...inputStyle, width: '100%', resize: 'vertical' }}
          />
        </Field>
      </Section>

      <Section title="Interests">
        <CheckboxGroup
          label="Advising interests"
          options={COACHING_OPTIONS}
          selected={form.coachingInterests}
          onToggle={(id) => toggleArrayItem('coachingInterests', id)}
        />
        <CheckboxGroup
          label="Group courses"
          options={GROUP_COURSE_OPTIONS}
          selected={form.groupCourses}
          onToggle={(id) => toggleArrayItem('groupCourses', id)}
        />
        <Field label="Biggest challenge">
          <textarea
            value={form.biggestChallenge}
            onChange={(e) => set('biggestChallenge', e.target.value)}
            rows={3}
            style={{ ...inputStyle, width: '100%', resize: 'vertical' }}
          />
        </Field>
      </Section>

      <Section title="Wrap-up">
        <Row>
          <Field label="Referral source">
            <select value={form.referralSource} onChange={(e) => set('referralSource', e.target.value)} style={inputStyle}>
              {REFERRAL_SOURCES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          {form.referralSource === 'other' && (
            <Field label="Referral (other)">
              <input value={form.referralOther} onChange={(e) => set('referralOther', e.target.value)} style={inputStyle} />
            </Field>
          )}
          <Field label="Signature" hint="Applicant's typed full name">
            <input value={form.signature} onChange={(e) => set('signature', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Privacy release">
            <select value={form.privacyRelease} onChange={(e) => set('privacyRelease', e.target.value)} style={inputStyle}>
              <option value="">Select…</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
        </Row>
      </Section>

      {/* ── Submit row ── */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          style={buttonStyle('#60a5fa', submitting)}
        >
          {submitting
            ? 'Working…'
            : pinOnly
              ? `Run PIN for client ${clientId.trim()}`
              : 'Inject into NeoSerra'}
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={submitting}
          style={buttonStyle('#9aa6b2', submitting, true)}
        >
          Dry run
        </button>
        <div style={{ flex: 1 }} />
        <button type="button" onClick={clearForm} style={buttonStyle('#f87171', false, true)}>
          Clear form
        </button>
      </div>

      {result && <ResultPanel result={result} />}
    </div>
  );
}

/* ═══ Result panel ═══ */

function ResultPanel({ result }: { result: Result }) {
  if (result.kind === 'error') {
    return (
      <PanelBox color="#f87171">
        <strong>Inject failed.</strong> {result.message}
      </PanelBox>
    );
  }

  if (result.kind === 'partial') {
    const { res } = result;
    return (
      <PanelBox color="#fbbf24">
        <strong>Partial: client {res.clientId} was created, but the R4I PIN step failed.</strong>
        <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.5 }}>
          The Existing Client ID field has been pre-filled with {res.clientId}. Fix the data
          if needed, then click &ldquo;Run PIN&rdquo; — do <strong>not</strong> re-inject, or
          a duplicate client will be created.
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#f1d48a' }}>{res.error}</p>
        <Collapsible label="PIN response">{res.pinResponse}</Collapsible>
        <Collapsible label="Intake result">{res.intakeResult}</Collapsible>
      </PanelBox>
    );
  }

  if (result.kind === 'dry') {
    const { res } = result;
    return (
      <PanelBox color="#9aa6b2">
        <strong>Dry run — nothing was sent.</strong>
        {res.intakePayload != null
          ? <Collapsible label="Intake payload" open>{res.intakePayload}</Collapsible>
          : <p style={{ margin: '8px 0 0', fontSize: 13 }}>PIN-only mode: no intake call will be made.</p>}
        <Collapsible label="PIN payload" open>{res.pinPayload}</Collapsible>
      </PanelBox>
    );
  }

  const { res } = result;
  return (
    <PanelBox color="#34d399">
      <strong>
        {res.pinOnly
          ? `✓ R4I PIN posted for client ${res.clientId}.`
          : `✓ Injected — NeoSerra client ${res.clientId} created with R4I PIN.`}
      </strong>
      <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.5, color: '#9aa6b2' }}>
        No emails were sent. The client appears in the NeoSerra New Sign-ups queue for review.
      </p>
      <Collapsible label="PIN result">{res.pinResult}</Collapsible>
      {res.intakeResult != null && <Collapsible label="Intake result">{res.intakeResult}</Collapsible>}
    </PanelBox>
  );
}

function Collapsible({ label, children, open }: { label: string; children: unknown; open?: boolean }) {
  return (
    <details open={open} style={{ marginTop: 10 }}>
      <summary style={{ cursor: 'pointer', fontSize: 13 }}>{label}</summary>
      <pre
        style={{
          background: '#0b0f14',
          border: '1px solid #1f2937',
          borderRadius: 6,
          padding: 12,
          fontSize: 12,
          overflowX: 'auto',
          marginTop: 6,
        }}
      >
        {JSON.stringify(children, null, 2)}
      </pre>
    </details>
  );
}

/* ═══ Layout + styling helpers ═══ */

const inputStyle: CSSProperties = {
  background: '#111827',
  border: '1px solid #2b3645',
  borderRadius: 6,
  color: '#e5e9ee',
  padding: '8px 10px',
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box',
};

const hintStyle: CSSProperties = {
  color: '#9aa6b2',
  fontSize: 13,
  lineHeight: 1.5,
  margin: '0 0 10px',
};

function buttonStyle(color: string, disabled: boolean, outline = false): CSSProperties {
  return {
    background: outline ? 'transparent' : color,
    color: outline ? color : '#0b0f14',
    border: `1px solid ${color}`,
    borderRadius: 6,
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };
}

function Panel({ accent, title, children }: { accent: string; title: string; children: ReactNode }) {
  return (
    <div
      style={{
        border: '1px solid #1f2937',
        borderLeft: `3px solid ${accent}`,
        borderRadius: 8,
        padding: '16px 18px',
        marginBottom: 20,
        background: '#0f141b',
      }}
    >
      <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px' }}>{title}</h2>
      {children}
    </div>
  );
}

function PanelBox({ color, children }: { color: string; children: ReactNode }) {
  return (
    <div
      style={{
        border: `1px solid ${color}`,
        borderRadius: 8,
        padding: '16px 18px',
        marginTop: 20,
        background: '#0f141b',
        color: '#e5e9ee',
        fontSize: 14,
      }}
    >
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset
      style={{
        border: '1px solid #1f2937',
        borderRadius: 8,
        padding: '16px 18px',
        marginBottom: 20,
        background: '#0f141b',
      }}
    >
      <legend style={{ fontSize: 14, fontWeight: 700, padding: '0 8px', color: '#c8d2dc' }}>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 12 }}>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  grow = 1,
  children,
}: {
  label: string;
  hint?: string;
  grow?: number;
  children: ReactNode;
}) {
  return (
    <label style={{ flex: grow, minWidth: 140, display: 'block', marginBottom: 4 }}>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#9aa6b2', marginBottom: 4 }}>
        {label}
        {hint && <span style={{ fontWeight: 400 }}> — {hint}</span>}
      </span>
      {children}
    </label>
  );
}

function CheckboxGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { id: string; label: string; desc?: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#9aa6b2', marginBottom: 6 }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map((o) => {
          const active = selected.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onToggle(o.id)}
              title={o.desc}
              style={{
                background: active ? '#1d4ed8' : '#111827',
                color: active ? '#fff' : '#9aa6b2',
                border: `1px solid ${active ? '#3b82f6' : '#2b3645'}`,
                borderRadius: 999,
                padding: '6px 14px',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
