import React from 'react';
import { X, RefreshCw } from 'lucide-react';
import { Exercise } from '../../types/workout';

interface ExerciseSubstitutionModalProps {
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
  onSelectAlternative: (name: string) => void;
}

export const ExerciseSubstitutionModal: React.FC<ExerciseSubstitutionModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onSelectAlternative,
}) => {
  if (!isOpen) return null;

  const options = [
    exercise.name,
    exercise.substitution1,
    exercise.substitution2,
  ].filter(Boolean) as string[];

  return (
    <div className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-1 border border-hairline-strong max-w-md w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-white">
              <RefreshCw className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-display uppercase tracking-wider text-white">Exercise Substitutions</h3>
              <p className="text-[11px] text-ink-subtle">Switch equipment or biomechanical variation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-ink-subtle hover:text-white transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-ink-subtle font-mono uppercase tracking-wider">
          Select an equipment substitution:
        </p>

        <div className="space-y-2">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectAlternative(opt);
                onClose();
              }}
              className={`w-full text-left p-3.5 border transition text-xs font-semibold uppercase tracking-wider active:scale-95 ${
                opt === exercise.name
                  ? 'bg-surface-2 border-white text-white'
                  : 'bg-surface-1 hover:bg-surface-2 border-hairline text-ink-muted hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{opt}</span>
                {opt === exercise.name && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-black font-bold uppercase">Current</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
