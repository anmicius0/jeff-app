import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Trash2,
  Target,
} from 'lucide-react';
import { Exercise, SetLog, PreviousPerformanceInfo } from '../../types/workout';
import { calculateAdaptiveRecommendation, parseTargetReps } from '../../utils/weightRecommendation';
import { WorkoutVideoPlayer } from './WorkoutVideoPlayer';
import { ExerciseHeader } from './ExerciseHeader';
import { TargetMetricsBlock } from './TargetMetricsBlock';
import { WarmupAcclimationBanner } from './WarmupAcclimationBanner';
import { SetLoggingPanel } from './SetLoggingPanel';
import { SetHistoryGrid } from './SetHistoryGrid';

interface CurrentWorkoutPromptProps {
  exercise: Exercise;
  currentWeek?: number;
  currentCycle?: number;
  currentSetIndex: number;
  completedSets: SetLog[];
  previousWeekSets?: SetLog[];
  previousPerformance?: PreviousPerformanceInfo;
  onLogSet: (weight: number, reps: number, rpe?: number, indexToEdit?: number | null) => void;
  onClearExerciseSets: () => void;
  onDeleteSet: (index: number) => void;
  onOpenRestTimer: (seconds: number) => void;
  onNextExercise: () => void;
  onSelectSubstitution?: () => void;
  onSelectWeakPoint?: () => void;
  isLastExerciseInDay: boolean;
}

function parseRestSeconds(restStr: string): number {
  if (restStr.includes('3 min')) return 180;
  if (restStr.includes('2.5 min')) return 150;
  if (restStr.includes('2 min')) return 120;
  if (restStr.includes('90 sec')) return 90;
  if (restStr.includes('60 sec')) return 60;
  return 120;
}

