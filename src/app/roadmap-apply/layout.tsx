import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply for R4I',
};

export default function RoadmapApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
