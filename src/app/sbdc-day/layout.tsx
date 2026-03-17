import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SBDC Day Social Grid | NorCal SBDC',
};

export default function SbdcDayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
