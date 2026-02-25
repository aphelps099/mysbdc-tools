'use client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-[var(--cream)] text-[var(--text-secondary)]',
  success: 'bg-green-50 text-[var(--green)]',
  warning: 'bg-amber-50 text-[var(--amber)]',
  info: 'bg-blue-50 text-[var(--royal)]',
};

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1
        text-[11px] font-medium tracking-wide uppercase
        font-[var(--mono)] rounded-full
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
