import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { SetLog } from '../../types/workout';

interface SetHistoryGridProps {
  workingSets: number;
  completedSets: SetLog[];
  currentSetIndex: number;
  editingSetIndex: number | null;
  isExerciseDone: boolean;
  onEditSet: (index: number) => void;
  onDeleteSet: (index: number) => void;
  onAddExtraSet: () => void;
}

export const SetHistoryGrid: React.FC<SetHistoryGridProps> = ({
  workingSets,
  completedSets,
  currentSetIndex,
  editingSetIndex,
  isExerciseDone,
  onEditSet,
  onDeleteSet,
  onAddExtraSet,
}) => {
  const totalSlots = Math.max(workingSets, completedSets.length);

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider">
          Sets Logged (Tap to Edit / Delete)
        </span>
        {completedSets.length >= workingSets && (
          <button
            type="button"
            onClick={onAddExtraSet}
            className="text-[10px] font-mono text-white flex items-center gap-1 hover:underline uppercase tracking-wider apple-press cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add Extra Set
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {Array.from({ length: totalSlots }).map((_, idx) => {
          const logged = completedSets[idx];
          const isCurrent = idx === currentSetIndex && !isExerciseDone;
          const isBeingEdited = idx === editingSetIndex;

          return (
            <div
              key={idx}
              onClick={() => {
                if (logged) onEditSet(idx);
              }}
              className={`min-h-[58px] p-2.5 sm:p-3 border text-center text-xs font-mono transition-all duration-100 relative group select-none ${
                logged
                  ? isBeingEdited
                    ? 'bg-surface-3 border-white text-white ring-2 ring-white/50 apple-card-press'
                    : 'bg-surface-2 hover:bg-surface-3 active:bg-surface-4 border-hairline text-white cursor-pointer apple-card-press'
                  : isCurrent
                  ? 'bg-surface-1 border-white text-white'
                  : 'bg-surface-1/40 border-hairline text-ink-tertiary'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-ink-subtle">
                <span className="font-bold">SET {idx + 1}</span>
                {logged && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSet(idx);
                    }}
                    title="Delete set"
                    className="w-5 h-5 -mr-1 -mt-1 rounded flex items-center justify-center text-ink-subtle hover:text-sale active:scale-95 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="mt-1 font-bold text-sm text-white">
                {logged ? `${logged.weight}kg × ${logged.reps}` : '—'}
              </div>
              {logged?.techniqueDetail && (
                <div className="text-[9px] text-ink-muted font-mono truncate mt-0.5" title={logged.techniqueDetail}>
                  {logged.techniqueDetail}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
