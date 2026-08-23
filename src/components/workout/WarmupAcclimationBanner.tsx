import React from 'react';
import { Flame, Clock } from 'lucide-react';

interface WarmupAcclimationBannerProps {
  minimalWarmupWeight: number;
  isWarmupDone: boolean;
  onToggleWarmupDone: () => void;
  onOpenRestTimer: (secs: number) => void;
}

export const WarmupAcclimationBanner: React.FC<WarmupAcclimationBannerProps> = ({
  minimalWarmupWeight,
  isWarmupDone,
  onToggleWarmupDone,
  onOpenRestTimer,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-surface-2 border border-hairline text-xs font-mono">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <Flame className="w-3.5 h-3.5 text-sale shrink-0" />
        <span className="text-white font-semibold uppercase tracking-wider text-[11px] sm:text-xs whitespace-nowrap">Warm-Up:</span>
        <span className="text-white font-bold text-[11px] sm:text-xs whitespace-nowrap">{minimalWarmupWeight}kg × 8</span>
        <span className="text-[10px] text-ink-tertiary hidden xs:inline">(~50%)</span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
        <button
          type="button"
          onClick={() => onOpenRestTimer(60)}
          className="px-2.5 py-1 rounded-full bg-surface-3 hover:bg-surface-4 border border-hairline text-[10px] sm:text-[11px] text-ink-subtle hover:text-white flex items-center gap-1 apple-press cursor-pointer"
          title="Start 60s warm-up rest"
        >
          <Clock className="w-3 h-3" />
          <span>60s</span>
        </button>
        <button
          type="button"
          onClick={onToggleWarmupDone}
          className={`px-2.5 sm:px-3 py-1 rounded-full border text-[10px] sm:text-[11px] font-medium apple-press cursor-pointer ${
            isWarmupDone
              ? 'bg-success/20 border-success text-success font-bold'
              : 'bg-surface-3 hover:bg-surface-4 border-hairline text-ink-muted'
          }`}
        >
          {isWarmupDone ? 'Done ✓' : 'Mark Done'}
        </button>
      </div>
    </div>
  );
};
