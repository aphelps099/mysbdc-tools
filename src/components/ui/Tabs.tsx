'use client';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="relative" role="tablist">
      {/* Bottom rule line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--rule-light)]" />

      <div className="flex gap-0 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-5 py-3
                text-[14px] font-[var(--sans)]
                whitespace-nowrap
                transition-all duration-[var(--duration-fast)] cursor-pointer
                border-b-2
                ${
                  isActive
                    ? 'font-medium text-[var(--text-primary)] border-[var(--navy)]'
                    : 'font-normal text-[var(--text-tertiary)] border-transparent hover:text-[var(--text-secondary)] hover:border-[var(--rule)]'
                }
              `}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`
                    text-[11px] font-[var(--mono)] tabular-nums
                    px-1.5 py-px rounded-full min-w-[22px] text-center
                    ${
                      isActive
                        ? 'bg-[var(--navy)] text-white'
                        : 'bg-[var(--cream)] text-[var(--text-tertiary)]'
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
