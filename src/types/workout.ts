export interface Exercise {
  id: string;
  name: string;
  intensityTechnique: string;
  warmupSets: number | string;
  workingSets: number;
  reps: string;
  earlyRpe: string;
  lastSetRpe: string;
  rest: string;
  substitution1?: string;
  substitution2?: string;
  notes: string;
  demoUrl?: string;
}

export interface WorkoutDay {
  id: string;
  name: string; // e.g. "UPPER #1", "LOWER #1", "UPPER #2", "LOWER #2", "ARMS & WEAK POINTS", "REST DAY"
  isRestDay: boolean;
  exercises: Exercise[];
}

export interface WeekPlan {
  weekNumber: number;
  blockNumber: number;
  phaseName: string; // e.g. "5-Week Climb Phase" or "5-Week Grind Phase"
  isIntroWeek: boolean;
  days: WorkoutDay[];
}

export type IntensityTechniqueType = 
  | 'none'
  | 'lengthened_partials'
  | 'drop_set'
  | 'myo_reps'
  | 'rest_pause'
  | 'static_hold'
  | 'custom';

export interface SetLog {
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number;
  completed: boolean;
  timestamp?: string;
  notes?: string;
  intensityTechnique?: string;
  techniqueDetail?: string;
  setupNotes?: string;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
  completed: boolean;
  setupNotes?: string;
}

export interface WorkoutSessionLog {
  date: string; // YYYY-MM-DD
  weekNumber: number;
  cycleNumber?: number; // Defaults to 1 if not set
  dayId: string;
  dayName: string;
  exercises: ExerciseLog[];
  durationMinutes?: number;
  syncedToAws?: boolean;
}

export interface PreviousPerformanceInfo {
  sets: SetLog[];
  sourceWeek: number;
  sourceCycle: number;
  sourceDate: string;
  sourceDayName?: string;
  isFromPreviousCycle?: boolean;
}

export interface WeakPointCategory {
  category: string;
  exercise1Options: string[];
  exercise2Options: string[];
}
