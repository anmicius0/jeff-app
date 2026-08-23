const API_BASE = 'https://6ji8vpvlni.execute-api.us-east-1.amazonaws.com/prod/workouts';

export interface AwsWorkoutItem {
  Date: string;
  WorkoutName: string;
  Set: number;
  Weight: string | number;
  Reps: string | number;
  RPE?: number;
  'WorkoutName#Set'?: string;
  Technique?: string;
  TechniqueDetail?: string;
  SetupNotes?: string;
  DayId?: string;
  WeekNumber?: number;
  CycleNumber?: number;
  DayName?: string;
  ExerciseId?: string;
}

export async function syncSetToAws(item: AwsWorkoutItem): Promise<boolean> {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    return res.ok;
  } catch (err) {
    console.warn('Offline or AWS sync failed:', err);
    return false;
  }
}

export async function fetchAwsWorkoutsByDate(date: string): Promise<AwsWorkoutItem[]> {
  try {
    const res = await fetch(`${API_BASE}?Date=${encodeURIComponent(date)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.workouts || [];
  } catch (err) {
    console.warn('Failed to fetch AWS workouts for date:', date, err);
    return [];
  }
}

export async function fetchAllAwsWorkouts(): Promise<AwsWorkoutItem[]> {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) return [];
    const data = await res.json();
    return data.workouts || [];
  } catch (err) {
    console.warn('Failed to fetch all AWS workouts:', err);
    return [];
  }
}

export async function deleteAwsSet(date: string, workoutName: string, setNumber: number): Promise<boolean> {
  try {
    const res = await fetch(API_BASE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Date: date,
        WorkoutName: workoutName,
        Set: setNumber,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete AWS set:', date, workoutName, setNumber, err);
    return false;
  }
}

export async function deleteAwsExercise(date: string, workoutName: string): Promise<boolean> {
  try {
    const res = await fetch(API_BASE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Date: date,
        WorkoutName: workoutName,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete AWS exercise:', date, workoutName, err);
    return false;
  }
}

export async function deleteAwsSession(date: string): Promise<boolean> {
  try {
    const res = await fetch(API_BASE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Date: date,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete AWS session for date:', date, err);
    return false;
  }
}
