import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Apply for R4I',
  description: 'Ready for Impact Application — NorCal SBDC',
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
