import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { Exercise } from '../../types/workout';

interface ExerciseHeaderProps {
  exercise: Exercise;
  currentSetIndex: number;
}

export const ExerciseHeader: React.FC<ExerciseHeaderProps> = ({
  exercise,
  currentSetIndex,
}) => {
  const displaySetIndex =
    currentSetIndex + 1 > exercise.workingSets
      ? exercise.workingSets
      : currentSetIndex + 1;

  return (
    <div className="space-y-2">
      <span className="text-[11px] font-mono tracking-widest text-ink-subtle uppercase block">
        Exercise {displaySetIndex} Target
      </span>
      <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white leading-tight w-full">
        {exercise.name}
      </h2>
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <span className="text-xs font-mono font-bold text-white">
          {exercise.workingSets} Working Sets × {exercise.reps} Reps
        </span>
        <span className="text-ink-tertiary">·</span>
        <span className="text-xs text-ink-subtle flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3 text-ink-tertiary" /> {exercise.rest}
        </span>
        {exercise.intensityTechnique && exercise.intensityTechnique !== 'N/A' && (
          <>
            <span className="text-ink-tertiary">·</span>
            <span className="text-[10px] sm:text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-surface-2 text-white border border-hairline uppercase tracking-wider inline-flex items-center gap-1">
              <Zap className="w-3 h-3 text-white" />
              <span>{exercise.intensityTechnique}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
};
