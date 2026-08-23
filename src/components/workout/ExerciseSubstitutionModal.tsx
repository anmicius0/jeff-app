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
      <div className="bg-surface-1 border border-hairline-strong rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-ink">Exercise Substitutions</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-ink-subtle hover:text-ink hover:bg-surface-2 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-ink-subtle">
          Select an equipment substitution or powerlifting variant:
        </p>

        <div className="space-y-2">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectAlternative(opt);
                onClose();
              }}
              className={`w-full text-left p-3 rounded-md border transition text-xs font-medium ${
                opt === exercise.name
                  ? 'bg-surface-2 border-primary/50 text-ink ring-1 ring-primary/30'
                  : 'bg-surface-1 hover:bg-surface-2 border-hairline text-ink-muted hover:text-ink'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{opt}</span>
                {opt === exercise.name && (
                  <span className="text-[10px] font-mono text-primary-hover uppercase">Current</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
