'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[var(--royal)] text-white hover:bg-[#1a4f96] active:bg-[#164282]',
  secondary:
    'bg-[var(--cream)] text-[var(--text-primary)] border border-[var(--rule)] hover:bg-[#e8e7e3]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--cream)] hover:text-[var(--text-primary)]',
  danger:
    'bg-[var(--red)] text-white hover:bg-[#c42020]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'px-4 py-2 text-[14px]',
  lg: 'px-6 py-3 text-[16px]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2
          font-[var(--sans)] font-medium
          rounded-[var(--radius-md)]
          transition-all duration-[var(--duration-fast)]
          cursor-pointer select-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
