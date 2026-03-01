import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tech Futures Group',
  description: 'TFG Application & AI Content Tools — NorCal SBDC',
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
