import { Exercise, SetLog, PreviousPerformanceInfo } from '../types/workout';
import { getEstimated75thPercentileWeight } from './baselineWeights';

export interface AdaptiveWeightRecommendation {
  recommendedWeight: number;
  recommendedReps: number;
  trend: 'increase' | 'decrease' | 'maintain' | 'baseline';
  reason: string;
  badgeText: string;
}

/**
 * Parses min, max, and default reps from strings like "8–10", "10-12", "12–15", "5", "10–12 + 10-12"
 */
export function parseTargetReps(repsStr: string): { minReps: number; maxReps: number; defaultReps: number } {
  if (!repsStr) return { minReps: 10, maxReps: 10, defaultReps: 10 };

  const clean = repsStr.replace(/[^\d–\-]/g, ' ').trim();
  const parts = clean.split(/[\s–\-]+/).filter(Boolean).map((p) => parseInt(p, 10)).filter((n) => !isNaN(n));

  if (parts.length === 0) return { minReps: 10, maxReps: 10, defaultReps: 10 };
  if (parts.length === 1) return { minReps: parts[0], maxReps: parts[0], defaultReps: parts[0] };

  const minReps = Math.min(...parts.slice(0, 2));
  const maxReps = Math.max(...parts.slice(0, 2));
  return {
    minReps,
    maxReps,
    defaultReps: minReps,
  };
}

/**
 * Parses numeric RPE target from strings like "8", "8.5", "9–10", "~8"
 */
export function parseTargetRpe(rpeStr?: string): number {
  if (!rpeStr) return 8.5;
  const match = rpeStr.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 8.5;
}

/**
 * Calculates adaptive weight recommendations based on previous performance (same workout from last week or the previous set).
 * - Auto-increases the weight if the set was completed too easily (target reps exceeded / low RPE).
 * - Auto-decreases the weight if the set was too difficult or failed.
 */