export const CurrentWorkoutPrompt: React.FC<CurrentWorkoutPromptProps> = ({
  exercise,
  currentSetIndex,
  completedSets,
  previousWeekSets = [],
  previousPerformance,
  onLogSet,
  onClearExerciseSets,
  onDeleteSet,
  onOpenRestTimer,
  onNextExercise,
  onSelectSubstitution,
  onSelectWeakPoint,
  isLastExerciseInDay,
}) => {
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [isWarmupDone, setIsWarmupDone] = useState<boolean>(false);
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);

  const isCurrentSetLastSet = currentSetIndex >= exercise.workingSets - 1;
  const currentTargetRpe = isCurrentSetLastSet ? 10 : 9;

  // Calculate adaptive weight recommendation
  const adaptiveRec = useMemo(() => {
    return calculateAdaptiveRecommendation({
      exercise,
      currentSetIndex,
      completedSets,
      previousWeekSets,
      previousPerformance,
    });
  }, [exercise, currentSetIndex, completedSets, previousWeekSets, previousPerformance]);

  const recommendedWeight = adaptiveRec.recommendedWeight;
  const defaultReps = parseTargetReps(exercise.reps).defaultReps;

  const [inputWeight, setInputWeight] = useState<number>(recommendedWeight);
  const [inputReps, setInputReps] = useState<number>(defaultReps);

  // Sync inputs when set changes
  useEffect(() => {
    if (editingSetIndex !== null && completedSets[editingSetIndex]) {
      setInputWeight(completedSets[editingSetIndex].weight);
      setInputReps(completedSets[editingSetIndex].reps);
      return;
    }

    if (completedSets.length > 0) {
      const lastLogged = completedSets[completedSets.length - 1];
      setInputWeight(lastLogged.weight);
      setInputReps(lastLogged.reps);
    } else {
      setInputWeight(recommendedWeight);
      setInputReps(defaultReps);
    }
  }, [currentSetIndex, exercise.id, recommendedWeight, defaultReps, editingSetIndex, completedSets]);

  const minimalWarmupWeight = Math.max(0, Math.round((recommendedWeight * 0.5) * 2) / 2);
  const isExerciseDone = completedSets.length >= exercise.workingSets;

  const handleCompleteCurrentSet = () => {
    try {
      if ('vibrate' in navigator) navigator.vibrate(50);
    } catch {}

    onLogSet(inputWeight, inputReps, currentTargetRpe, editingSetIndex);

    if (editingSetIndex === null) {
      const restSecs = parseRestSeconds(exercise.rest);
      onOpenRestTimer(restSecs);
    }
    setEditingSetIndex(null);
  };

  const handleEditSet = (index: number) => {
    const targetSet = completedSets[index];
    if (targetSet) {
      setInputWeight(targetSet.weight);
      setInputReps(targetSet.reps);
      setEditingSetIndex(index);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Exercise Card */}
      <div className="bg-surface-1 border border-hairline p-4 sm:p-6 space-y-5 relative overflow-hidden">
        {/* Modular Header */}
        <ExerciseHeader exercise={exercise} currentSetIndex={currentSetIndex} />

        {/* Action Pills: Substitutions, Form Cues & Reset */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {onSelectWeakPoint && (
            <button
              type="button"
              onClick={onSelectWeakPoint}
              className="min-h-[38px] text-xs px-4 py-2 rounded-full bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200 apple-press flex items-center gap-1.5 cursor-pointer select-none shadow-sm"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Choose Weak Point</span>
            </button>
          )}
          {exercise.substitution1 && !onSelectWeakPoint && (
            <button
              type="button"
              onClick={onSelectSubstitution}
              className="min-h-[38px] text-xs px-3.5 py-2 rounded-full bg-surface-2 hover:bg-surface-3 active:bg-surface-4 border border-hairline text-ink-muted hover:text-white apple-press flex items-center gap-1.5 cursor-pointer select-none"
            >
              <Layers className="w-3.5 h-3.5 text-white" />
              <span>Swap Exercise</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="min-h-[38px] text-xs px-3.5 py-2 rounded-full bg-surface-2 hover:bg-surface-3 active:bg-surface-4 border border-hairline text-ink-muted hover:text-white apple-press flex items-center gap-1.5 cursor-pointer select-none"
          >
            <span>Form Cues</span>
            {showNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-ink-subtle" />}
          </button>
          {completedSets.length > 0 && (
            <button
              type="button"
              onClick={onClearExerciseSets}
              className="min-h-[38px] text-xs px-3.5 py-2 rounded-full bg-surface-2 hover:bg-sale-deep/40 active:bg-sale/20 border border-hairline hover:border-sale/40 text-ink-subtle hover:text-sale apple-press flex items-center gap-1.5 ml-auto cursor-pointer select-none"
              title="Reset all recorded sets for this exercise"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Sets</span>
            </button>
          )}
        </div>

        {exercise.name.toLowerCase().includes('weak point') && onSelectWeakPoint && (
          <div className="mt-2 p-3.5 bg-surface-2 border border-hairline flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-white" />
                <span>Choose Weak Point Focus</span>
              </div>
              <div className="text-[11px] text-ink-subtle mt-0.5">
                Select a muscle group (Shoulders, Lats, Quads, Chest, etc.) to assign this slot.
              </div>
            </div>
            <button
              type="button"
              onClick={onSelectWeakPoint}
              className="shrink-0 px-4 py-2 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider apple-press cursor-pointer"
            >
              Select Focus
            </button>
          </div>
        )}

        {showNotes && (
          <div className="mt-2 p-3.5 bg-surface-2 border border-hairline text-xs text-ink-muted leading-relaxed animate-in fade-in">
            {exercise.notes}
          </div>
        )}

        {/* Video Demonstration Embedded On Top Card */}
        <div className="pt-1">
          <WorkoutVideoPlayer exerciseName={exercise.name} defaultExpanded={true} />
        </div>

        {/* Modular 3-Column Target Metrics Block */}
        <TargetMetricsBlock
          reps={exercise.reps}
          targetRpe={currentTargetRpe}
          isLastSet={isCurrentSetLastSet}
          recommendedWeight={recommendedWeight}
          adaptiveRec={adaptiveRec}
        />

        {/* Modular Minimal Acclimation Set */}
        {completedSets.length === 0 && (
          <WarmupAcclimationBanner
            minimalWarmupWeight={minimalWarmupWeight}
            isWarmupDone={isWarmupDone}
            onToggleWarmupDone={() => {
              setIsWarmupDone(!isWarmupDone);
              try {
                if ('vibrate' in navigator) navigator.vibrate(30);
              } catch {}
            }}
            onOpenRestTimer={onOpenRestTimer}
          />
        )}

        {/* Modular Set Logging Panel */}
        <SetLoggingPanel
          exercise={exercise}
          currentSetIndex={currentSetIndex}
          editingSetIndex={editingSetIndex}
          currentTargetRpe={currentTargetRpe}
          inputWeight={inputWeight}
          inputReps={inputReps}
          setInputWeight={setInputWeight}
          setInputReps={setInputReps}
          onCancelEdit={() => setEditingSetIndex(null)}
          onCompleteSet={handleCompleteCurrentSet}
          isExerciseDone={isExerciseDone}
          completedSets={completedSets}
          onEditLastSet={() => handleEditSet(completedSets.length - 1)}
          onNextExercise={onNextExercise}
          isLastExerciseInDay={isLastExerciseInDay}
        />

        {/* Modular Set History Grid */}
        <SetHistoryGrid
          workingSets={exercise.workingSets}
          completedSets={completedSets}
          currentSetIndex={currentSetIndex}
          editingSetIndex={editingSetIndex}
          isExerciseDone={isExerciseDone}
          onEditSet={handleEditSet}
          onDeleteSet={onDeleteSet}
          onAddExtraSet={() => {
            setEditingSetIndex(null);
            setInputWeight(completedSets[completedSets.length - 1]?.weight || recommendedWeight);
            setInputReps(defaultReps);
          }}
        />
      </div>
    </div>
  );
};
