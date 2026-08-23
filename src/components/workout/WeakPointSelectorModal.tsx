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
    <div className="fixed inset-0 z-50 bg-canvas/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-surface-1 border border-hairline-strong rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-hairline flex items-center justify-between bg-surface-2/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-hover">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink flex items-center gap-1.5">
                <span>Select Weak Point Focus</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-3 text-ink-subtle border border-hairline">
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
            className="p-1.5 rounded-md text-ink-subtle hover:text-ink hover:bg-surface-3 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Two-pane or Stacked Muscle Group & Exercises */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Muscle Group Chips */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-ink-subtle uppercase tracking-wider block">
              1. Choose Muscle Group
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-1 bg-surface-2/40 rounded-lg border border-hairline">
              {WEAK_POINTS_DATA.map((wp) => {
                const isSelected = wp.category === selectedCategory;
                return (
                  <button
                    key={wp.category}
                    type="button"
                    onClick={() => setSelectedCategory(wp.category)}
                    className={`px-2.5 py-2 rounded-md text-left text-xs font-medium transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-surface-3 border border-primary text-ink shadow-sm ring-1 ring-primary/40'
                        : 'bg-surface-1 hover:bg-surface-2 border border-hairline text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span className="truncate">{wp.category}</span>
                    {isSelected && <Sparkles className="w-3 h-3 text-primary-hover shrink-0" />}
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

            <div className="space-y-1.5">
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
                    className={`w-full p-3 rounded-lg border text-left transition flex items-center justify-between group ${
                      isCurrent
                        ? 'bg-surface-3 border-primary/60 text-ink ring-1 ring-primary/30'
                        : 'bg-surface-1 hover:bg-surface-2 border-hairline text-ink hover:text-ink'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold group-hover:text-primary-hover transition">
                        {opt}
                      </div>
                      <div className="text-[10px] font-mono text-ink-subtle mt-0.5">
                        {selectedCategory} · Video & 75th% Baseline Available
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrent ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/20 text-primary-hover border border-primary/40 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-ink-tertiary group-hover:text-ink-muted">
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
        <div className="p-3 border-t border-hairline bg-surface-2/40 flex items-center justify-between text-xs text-ink-subtle">
          <span>Optional: You can swap this at any time during your workout.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-surface-3 hover:bg-surface-4 text-ink transition text-xs font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
