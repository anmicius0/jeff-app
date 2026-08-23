import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, ArrowRight } from 'lucide-react';
import { WorkoutSessionLog } from '../../types/workout';

interface WorkoutCompleteBannerProps {
  sessionLog: WorkoutSessionLog;
  currentCycle?: number;
  onResetWorkout: () => void;
  onNextWorkoutDay: () => void;
}

export const WorkoutCompleteBanner: React.FC<WorkoutCompleteBannerProps> = ({
  sessionLog,
  currentCycle = 1,
  onResetWorkout,
  onNextWorkoutDay,
}) => {
  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#cacacb', '#1eaa52', '#d30005'],
      });
    } catch {
      // Ignored if canvas unsupported
    }
  }, []);

  const totalSets = sessionLog.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const totalVolume = sessionLog.exercises.reduce(
    (acc, ex) => acc + ex.sets.reduce((sAcc, s) => sAcc + s.weight * s.reps, 0),
    0
  );

  const isCycleFinish = sessionLog.weekNumber === 10 && (sessionLog.dayId === 'w10-d5' || sessionLog.dayName.includes('ARMS'));
  const activeCycle = sessionLog.cycleNumber || currentCycle || 1;

  return (
    <div className="w-full max-w-xl mx-auto bg-surface-1 border border-hairline-strong p-6 sm:p-8 text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="w-16 h-16 rounded-full bg-surface-2 border border-hairline mx-auto flex items-center justify-center text-white">
        <Trophy className="w-8 h-8 text-white" />
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-white">
          {isCycleFinish ? `Cycle ${activeCycle} Complete!` : 'Workout Complete!'}
        </h2>
        <p className="text-xs text-ink-subtle">
          {isCycleFinish ? (
            <span>
              Congratulations! You completed the full 10-week cycle. Ready to carry forward your gains into{' '}
              <span className="text-white font-bold">Cycle {activeCycle + 1}</span> (Week 1)!
            </span>
          ) : (
            <span>
              Great work crushing <span className="text-white font-bold">{sessionLog.dayName}</span> (C{activeCycle} · Week {sessionLog.weekNumber})
            </span>
          )}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 bg-surface-2 border border-hairline p-4 font-mono">
        <div>
          <span className="block text-[10px] text-ink-subtle uppercase tracking-wider">Exercises</span>
          <span className="text-lg font-bold text-white mt-0.5 block">{sessionLog.exercises.length}</span>
        </div>
        <div className="border-x border-hairline px-2">
          <span className="block text-[10px] text-ink-subtle uppercase tracking-wider">Total Sets</span>
          <span className="text-lg font-bold text-white mt-0.5 block">{totalSets}</span>
        </div>
        <div>
          <span className="block text-[10px] text-ink-subtle uppercase tracking-wider">Volume</span>
          <span className="text-lg font-bold text-white mt-0.5 block">
            {totalVolume.toLocaleString()} <span className="text-[10px] font-normal text-ink-subtle font-sans">kg</span>
          </span>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onResetWorkout}
          className="flex-1 py-3 rounded-full bg-surface-2 hover:bg-surface-3 border border-hairline text-white text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-2 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Review Workout</span>
        </button>
        <button
          type="button"
          onClick={onNextWorkoutDay}
          className="flex-1 py-3 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer"
        >
          <span>{isCycleFinish ? `Start Cycle ${activeCycle + 1} (Week 1)` : 'Next Workout'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

