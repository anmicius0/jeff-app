import { WORKOUT_PLAN_DATA } from '../data/workoutPlan';
import { WorkoutSessionLog, SetLog } from '../types/workout';
import { matchesExercise } from './exerciseMatching';
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
      if (day.exercises.some((ex) => matchesExercise(exerciseName, ex))) {
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
      const score = exerciseNames.reduce(
        (sum, exName) => sum + (day.exercises.some((ex) => matchesExercise(exName, ex)) ? 1 : 0),
        0
      );

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
    const explicitDayId = items.find((it) => it.DayId)?.DayId;
    const explicitWeek = items.find((it) => it.WeekNumber)?.WeekNumber;
    const explicitCycle = items.find((it) => it.CycleNumber)?.CycleNumber;
    const explicitDayName = items.find((it) => it.DayName)?.DayName;

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
      let exEntry = currentExs.find((e) => matchesExercise(e, item.WorkoutName) || (item.ExerciseId && e.exerciseId === item.ExerciseId));

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
  if (!sessionLog?.exercises?.length) {
    return false;
  }

  const weekPlan = WORKOUT_PLAN_DATA.find((w) => w.weekNumber === weekNumber) || WORKOUT_PLAN_DATA[0];
  const dayPlan = weekPlan.days.find((d) => d.id === dayId);
  if (!dayPlan || dayPlan.isRestDay || dayPlan.exercises.length === 0) {
    return false;
  }

  const nonOptionalExercises = dayPlan.exercises.filter(
    (ex) => !ex.name.toLowerCase().includes('(optional)')
  );
  const targetsToCheck = nonOptionalExercises.length > 0 ? nonOptionalExercises : dayPlan.exercises;

  // Criteria 1: Every non-optional target exercise has completed working sets
  const allTargetsComplete = targetsToCheck.every((ex) => {
    const exLog = sessionLog.exercises.find((e) => matchesExercise(e, ex));
    return Boolean(exLog?.sets && exLog.sets.filter((s) => s && s.completed).length >= ex.workingSets);
  });

  if (allTargetsComplete) return true;

  // Criteria 2: Substantial completion check (all planned non-optional exercises logged with at least 1 set)
  const completedExercisesCount = targetsToCheck.filter((ex) => {
    const exLog = sessionLog.exercises.find((e) => matchesExercise(e, ex));
    return Boolean(exLog?.sets && exLog.sets.some((s) => s && s.completed));
  }).length;

  return completedExercisesCount >= targetsToCheck.length;
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

  // Check if there is another non-rest day later in the same week
  if (currentDayIdx >= 0) {
    const remainingDays = currentWeekPlan.days.slice(currentDayIdx + 1);
    const nextActiveDayInWeek = remainingDays.find((d) => !d.isRestDay);
    if (nextActiveDayInWeek) {
      return {
        cycle: currentCycle,
        week: currentWeek,
        dayId: nextActiveDayInWeek.id,
      };
    }
  }

  // Advance to next week or next mesocycle
  const nextWeekNum = currentWeek < 10 ? currentWeek + 1 : 1;
  const nextCycle = currentWeek < 10 ? currentCycle : currentCycle + 1;
  const nextWeekPlan = WORKOUT_PLAN_DATA.find((w) => w.weekNumber === nextWeekNum) || WORKOUT_PLAN_DATA[0];
  const firstActiveDay = nextWeekPlan.days.find((d) => !d.isRestDay) || nextWeekPlan.days[0];

  return {
    cycle: nextCycle,
    week: nextWeekNum,
    dayId: firstActiveDay.id,
  };
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
    return Boolean(
      session?.exercises?.some((e) => e.sets?.some((s) => s && s.completed))
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
      const getMaxTimestamp = (session: WorkoutSessionLog) => {
        let maxTs = '';
        session.exercises?.forEach((ex) => {
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

      // Find first non-optional exercise not completed
      let nextExIdx = dayPlan.exercises.findIndex((ex) => {
        if (ex.name.toLowerCase().includes('(optional)')) return false;
        const exLog = latestSession.exercises.find((e) => matchesExercise(e, ex));
        const completedSetsCount = exLog ? exLog.sets.filter((s) => s && s.completed).length : 0;
        return completedSetsCount < ex.workingSets;
      });

      if (nextExIdx < 0) {
        // Look for any uncompleted exercise
        const firstUnfinished = dayPlan.exercises.findIndex((ex) => {
          const exLog = latestSession.exercises.find((e) => matchesExercise(e, ex));
          const completedSetsCount = exLog ? exLog.sets.filter((s) => s && s.completed).length : 0;
          return completedSetsCount < ex.workingSets;
        });
        nextExIdx = firstUnfinished >= 0 ? firstUnfinished : 0;
      }

      const activeTargetExercise = dayPlan.exercises[nextExIdx];
      const activeExLog = activeTargetExercise
        ? latestSession.exercises.find((e) => matchesExercise(e, activeTargetExercise))
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
