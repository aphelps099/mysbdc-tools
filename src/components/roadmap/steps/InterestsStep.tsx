'use client';

import type { RoadmapApplicationData } from '../types';
import { COACHING_OPTIONS, GROUP_COURSE_OPTIONS } from '../types';

interface Props {
  data: RoadmapApplicationData;
  onChange: (patch: Partial<RoadmapApplicationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function InterestsStep({ data, onChange, onNext, onBack }: Props) {
  const toggleCoaching = (id: string) => {
    const interests = data.coachingInterests.includes(id)
      ? data.coachingInterests.filter((c) => c !== id)
      : [...data.coachingInterests, id];
    onChange({ coachingInterests: interests });
  };

  const toggleCourse = (id: string) => {
    const courses = data.groupCourses.includes(id)
      ? data.groupCourses.filter((c) => c !== id)
      : [...data.groupCourses, id];
    onChange({ groupCourses: courses });
  };

  const valid = data.coachingInterests.length > 0 || data.groupCourses.length > 0;

  return (
    <div className="s641-step">
      <h2 className="s641-question">What are you interested in?</h2>
      <p className="s641-subtitle">
        Select the coaching areas and/or group training courses that
        match your needs. Choose as many as you like.
      </p>

      <div className="s641-fields" style={{ gap: 28 }}>
        {/* 1:1 Coaching */}
        <div className="s641-field">
          <label className="s641-label">Individual Coaching Areas</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {COACHING_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`s641-card s641-card-compact${data.coachingInterests.includes(opt.id) ? ' selected' : ''}`}
                onClick={() => toggleCoaching(opt.id)}
              >
                <span className="s641-card-check">
                  {data.coachingInterests.includes(opt.id) && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <div className="s641-card-content">
                  <div className="s641-card-title">{opt.label}</div>
                  <div className="s641-card-desc">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Group Courses */}
        <div className="s641-field">
          <label className="s641-label">Group Training Courses</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {GROUP_COURSE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`s641-card s641-card-compact${data.groupCourses.includes(opt.id) ? ' selected' : ''}`}
                onClick={() => toggleCourse(opt.id)}
              >
                <span className="s641-card-check">
                  {data.groupCourses.includes(opt.id) && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <div className="s641-card-content">
                  <div className="s641-card-title">{opt.label}</div>
                  <div className="s641-card-desc">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Biggest Challenge */}
        <div className="s641-field">
          <label className="s641-label">
            What is your biggest challenge right now? <span className="s641-optional">optional</span>
          </label>
          <textarea
            className="s641-input s641-textarea"
            rows={3}
            placeholder="e.g. supply chain delays, workforce retention, scaling production..."
            value={data.biggestChallenge}
            onChange={(e) => onChange({ biggestChallenge: e.target.value })}
          />
        </div>
      </div>

      <div className="s641-nav">
        <button className="s641-btn s641-btn-back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <button className="s641-btn s641-btn-primary" disabled={!valid} onClick={onNext}>
          Review & Submit
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
