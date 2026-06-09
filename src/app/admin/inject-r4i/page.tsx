import type { Metadata } from 'next';
import AdHocForm from './AdHocForm';

export const metadata: Metadata = {
  title: 'Inject R4I Records — SBDC Tools',
};

export const dynamic = 'force-dynamic';

/* ═══════════════════════════════════════════════════════
   /admin/inject-r4i — back-office injection of R4I
   applications that didn't come through the public form
   (forwarded emails, partner referrals, recovery).
   ═══════════════════════════════════════════════════════ */

export default function InjectR4iPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0b0f14',
        color: '#e5e9ee',
        padding: '40px 20px 80px',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px' }}>
          Inject R4I Records
        </h1>
        <p style={{ color: '#9aa6b2', fontSize: 14, lineHeight: 1.6, margin: '0 0 28px' }}>
          Back-office tool for adding Roadmap for Innovation applications that didn&apos;t
          come through the public form — forwarded emails, partner referrals, or recovery
          of failed submissions. Records are created in NeoSerra exactly like public-form
          submissions, but <strong style={{ color: '#e5e9ee' }}>no emails are ever sent</strong> to
          the applicant or admins. Use <em>Dry run</em> to preview the exact payloads first.
        </p>

        <AdHocForm />
      </div>
    </div>
  );
}
