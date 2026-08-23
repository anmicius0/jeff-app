import { WORKOUT_PLAN_DATA } from '../data/workoutPlan';
import { WorkoutSessionLog, SetLog } from '../types/workout';
import { areExercisesSame, getCanonicalExerciseName } from './exerciseMatching';
import { getTodayLocalDateString, CurrentProgressState } from './storage';
import { AwsWorkoutItem } from './awsApi';

export interface ScheduledWorkoutTarget {
  cycle: number;
  week: number;
  dayId: string;
}

export interface AutoResumePosition {
  cycle: number;
  week: number;
  dayId: string;
  exerciseIndex: number;
  setIndex: number;
  selectedDate: string;
}

/**
 * Searches the workout plan to find which week, day, and dayName a single exercise belongs to.
 */
export function findDayPlanByExerciseName(exerciseName: string): {
  weekNumber: number;
  dayId: string;
  dayName: string;
} | undefined {
  if (!exerciseName) return undefined;
  for (const week of WORKOUT_PLAN_DATA) {
    for (const day of week.days) {
      if (day.isRestDay) continue;
      const match = day.exercises.some(
        (ex) =>
          ex.name === exerciseName ||
          areExercisesSame(ex.name, exerciseName) ||
          getCanonicalExerciseName(ex.name) === getCanonicalExerciseName(exerciseName) ||
          (ex.substitution1 && (areExercisesSame(ex.substitution1, exerciseName) || ex.substitution1 === exerciseName)) ||
          (ex.substitution2 && (areExercisesSame(ex.substitution2, exerciseName) || ex.substitution2 === exerciseName))
      );
      if (match) {
        return {
          weekNumber: week.weekNumber,
          dayId: day.id,
          dayName: day.name,
        };
      }
    }
  }
  return undefined;
}

/**
 * Finds the single best-matching workout day in the program that contains the highest overlap of the given exercise names.
 */
export function findBestMatchingDayPlan(exerciseNames: string[]): {
  weekNumber: number;
  dayId: string;
  dayName: string;
} | undefined {
  if (!exerciseNames || exerciseNames.length === 0) return undefined;

  let bestMatch: { weekNumber: number; dayId: string; dayName: string } | undefined;
  let maxScore = -1;

  for (const week of WORKOUT_PLAN_DATA) {
    for (const day of week.days) {
      if (day.isRestDay) continue;
      let score = 0;
      for (const exName of exerciseNames) {
        const matches = day.exercises.some(
          (ex) =>
            ex.name === exName ||
            areExercisesSame(ex.name, exName) ||
            getCanonicalExerciseName(ex.name) === getCanonicalExerciseName(exName) ||
            (ex.substitution1 && (areExercisesSame(ex.substitution1, exName) || ex.substitution1 === exName)) ||
            (ex.substitution2 && (areExercisesSame(ex.substitution2, exName) || ex.substitution2 === exName))
        );
        if (matches) score += 1;
      }

      if (score > maxScore && score > 0) {
        maxScore = score;
        bestMatch = {
          weekNumber: week.weekNumber,
          dayId: day.id,
          dayName: day.name,
        };
      }
    }
  }

  return bestMatch;
}

/**
 * Reconstructs cohesive session logs from raw AWS DynamoDB records:
 * - Groups items by date into unified session logs without splitting across days.
 * - Uses explicit DayId, WeekNumber, CycleNumber, DayName when available.
 * - Intelligently matches all exercises for a date to determine the correct day template.
 */
