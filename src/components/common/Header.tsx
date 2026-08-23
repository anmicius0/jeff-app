import React from 'react';
import { Dumbbell, Layers, Calendar } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full h-14 bg-canvas/95 backdrop-blur-md border-b border-hairline px-3 sm:px-6 flex items-center justify-between gap-2">
      {/* Brand & Program info */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-2 border border-hairline flex items-center justify-center text-white shrink-0">
          <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <span className="text-lg sm:text-2xl font-display tracking-wider sm:tracking-widest text-white uppercase select-none whitespace-nowrap">
            JEFF APP
          </span>
          <span className="text-[9px] sm:text-[10px] font-sans font-semibold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-surface-2 border border-hairline text-ink-subtle hidden xs:inline">
            Phase 2
          </span>
        </div>
      </div>

      {/* Week / Day badge selector & tools */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
        <button
          type="button"
          onClick={onOpenWeekSelector}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-surface-2 hover:bg-surface-3 border border-hairline text-xs text-white transition active:scale-95 min-w-0 shrink"
        >
          <Calendar className="w-3.5 h-3.5 text-ink-muted shrink-0 hidden xs:inline" />
          <span className="font-mono font-bold text-white text-[11px] sm:text-xs whitespace-nowrap">C{currentCycle}·W{currentWeek}</span>
          <span className="text-ink-tertiary">·</span>
          <span className="text-ink-muted truncate max-w-[65px] xs:max-w-[100px] sm:max-w-[160px] font-medium text-[11px] sm:text-xs">
            {selectedDayName}
          </span>
        </button>

        {/* Circular icon button for warm-up guide */}
        <button
          type="button"
          onClick={onOpenWarmupGuide}
          title="General Warm-up Guide"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-muted hover:text-white flex items-center justify-center transition active:scale-95 shrink-0"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        {/* Sync / Offline indicator */}
        <div className="hidden sm:flex items-center pl-1 shrink-0">
          {isOnline ? (
            <div className="flex items-center gap-1.5 text-[11px] text-ink-subtle font-mono" title="AWS DynamoDB Synced">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="hidden md:inline text-ink-muted">Sync Ready</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-sale font-mono" title="Offline PWA Mode Active">
              <span className="w-2 h-2 rounded-full bg-sale animate-pulse" />
              <span className="hidden md:inline text-sale">Offline</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
