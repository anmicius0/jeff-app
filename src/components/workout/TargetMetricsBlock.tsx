import React from 'react';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { AdaptiveWeightRecommendation } from '../../utils/weightRecommendation';

interface TargetMetricsBlockProps {
  reps: string;
  targetRpe: number;
  isLastSet: boolean;
  recommendedWeight: number;
  adaptiveRec: AdaptiveWeightRecommendation;
}

export const TargetMetricsBlock: React.FC<TargetMetricsBlockProps> = ({
  reps,
  targetRpe,
  isLastSet,
  recommendedWeight,
  adaptiveRec,
}) => {
  return (
    <div className="bg-surface-2 border border-hairline p-3 sm:p-4">
      <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center divide-x divide-hairline">
        <div className="px-1 min-w-0">
          <span className="block text-[9px] sm:text-[10px] text-ink-subtle uppercase tracking-wider font-mono truncate">
            Target Reps
          </span>
          <span className="text-base sm:text-xl font-display tracking-wider text-white mt-0.5 block truncate">
            {reps}
          </span>
          <span className="text-[9px] sm:text-[10px] text-ink-tertiary font-mono block mt-0.5 truncate">
            hypertrophy
          </span>
        </div>

        <div className="px-1 min-w-0">
          <span className="block text-[9px] sm:text-[10px] text-ink-subtle uppercase tracking-wider font-mono truncate">
            Target Effort
          </span>
          <span className="text-base sm:text-xl font-display tracking-wider text-white mt-0.5 block truncate">
            RPE {targetRpe}
          </span>
          <span className="text-[9px] sm:text-[10px] text-ink-tertiary font-mono block mt-0.5 truncate">
            {isLastSet ? 'Final Set' : 'Early Sets'}
          </span>
        </div>

        <div className="px-1 min-w-0">
          <div className="flex items-center justify-center gap-1">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white shrink-0" />
            <span className="block text-[9px] sm:text-[10px] text-ink-subtle uppercase tracking-wider font-mono truncate">
              Suggested
            </span>
          </div>
          <span className="text-base sm:text-xl font-mono font-bold text-white mt-0.5 block truncate">
            {recommendedWeight}<span className="text-[10px] sm:text-xs font-normal text-ink-subtle font-sans">kg</span>
          </span>
          <div className="flex items-center justify-center gap-0.5 mt-0.5">
            {adaptiveRec.trend === 'increase' && <TrendingUp className="w-2.5 h-2.5 text-success shrink-0" />}
            {adaptiveRec.trend === 'decrease' && <TrendingDown className="w-2.5 h-2.5 text-sale shrink-0" />}
            <span
              className={`text-[9px] sm:text-[10px] font-mono truncate max-w-full ${
                adaptiveRec.trend === 'increase'
                  ? 'text-success font-semibold'
                  : adaptiveRec.trend === 'decrease'
                  ? 'text-sale font-semibold'
                  : 'text-ink-subtle'
              }`}
              title={adaptiveRec.reason}
            >
              {adaptiveRec.badgeText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
