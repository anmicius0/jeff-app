import React from 'react';
import { Check, Edit2, ArrowRight } from 'lucide-react';
import { Exercise, SetLog } from '../../types/workout';

interface SetLoggingPanelProps {
  exercise: Exercise;
  currentSetIndex: number;
  editingSetIndex: number | null;
  currentTargetRpe: number;
  inputWeight: number;
  inputReps: number;
  setInputWeight: React.Dispatch<React.SetStateAction<number>>;
  setInputReps: React.Dispatch<React.SetStateAction<number>>;
  onCancelEdit: () => void;
  onCompleteSet: () => void;
  isExerciseDone: boolean;
  completedSets: SetLog[];
  onEditLastSet: () => void;
  onNextExercise: () => void;
  isLastExerciseInDay: boolean;
}

export const SetLoggingPanel: React.FC<SetLoggingPanelProps> = ({
  exercise,
  currentSetIndex,
  editingSetIndex,
  currentTargetRpe,
  inputWeight,
  inputReps,
  setInputWeight,
  setInputReps,
  onCancelEdit,
  onCompleteSet,
  isExerciseDone,
  completedSets,
  onEditLastSet,
  onNextExercise,
  isLastExerciseInDay,
}) => {
  if (isExerciseDone) {
    return (
      <div className="p-4 sm:p-5 bg-surface-2 border border-hairline text-center space-y-3 sm:space-y-4 animate-scale-in">
        <div className="text-xs sm:text-sm font-semibold text-white flex items-center justify-center gap-2 uppercase tracking-wider">
          <Check className="w-4 h-4 text-success stroke-[3] shrink-0" />
          <span>Exercise Completed ({completedSets.length} Sets Logged)</span>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onEditLastSet}
            className="flex-1 h-11 bg-surface-3 hover:bg-surface-4 border border-hairline text-white font-medium text-xs rounded-full apple-press flex items-center justify-center gap-1.5 uppercase tracking-wider truncate px-2 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Edit Last Set</span>
          </button>
          <button
            type="button"
            onClick={onNextExercise}
            className="flex-1 h-11 bg-white hover:bg-neutral-200 text-black font-bold text-xs rounded-full apple-press flex items-center justify-center gap-1.5 shadow-md uppercase tracking-wider truncate px-2 cursor-pointer"
          >
            <span className="truncate">{isLastExerciseInDay ? 'Finish Session' : 'Next Exercise'}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-1">
      {/* Set Tracker Header */}
      <div className="flex items-center justify-between text-xs pb-1 border-b border-hairline">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="font-mono font-bold text-white uppercase tracking-wider text-xs">
            {editingSetIndex !== null
              ? `Editing Set ${editingSetIndex + 1}`
              : `Set ${currentSetIndex + 1} of ${exercise.workingSets}`}
          </span>
          {editingSetIndex !== null && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="text-ink-subtle hover:text-white text-xs underline ml-2 cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
        <span className="text-ink-subtle font-mono text-xs">
          Target: RPE {currentTargetRpe}
        </span>
      </div>

      {/* Steppers for Weight & Reps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Weight input with Steppers */}
        <div className="p-3.5 sm:p-4 bg-surface-2 border border-hairline hover:border-hairline-strong transition-colors duration-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-semibold text-ink-subtle uppercase tracking-wider">Weight (kg)</label>
            <span className="text-[10px] font-mono text-ink-tertiary">Step ±2.5kg</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setInputWeight((prev) => Math.max(0, Math.round((prev - 2.5) * 2) / 2))}
              className="w-12 h-12 rounded-full bg-surface-3 hover:bg-surface-4 active:bg-white active:text-black border border-hairline text-white font-mono text-2xl font-bold flex items-center justify-center transition-all duration-150 active:scale-90 active:rotate-[-6deg] shrink-0 cursor-pointer select-none shadow-sm"
              title="Minus 2.5kg"
            >
              -
            </button>
            <div className="flex-1 min-w-0 relative">
              <input
                key={inputWeight}
                type="number"
                step="0.5"
                value={inputWeight}
                onChange={(e) => setInputWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-1 border border-hairline focus:border-white focus:ring-1 focus:ring-white/30 text-white rounded-md h-12 text-center text-2xl sm:text-3xl font-mono font-bold outline-none transition-all duration-200 animate-number-tick"
              />
            </div>
            <button
              type="button"
              onClick={() => setInputWeight((prev) => Math.round((prev + 2.5) * 2) / 2)}
              className="w-12 h-12 rounded-full bg-surface-3 hover:bg-surface-4 active:bg-white active:text-black border border-hairline text-white font-mono text-2xl font-bold flex items-center justify-center transition-all duration-150 active:scale-90 active:rotate-[6deg] shrink-0 cursor-pointer select-none shadow-sm"
              title="Plus 2.5kg"
            >
              +
            </button>
          </div>
          {/* Plate quick buttons */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[-5, -2.5, +2.5, +5].map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => setInputWeight((prev) => Math.max(0, prev + delta))}
                className="min-h-[38px] py-2 text-xs font-mono font-semibold bg-surface-3 hover:bg-surface-4 active:bg-white active:text-black border border-hairline text-ink-muted hover:text-white rounded-md transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer select-none"
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>
        </div>

        {/* Reps input with Steppers */}
        <div className="p-3.5 sm:p-4 bg-surface-2 border border-hairline hover:border-hairline-strong transition-colors duration-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-semibold text-ink-subtle uppercase tracking-wider">Reps</label>
            <span className="text-[10px] font-mono text-ink-tertiary">Target: {exercise.reps}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setInputReps((prev) => Math.max(1, prev - 1))}
              className="w-12 h-12 rounded-full bg-surface-3 hover:bg-surface-4 apple-stepper-press border border-hairline text-white font-mono text-2xl font-bold flex items-center justify-center shrink-0 cursor-pointer select-none shadow-sm"
              title="Minus 1 rep"
            >
              -
            </button>
            <div className="flex-1 min-w-0 relative">
              <input
                key={inputReps}
                type="number"
                value={inputReps}
                onChange={(e) => setInputReps(parseInt(e.target.value) || 0)}
                className="w-full bg-surface-1 border border-hairline apple-focus-ring text-white rounded-md h-12 text-center text-2xl sm:text-3xl font-mono font-bold outline-none apple-num-tick"
              />
            </div>
            <button
              type="button"
              onClick={() => setInputReps((prev) => prev + 1)}
              className="w-12 h-12 rounded-full bg-surface-3 hover:bg-surface-4 apple-stepper-press border border-hairline text-white font-mono text-2xl font-bold flex items-center justify-center shrink-0 cursor-pointer select-none shadow-sm"
              title="Plus 1 rep"
            >
              +
            </button>
          </div>
          {/* Common rep targets */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[8, 10, 12, 15].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setInputReps(r)}
                className={`min-h-[38px] py-2 text-xs font-mono border rounded-md apple-press flex items-center justify-center cursor-pointer select-none ${
                  inputReps === r
                    ? 'bg-white text-black font-bold border-white shadow-sm scale-[1.02]'
                    : 'bg-surface-3 hover:bg-surface-4 active:bg-white active:text-black border-hairline text-ink-muted hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Universal Nike-Style White CTA Pill with Apple Tactile Feedback */}
      <button
        type="button"
        onClick={onCompleteSet}
        className="w-full min-h-[52px] py-3.5 px-4 sm:px-6 bg-white hover:bg-neutral-200 apple-press text-black font-sans font-bold text-xs sm:text-sm rounded-full flex items-center justify-between gap-2 shadow-lg hover:shadow-xl cursor-pointer uppercase tracking-wider select-none group"
      >
        <div className="flex items-center gap-2.5 truncate">
          <Check className="w-5 h-5 stroke-[2.5] shrink-0 group-active:scale-110 transition-transform duration-100" />
          <span className="truncate">
            {editingSetIndex !== null
              ? `Save Set ${editingSetIndex + 1}`
              : `Log Set ${currentSetIndex + 1} of ${exercise.workingSets}`}
          </span>
        </div>
        <span className="font-mono text-xs px-3 py-1.5 rounded-full bg-black/10 text-black font-bold shrink-0 whitespace-nowrap group-hover:bg-black/15 transition-colors">
          {inputWeight}kg × {inputReps}
        </span>
      </button>
    </div>
  );
};
