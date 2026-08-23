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
  Sliders,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Exercise, SetLog, PreviousPerformanceInfo } from '../../types/workout';
import { calculateAdaptiveRecommendation, parseTargetReps, AdaptiveWeightRecommendation } from '../../utils/weightRecommendation';
import { loadExerciseSetupNotes, saveExerciseSetupNote } from '../../utils/storage';
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

  // Pro Bodybuilding Features State
  // 1. Machine Setup / Pin / Seat notes
  const [setupNotes, setSetupNotes] = useState<string>('');
  const [isEditingSetup, setIsEditingSetup] = useState<boolean>(false);

  // 2. Minimal Warm-Up State (Single 1-Tap Acclimation Set)
  const [isWarmupDone, setIsWarmupDone] = useState<boolean>(false);

  // Load saved setup notes for this exercise
  useEffect(() => {
    const saved = loadExerciseSetupNotes();
    const existing = saved[exercise.name] || '';
    setSetupNotes(existing);
    setIsEditingSetup(false);
  }, [exercise.name]);

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

  const handleSaveSetupNotes = (text: string) => {
    setSetupNotes(text);
    saveExerciseSetupNote(exercise.name, text);
    setIsEditingSetup(false);
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
      setupNotes.trim() || undefined
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
      {/* Exercise Card: Surface 1 with hairline */}
      <div className="rounded-lg bg-surface-1 border border-hairline p-4 sm:p-6 space-y-5 relative overflow-hidden shadow-2xl">
        {/* Decorative Linear Top Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-hairline-strong to-transparent" />

        {/* Title & Badge */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-ink">
                {exercise.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-ink-subtle">
                  {exercise.workingSets} Working Sets × {exercise.reps} Reps
                </span>
                <span className="text-ink-tertiary">·</span>
                <span className="text-xs text-ink-subtle flex items-center gap-1">
                  <Clock className="w-3 h-3 text-ink-tertiary" /> {exercise.rest}
                </span>
              </div>
            </div>

            {exercise.intensityTechnique && exercise.intensityTechnique !== 'N/A' && (
              <span className="shrink-0 text-[11px] font-mono px-2.5 py-1 rounded-pill bg-surface-2 text-primary-hover border border-primary/30">
                {exercise.intensityTechnique}
              </span>
            )}
          </div>

          {/* Substitutions, Form Cues, Setup & Reset */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {onSelectWeakPoint && (
              <button
                type="button"
                onClick={onSelectWeakPoint}
                className="text-[11px] px-2.5 py-0.5 rounded bg-primary/15 hover:bg-primary/25 border border-primary/40 text-primary-hover font-medium transition flex items-center gap-1 shadow-sm"
              >
                <Target className="w-3 h-3" />
                <span>Choose Weak Point</span>
              </button>
            )}
            {exercise.substitution1 && !onSelectWeakPoint && (
              <button
                type="button"
                onClick={onSelectSubstitution}
                className="text-[11px] px-2 py-0.5 rounded bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-muted transition flex items-center gap-1"
              >
                <Layers className="w-3 h-3 text-primary-hover" />
                <span>Swap Exercise</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="text-[11px] px-2 py-0.5 rounded bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-muted transition flex items-center gap-1"
            >
              <span>Form Cues</span>
              {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={() => setIsEditingSetup(!isEditingSetup)}
              className={`text-[11px] px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                setupNotes
                  ? 'bg-primary/15 border-primary/40 text-primary-hover font-medium'
                  : 'bg-surface-2 hover:bg-surface-3 border-hairline text-ink-muted'
              }`}
              title="Standardize seat, pin, bench angle, and attachment settings"
            >
              <Sliders className="w-3 h-3" />
              <span>{setupNotes ? `Setup: ${setupNotes}` : 'Pin / Seat Setup'}</span>
            </button>
            {completedSets.length > 0 && (
              <button
                type="button"
                onClick={onClearExerciseSets}
                className="text-[11px] px-2 py-0.5 rounded bg-surface-2 hover:bg-red-950/40 border border-hairline hover:border-red-500/40 text-ink-tertiary hover:text-red-400 transition flex items-center gap-1 ml-auto"
                title="Reset all recorded sets for this exercise"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset Sets</span>
              </button>
            )}
          </div>

          {/* Machine & Setup Notes Quick Editor */}
          {isEditingSetup && (
            <div className="p-3 rounded-lg bg-surface-2 border border-primary/40 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-primary-hover" />
                  <span>Machine / Pin / Bench Setup (Saved per exercise)</span>
                </span>
                <span className="text-[10px] text-ink-subtle">e.g., Seat 4, Pin #3, Prime handle</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., Seat #4, Pin 3 (lengthened load), 45° bench angle..."
                  value={setupNotes}
                  onChange={(e) => setSetupNotes(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveSetupNotes(setupNotes);
                  }}
                  className="flex-1 bg-surface-3 border border-hairline-strong focus:border-primary text-ink rounded px-2.5 py-1.5 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSaveSetupNotes(setupNotes)}
                  className="px-3 py-1.5 rounded bg-primary hover:bg-primary-hover text-on-primary text-xs font-medium transition"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {exercise.name.toLowerCase().includes('weak point') && onSelectWeakPoint && (
            <div className="mt-2 p-3 rounded-lg bg-surface-2/90 border border-primary/30 flex items-center justify-between gap-3 shadow-inner">
              <div>
                <div className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-primary-hover" />
                  <span>Choose Weak Point Focus</span>
                </div>
                <div className="text-[11px] text-ink-subtle mt-0.5">
                  Select a muscle group (Shoulders, Lats, Quads, Chest, etc.) to assign this slot.
                </div>
              </div>
              <button
                type="button"
                onClick={onSelectWeakPoint}
                className="shrink-0 px-3 py-1.5 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-medium transition shadow-md"
              >
                Select Focus
              </button>
            </div>
          )}

          {showNotes && (
            <div className="mt-2 p-3 rounded-md bg-surface-2/80 border border-hairline text-xs text-ink-muted leading-relaxed animate-in fade-in">
              {exercise.notes}
            </div>
          )}

          {/* Video Demonstration Embedded On Top Card */}
          <div className="pt-1">
            <WorkoutVideoPlayer exerciseName={exercise.name} defaultExpanded={true} />
          </div>
        </div>

        {/* Unified Target Hero Card */}
        <div className="rounded-lg bg-surface-2 border border-hairline-strong p-3 sm:p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center divide-x divide-hairline">
            <div className="px-1 min-w-0">
              <span className="block text-[9px] sm:text-[10px] text-ink-subtle uppercase tracking-wider font-mono truncate">
                Target Reps
              </span>
              <span className="text-sm sm:text-lg font-bold text-ink font-mono mt-0.5 block truncate">
                {exercise.reps}
              </span>
              <span className="text-[9px] sm:text-[10px] text-ink-tertiary font-mono block mt-0.5">
                hypertrophy
              </span>
            </div>

            <div className="px-1 min-w-0">
              <span className="block text-[9px] sm:text-[10px] text-ink-subtle uppercase tracking-wider font-mono truncate">
                Target Effort
              </span>
              <span className="text-sm sm:text-lg font-bold text-primary-hover font-mono mt-0.5 block truncate">
                RPE {currentTargetRpe}
              </span>
              <span className="text-[9px] sm:text-[10px] text-ink-tertiary font-mono block mt-0.5">
                {isCurrentSetLastSet ? 'Final Set' : 'Early Sets'}
              </span>
            </div>

            <div className="px-1 min-w-0">
              <div className="flex items-center justify-center gap-1">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-hover shrink-0" />
                <span className="block text-[9px] sm:text-[10px] text-ink-subtle uppercase tracking-wider font-mono truncate">
                  Suggested Load
                </span>
              </div>
              <span className="text-sm sm:text-lg font-bold text-ink font-mono mt-0.5 block truncate">
                {recommendedWeight} <span className="text-[10px] sm:text-xs font-normal text-ink-subtle">kg</span>
              </span>
              <div className="flex items-center justify-center gap-0.5 mt-0.5">
                {adaptiveRec.trend === 'increase' && <TrendingUp className="w-2.5 h-2.5 text-semantic-success shrink-0" />}
                {adaptiveRec.trend === 'decrease' && <TrendingDown className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                <span
                  className={`text-[9px] sm:text-[10px] font-mono truncate ${
                    adaptiveRec.trend === 'increase'
                      ? 'text-semantic-success font-medium'
                      : adaptiveRec.trend === 'decrease'
                      ? 'text-amber-400 font-medium'
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
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-2/70 border border-hairline text-xs font-mono">
            <div className="flex items-center gap-2 truncate pr-2">
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-ink font-medium">Acclimation:</span>
              <span className="text-primary-hover font-bold">{minimalWarmupWeight}kg × 8</span>
              <span className="text-[10px] text-ink-tertiary">(~50%)</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onOpenRestTimer(60)}
                className="px-2 py-0.5 rounded bg-surface-3 hover:bg-surface-4 border border-hairline text-[10px] text-ink-subtle hover:text-ink flex items-center gap-1 transition"
                title="Start 60s warm-up rest"
              >
                <Clock className="w-2.5 h-2.5" />
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
                className={`px-2 py-0.5 rounded border text-[10px] font-medium transition ${
                  isWarmupDone
                    ? 'bg-semantic-success/20 border-semantic-success/40 text-semantic-success'
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
          <div className="space-y-3 pt-1">
            {/* Set Tracker Header */}
            <div className="flex items-center justify-between text-xs pb-1 border-b border-hairline">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-semibold text-ink font-mono uppercase tracking-wider">
                  {editingSetIndex !== null
                    ? `Editing Set ${editingSetIndex + 1}`
                    : `Set ${currentSetIndex + 1} of ${exercise.workingSets}`}
                </span>
                {editingSetIndex !== null && (
                  <button
                    type="button"
                    onClick={() => setEditingSetIndex(null)}
                    className="text-ink-subtle hover:text-ink text-[11px] underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <span className="text-ink-subtle font-mono text-[11px]">
                Target: RPE {currentTargetRpe}
              </span>
            </div>

            {/* Steppers for Weight & Reps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Weight input with Steppers */}
              <div className="p-3 rounded-lg bg-surface-2/80 border border-hairline space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-ink-subtle font-mono">Weight (kg)</label>
                  <span className="text-[10px] font-mono text-ink-tertiary">Step ±2.5kg</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setInputWeight((prev) => Math.max(0, Math.round((prev - 2.5) * 2) / 2))}
                    className="w-10 h-10 rounded-md bg-surface-3 hover:bg-surface-4 border border-hairline text-ink font-mono text-lg font-bold flex items-center justify-center transition active:scale-95 cursor-pointer"
                    title="Minus 2.5kg"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.5"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-surface-1 border border-hairline focus:border-primary focus:ring-1 focus:ring-primary text-ink rounded-md py-2 text-center text-2xl font-mono font-bold outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setInputWeight((prev) => Math.round((prev + 2.5) * 2) / 2)}
                    className="w-10 h-10 rounded-md bg-surface-3 hover:bg-surface-4 border border-hairline text-ink font-mono text-lg font-bold flex items-center justify-center transition active:scale-95 cursor-pointer"
                    title="Plus 2.5kg"
                  >
                    +
                  </button>
                </div>
                {/* Plate quick buttons */}
                <div className="flex gap-1 pt-0.5">
                  {[-5, -2.5, +2.5, +5].map((delta) => (
                    <button
                      key={delta}
                      type="button"
                      onClick={() => setInputWeight((prev) => Math.max(0, prev + delta))}
                      className="flex-1 py-1 text-[11px] font-mono bg-surface-3 hover:bg-surface-4 border border-hairline text-ink-subtle hover:text-ink rounded transition"
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reps input with Steppers */}
              <div className="p-3 rounded-lg bg-surface-2/80 border border-hairline space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-ink-subtle font-mono">Reps</label>
                  <span className="text-[10px] font-mono text-ink-tertiary">Target: {exercise.reps}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setInputReps((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 rounded-md bg-surface-3 hover:bg-surface-4 border border-hairline text-ink font-mono text-lg font-bold flex items-center justify-center transition active:scale-95 cursor-pointer"
                    title="Minus 1 rep"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={inputReps}
                    onChange={(e) => setInputReps(parseInt(e.target.value) || 0)}
                    className="flex-1 bg-surface-1 border border-hairline focus:border-primary focus:ring-1 focus:ring-primary text-ink rounded-md py-2 text-center text-2xl font-mono font-bold outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setInputReps((prev) => prev + 1)}
                    className="w-10 h-10 rounded-md bg-surface-3 hover:bg-surface-4 border border-hairline text-ink font-mono text-lg font-bold flex items-center justify-center transition active:scale-95 cursor-pointer"
                    title="Plus 1 rep"
                  >
                    +
                  </button>
                </div>
                {/* Common rep targets */}
                <div className="flex gap-1 pt-0.5">
                  {[8, 10, 12, 15].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInputReps(r)}
                      className={`flex-1 py-1 text-[11px] font-mono border rounded transition ${
                        inputReps === r
                          ? 'bg-primary/20 border-primary text-primary-hover font-bold'
                          : 'bg-surface-3 hover:bg-surface-4 border-hairline text-ink-subtle hover:text-ink'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* High-Impact Log Set Button */}
            <button
              type="button"
              onClick={handleCompleteCurrentSet}
              className="w-full min-h-[48px] py-2.5 px-3 sm:px-4 bg-primary hover:bg-primary-hover active:bg-primary-focus text-on-primary font-semibold text-xs sm:text-sm rounded-lg transition duration-150 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 shadow-lg cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                <span>
                  {editingSetIndex !== null
                    ? `Save Set ${editingSetIndex + 1}`
                    : `Log Set ${currentSetIndex + 1} of ${exercise.workingSets}`}
                </span>
              </div>
              <span className="font-mono text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-black/30 text-white font-normal group-hover:bg-black/40 transition">
                {inputWeight}kg × {inputReps} reps · {parseRestSeconds(exercise.rest) / 60}m rest
              </span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-md bg-surface-2 border border-semantic-success/30 text-center space-y-3">
            <div className="text-sm font-semibold text-semantic-success flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" /> Exercise Completed! ({completedSets.length} Sets Logged)
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleEditSet(completedSets.length - 1)}
                className="flex-1 h-9 bg-surface-3 hover:bg-surface-4 border border-hairline text-ink-muted hover:text-ink font-medium text-xs rounded-md transition flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Last Set</span>
              </button>
              <button
                type="button"
                onClick={onNextExercise}
                className="flex-1 h-9 bg-primary hover:bg-primary-hover text-on-primary font-medium text-xs rounded-md transition flex items-center justify-center gap-1.5"
              >
                <span>{isLastExerciseInDay ? 'Finish Session' : 'Next Exercise'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Set History Bubbles with Tap-to-Edit, Set Types & Intensity Tags */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-ink-tertiary uppercase tracking-wider">
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
                className="text-[10px] font-mono text-primary-hover flex items-center gap-0.5 hover:underline"
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
                  className={`py-2 px-2 rounded-md border text-center text-xs font-mono transition relative group ${
                    logged
                      ? isBeingEdited
                        ? 'bg-primary/20 border-primary text-primary-hover ring-1 ring-primary'
                        : 'bg-surface-2 hover:bg-surface-3 border-hairline-strong text-ink cursor-pointer'
                      : isCurrent
                      ? 'bg-surface-1 border-primary text-primary-hover ring-1 ring-primary/40'
                      : 'bg-surface-1/40 border-hairline text-ink-tertiary'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-ink-subtle">
                    <span>SET {idx + 1}</span>
                    {logged && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSet(idx);
                        }}
                        title="Delete set"
                        className="opacity-0 group-hover:opacity-100 text-ink-subtle hover:text-red-400 transition"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                  <div className="mt-0.5 font-medium">
                    {logged ? `${logged.weight}k × ${logged.reps}` : '—'}
                  </div>
                  {logged?.techniqueDetail && (
                    <div className="text-[9px] text-primary-hover font-mono truncate mt-0.5" title={logged.techniqueDetail}>
                      {logged.techniqueDetail}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
