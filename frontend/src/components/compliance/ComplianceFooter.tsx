'use client';

export default function ComplianceFooter() {
  return (
    <div className="mt-4 px-4 py-3 rounded-r-[var(--radius-sm)]" style={{ background: 'var(--cream)', borderLeft: '3px solid var(--brick)' }}>
      <div className="flex items-start gap-2.5">
        <svg
          className="w-4 h-4 mt-0.5 text-[var(--brick)] shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
          />
        </svg>
        <div>
          <p className="text-[13px] font-[var(--era-text)] font-normal text-[var(--text-secondary)] leading-relaxed">
            <span className="font-medium">Compliance Note:</span> This output is AI-generated
            and should be carefully reviewed before sharing in advising. Always verify
            recommendations before sharing with clients.{' '}
            <a
              href="mailto:phelps@norcalsbdc.org"
              className="text-[var(--royal)] underline underline-offset-2"
            >
              phelps@norcalsbdc.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
