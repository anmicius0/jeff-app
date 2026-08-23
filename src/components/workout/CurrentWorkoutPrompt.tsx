import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Check,
  Clock,
  Flame,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  Plus,
  Target,
  TrendingUp,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { Exercise, SetLog, PreviousPerformanceInfo } from '../../types/workout';
import { calculateAdaptiveRecommendation, parseTargetReps, AdaptiveWeightRecommendation } from '../../utils/weightRecommendation';
import { WorkoutVideoPlayer } from './WorkoutVideoPlayer';

interface CurrentWorkoutPromptProps {
  exercise: Exercise;
  currentWeek?: number;
  currentCycle?: number;
  currentSetIndex: number;
  completedSets: SetLog[];
  previousWeekSets?: SetLog[];
  previousPerformance?: PreviousPerformanceInfo;
  onLogSet: (
    setNumber: number,
    weight: number,
    reps: number,
    rpe: number,
    technique?: string,
    techniqueDetail?: string,
    setupNotes?: string
  ) => void;
  onDeleteSet: (setIndex: number) => void;
  onClearExerciseSets: () => void;
  onSelectSubstitution?: () => void;
  onSelectWeakPoint?: () => void;
  onOpenRestTimer: (seconds: number) => void;
  onNextExercise: () => void;
  isLastExerciseInDay: boolean;
}

