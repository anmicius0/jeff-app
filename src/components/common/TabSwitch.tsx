import React from 'react';

export interface TabOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabSwitchProps<T extends string = string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  maxWidthClass?: string;
}

export function TabSwitch<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  maxWidthClass = 'max-w-sm sm:max-w-md',
}: TabSwitchProps<T>) {
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === activeTab)
  );

  const numTabs = tabs.length;
  // Calculate left offset percentage for sliding pill
  const leftPercent = (activeIndex / numTabs) * 100;
  const widthPercent = 100 / numTabs;

  return (
    <div className={`relative p-1 rounded-full bg-surface-1 border border-hairline shadow-sm w-full ${maxWidthClass} ${className}`}>
      {/* Sliding Pill Indicator */}
      <div
        className="absolute top-1 bottom-1 bg-white rounded-full transition-all duration-150 ease-spring-smooth shadow-md pointer-events-none"
        style={{
          left: `calc(${leftPercent}% + 2px)`,
          width: `calc(${widthPercent}% - 4px)`,
        }}
      />

      {/* Tab Buttons Grid */}
      <div
        className="grid relative z-10 w-full"
        style={{
          gridTemplateColumns: `repeat(${numTabs}, minmax(0, 1fr))`,
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`py-2 px-3 sm:px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors duration-150 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer select-none truncate ${
                isActive
                  ? 'text-black font-bold'
                  : 'text-ink-subtle hover:text-white'
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span className="truncate">{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-black/15 text-black' : 'bg-surface-2 text-ink-subtle'
                  }`}
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