export function reconstructSessionsFromAwsItems(
  remoteItems: AwsWorkoutItem[],
  existingLogs: Record<string, WorkoutSessionLog> = {}
): Record<string, WorkoutSessionLog> {
  const merged: Record<string, WorkoutSessionLog> = { ...existingLogs };
  if (!remoteItems || remoteItems.length === 0) return merged;

  // Group items by Date
  const itemsByDate: Record<string, AwsWorkoutItem[]> = {};
  remoteItems.forEach((item) => {
    const date = item.Date || getTodayLocalDateString();
    if (!itemsByDate[date]) itemsByDate[date] = [];
    itemsByDate[date].push(item);
  });

  // Reconstruct each date's session
  Object.entries(itemsByDate).forEach(([date, items]) => {
    // Check if any item contains explicit DayId
    const explicitDayId = items.find((it) => it.DayId)?.DayId;
    const explicitWeek = items.find((it) => it.WeekNumber)?.WeekNumber;
    const explicitCycle = items.find((it) => it.CycleNumber)?.CycleNumber;
    const explicitDayName = items.find((it) => it.DayName)?.DayName;

    // Check existing local session for this date
    const existingSessionKey = Object.keys(merged).find((k) => k.startsWith(date));
    const existingSession = existingSessionKey ? merged[existingSessionKey] : undefined;

    let dayId = explicitDayId || existingSession?.dayId;
    let weekNumber = explicitWeek || existingSession?.weekNumber;
    let cycleNumber = explicitCycle || existingSession?.cycleNumber || 1;
    let dayName = explicitDayName || existingSession?.dayName;

    if (!dayId) {
      const distinctExNames = Array.from(new Set(items.map((it) => it.WorkoutName).filter(Boolean)));
      const bestMatch = findBestMatchingDayPlan(distinctExNames);
      dayId = bestMatch?.dayId || 'w1-d1';
      weekNumber = bestMatch?.weekNumber || 1;
      dayName = bestMatch?.dayName || 'UPPER #1';
    }

    const sessionKey = `${date}_${dayId}`;

    if (!merged[sessionKey]) {
      merged[sessionKey] = {
        date,
        weekNumber: weekNumber || 1,
        cycleNumber: cycleNumber || 1,
        dayId,
        dayName: dayName || 'Workout',
        exercises: [],
      };
    } else {
      if (weekNumber) merged[sessionKey].weekNumber = weekNumber;
      if (cycleNumber) merged[sessionKey].cycleNumber = cycleNumber;
      if (dayId) merged[sessionKey].dayId = dayId;
      if (dayName) merged[sessionKey].dayName = dayName;
    }

    const currentExs = [...(merged[sessionKey].exercises || [])];

    items.forEach((item) => {
      let exEntry = currentExs.find(
        (e) =>
          e.exerciseName === item.WorkoutName ||
          areExercisesSame(e.exerciseName, item.WorkoutName) ||
          getCanonicalExerciseName(e.exerciseName) === getCanonicalExerciseName(item.WorkoutName) ||
          (item.ExerciseId && e.exerciseId === item.ExerciseId)
      );

      if (!exEntry) {
        exEntry = {
          exerciseId: item.ExerciseId || `aws-${item.WorkoutName}`,
          exerciseName: item.WorkoutName,
          sets: [],
          completed: false,
          setupNotes: item.SetupNotes,
        };
        currentExs.push(exEntry);
      } else if (item.SetupNotes && !exEntry.setupNotes) {
        exEntry.setupNotes = item.SetupNotes;
      }

      const setNum = Number(item.Set) || 1;
      const weightVal = Number(item.Weight) || 0;
      const repsVal = Number(item.Reps) || 0;
      const rpeVal = Number(item.RPE) || 8.5;

      const rawSets = [...(exEntry.sets || [])];
      rawSets[setNum - 1] = {
        setNumber: setNum,
        weight: weightVal,
        reps: repsVal,
        rpe: rpeVal,
        completed: true,
        intensityTechnique: item.Technique,
        techniqueDetail: item.TechniqueDetail,
        setupNotes: item.SetupNotes,
      };

      // Filter out holes and normalize set numbers
      exEntry.sets = rawSets.filter((s): s is SetLog => Boolean(s));
      exEntry.completed = exEntry.sets.length > 0;
    });

    merged[sessionKey].exercises = currentExs;
  });

  return merged;
}

/**
 * Checks if a specific day's workout session is 100% completed based on scheduled exercises and working sets.
 */
