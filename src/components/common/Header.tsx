import React from 'react';
import { Dumbbell, Cloud, CloudOff, Layers, Calendar } from 'lucide-react';

interface HeaderProps {
  currentCycle?: number;
  currentWeek: number;
  selectedDayName: string;
  isOnline: boolean;
  onOpenWeekSelector: () => void;
  onOpenWarmupGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCycle = 1,
  currentWeek,
  selectedDayName,
  isOnline,
  onOpenWeekSelector,
  onOpenWarmupGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-canvas/90 backdrop-blur border-b border-hairline px-3 sm:px-4 flex items-center justify-between gap-2">
      {/* Brand & Program info */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-md bg-surface-2 border border-hairline flex items-center justify-center text-primary">
          <Dumbbell className="w-4 h-4 text-primary" />
        </div>
        <div>
          <span className="text-xs sm:text-sm font-semibold tracking-tight text-ink flex items-center gap-1 sm:gap-1.5">
            PURE <span className="text-primary font-bold">BB</span>
            <span className="hidden xs:inline text-[10px] px-1.5 py-0.2 rounded bg-surface-2 border border-hairline text-ink-subtle font-mono uppercase">
              Phase 2
            </span>
          </span>
        </div>
      </div>

      {/* Week / Day badge selector */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <button
          type="button"
          onClick={onOpenWeekSelector}
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-surface-1 hover:bg-surface-2 border border-hairline text-xs text-ink transition min-w-0"
        >
          <Calendar className="w-3.5 h-3.5 text-primary-hover shrink-0" />
          <span className="font-mono font-medium text-primary-hover">C{currentCycle}</span>
          <span className="text-ink-tertiary font-mono">·</span>
          <span className="font-mono font-medium">W{currentWeek}</span>
          <span className="text-ink-subtle">·</span>
          <span className="text-ink-muted truncate max-w-[80px] sm:max-w-[160px]">
            {selectedDayName}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenWarmupGuide}
          title="General Warm-up Guide"
          className="p-1.5 rounded-md bg-surface-1 hover:bg-surface-2 border border-hairline text-ink-subtle hover:text-ink transition shrink-0"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Sync / Offline indicator */}
        <div className="hidden sm:flex items-center pl-1 shrink-0">
          {isOnline ? (
            <div className="flex items-center gap-1 text-[11px] text-ink-subtle" title="AWS DynamoDB Synced">
              <Cloud className="w-3.5 h-3.5 text-semantic-success" />
              <span className="hidden md:inline">Sync Ready</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-ink-tertiary" title="Offline PWA Mode Active">
              <CloudOff className="w-3.5 h-3.5 text-amber-500/70" />
              <span className="hidden md:inline">Offline Mode</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