export const CurrentWorkoutPrompt: React.FC<CurrentWorkoutPromptProps> = ({
  exercise,
  currentWeek: _currentWeek,
  currentSetIndex,
  completedSets,
  previousWeekSets,
  previousPerformance,
  onLogSet,
  onDeleteSet,
  onClearExerciseSets,
  onSelectSubstitution,
  onSelectWeakPoint,
  onOpenRestTimer,
  onNextExercise,
  isLastExerciseInDay,
}) => {
  const { defaultReps } = useMemo(() => parseTargetReps(exercise.reps), [exercise.reps]);

  // Adaptive weight recommendation based on previous set in current session or previous week/cycle performance
  const adaptiveRec: AdaptiveWeightRecommendation = useMemo(() => {
    return calculateAdaptiveRecommendation({
      exercise,
      currentSetIndex,
      completedSets,
      previousWeekSets,
      previousPerformance,
    });
  }, [exercise, currentSetIndex, completedSets, previousWeekSets, previousPerformance]);

  const recommendedWeight = adaptiveRec.recommendedWeight;

  const [inputWeight, setInputWeight] = useState<number>(recommendedWeight);
  const [inputReps, setInputReps] = useState<number>(adaptiveRec.recommendedReps || defaultReps);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);

  // Minimal Warm-Up State (Single 1-Tap Acclimation Set)
  const [isWarmupDone, setIsWarmupDone] = useState<boolean>(false);

  // Sync adaptive recommendation when exercise or current active set index changes (unless user is currently editing a previous set)
  useEffect(() => {
    if (editingSetIndex === null) {
      setInputWeight(recommendedWeight);
      setInputReps(adaptiveRec.recommendedReps || defaultReps);
    }
  }, [exercise.id, recommendedWeight, adaptiveRec.recommendedReps, defaultReps, currentSetIndex, editingSetIndex]);

  // Reset exercise state on exercise change
  useEffect(() => {
    setEditingSetIndex(null);
    setIsWarmupDone(false);
  }, [exercise.id]);

  // Minimal 50% warm-up weight
  const minimalWarmupWeight = Math.max(
    0,
    Math.round(((inputWeight > 0 ? inputWeight : recommendedWeight) * 0.5) * 2) / 2
  );

  const isCurrentSetLastSet = currentSetIndex >= exercise.workingSets - 1;
  const currentTargetRpe = isCurrentSetLastSet ? exercise.lastSetRpe : exercise.earlyRpe;
  const isExerciseDone = completedSets.length >= exercise.workingSets && editingSetIndex === null;

  // Parse rest seconds
  const parseRestSeconds = (restStr: string): number => {
    if (restStr.includes('3–5')) return 240;
    if (restStr.includes('2–3') || restStr.includes('3–4')) return 180;
    if (restStr.includes('1–2')) return 90;
    return 120;
  };

  const handleCompleteCurrentSet = () => {
    const targetSetNum = editingSetIndex !== null ? editingSetIndex + 1 : currentSetIndex + 1;
    const rpeValue = parseFloat(currentTargetRpe.replace('~', '').split('–')[0]) || 8.5;

    onLogSet(
      targetSetNum,
      inputWeight,
      inputReps,
      rpeValue,
      'Lengthened Partials',
      undefined,
      undefined
    );

    // Haptic feedback on mobile
    try {
      if ('vibrate' in navigator) navigator.vibrate([40, 30, 40]);
    } catch {
      // Haptics not supported
    }
    
    // Trigger rest timer only when adding new sets (not while just editing previous set)
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
      {/* Exercise Card: Flat 0px container sitting directly on dark surface */}
      <div className="bg-surface-1 border border-hairline p-4 sm:p-6 space-y-5 relative overflow-hidden">
        {/* Title & Metadata Header */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-widest text-ink-subtle uppercase block">
            Exercise {currentSetIndex + 1 > exercise.workingSets ? exercise.workingSets : currentSetIndex + 1} Target
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
                className="shrink-0 px-4 py-2 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider transition active:scale-95"
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
        </div>

        {/* 3-Column Target Metrics Block */}
        <div className="bg-surface-2 border border-hairline p-3 sm:p-4">
          <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center divide-x divide-hairline">
            <div className="px-1 min-w-0">
              <span className="block text-[9px] sm:text-[10px] text-ink-subtle uppercase tracking-wider font-mono truncate">
                Target Reps
              </span>
              <span className="text-base sm:text-xl font-display tracking-wider text-white mt-0.5 block truncate">
                {exercise.reps}
              </span>
              <span className="text-[9px] sm:text-[10px] text-ink-tertiary font-mono block mt-0.5 truncate">
                hypertrophy
              </span>
            </div>

            <div className="px-1 min-w-0">
              <span className="block text-[9px] sm:text-[10px] text-ink-subtle uppercase tracking-wider font-mono truncate">
                Target Effort
              </span>
              <span className="text-base sm:text-xl font-display tracking-wider text-white mt-0.5 block truncate">
                RPE {currentTargetRpe}
              </span>
              <span className="text-[9px] sm:text-[10px] text-ink-tertiary font-mono block mt-0.5 truncate">
                {isCurrentSetLastSet ? 'Final Set' : 'Early Sets'}
              </span>
            </div>

            <div className="px-1 min-w-0">
              <div className="flex items-center justify-center gap-1">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white shrink-0" />
                <span className="block text-[9px] sm:text-[10px] text-ink-subtle uppercase tracking-wider font-mono truncate">
                  Suggested
                </span>
              </div>
              <span className="text-base sm:text-xl font-mono font-bold text-white mt-0.5 block truncate">
                {recommendedWeight}<span className="text-[10px] sm:text-xs font-normal text-ink-subtle font-sans">kg</span>
              </span>
              <div className="flex items-center justify-center gap-0.5 mt-0.5">
                {adaptiveRec.trend === 'increase' && <TrendingUp className="w-2.5 h-2.5 text-success shrink-0" />}
                {adaptiveRec.trend === 'decrease' && <TrendingDown className="w-2.5 h-2.5 text-sale shrink-0" />}
                <span
                  className={`text-[9px] sm:text-[10px] font-mono truncate max-w-full ${
                    adaptiveRec.trend === 'increase'
                      ? 'text-success font-semibold'
                      : adaptiveRec.trend === 'decrease'
                      ? 'text-sale font-semibold'
                      : 'text-ink-subtle'
                  }`}
                  title={adaptiveRec.reason}
                >
                  {adaptiveRec.badgeText}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Acclimation Set (Before Working Set 1) */}
        {completedSets.length === 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-surface-2 border border-hairline text-xs font-mono">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Flame className="w-3.5 h-3.5 text-sale shrink-0" />
              <span className="text-white font-semibold uppercase tracking-wider text-[11px] sm:text-xs whitespace-nowrap">Warm-Up:</span>
              <span className="text-white font-bold text-[11px] sm:text-xs whitespace-nowrap">{minimalWarmupWeight}kg × 8</span>
              <span className="text-[10px] text-ink-tertiary hidden xs:inline">(~50%)</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
              <button
                type="button"
                onClick={() => onOpenRestTimer(60)}
                className="px-2.5 py-1 rounded-full bg-surface-3 hover:bg-surface-4 border border-hairline text-[10px] sm:text-[11px] text-ink-subtle hover:text-white flex items-center gap-1 transition active:scale-95"
                title="Start 60s warm-up rest"
              >
                <Clock className="w-3 h-3" />
                <span>60s</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsWarmupDone(!isWarmupDone);
                  try {
                    if ('vibrate' in navigator) navigator.vibrate(30);
                  } catch {}
                }}
                className={`px-2.5 sm:px-3 py-1 rounded-full border text-[10px] sm:text-[11px] font-medium transition active:scale-95 ${
                  isWarmupDone
                    ? 'bg-success/20 border-success text-success font-bold'
                    : 'bg-surface-3 hover:bg-surface-4 border-hairline text-ink-muted'
                }`}
              >
                {isWarmupDone ? 'Done ✓' : 'Mark Done'}
              </button>
            </div>
          </div>
        )}

        {/* Interactive Logging Panel */}
        {!isExerciseDone ? (
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
                    onClick={() => setEditingSetIndex(null)}
                    className="text-ink-subtle hover:text-white text-xs underline ml-2"
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
              onClick={handleCompleteCurrentSet}
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
        ) : (
          <div className="p-4 sm:p-5 bg-surface-2 border border-hairline text-center space-y-3 sm:space-y-4 animate-scale-in">
            <div className="text-xs sm:text-sm font-semibold text-white flex items-center justify-center gap-2 uppercase tracking-wider">
              <Check className="w-4 h-4 text-success stroke-[3] shrink-0" />
              <span>Exercise Completed ({completedSets.length} Sets Logged)</span>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleEditSet(completedSets.length - 1)}
                className="flex-1 h-11 bg-surface-3 hover:bg-surface-4 border border-hairline text-white font-medium text-xs rounded-full apple-press flex items-center justify-center gap-1.5 uppercase tracking-wider truncate px-2"
              >
                <Edit2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Edit Last Set</span>
              </button>
              <button
                type="button"
                onClick={onNextExercise}
                className="flex-1 h-11 bg-white hover:bg-neutral-200 text-black font-bold text-xs rounded-full apple-press flex items-center justify-center gap-1.5 shadow-md uppercase tracking-wider truncate px-2"
              >
                <span className="truncate">{isLastExerciseInDay ? 'Finish Session' : 'Next Exercise'}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* Set History Bubbles with Tap-to-Edit */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider">
              Sets Logged (Tap to Edit / Delete)
            </span>
            {completedSets.length >= exercise.workingSets && (
              <button
                type="button"
                onClick={() => {
                  setEditingSetIndex(null);
                  setInputWeight(completedSets[completedSets.length - 1]?.weight || recommendedWeight);
                  setInputReps(defaultReps);
                }}
                className="text-[10px] font-mono text-white flex items-center gap-1 hover:underline uppercase tracking-wider apple-press"
              >
                <Plus className="w-3 h-3" /> Add Extra Set
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {Array.from({ length: Math.max(exercise.workingSets, completedSets.length) }).map((_, idx) => {
              const logged = completedSets[idx];
              const isCurrent = idx === currentSetIndex && !isExerciseDone;
              const isBeingEdited = idx === editingSetIndex;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (logged) handleEditSet(idx);
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
      </div>
  );
};
