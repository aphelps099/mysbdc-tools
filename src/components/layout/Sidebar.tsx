'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface SidebarProps {
  onClose?: () => void;
}

const navItems = [
  {
    href: '/intake',
    label: 'Smart 641',
    description: 'Client intake',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    href: '/milestones',
    label: 'Milestones',
    description: 'Impact tracking',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    href: '/atlas',
    label: 'ATLAS',
    description: 'Impact dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
      </svg>
    ),
  },
  {
    href: '/titles',
    label: 'Title Cards',
    description: 'Motion graphics',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    href: '/chat',
    label: 'Chat',
    description: 'Brand AI',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
      </svg>
    ),
  },
  {
    href: '/videos',
    label: 'Videos',
    description: 'Video library',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
      </svg>
    ),
  },
];


export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col min-h-full bg-[var(--navy)] text-white overflow-y-auto md:overflow-hidden">
      {/* ─── Logo ─── */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <Image
          src="/sbdc-white-2026.png"
          alt="NorCal SBDC"
          width={100}
          height={40}
          className="object-contain"
          priority
        />
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ─── App title ─── */}
      <div className="px-6 pb-5">
        <p className="font-[var(--mono)] text-[11px] tracking-wider uppercase text-white/55">
          SBDC Tools
        </p>
      </div>

      {/* ─── Divider ─── */}
      <div className="h-px bg-[var(--rule-on-dark)] mx-6" />

      {/* ─── Navigation ─── */}
      <nav className="px-4 py-4 flex-1">
        <p className="text-label text-white/40 px-2 pb-2">Tools</p>
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose?.()}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-colors duration-[var(--duration-fast)] ${
                  active
                    ? 'bg-white/[0.1] text-white'
                    : 'text-white/55 hover:bg-white/[0.06] hover:text-white/80'
                }`}
              >
                <span className={active ? 'text-white' : 'text-white/40'}>
                  {item.icon}
                </span>
                <div>
                  <p className={`text-[14px] font-[var(--sans)] ${active ? 'font-medium' : 'font-light'}`}>
                    {item.label}
                  </p>
                  <p className="text-[11px] font-[var(--mono)] text-white/25">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ─── Bottom ─── */}
      <div className="mt-auto">
        <div className="h-px bg-[var(--rule-on-dark)] mx-6" />
        <div className="px-6 py-4">
          <Link
            href="/milestone-log"
            onClick={() => onClose?.()}
            className="text-[12px] font-[var(--mono)] text-white/25 hover:text-white/50 tracking-wider uppercase transition-colors duration-[var(--duration-fast)]"
          >
            Milestone Log
          </Link>
        </div>
      </div>
    </aside>
  );
}
