/** Smart 641 Readiness Scoring Algorithm (client-side preview).
 *
 *  Mirrors the backend calculation in backend/app/routes/intake.py
 *  so the review screen can show a live score preview before submission.
 *
 *  Weights (100 pts total):
 *    Business Status:  25 pts
 *    Docs Readiness:   25 pts
 *    Capital Timeline: 15 pts
 *    Credit Awareness: 15 pts
 *    Goals Clarity:    20 pts
 */

import type { IntakeData } from './types';

export interface ScoreBreakdown {
  total: number;
  businessStatus: number;
  docsReadiness: number;
  capitalTimeline: number;
  creditAwareness: number;
  goalsClarity: number;
  track: 'advising' | 'training' | 'urgent_capital';
  trackLabel: string;
}

export function calculateScore(data: IntakeData): ScoreBreakdown {
  let businessStatus = 0;
  let docsReadiness = 0;
  let capitalTimeline = 0;
  let creditAwareness = 0;
  let goalsClarity = 0;

  // 1. Business Status (25 pts) — "B" = in business, "P" = pre-venture
  const statusScores: Record<string, number> = { B: 25, P: 8 };
  businessStatus = statusScores[data.businessStatus] ?? 0;

  // 2. Docs Readiness (25 pts)
  const hasCapitalGoal = data.goals.includes('access_capital');
  if (hasCapitalGoal && data.docsReady) {
    const docsScores: Record<string, number> = { all_ready: 25, some_ready: 15, not_started: 5 };
    docsReadiness = docsScores[data.docsReady] ?? 0;
  } else if (!hasCapitalGoal) {
    docsReadiness = 12;
  }

  // 3. Capital Timeline (15 pts)
  if (data.capitalTimeline) {
    const timelineScores: Record<string, number> = { urgent_30: 15, near_90: 12, within_year: 8, exploring: 4 };
    capitalTimeline = timelineScores[data.capitalTimeline] ?? 0;
  } else if (!hasCapitalGoal) {
    capitalTimeline = 7;
  }

  // 4. Credit Awareness (15 pts)
  if (data.creditAwareness) {
    const creditScores: Record<string, number> = { excellent: 15, good: 12, fair: 8, unsure: 3 };
    creditAwareness = creditScores[data.creditAwareness] ?? 0;
  } else if (!hasCapitalGoal) {
    creditAwareness = 7;
  }

  // 5. Goals Clarity (20 pts)
  const gc = data.goals.length;
  goalsClarity = gc >= 3 ? 20 : gc === 2 ? 15 : gc === 1 ? 10 : 0;

  let total = businessStatus + docsReadiness + capitalTimeline + creditAwareness + goalsClarity;

  // Urgent capital auto-override
  if (data.capitalTimeline === 'urgent_30') total = 100;

  total = Math.max(0, Math.min(100, total));

  // Track (internal — user never sees "training" label)
  let track: 'advising' | 'training' | 'urgent_capital';
  if (total === 100 && data.capitalTimeline === 'urgent_30') {
    track = 'urgent_capital';
  } else if (total >= 60) {
    track = 'advising';
  } else {
    track = 'training';
  }

  // User-facing labels never say "Training"
  const trackLabels = {
    advising: 'Advising-Ready',
    training: 'Advising-Ready',
    urgent_capital: 'Urgent Capital Lane',
  };

  return {
    total,
    businessStatus,
    docsReadiness,
    capitalTimeline,
    creditAwareness,
    goalsClarity,
    track,
    trackLabel: trackLabels[track],
  };
}
