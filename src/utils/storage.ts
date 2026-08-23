import { WorkoutSessionLog } from '../types/workout';

const STORAGE_KEY_LOGS = 'jeff_app_workout_logs_v1';
const STORAGE_KEY_CURRENT_PROGRESS = 'jeff_app_current_progress_v1';

export function getTodayLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface CurrentProgressState {
  currentCycle: number;
  currentWeek: number;
  currentDayId: string;
  activeExerciseIndex: number;
  activeSetIndex: number;
  lastActiveDate?: string;
}

export const loadWorkoutLogs = (): Record<string, WorkoutSessionLog> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load workout logs from localStorage', err);
    return {};
  }
};

export const saveAllWorkoutLogs = (logs: Record<string, WorkoutSessionLog>): void => {
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save all workout logs to localStorage', err);
  }
};

export const saveWorkoutLog = (sessionLog: WorkoutSessionLog): void => {
  try {
    const logs = loadWorkoutLogs();
    const key = `${sessionLog.date}_${sessionLog.dayId}`;
    logs[key] = {
      ...sessionLog,
      cycleNumber: sessionLog.cycleNumber || 1,
    };
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save workout log to localStorage', err);
  }
};

export const deleteWorkoutLog = (sessionKey: string): void => {
  try {
    const logs = loadWorkoutLogs();
    delete logs[sessionKey];
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to delete workout log from localStorage', err);
  }
};

export const loadCurrentProgress = (): CurrentProgressState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_PROGRESS);
    if (!raw) {
      return {
        currentCycle: 1,
        currentWeek: 1,
        currentDayId: 'w1-d1',
        activeExerciseIndex: 0,
        activeSetIndex: 0,
        lastActiveDate: getTodayLocalDateString(),
      };
    }
    const parsed = JSON.parse(raw);
    return {
      currentCycle: parsed.currentCycle || 1,
      currentWeek: parsed.currentWeek || 1,
      currentDayId: parsed.currentDayId || 'w1-d1',
      activeExerciseIndex: parsed.activeExerciseIndex || 0,
      activeSetIndex: parsed.activeSetIndex || 0,
      lastActiveDate: parsed.lastActiveDate,
    };
  } catch (err) {
    console.error('Failed to load current progress', err);
    return {
      currentCycle: 1,
      currentWeek: 1,
      currentDayId: 'w1-d1',
      activeExerciseIndex: 0,
      activeSetIndex: 0,
      lastActiveDate: getTodayLocalDateString(),
    };
  }
};

export const saveCurrentProgress = (progress: CurrentProgressState): void => {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_PROGRESS, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save current progress', err);
  }
};

