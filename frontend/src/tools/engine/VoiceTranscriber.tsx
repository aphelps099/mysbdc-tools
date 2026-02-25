'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { startPcmRecording, PcmRecorder } from '@/lib/audioUtils';
import { transcribeAudio } from '@/lib/api';
import './tool-engine.css';

/* ═══════════════════════════════════════════════════════
   Voice Transcriber — Record, transcribe, apply templates
   Custom tool component (not JSON-driven like other tools)
   ═══════════════════════════════════════════════════════ */

interface VoiceTranscriberProps {
  onBack?: () => void;
}

type Phase = 'idle' | 'recording' | 'transcribing' | 'done' | 'error';

const TEMPLATES = [
  {
    id: 'session-notes',
    label: 'Session Notes',
    prompt: (t: string) =>
      `You are an SBDC advisor assistant. Given the following raw transcript from an advising session, produce clean, structured session notes.\n\nFormat:\n- **Date**: [today]\n- **Attendees**: [extract from transcript]\n- **Summary**: 2-3 sentence overview\n- **Key Topics Discussed**: bulleted list\n- **Decisions Made**: bulleted list\n- **Action Items**: numbered list with owners if mentioned\n- **Follow-Up Needed**: yes/no + details\n\nTranscript:\n${t}`,
  },
  {
    id: 'action-plan',
    label: 'Action Plan',
    prompt: (t: string) =>
      `You are an SBDC advisor assistant. From this advising session transcript, extract a prioritized client action plan.\n\nFormat each item as:\n1. **Action**: what needs to be done\n   - **Owner**: client or advisor\n   - **Deadline**: suggested timeline\n   - **Resources**: any links, templates, or referrals mentioned\n\nPrioritize by urgency. Include 5-8 action items.\n\nTranscript:\n${t}`,
  },
  {
    id: 'followup-email',
    label: 'Follow-Up Email',
    prompt: (t: string) =>
      `You are an SBDC advisor. Write a professional follow-up email to the client based on this advising session transcript.\n\nThe email should:\n- Thank them for the session\n- Summarize key points discussed (3-4 bullets)\n- List agreed-upon next steps with deadlines\n- Offer continued support\n- Be warm but professional, 200-300 words\n\nTranscript:\n${t}`,
  },
  {
    id: 'crm-entry',
    label: 'CRM Entry',
    prompt: (t: string) =>
      `You are an SBDC advisor assistant. From this session transcript, produce a concise CRM session record suitable for Neoserra.\n\nFormat:\n- **Session Type**: [initial intake / follow-up / milestone review]\n- **Duration**: [estimate from transcript length]\n- **Topics**: [comma-separated list]\n- **Summary**: 2-3 sentences max\n- **Outcomes**: bulleted list\n- **Next Session**: [suggested date/topic if mentioned]\n- **Milestones**: [any SBA-reportable milestones achieved]\n\nKeep it factual and brief.\n\nTranscript:\n${t}`,
  },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VoiceTranscriber({ onBack }: VoiceTranscriberProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [segments, setSegments] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [compiledPrompt, setCompiledPrompt] = useState('');
  const [copied, setCopied] = useState<'transcript' | 'prompt' | null>(null);

  const recorderRef = useRef<PcmRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Scroll transcript to bottom when new segments are added
  useEffect(() => {
    if (segments.length > 1) {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [segments.length]);

  const beginRecording = useCallback(async (continuing: boolean) => {
    setErrorMsg('');
    if (!continuing) {
      setTranscript('');
      setSegments([]);
      setSelectedTemplate(null);
      setCompiledPrompt('');
    }
    try {
      const recorder = await startPcmRecording();
      recorderRef.current = recorder;
      setPhase('recording');
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch {
      setErrorMsg('Microphone access denied. Please allow microphone permissions.');
      setPhase('error');
    }
  }, []);

  const startRecording = useCallback(() => beginRecording(false), [beginRecording]);
  const continueRecording = useCallback(() => beginRecording(true), [beginRecording]);

  const stopRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const recorder = recorderRef.current;
    recorderRef.current = null;

    if (!recorder) return;

    setPhase('transcribing');
    try {
      const wavBlob = await recorder.stop();
      if (wavBlob.size < 1000) {
        // If we already have segments, go back to done instead of error
        if (segments.length > 0) {
          setPhase('done');
        } else {
          setErrorMsg('Recording too short. Try speaking for at least a few seconds.');
          setPhase('error');
        }
        return;
      }

      const { text } = await transcribeAudio(wavBlob);
      if (text) {
        setSegments((prev) => [...prev, text]);
        setTranscript((prev) => (prev ? prev + '\n\n' + text : text));
        // Clear template selection when transcript changes
        setSelectedTemplate(null);
        setCompiledPrompt('');
        setPhase('done');
      } else if (segments.length > 0) {
        // Already have content, just go back to done
        setPhase('done');
      } else {
        setErrorMsg('No speech detected. Try again in a quieter environment.');
        setPhase('error');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Transcription failed');
      setPhase('error');
    }
  }, [segments.length]);

  const reset = useCallback(() => {
    setPhase('idle');
    setTranscript('');
    setSegments([]);
    setErrorMsg('');
    setElapsed(0);
    setSelectedTemplate(null);
    setCompiledPrompt('');
  }, []);

  const applyTemplate = useCallback(
    (templateId: string) => {
      const tmpl = TEMPLATES.find((t) => t.id === templateId);
      if (!tmpl || !transcript) return;
      setSelectedTemplate(templateId);
      setCompiledPrompt(tmpl.prompt(transcript));
    },
    [transcript]
  );

  const copyToClipboard = useCallback(
    async (text: string, which: 'transcript' | 'prompt') => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(which);
        setTimeout(() => setCopied(null), 2000);
      } catch {
        // Fallback
      }
    },
    []
  );

  return (
    <div className="tool-engine">
      {/* Back link */}
      <button className="te-back" onClick={onBack} type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
        All Tools
      </button>

      {/* Header */}
      <div className="te-header">
        <h1 className="te-title">Voice Transcription</h1>
        <div className="te-badge">
          <span className="te-badge-dot" style={{ background: '#16a34a' }} />
          Session Management
          <span
            style={{
              marginLeft: 8,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#d97706',
              background: '#fef3c7',
              padding: '2px 8px',
              borderRadius: 100,
            }}
          >
            BETA
          </span>
        </div>
      </div>

      {/* ── Recording Card ── */}
      <div className="te-card">
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          {/* ── Idle state ── */}
          {phase === 'idle' && (
            <div style={{ animation: 'teFadeSlide 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  margin: '0 auto 20px',
                  borderRadius: '50%',
                  background: 'var(--p-sand, #f3efe8)',
                  border: '2px solid var(--p-line, #e7e2da)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--p-mid, #57534e)" strokeWidth={1.5}>
                  <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" fill="var(--p-mid, #57534e)" stroke="none" />
                </svg>
              </div>
              <p
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 14,
                  color: 'var(--p-mid, #57534e)',
                  margin: '0 0 24px',
                  lineHeight: 1.6,
                }}
              >
                Record a session, then apply templates to generate<br />
                session notes, action plans, or follow-up emails.
              </p>
              <button
                onClick={startRecording}
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const,
                  padding: '12px 32px',
                  borderRadius: 100,
                  border: 'none',
                  cursor: 'pointer',
                  background: 'var(--p-navy, #162d50)',
                  color: '#fff',
                  boxShadow: '0 2px 10px rgba(22,45,80,0.2)',
                  transition: 'all 0.18s cubic-bezier(0.22,1,0.36,1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(22,45,80,0.28)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(22,45,80,0.2)';
                }}
              >
                Start Recording
              </button>
            </div>
          )}

          {/* ── Recording state ── */}
          {phase === 'recording' && (
            <div style={{ animation: 'teFadeSlide 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  margin: '0 auto 20px',
                  borderRadius: '50%',
                  background: '#fef2f2',
                  border: '2px solid #fca5a5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'vt-pulse 2s ease-in-out infinite',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={1.5}>
                  <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" fill="#ef4444" stroke="none" />
                </svg>
              </div>
              <p
                style={{
                  fontFamily: 'var(--mono, monospace)',
                  fontSize: 28,
                  fontWeight: 600,
                  color: '#ef4444',
                  margin: '0 0 4px',
                  letterSpacing: '0.04em',
                }}
              >
                {formatTime(elapsed)}
              </p>
              <p
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  color: '#ef4444',
                  margin: '0 0 4px',
                }}
              >
                {segments.length > 0 ? `Recording Segment ${segments.length + 1}` : 'Recording'}
              </p>
              {segments.length > 0 && (
                <p
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 10,
                    color: 'var(--p-muted, #a8a29e)',
                    margin: '0 0 20px',
                  }}
                >
                  {segments.length} segment{segments.length !== 1 ? 's' : ''} recorded
                </p>
              )}
              {segments.length === 0 && <div style={{ marginBottom: 20 }} />}
              <button
                onClick={stopRecording}
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const,
                  padding: '12px 32px',
                  borderRadius: 100,
                  border: 'none',
                  cursor: 'pointer',
                  background: '#ef4444',
                  color: '#fff',
                  boxShadow: '0 2px 10px rgba(239,68,68,0.3)',
                  transition: 'all 0.18s cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                Stop Recording
              </button>
            </div>
          )}

          {/* ── Transcribing state ── */}
          {phase === 'transcribing' && (
            <div style={{ animation: 'teFadeSlide 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  margin: '0 auto 20px',
                  borderRadius: '50%',
                  background: '#fffbeb',
                  border: '2px solid #fcd34d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth={2}
                  style={{ animation: 'vt-spin 1s linear infinite' }}
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeOpacity={0.25} />
                  <path d="M4 12a8 8 0 018-8" />
                </svg>
              </div>
              <p
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  color: '#d97706',
                  margin: 0,
                }}
              >
                Transcribing {formatTime(elapsed)} of audio...
              </p>
            </div>
          )}

          {/* ── Error state ── */}
          {phase === 'error' && (
            <div style={{ animation: 'teFadeSlide 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  margin: '0 auto 20px',
                  borderRadius: '50%',
                  background: '#fef2f2',
                  border: '2px solid #fca5a5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <p
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 14,
                  color: '#ef4444',
                  margin: '0 0 20px',
                }}
              >
                {errorMsg}
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                {segments.length > 0 && (
                  <button
                    onClick={() => setPhase('done')}
                    style={{
                      fontFamily: 'var(--sans)',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase' as const,
                      padding: '10px 28px',
                      borderRadius: 100,
                      border: '1.5px solid var(--p-line, #e7e2da)',
                      cursor: 'pointer',
                      background: 'var(--p-white, #fff)',
                      color: 'var(--p-ink, #1a1a1a)',
                      transition: 'all 0.15s',
                    }}
                  >
                    Back to Transcript
                  </button>
                )}
                <button
                  onClick={segments.length > 0 ? continueRecording : reset}
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase' as const,
                    padding: '10px 28px',
                    borderRadius: 100,
                    border: '1.5px solid var(--p-line, #e7e2da)',
                    cursor: 'pointer',
                    background: 'var(--p-white, #fff)',
                    color: 'var(--p-ink, #1a1a1a)',
                    transition: 'all 0.15s',
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Previous segments shown during recording/transcribing ── */}
      {(phase === 'recording' || phase === 'transcribing') && segments.length > 0 && (
        <div style={{ marginTop: 16, animation: 'teFadeSlide 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
          <span
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: 'var(--p-muted, #a8a29e)',
            }}
          >
            Previous Segments ({segments.length})
          </span>
          <div
            style={{
              marginTop: 6,
              background: 'var(--p-white, #fff)',
              border: '1.5px solid var(--p-line, #e7e2da)',
              borderRadius: 14,
              padding: '16px 18px',
              fontFamily: 'var(--sans)',
              fontSize: 13,
              lineHeight: 1.7,
              color: 'var(--p-mid, #57534e)',
              maxHeight: 160,
              overflowY: 'auto',
            }}
          >
            {segments.map((seg, i) => (
              <div key={i}>
                {i > 0 && (
                  <div style={{
                    margin: '10px 0',
                    borderTop: '1px dashed var(--p-line, #e7e2da)',
                  }} />
                )}
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--p-muted, #a8a29e)', textTransform: 'uppercase' as const }}>
                  Segment {i + 1}
                </span>
                <p style={{ margin: '4px 0 0' }}>{seg}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Transcript Result ── */}
      {phase === 'done' && transcript && (
        <div style={{ marginTop: 20, animation: 'teFadeSlide 0.45s cubic-bezier(0.22,1,0.36,1) 0.1s both' }}>
          {/* Transcript header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--p-muted, #a8a29e)',
                }}
              >
                Transcript
              </span>
              {segments.length > 1 && (
                <span
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: '#2456e3',
                    background: '#eef2ff',
                    padding: '2px 8px',
                    borderRadius: 100,
                  }}
                >
                  {segments.length} segments
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => copyToClipboard(transcript, 'transcript')}
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const,
                  color: copied === 'transcript' ? '#16a34a' : 'var(--p-muted, #a8a29e)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 6,
                  transition: 'color 0.15s',
                }}
              >
                {copied === 'transcript' ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={reset}
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--p-muted, #a8a29e)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 6,
                  transition: 'color 0.15s',
                }}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Transcript body with segment dividers */}
          <div
            style={{
              background: 'var(--p-white, #fff)',
              border: '1.5px solid #7ee2a8',
              borderRadius: 14,
              padding: '20px 22px',
              fontFamily: 'var(--sans)',
              fontSize: 14,
              lineHeight: 1.7,
              color: 'var(--p-ink, #1a1a1a)',
              maxHeight: 360,
              overflowY: 'auto',
            }}
          >
            {segments.length > 1
              ? segments.map((seg, i) => (
                  <div key={i}>
                    {i > 0 && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        margin: '14px 0',
                      }}>
                        <div style={{ flex: 1, borderTop: '1px dashed #c5e8d4' }} />
                        <span style={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          color: '#7ee2a8',
                          textTransform: 'uppercase' as const,
                          whiteSpace: 'nowrap',
                        }}>
                          Segment {i + 1}
                        </span>
                        <div style={{ flex: 1, borderTop: '1px dashed #c5e8d4' }} />
                      </div>
                    )}
                    {seg}
                  </div>
                ))
              : transcript}
            <div ref={transcriptEndRef} />
          </div>

          {/* Continue Recording button */}
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button
              onClick={continueRecording}
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
                padding: '10px 28px',
                borderRadius: 100,
                border: '1.5px solid var(--p-navy, #162d50)',
                cursor: 'pointer',
                background: 'var(--p-white, #fff)',
                color: 'var(--p-navy, #162d50)',
                boxShadow: '0 1px 6px rgba(22,45,80,0.1)',
                transition: 'all 0.18s cubic-bezier(0.22,1,0.36,1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--p-navy, #162d50)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(22,45,80,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--p-white, #fff)';
                e.currentTarget.style.color = 'var(--p-navy, #162d50)';
                e.currentTarget.style.boxShadow = '0 1px 6px rgba(22,45,80,0.1)';
              }}
            >
              + Continue Recording
            </button>
          </div>

          {/* ── Template Selector ── */}
          <div style={{ marginTop: 24, animation: 'teFadeSlide 0.45s cubic-bezier(0.22,1,0.36,1) 0.2s both' }}>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--sans)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                color: 'var(--p-muted, #a8a29e)',
                marginBottom: 10,
                paddingBottom: 6,
                borderBottom: '1px solid var(--p-line, #e7e2da)',
              }}
            >
              Apply Template
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TEMPLATES.map((tmpl) => {
                const isActive = selectedTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => applyTemplate(tmpl.id)}
                    style={{
                      fontFamily: 'var(--sans)',
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase' as const,
                      padding: '8px 18px',
                      borderRadius: 100,
                      cursor: 'pointer',
                      border: isActive ? '1.5px solid #2456e3' : '1.5px solid #c5bfb5',
                      background: isActive ? '#2456e3' : 'var(--p-white, #fff)',
                      color: isActive ? '#fff' : 'var(--p-ink, #1a1a1a)',
                      boxShadow: isActive ? '0 2px 8px rgba(36,86,227,0.25)' : 'none',
                      transition: 'all 0.18s cubic-bezier(0.22,1,0.36,1)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tmpl.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Compiled Prompt ── */}
          {compiledPrompt && (
            <div style={{ marginTop: 20, animation: 'teFadeSlide 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--p-muted, #a8a29e)',
                  }}
                >
                  Compiled Prompt — {TEMPLATES.find((t) => t.id === selectedTemplate)?.label}
                </span>
                <button
                  onClick={() => copyToClipboard(compiledPrompt, 'prompt')}
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase' as const,
                    color: copied === 'prompt' ? '#16a34a' : 'var(--p-muted, #a8a29e)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: 6,
                    transition: 'color 0.15s',
                  }}
                >
                  {copied === 'prompt' ? 'Copied' : 'Copy Prompt'}
                </button>
              </div>
              <div
                style={{
                  background: 'var(--p-sand, #f3efe8)',
                  border: '1px solid var(--p-line, #e7e2da)',
                  borderRadius: 12,
                  padding: '16px 18px',
                  fontFamily: 'var(--mono, monospace)',
                  fontSize: 12.5,
                  lineHeight: 1.65,
                  color: 'var(--p-mid, #57534e)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: 320,
                  overflowY: 'auto',
                }}
              >
                {compiledPrompt}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Animations ── */}
      <style>{`
        @keyframes vt-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.3); }
          50% { transform: scale(1.04); box-shadow: 0 0 0 12px rgba(239,68,68,0); }
        }
        @keyframes vt-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
