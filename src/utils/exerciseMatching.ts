import { EXERCISE_VIDEO_MAP } from '../data/exerciseVideos';
import { WorkoutSessionLog, PreviousPerformanceInfo } from '../types/workout';

/**
 * Checks if two exercise names refer to the same workout movement
 * by exact name, normalized string match, or shared YouTube video ID demonstration.
 */
export function areExercisesSame(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB) return false;
  if (nameA === nameB) return true;

  const cleanA = nameA.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanB = nameB.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanA === cleanB) return true;

  // Specific canonical aliases
  if (
    (cleanA.includes('meadows') || cleanA.includes('inclinelying')) &&
    (cleanB.includes('meadows') || cleanB.includes('inclinelying')) &&
    cleanA.includes('lateral') && cleanB.includes('lateral')
  ) {
    return true;
  }

  const videoA = EXERCISE_VIDEO_MAP[nameA];
  const videoB = EXERCISE_VIDEO_MAP[nameB];
  if (videoA && videoB && videoA === videoB) {
    return true;
  }

  return false;
}

/**
 * Returns a canonical display name for an exercise
 */
export function getCanonicalExerciseName(name: string): string {
  if (!name) return name;
  if (name === 'Incline Lying DB Lateral Raise') {
    return 'Meadows Incline DB Lateral Raise';
  }
  if (name === 'Neutral-Grip Pullup') {
    return 'Neutral-Grip Pull-Up';
  }
  if (name === 'Pendlay Deficit Row') {
    return 'Deficit Pendlay Row';
  }
  if (name === 'Incline DB Stretch-Curl') {
    return 'Incline DB Stretch Curl';
  }
  if (name === 'Good Morning(Light Weight)') {
    return 'Good Morning (Light Weight)';
  }
  if (name === 'Nordic Curl') {
    return 'Nordic Ham Curl';
  }
  return name;
}

/**
 * Finds the previous performance benchmark for a given exercise.
 * Supports within-cycle progression (Week 2-10) and multi-cycle carryover (Week 10 -> Week 1).
 */
export function findPreviousExercisePerformance(
  exerciseName: string,
  currentWeek: number,
  currentCycle: number,
  currentDate: string,
  currentDayId: string,
  logs: Record<string, WorkoutSessionLog>
): PreviousPerformanceInfo | undefined {
  if (!exerciseName) return undefined;

  const activeSessionKey = `${currentDate}_${currentDayId}`;
  const allSessions = Object.entries(logs)
    .filter(([key]) => key !== activeSessionKey)
    .map(([, session]) => session);

  // Extract all sessions that have logged sets for this exercise
  const candidateSessions = allSessions
    .map((session) => {
      const matchedEx = session.exercises.find(
        (e) => areExercisesSame(e.exerciseName, exerciseName) || e.exerciseId.includes(exerciseName)
      );
      if (!matchedEx || !matchedEx.sets || matchedEx.sets.length === 0) return null;
      return {
        session,
        sets: matchedEx.sets,
      };
    })
    .filter(Boolean) as { session: WorkoutSessionLog; sets: typeof allSessions[0]['exercises'][0]['sets'] }[];

  if (candidateSessions.length === 0) return undefined;

  // Case 1: In Weeks 2–10, look for previous week in same cycle first
  if (currentWeek > 1) {
    // 1a. Direct prior week in same cycle
    const directPrevWeek = candidateSessions.find(
      (c) =>
        (c.session.cycleNumber || 1) === currentCycle &&
        c.session.weekNumber === currentWeek - 1
    );
    if (directPrevWeek) {
      return {
        sets: directPrevWeek.sets,
        sourceWeek: directPrevWeek.session.weekNumber,
        sourceCycle: directPrevWeek.session.cycleNumber || 1,
        sourceDate: directPrevWeek.session.date,
        sourceDayName: directPrevWeek.session.dayName,
        isFromPreviousCycle: false,
      };
    }

    // 1b. Nearest earlier week in same cycle
    const earlierInCycle = candidateSessions
      .filter(
        (c) =>
          (c.session.cycleNumber || 1) === currentCycle &&
          c.session.weekNumber < currentWeek
      )
      .sort((a, b) => b.session.weekNumber - a.session.weekNumber)[0];

    if (earlierInCycle) {
      return {
        sets: earlierInCycle.sets,
        sourceWeek: earlierInCycle.session.weekNumber,
        sourceCycle: earlierInCycle.session.cycleNumber || 1,
        sourceDate: earlierInCycle.session.date,
        sourceDayName: earlierInCycle.session.dayName,
        isFromPreviousCycle: false,
      };
    }
  }

  // Case 2: Week 1 (or no earlier session found in current cycle)
  // Look for the most recent session from a prior cycle (or prior date)
  const sortedHistorical = [...candidateSessions].sort((a, b) => {
    const cycleA = a.session.cycleNumber || 1;
    const cycleB = b.session.cycleNumber || 1;
    if (cycleA !== cycleB) return cycleB - cycleA;
    // Within cycle, prefer higher week or later date
    if (a.session.weekNumber !== b.session.weekNumber) {
      return b.session.weekNumber - a.session.weekNumber;
    }
    return new Date(b.session.date).getTime() - new Date(a.session.date).getTime();
  });

  const bestMatch = sortedHistorical[0];
  if (!bestMatch) return undefined;

  const isFromPreviousCycle = (bestMatch.session.cycleNumber || 1) < currentCycle || currentWeek === 1;

  return {
    sets: bestMatch.sets,
    sourceWeek: bestMatch.session.weekNumber,
    sourceCycle: bestMatch.session.cycleNumber || 1,
    sourceDate: bestMatch.session.date,
    sourceDayName: bestMatch.session.dayName,
    isFromPreviousCycle,
  };
}