export function isWorkoutSessionComplete(
  sessionLog: WorkoutSessionLog | undefined,
  weekNumber: number,
  dayId: string
): boolean {
  if (!sessionLog || !sessionLog.exercises || sessionLog.exercises.length === 0) {
    return false;
  }

  const weekPlan = WORKOUT_PLAN_DATA.find((w) => w.weekNumber === weekNumber) || WORKOUT_PLAN_DATA[0];
  const dayPlan = weekPlan.days.find((d) => d.id === dayId);
  if (!dayPlan || dayPlan.isRestDay || dayPlan.exercises.length === 0) {
    return false;
  }

  // Non-optional exercises must all be completed with working sets logged
  const nonOptionalExercises = dayPlan.exercises.filter(
    (ex) => !ex.name.toLowerCase().includes('(optional)')
  );
  const targetsToCheck = nonOptionalExercises.length > 0 ? nonOptionalExercises : dayPlan.exercises;

  // Criteria 1: Every non-optional target exercise has completed working sets
  const allTargetsComplete = targetsToCheck.every((ex) => {
    const exLog = sessionLog.exercises.find(
      (e) =>
        e.exerciseId === ex.id ||
        e.exerciseName === ex.name ||
        areExercisesSame(e.exerciseName, ex.name) ||
        getCanonicalExerciseName(e.exerciseName) === getCanonicalExerciseName(ex.name) ||
        (ex.substitution1 && (areExercisesSame(e.exerciseName, ex.substitution1) || e.exerciseName === ex.substitution1)) ||
        (ex.substitution2 && (areExercisesSame(e.exerciseName, ex.substitution2) || e.exerciseName === ex.substitution2))
    );
    return !!(exLog && exLog.sets && exLog.sets.filter((s) => s && s.completed).length >= ex.workingSets);
  });

  if (allTargetsComplete) return true;

  // Criteria 2: Substantial completion check (all planned non-optional exercises logged with at least 1-2 sets or >=80% volume)
  const completedExercisesCount = targetsToCheck.filter((ex) => {
    const exLog = sessionLog.exercises.find(
      (e) =>
        e.exerciseId === ex.id ||
        e.exerciseName === ex.name ||
        areExercisesSame(e.exerciseName, ex.name) ||
        getCanonicalExerciseName(e.exerciseName) === getCanonicalExerciseName(ex.name)
    );
    return exLog && exLog.sets && exLog.sets.filter((s) => s && s.completed).length > 0;
  }).length;

  if (completedExercisesCount >= targetsToCheck.length) {
    return true;
  }

  return false;
}

/**
 * Calculates the next scheduled workout day in the program, skipping rest days appropriately,
 * transitioning across weeks 1-10, and rolling over across training cycles.
 */
