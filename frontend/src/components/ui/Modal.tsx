'use client';

import { useEffect, useCallback, ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'default' | 'full';
  containerStyle?: React.CSSProperties;
}

export default function Modal({ open, onClose, children, size = 'default', containerStyle }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const sizeClasses =
    size === 'full'
      ? 'max-w-[1200px] max-h-[94vh] mt-[3vh] md:mx-4 mx-0 md:rounded-[var(--radius-lg,16px)] rounded-none'
      : 'max-w-[680px] max-h-[90vh] mt-[5vh] mx-4';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-md animate-[backdropIn_200ms_ease_both]"
        onClick={onClose}
      />
      {/* Content */}
      <div
        className={`relative w-full ${sizeClasses} flex flex-col overflow-hidden animate-[modalIn_300ms_cubic-bezier(0.16,1,0.3,1)_both] ${size === 'full' ? 'max-md:max-h-dvh max-md:mt-0 max-md:h-dvh' : ''}`}
        style={{
          background: 'var(--p-white, #fff)',
          borderRadius: size === 'full' ? undefined : 'var(--radius-lg, 16px)',
          boxShadow: '0 24px 80px -16px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.04)',
          ...containerStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
}
