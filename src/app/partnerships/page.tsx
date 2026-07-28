import type { Metadata } from 'next';
import { PartnershipsApp } from '@/components/partnerships/PartnershipsApp';

/* ═══════════════════════════════════════════════════════
   /partnerships — Partnership CRM
   Track partner organizations (banks, CDFIs, chambers,
   EDCs, funders, event partners) through a relationship
   pipeline. Shareable directly via the CRM-only password
   (see /partnerships/login + middleware.ts).
   ═══════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  title: 'Partnership CRM — NorCal SBDC',
  description:
    'Track partner organizations through a relationship pipeline — owners, stages, referrals, and follow-ups.',
  robots: { index: false, follow: false },
};

export default function PartnershipsPage() {
  return <PartnershipsApp />;
}