export function getNextScheduledWorkout(
  currentCycle: number,
  currentWeek: number,
  currentDayId: string
): ScheduledWorkoutTarget {
  const currentWeekPlan = WORKOUT_PLAN_DATA.find((w) => w.weekNumber === currentWeek) || WORKOUT_PLAN_DATA[0];
  const currentDayIdx = currentWeekPlan.days.findIndex((d) => d.id === currentDayId);

  if (currentDayIdx >= 0 && currentDayIdx < currentWeekPlan.days.length - 1) {
    const nextDay = currentWeekPlan.days[currentDayIdx + 1];
    // If next day is a rest day, check if there's a subsequent active day in the same week
    if (nextDay.isRestDay) {
      if (currentDayIdx + 2 < currentWeekPlan.days.length && !currentWeekPlan.days[currentDayIdx + 2].isRestDay) {
        return {
          cycle: currentCycle,
          week: currentWeek,
          dayId: currentWeekPlan.days[currentDayIdx + 2].id,
        };
      } else {
        // Rest day is end of the week, advance to next week Day 1
        if (currentWeek < 10) {
          const nextWeekNum = currentWeek + 1;
          const nextWeekPlan = WORKOUT_PLAN_DATA.find((w) => w.weekNumber === nextWeekNum) || WORKOUT_PLAN_DATA[0];
          const firstActiveDay = nextWeekPlan.days.find((d) => !d.isRestDay) || nextWeekPlan.days[0];
          return {
            cycle: currentCycle,
            week: nextWeekNum,
            dayId: firstActiveDay.id,
          };
        } else {
          // Cycle 10 complete -> advance to Cycle + 1, Week 1
          const nextCycle = currentCycle + 1;
          const week1Plan = WORKOUT_PLAN_DATA[0];
          const firstActiveDay = week1Plan.days.find((d) => !d.isRestDay) || week1Plan.days[0];
          return {
            cycle: nextCycle,
            week: 1,
            dayId: firstActiveDay.id,
          };
        }
      }
    } else {
      return {
        cycle: currentCycle,
        week: currentWeek,
        dayId: nextDay.id,
      };
    }
  } else if (currentWeek < 10) {
    const nextWeekNum = currentWeek + 1;
    const nextWeekPlan = WORKOUT_PLAN_DATA.find((w) => w.weekNumber === nextWeekNum) || WORKOUT_PLAN_DATA[0];
    const firstActiveDay = nextWeekPlan.days.find((d) => !d.isRestDay) || nextWeekPlan.days[0];
    return {
      cycle: currentCycle,
      week: nextWeekNum,
      dayId: firstActiveDay.id,
    };
  } else {
    // Cycle complete
    const nextCycle = currentCycle + 1;
    const week1Plan = WORKOUT_PLAN_DATA[0];
    const firstActiveDay = week1Plan.days.find((d) => !d.isRestDay) || week1Plan.days[0];
    return {
      cycle: nextCycle,
      week: 1,
      dayId: firstActiveDay.id,
    };
  }
}

/**
 * Automatically calculates where the app should resume upon entering (down to the set level):
 * - If there are workout records: finds the most recent workout record.
 * - If the day is finished (or was completed on a previous day): starts from the next scheduled day (at exercise 0, set 0, date = today).
 * - If the day is unfinished: continues that day at the next uncompleted exercise and set level (date = session date).
 * - Otherwise: falls back to saved progress or defaults to Cycle 1, Week 1, Day 1 (set 0).
 */