export function calculateAdaptiveRecommendation(params: {
  exercise: Exercise;
  currentSetIndex: number;
  completedSets: SetLog[];
  previousWeekSets?: SetLog[];
  previousPerformance?: PreviousPerformanceInfo;
}): AdaptiveWeightRecommendation {
  const { exercise, currentSetIndex, completedSets, previousWeekSets, previousPerformance } = params;
  const { minReps, maxReps, defaultReps } = parseTargetReps(exercise.reps);

  const isLastSet = currentSetIndex >= exercise.workingSets - 1;
  const targetRpe = parseTargetRpe(isLastSet ? exercise.lastSetRpe : exercise.earlyRpe);

  // Case 1: Within-session adaptation (Set 2, 3, etc.) based on immediately previous set
  if (completedSets.length > 0) {
    const lastSet = completedSets[completedSets.length - 1];
    const lastWeight = lastSet.weight || 0;
    const lastReps = lastSet.reps || 0;
    const lastRpe = lastSet.rpe ?? 8.5;

    // Check if set was completed too easily (Auto-increase)
    const targetRepsExceeded = lastReps > maxReps;
    const lowRpe = lastRpe <= 7.0 || (lastRpe <= targetRpe - 1.5 && lastReps >= minReps);
    const topOfRangeEasy = lastReps >= maxReps && lastRpe <= 7.5;

    if (targetRepsExceeded || lowRpe || topOfRangeEasy) {
      const nextWeight = lastWeight + 2.5;
      const badge = targetRepsExceeded
        ? `+2.5kg (Exceeded ${maxReps} reps)`
        : `+2.5kg (RPE ${lastRpe} was easy)`;
      const reason = targetRepsExceeded
        ? `Auto-increased (+2.5kg): Exceeded target rep ceiling in Set ${lastSet.setNumber} (${lastReps}/${maxReps} reps)`
        : `Auto-increased (+2.5kg): Set ${lastSet.setNumber} felt easy at RPE ${lastRpe}`;

      return {
        recommendedWeight: nextWeight,
        recommendedReps: defaultReps,
        trend: 'increase',
        reason,
        badgeText: badge,
      };
    }

    // Check if set was too difficult or failed (Auto-decrease)
    const failedRepTarget = lastReps < minReps;
    const prematureFailure = !isLastSet && lastRpe >= 10 && lastReps <= minReps;

    if (failedRepTarget || prematureFailure) {
      const nextWeight = Math.max(0, lastWeight - 2.5);
      const badge = failedRepTarget
        ? `-2.5kg (Missed ${minReps} reps)`
        : `-2.5kg (Hit failure early)`;
      const reason = failedRepTarget
        ? `Auto-decreased (-2.5kg): Fell short of ${minReps} reps in Set ${lastSet.setNumber} (${lastReps}/${minReps} reps)`
        : `Auto-decreased (-2.5kg): Hit early failure in Set ${lastSet.setNumber} (RPE ${lastRpe})`;

      return {
        recommendedWeight: nextWeight,
        recommendedReps: defaultReps,
        trend: 'decrease',
        reason,
        badgeText: badge,
      };
    }

    // Target met nicely (Maintain weight)
    return {
      recommendedWeight: lastWeight,
      recommendedReps: defaultReps,
      trend: 'maintain',
      reason: `Maintained: Set ${lastSet.setNumber} was on target (${lastWeight}kg × ${lastReps} reps @ RPE ${lastRpe})`,
      badgeText: `Maintained (${lastWeight}kg)`,
    };
  }

  // Case 2: Set 1 (No sets logged today yet) -> Adapt from previous week / cycle performance
  let priorReferenceSet: SetLog | undefined;
  if (previousPerformance?.sets && previousPerformance.sets.length > 0) {
    // Find best set or corresponding first set
    priorReferenceSet = [...previousPerformance.sets].sort((a, b) => (b.weight || 0) - (a.weight || 0))[0];
  } else if (previousWeekSets && previousWeekSets.length > 0) {
    priorReferenceSet = previousWeekSets[0] || previousWeekSets[previousWeekSets.length - 1];
  }

  if (priorReferenceSet && priorReferenceSet.weight) {
    const prevWeight = priorReferenceSet.weight;
    const prevReps = priorReferenceSet.reps || 0;
    const prevRpe = priorReferenceSet.rpe ?? 8.5;

    // Evaluate last week's performance
    if (prevReps > maxReps || (prevReps >= maxReps && prevRpe <= 8.5)) {
      const nextWeight = prevWeight + 2.5;
      return {
        recommendedWeight: nextWeight,
        recommendedReps: defaultReps,
        trend: 'increase',
        reason: `Auto-increased (+2.5kg): Hit top of rep range last week (${prevWeight}kg × ${prevReps} reps)`,
        badgeText: `+2.5kg (Prior week overload)`,
      };
    }

    if (prevRpe <= 7.0 && prevReps >= minReps) {
      const nextWeight = prevWeight + 2.5;
      return {
        recommendedWeight: nextWeight,
        recommendedReps: defaultReps,
        trend: 'increase',
        reason: `Auto-increased (+2.5kg): Previous session was easy (RPE ${prevRpe})`,
        badgeText: `+2.5kg (Low RPE prior week)`,
      };
    }

    if (prevReps < minReps) {
      const nextWeight = Math.max(0, prevWeight - 2.5);
      return {
        recommendedWeight: nextWeight,
        recommendedReps: defaultReps,
        trend: 'decrease',
        reason: `Auto-decreased (-2.5kg): Fell short of ${minReps} reps last week (${prevReps} reps)`,
        badgeText: `-2.5kg (Below rep target)`,
      };
    }

    return {
      recommendedWeight: prevWeight,
      recommendedReps: defaultReps,
      trend: 'maintain',
      reason: `Prior benchmark from week ${previousPerformance?.sourceWeek || 'last week'} (${prevWeight}kg × ${prevReps} reps)`,
      badgeText: `Prior benchmark (${prevWeight}kg)`,
    };
  }

  // Fallback: 75th percentile strength baseline
  const baseline = getEstimated75thPercentileWeight(exercise.name);
  return {
    recommendedWeight: baseline,
    recommendedReps: defaultReps,
    trend: 'baseline',
    reason: `Estimated 75th percentile strength baseline`,
    badgeText: `75th% baseline`,
  };
}
