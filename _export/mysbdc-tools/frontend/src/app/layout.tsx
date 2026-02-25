import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NorCal SBDC Tools',
  description: 'Client-facing SBDC tools — intake, milestones, impact tracking, and more',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