export function getAutoResumeWorkoutPosition(
  logs: Record<string, WorkoutSessionLog>,
  currentProgress?: Partial<CurrentProgressState>,
  today: string = getTodayLocalDateString()
): AutoResumePosition {
  const sessionEntries = Object.entries(logs).filter(([, session]) => {
    return (
      session &&
      session.exercises &&
      session.exercises.some((e) => e.sets && e.sets.some((s) => s && s.completed))
    );
  });

  if (sessionEntries.length > 0) {
    // Sort sessions by date descending, then latest timestamp if available
    sessionEntries.sort(([keyA, a], [keyB, b]) => {
      const dateA = a.date || keyA.split('_')[0] || '';
      const dateB = b.date || keyB.split('_')[0] || '';
      if (dateA !== dateB) {
        return dateB.localeCompare(dateA);
      }
      // If same date, compare latest set timestamp
      const getMaxTimestamp = (session: WorkoutSessionLog) => {
        let maxTs = '';
        session.exercises.forEach((ex) => {
          ex.sets?.forEach((s) => {
            if (s.timestamp && s.timestamp > maxTs) maxTs = s.timestamp;
          });
        });
        return maxTs;
      };
      const tsA = getMaxTimestamp(a);
      const tsB = getMaxTimestamp(b);
      if (tsA && tsB && tsA !== tsB) {
        return tsB.localeCompare(tsA);
      }
      // Fallback: compare cycle/week
      const cycleA = a.cycleNumber || 1;
      const cycleB = b.cycleNumber || 1;
      if (cycleA !== cycleB) return cycleB - cycleA;
      return (b.weekNumber || 1) - (a.weekNumber || 1);
    });

    const [, latestSession] = sessionEntries[0];
    const cycle = latestSession.cycleNumber || 1;
    const week = latestSession.weekNumber || 1;
    const dayId = latestSession.dayId || 'w1-d1';

    const isComplete = isWorkoutSessionComplete(latestSession, week, dayId);

    // If session is complete OR session was logged on a past day with substantial workout completed (>=3 exercises)
    const isPastSessionWithExercises =
      latestSession.date &&
      today > latestSession.date &&
      latestSession.exercises.filter((e) => e.sets && e.sets.length > 0).length >= 3;

    if (isComplete || isPastSessionWithExercises) {
      const nextTarget = getNextScheduledWorkout(cycle, week, dayId);
      return {
        cycle: nextTarget.cycle,
        week: nextTarget.week,
        dayId: nextTarget.dayId,
        exerciseIndex: 0,
        setIndex: 0,
        selectedDate: today,
      };
    } else {
      const weekPlan = WORKOUT_PLAN_DATA.find((w) => w.weekNumber === week) || WORKOUT_PLAN_DATA[0];
      const dayPlan = weekPlan.days.find((d) => d.id === dayId) || weekPlan.days[0];

      let nextExIdx = 0;
      // First try to find the first non-optional exercise that isn't fully completed
      const foundIdx = dayPlan.exercises.findIndex((ex) => {
        const isOptional = ex.name.toLowerCase().includes('(optional)');
        if (isOptional) return false;
        const exLog = latestSession.exercises.find(
          (e) =>
            e.exerciseId === ex.id ||
            e.exerciseName === ex.name ||
            areExercisesSame(e.exerciseName, ex.name) ||
            getCanonicalExerciseName(e.exerciseName) === getCanonicalExerciseName(ex.name) ||
            (ex.substitution1 && (areExercisesSame(e.exerciseName, ex.substitution1) || e.exerciseName === ex.substitution1)) ||
            (ex.substitution2 && (areExercisesSame(e.exerciseName, ex.substitution2) || e.exerciseName === ex.substitution2))
        );
        const completedSetsCount = exLog ? exLog.sets.filter((s) => s && s.completed).length : 0;
        return completedSetsCount < ex.workingSets;
      });

      if (foundIdx >= 0) {
        nextExIdx = foundIdx;
      } else {
        // Look for any uncompleted exercise including optional if started
        const firstUnfinished = dayPlan.exercises.findIndex((ex) => {
          const exLog = latestSession.exercises.find(
            (e) =>
              e.exerciseId === ex.id ||
              e.exerciseName === ex.name ||
              areExercisesSame(e.exerciseName, ex.name)
          );
          const completedSetsCount = exLog ? exLog.sets.filter((s) => s && s.completed).length : 0;
          return completedSetsCount < ex.workingSets;
        });
        nextExIdx = firstUnfinished >= 0 ? firstUnfinished : 0;
      }

      const activeTargetExercise = dayPlan.exercises[nextExIdx];
      const activeExLog = activeTargetExercise
        ? latestSession.exercises.find(
            (e) =>
              e.exerciseId === activeTargetExercise.id ||
              e.exerciseName === activeTargetExercise.name ||
              areExercisesSame(e.exerciseName, activeTargetExercise.name)
          )
        : undefined;
      const currentSetsCount = activeExLog ? activeExLog.sets.filter((s) => s && s.completed).length : 0;

      return {
        cycle,
        week,
        dayId,
        exerciseIndex: nextExIdx,
        setIndex: currentSetsCount,
        selectedDate: latestSession.date || today,
      };
    }
  }

  // Fallback to saved current progress if available
  if (currentProgress && (currentProgress.currentWeek || currentProgress.currentDayId)) {
    return {
      cycle: currentProgress.currentCycle || 1,
      week: currentProgress.currentWeek || 1,
      dayId: currentProgress.currentDayId || 'w1-d1',
      exerciseIndex: currentProgress.activeExerciseIndex || 0,
      setIndex: currentProgress.activeSetIndex || 0,
      selectedDate: today,
    };
  }

  return {
    cycle: 1,
    week: 1,
    dayId: 'w1-d1',
    exerciseIndex: 0,
    setIndex: 0,
    selectedDate: today,
  };
}
