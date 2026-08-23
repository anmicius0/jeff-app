import React, { useState } from 'react';
import { X, Target, Check, Sparkles } from 'lucide-react';
import { WEAK_POINTS_DATA } from '../../data/weakPoints';

interface WeakPointSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exerciseName: string) => void;
  exerciseSlot: 'Exercise 1' | 'Exercise 2' | 'Any';
  currentExerciseName?: string;
}

export const WeakPointSelectorModal: React.FC<WeakPointSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
  exerciseSlot,
  currentExerciseName,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    WEAK_POINTS_DATA[0].category
  );

  if (!isOpen) return null;

  const currentCategoryData =
    WEAK_POINTS_DATA.find((c) => c.category === selectedCategory) ||
    WEAK_POINTS_DATA[0];

  const slotOptions =
    exerciseSlot === 'Exercise 2'
      ? currentCategoryData.exercise2Options
      : exerciseSlot === 'Exercise 1'
      ? currentCategoryData.exercise1Options
      : [
          ...currentCategoryData.exercise1Options,
          ...currentCategoryData.exercise2Options,
        ];

  return (
    <div className="fixed inset-0 z-50 bg-canvas/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-backdrop-fade">
      <div className="bg-surface-1 border border-hairline-strong max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-modal-pop">
        {/* Modal Header */}
        <div className="p-4 border-b border-hairline flex items-center justify-between bg-surface-2/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-white">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-display uppercase tracking-wider text-white flex items-center gap-2">
                <span>Select Weak Point Focus</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-surface-3 text-white border border-hairline uppercase">
                  {exerciseSlot}
                </span>
              </h3>
              <p className="text-[11px] text-ink-subtle">
                Pick your target muscle group from the Hypertrophy Handbook
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-ink-subtle hover:text-white apple-press cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Muscle Group & Exercises */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Muscle Group Chips (Filter Chips) */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-ink-subtle uppercase tracking-wider block">
              1. Choose Muscle Group
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1.5 bg-surface-2 border border-hairline">
              {WEAK_POINTS_DATA.map((wp) => {
                const isSelected = wp.category === selectedCategory;
                return (
                  <button
                    key={wp.category}
                    type="button"
                    onClick={() => setSelectedCategory(wp.category)}
                    className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider apple-press flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black border-white shadow-sm font-bold'
                        : 'bg-surface-1 hover:bg-surface-3 border border-hairline text-ink-muted hover:text-white'
                    }`}
                  >
                    <span className="truncate">{wp.category}</span>
                    {isSelected && <Sparkles className="w-3 h-3 text-black shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exercise Selection For This Muscle Group */}
          <div className="space-y-2 pt-2 border-t border-hairline">
            <label className="text-[11px] font-mono text-ink-subtle uppercase tracking-wider flex items-center justify-between">
              <span>2. Choose Exercise ({selectedCategory})</span>
              <span className="text-[10px] text-ink-tertiary">Tap to assign</span>
            </label>

            <div className="space-y-2">
              {slotOptions.map((opt) => {
                const isCurrent = opt === currentExerciseName;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onSelectExercise(opt);
                      onClose();
                    }}
                    className={`w-full p-3.5 border text-left apple-card-press flex items-center justify-between group cursor-pointer ${
                      isCurrent
                        ? 'bg-surface-2 border-white text-white'
                        : 'bg-surface-1 hover:bg-surface-2 border-hairline text-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider">
                        {opt}
                      </div>
                      <div className="text-[10px] font-mono text-ink-subtle mt-0.5">
                        {selectedCategory} · Video & 75th% Baseline Available
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrent ? (
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white text-black font-bold flex items-center gap-1 uppercase">
                          <Check className="w-3 h-3 stroke-[3]" /> Active
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-ink-subtle group-hover:text-white">
                          Select →
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-hairline bg-surface-2/60 flex items-center justify-between text-xs text-ink-subtle">
          <span>Optional: You can swap this at any time during your workout.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-surface-3 hover:bg-surface-4 text-white text-xs font-semibold uppercase tracking-wider apple-press cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
