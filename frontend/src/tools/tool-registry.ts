import type { ToolDefinition, CategoryInfo } from './types';

import fundingReadiness from './definitions/funding-readiness.json';
import businessPlanReview from './definitions/business-plan-review.json';
import sessionPrep from './definitions/session-prep.json';
import clientFollowup from './definitions/client-followup.json';
import voiceTranscription from './definitions/voice-transcription.json';
import workshopPromo from './definitions/workshop-promo.json';
import successStory from './definitions/success-story.json';
import swotFacilitator from './definitions/swot-facilitator.json';
import aiWalkthrough from './definitions/ai-walkthrough.json';
import cashFlowHelper from './definitions/cash-flow-helper.json';
import sessionNotesFormatter from './definitions/session-notes-formatter.json';
import milestoneReport from './definitions/milestone-report.json';
import impactNarrative from './definitions/impact-narrative.json';
import competitiveAnalysis from './definitions/competitive-analysis.json';
import marketingPlanBuilder from './definitions/marketing-plan-builder.json';
import clientIntakeSummary from './definitions/client-intake-summary.json';

export const toolRegistry: ToolDefinition[] = [
  fundingReadiness as ToolDefinition,
  businessPlanReview as ToolDefinition,
  sessionPrep as ToolDefinition,
  clientFollowup as ToolDefinition,
  voiceTranscription as ToolDefinition,
  workshopPromo as ToolDefinition,
  successStory as ToolDefinition,
  swotFacilitator as ToolDefinition,
  aiWalkthrough as ToolDefinition,
  cashFlowHelper as ToolDefinition,
  sessionNotesFormatter as ToolDefinition,
  milestoneReport as ToolDefinition,
  impactNarrative as ToolDefinition,
  competitiveAnalysis as ToolDefinition,
  marketingPlanBuilder as ToolDefinition,
  clientIntakeSummary as ToolDefinition,
];

/** Tools that use a custom component instead of the generic ToolEngine */
export const CUSTOM_TOOL_IDS = new Set(['voice-transcription']);

export const categories: CategoryInfo[] = [
  { id: 'all', label: 'All Tools', color: '' },
  { id: 'client-advising', label: 'Client Advising', color: '#2456e3' },
  { id: 'session-management', label: 'Session Management', color: '#16a34a' },
  { id: 'communications', label: 'Communications', color: '#e05a6f' },
  { id: 'reporting', label: 'Reporting', color: '#d97706' },
  { id: 'staff', label: 'Staff', color: '#8b5cf6' },
];

export function getToolById(id: string): ToolDefinition | undefined {
  return toolRegistry.find((t) => t.id === id);
}

export function getToolsByCategory(category: string): ToolDefinition[] {
  if (category === 'all') return toolRegistry;
  return toolRegistry.filter((t) => t.category === category);
}
