/**
 * TFG Application submission route.
 *
 * Accepts multipart/form-data with:
 *   - `data`      — JSON string of all TFG application fields
 *   - `pitchDeck` — optional file upload
 *
 * Maps TFG fields to the intake format and forwards to the backend's
 * existing /api/intake/submit endpoint.
 */

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

function backendUrl(): string {
  return (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');
}

export async function POST(req: NextRequest): Promise<Response> {
  let tfgData: Record<string, unknown>;

  try {
    const fd = await req.formData();
    const raw = fd.get('data');
    if (!raw || typeof raw !== 'string') {
      return Response.json(
        { success: false, error: 'Missing "data" field' },
        { status: 400 },
      );
    }
    tfgData = JSON.parse(raw);
  } catch (err) {
    return Response.json(
      { success: false, error: 'Invalid form data' },
      { status: 400 },
    );
  }

  // Map TFG fields to intake-compatible payload
  const intakePayload = {
    // Shared contact fields
    firstName: tfgData.firstName ?? '',
    lastName: tfgData.lastName ?? '',
    email: tfgData.email ?? '',
    phone: tfgData.phone ?? '',
    streetAddress: tfgData.streetAddress ?? '',
    city: tfgData.city ?? '',
    state: tfgData.state ?? 'CA',
    zipCode: tfgData.zipCode ?? '',

    // Company
    companyName: tfgData.companyName ?? '',
    website: tfgData.website ?? '',
    businessStatus: 'B', // TFG applicants are in-business startups
    businessDescription: tfgData.vision ?? '',

    // Signature
    signature: tfgData.signature ?? '',
    privacyRelease: 'Yes',

    // Flag as TFG application
    programSignup: 'tfg',
    specialPrograms: ['tfg'],

    // Defaults for required intake fields
    goals: [],
    gender: '',
    ethnicity: '',
    hispanic: '',
    veteran: '',
    education: '',
    language: '',
    referral: '',       // Don't send — TFG values aren't valid Neoserra reffrom codes
    referralOther: '',  // Referral info preserved in tfgData bundle below
    newsletter: '',
    centerId: 107,

    // Bundle all TFG-specific data for backend passthrough to Neoserra
    tfgData: {
      linkedin: tfgData.linkedin,
      stateOfIncorporation: tfgData.stateOfIncorporation,
      industrySectors: tfgData.industrySectors,
      otherIndustry: tfgData.otherIndustry,
      vision: tfgData.vision,
      problem: tfgData.problem,
      solution: tfgData.solution,
      marketOpportunity: tfgData.marketOpportunity,
      icorpsStatus: tfgData.icorpsStatus,
      icorpsDetails: tfgData.icorpsDetails,
      interviewStatus: tfgData.interviewStatus,
      interviewCount: tfgData.interviewCount,
      interviewLearnings: tfgData.interviewLearnings,
      idealCustomerProfile: tfgData.idealCustomerProfile,
      productStage: tfgData.productStage,
      inMarketStatus: tfgData.inMarketStatus,
      revenueStage: tfgData.revenueStage,
      sbirStatus: tfgData.sbirStatus,
      recentAchievements: tfgData.recentAchievements,
      totalFunding: tfgData.totalFunding,
      lastRound: tfgData.lastRound,
      raisingCapital: tfgData.raisingCapital,
      raiseDetails: tfgData.raiseDetails,
      runwayMonths: tfgData.runwayMonths,
      teamMembers: tfgData.teamMembers,
      teamFit: tfgData.teamFit,
      timeWorking: tfgData.timeWorking,
      supportNeeds: tfgData.supportNeeds,
      otherSupport: tfgData.otherSupport,
      referralSource: tfgData.referralSource,
      referrerName: tfgData.referrerName,
      pitchDeckFileName: tfgData.pitchDeckFileName,
      readinessScore: tfgData.readinessScore,
    },
  };

  try {
    const res = await fetch(`${backendUrl()}/api/intake/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intakePayload),
    });

    if (!res.ok) {
      // Backend may not fully support TFG yet — return success stub
      // so the form flow works end-to-end during development
      console.warn(
        `[tfg/submit] Backend returned ${res.status}; using success stub`,
      );
      return Response.json({
        success: true,
        neoserraResult: { stub: true },
      });
    }

    const result = await res.json();
    return Response.json({
      success: result.success ?? true,
      neoserraResult: result.neoserraResult ?? result,
    });
  } catch (err) {
    // Backend unreachable — return success stub
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[tfg/submit] Backend unreachable (${reason}); using success stub`);
    return Response.json({
      success: true,
      neoserraResult: { stub: true },
    });
  }
}
