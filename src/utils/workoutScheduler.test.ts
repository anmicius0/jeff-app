import { describe, test, expect } from 'bun:test';
import { 
  getAutoResumeWorkoutPosition, 
  isWorkoutSessionComplete, 
  findDayPlanByExerciseName,
  reconstructSessionsFromAwsItems 
} from './workoutScheduler';
import { WorkoutSessionLog } from '../types/workout';
import { WORKOUT_PLAN_DATA } from '../data/workoutPlan';
import { AwsWorkoutItem } from './awsApi';

describe('Workout Scheduler', () => {
  const today = '2026-08-23';
  const week1Plan = WORKOUT_PLAN_DATA[0];
  const day1Plan = week1Plan.days[0]; // w1-d1
  const ex1 = day1Plan.exercises[0];

  test('defaults to Cycle 1, Week 1, Day 1, Exercise 0 when no logs exist', () => {
    const pos = getAutoResumeWorkoutPosition({}, undefined, today);
    expect(pos.cycle).toBe(1);
    expect(pos.week).toBe(1);
    expect(pos.dayId).toBe('w1-d1');
    expect(pos.exerciseIndex).toBe(0);
    expect(pos.selectedDate).toBe(today);
  });

  test('falls back to saved progress if no logs have completed sets', () => {
    const savedProgress = {
      currentCycle: 2,
      currentWeek: 3,
      currentDayId: 'w3-d2',
      activeExerciseIndex: 1,
    };
    const pos = getAutoResumeWorkoutPosition({}, savedProgress, today);
    expect(pos.cycle).toBe(2);
    expect(pos.week).toBe(3);
    expect(pos.dayId).toBe('w3-d2');
    expect(pos.exerciseIndex).toBe(1);
  });

  test('automatically continues from an in-progress day at the first uncompleted exercise', () => {
    const sessionLogIncomplete: WorkoutSessionLog = {
      date: '2026-08-22',
      weekNumber: 1,
      cycleNumber: 1,
      dayId: 'w1-d1',
      dayName: day1Plan.name,
      exercises: [
        {
          exerciseId: ex1.id,
          exerciseName: ex1.name,
          completed: true,
          sets: Array.from({ length: ex1.workingSets }, (_, i) => ({
            setNumber: i + 1,
            weight: 10,
            reps: 12,
            rpe: 8,
            completed: true,
          })),
        },
      ],
    };

    const pos = getAutoResumeWorkoutPosition({ '2026-08-22_w1-d1': sessionLogIncomplete }, undefined, today);
    expect(pos.cycle).toBe(1);
    expect(pos.week).toBe(1);
    expect(pos.dayId).toBe('w1-d1');
    expect(pos.exerciseIndex).toBe(1);
    expect(pos.setIndex).toBe(0);
    expect(pos.selectedDate).toBe('2026-08-22');
  });

  test('resumes at set-level when active exercise has partial sets completed', () => {
    const sessionLogPartialSet: WorkoutSessionLog = {
      date: '2026-08-22',
      weekNumber: 1,
      cycleNumber: 1,
      dayId: 'w1-d1',
      dayName: day1Plan.name,
      exercises: [
        {
          exerciseId: ex1.id,
          exerciseName: ex1.name,
          completed: false,
          sets: [
            {
              setNumber: 1,
              weight: 10,
              reps: 12,
              rpe: 8,
              completed: true,
            },
          ],
        },
      ],
    };

    const pos = getAutoResumeWorkoutPosition({ '2026-08-22_w1-d1': sessionLogPartialSet }, undefined, today);
    expect(pos.exerciseIndex).toBe(0);
    expect(pos.setIndex).toBe(1);
  });

  test('advances to next day when previous workout day is completed', () => {
    const completeExercisesLog = day1Plan.exercises.map((ex) => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      completed: true,
      sets: Array.from({ length: ex.workingSets }, (_, i) => ({
        setNumber: i + 1,
        weight: 20,
        reps: 10,
        rpe: 8,
        completed: true,
      })),
    }));

    const sessionLogComplete: WorkoutSessionLog = {
      date: '2026-08-22',
      weekNumber: 1,
      cycleNumber: 1,
      dayId: 'w1-d1',
      dayName: day1Plan.name,
      exercises: completeExercisesLog,
    };

    expect(isWorkoutSessionComplete(sessionLogComplete, 1, 'w1-d1')).toBe(true);

    const pos = getAutoResumeWorkoutPosition({ '2026-08-22_w1-d1': sessionLogComplete }, undefined, today);
    expect(pos.cycle).toBe(1);
    expect(pos.week).toBe(1);
    expect(pos.dayId).toBe('w1-d2');
    expect(pos.exerciseIndex).toBe(0);
    expect(pos.setIndex).toBe(0);
    expect(pos.selectedDate).toBe(today);
  });

  test('rolls over to next week Day 1 when finishing the last active day of the week', () => {
    const day6Plan = week1Plan.days.find((d) => d.id === 'w1-d6')!;
    const day6CompleteLog = day6Plan.exercises
      .filter((ex) => !ex.name.toLowerCase().includes('(optional)'))
      .map((ex) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        completed: true,
        sets: Array.from({ length: ex.workingSets }, (_, i) => ({
          setNumber: i + 1,
          weight: 20,
          reps: 10,
          rpe: 8,
          completed: true,
        })),
      }));

    const sessionDay6Complete: WorkoutSessionLog = {
      date: '2026-08-22',
      weekNumber: 1,
      cycleNumber: 1,
      dayId: 'w1-d6',
      dayName: day6Plan.name,
      exercises: day6CompleteLog,
    };

    const pos = getAutoResumeWorkoutPosition({ '2026-08-22_w1-d6': sessionDay6Complete }, undefined, today);
    expect(pos.cycle).toBe(1);
    expect(pos.week).toBe(2);
    expect(pos.dayId).toBe('w2-d1');
    expect(pos.setIndex).toBe(0);
  });

  test('matches exercise names to day plan correctly', () => {
    const matchEx = findDayPlanByExerciseName('Meadows Incline DB Lateral Raise');
    expect(matchEx?.dayId).toBe('w1-d1');
    expect(matchEx?.dayName).toBe('UPPER #1');
  });

  test('reconstructSessionsFromAwsItems unifies exercises for the same date', () => {
    const mockAwsItems: AwsWorkoutItem[] = [
      { Date: '2026-08-22', WorkoutName: 'Meadows Incline DB Lateral Raise', Set: 1, Weight: 12, Reps: 12 },
      { Date: '2026-08-22', WorkoutName: 'Meadows Incline DB Lateral Raise', Set: 2, Weight: 12, Reps: 12 },
      { Date: '2026-08-22', WorkoutName: 'Meadows Incline DB Lateral Raise', Set: 3, Weight: 12, Reps: 12 },
      { Date: '2026-08-22', WorkoutName: 'Wide-Grip Pull-Up', Set: 1, Weight: 0, Reps: 10 },
      { Date: '2026-08-22', WorkoutName: 'Wide-Grip Pull-Up', Set: 2, Weight: 0, Reps: 10 },
      { Date: '2026-08-22', WorkoutName: 'Flat Machine Chest Press', Set: 1, Weight: 80, Reps: 10 },
      { Date: '2026-08-22', WorkoutName: 'Flat Machine Chest Press', Set: 2, Weight: 80, Reps: 10 },
      { Date: '2026-08-22', WorkoutName: 'Chest-Supported Low Row', Set: 1, Weight: 60, Reps: 10 },
      { Date: '2026-08-22', WorkoutName: 'Chest-Supported Low Row', Set: 2, Weight: 60, Reps: 10 },
      { Date: '2026-08-22', WorkoutName: 'Seated Cable Flye', Set: 1, Weight: 25, Reps: 10 },
      { Date: '2026-08-22', WorkoutName: 'Seated Cable Flye', Set: 2, Weight: 25, Reps: 10 },
      { Date: '2026-08-22', WorkoutName: 'Ez Bar Preacher Curl', Set: 1, Weight: 30, Reps: 12 },
      { Date: '2026-08-22', WorkoutName: 'Ez Bar Preacher Curl', Set: 2, Weight: 30, Reps: 12 },
    ];

    const reconstructed = reconstructSessionsFromAwsItems(mockAwsItems);
    const sessionKeys = Object.keys(reconstructed);
    expect(sessionKeys.length).toBe(1);

    const reconstructedSession = reconstructed[sessionKeys[0]];
    expect(reconstructedSession.exercises.length).toBe(6);
    expect(isWorkoutSessionComplete(reconstructedSession, 1, 'w1-d1')).toBe(true);

    const posCrossDevice = getAutoResumeWorkoutPosition(reconstructed, undefined, today);
    expect(posCrossDevice.dayId).toBe('w1-d2');
  });
});
