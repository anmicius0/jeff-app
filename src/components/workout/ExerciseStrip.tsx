import React from 'react';
import { Check } from 'lucide-react';
import { Exercise, WorkoutSessionLog } from '../../types/workout';
import { matchesExercise } from '../../utils/exerciseMatching';

interface ExerciseStripProps {
  dayName: string;
  exercises: Exercise[];
  activeExerciseIndex: number;
  exerciseOverrides: Record<string, string>;
  currentSessionLog: WorkoutSessionLog;
  completedExercisesCount: number;
  onSelectExerciseIndex: (index: number) => void;
}

export const ExerciseStrip: React.FC<ExerciseStripProps> = ({
  dayName,
  exercises,
  activeExerciseIndex,
  exerciseOverrides,
  currentSessionLog,
  completedExercisesCount,
  onSelectExerciseIndex,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs text-ink-subtle px-1">
        <span className="uppercase tracking-widest font-mono text-[11px]">Exercises ({dayName})</span>
        <span className="font-mono text-xs">
          {completedExercisesCount} / {exercises.length} Completed
        </span>
      </div>

      {/* Horizontal Scrollable Exercise Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {exercises.map((rawEx, idx) => {
          const exName = exerciseOverrides[rawEx.id] || rawEx.name;
          const isSelected = idx === activeExerciseIndex;
          const exLog = currentSessionLog.exercises.find((e) =>
            matchesExercise(e, { ...rawEx, name: exName })
          );
          const setsCount = exLog?.sets ? exLog.sets.filter((s) => s && s.completed).length : 0;
          const isDone = setsCount >= rawEx.workingSets || Boolean(exLog?.completed);

          return (
            <button
              key={rawEx.id}
              type="button"
              onClick={() => onSelectExerciseIndex(idx)}
              className={`min-h-[46px] shrink-0 px-3.5 py-2.5 border text-xs text-left apple-card-press flex items-center gap-2.5 select-none cursor-pointer ${
                isSelected
                  ? 'bg-surface-2 border-white text-white shadow-sm'
                  : 'bg-surface-1 hover:bg-surface-2 active:bg-surface-3 border-hairline text-ink-muted hover:text-white'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                  isDone
                    ? 'bg-success text-black border-success'
                    : isSelected
                    ? 'bg-white text-black border-white'
                    : 'bg-surface-2 border-hairline text-ink-subtle'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
              </span>
              <div className="max-w-[150px] truncate">
                <div className="font-semibold truncate">{exName}</div>
                <div className="text-[10px] font-mono text-ink-subtle">
                  {setsCount}/{rawEx.workingSets} Sets
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
