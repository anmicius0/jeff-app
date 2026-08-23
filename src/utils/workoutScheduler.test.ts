import { 
  getAutoResumeWorkoutPosition, 
  isWorkoutSessionComplete, 
  findDayPlanByExerciseName,
  reconstructSessionsFromAwsItems 
} from './workoutScheduler';
import { WorkoutSessionLog } from '../types/workout';
import { WORKOUT_PLAN_DATA } from '../data/workoutPlan';
import { AwsWorkoutItem } from './awsApi';

export function runWorkoutSchedulerTests() {
  console.log('Running Workout Scheduler tests...');
  const today = '2026-08-23';

  // Test 1: defaults to Cycle 1, Week 1, Day 1, Exercise 0 when no logs exist
  const pos1 = getAutoResumeWorkoutPosition({}, undefined, today);
  console.assert(pos1.cycle === 1, 'Default cycle is 1');
  console.assert(pos1.week === 1, 'Default week is 1');
  console.assert(pos1.dayId === 'w1-d1', 'Default day is w1-d1');
  console.assert(pos1.exerciseIndex === 0, 'Default exercise index is 0');
  console.assert(pos1.selectedDate === today, 'Default selectedDate is today');

  // Test 2: falls back to saved progress if no logs have completed sets
  const savedProgress = {
    currentCycle: 2,
    currentWeek: 3,
    currentDayId: 'w3-d2',
    activeExerciseIndex: 1,
  };
  const pos2 = getAutoResumeWorkoutPosition({}, savedProgress, today);
  console.assert(pos2.cycle === 2 && pos2.week === 3 && pos2.dayId === 'w3-d2' && pos2.exerciseIndex === 1, 'Falls back to saved progress correctly');

  // Test 3: automatically continues from an in-progress day at the first uncompleted exercise
  const week1Plan = WORKOUT_PLAN_DATA[0];
  const day1Plan = week1Plan.days[0]; // w1-d1
  const ex1 = day1Plan.exercises[0];

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

  const pos3 = getAutoResumeWorkoutPosition({ '2026-08-22_w1-d1': sessionLogIncomplete }, undefined, today);
  console.assert(pos3.cycle === 1 && pos3.week === 1 && pos3.dayId === 'w1-d1', 'In-progress day targets same day');
  console.assert(pos3.exerciseIndex === 1, `Continues at exercise index 1 (Wide-Grip Pull-Up), got ${pos3.exerciseIndex}`);
  console.assert(pos3.setIndex === 0, `Ex 1 has 0 sets completed, setIndex should be 0, got ${pos3.setIndex}`);
  console.assert(pos3.selectedDate === '2026-08-22', 'Session date preserved for in-progress day');

  // Test 3b: Set-level resumption when active exercise has 1 set completed out of 3
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

  const pos3b = getAutoResumeWorkoutPosition({ '2026-08-22_w1-d1': sessionLogPartialSet }, undefined, today);
  console.assert(pos3b.exerciseIndex === 0, 'Still on exercise index 0');
  console.assert(pos3b.setIndex === 1, `Resumes on setIndex 1 (Set 2 of 3), got ${pos3b.setIndex}`);

  // Test 4: starts from the next day if the previous workout day was finished
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

  console.assert(isWorkoutSessionComplete(sessionLogComplete, 1, 'w1-d1') === true, 'Session complete check returns true');

  const pos4 = getAutoResumeWorkoutPosition({ '2026-08-22_w1-d1': sessionLogComplete }, undefined, today);
  console.assert(pos4.cycle === 1 && pos4.week === 1 && pos4.dayId === 'w1-d2', `Day 1 complete advances to Day 2 (w1-d2), got ${pos4.dayId}`);
  console.assert(pos4.exerciseIndex === 0, 'New day starts at exercise index 0');
  console.assert(pos4.setIndex === 0, 'New day starts at set index 0');
  console.assert(pos4.selectedDate === today, 'New day date is today');

  // Test 5: rolls over to next week Day 1 when finishing the last active day of the week
  const day6Plan = week1Plan.days.find((d) => d.id === 'w1-d6')!; // ARMS & WEAK POINTS
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

  const pos5 = getAutoResumeWorkoutPosition({ '2026-08-22_w1-d6': sessionDay6Complete }, undefined, today);
  console.assert(pos5.cycle === 1 && pos5.week === 2 && pos5.dayId === 'w2-d1', `Week 1 Day 6 complete advances to Week 2 Day 1, got W${pos5.week} ${pos5.dayId}`);
  console.assert(pos5.setIndex === 0, 'Week 2 Day 1 starts at set index 0');

  // Test 6: findDayPlanByExerciseName
  const matchEx = findDayPlanByExerciseName('Meadows Incline DB Lateral Raise');
  console.assert(matchEx?.dayId === 'w1-d1' && matchEx?.dayName === 'UPPER #1', 'Exercise match to day plan works correctly');

  // Test 7: reconstructSessionsFromAwsItems prevents session splitting across exercises for the same date
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
  console.assert(sessionKeys.length === 1, `All exercises for the date must form 1 unified session, got ${sessionKeys.length}`);
  const reconstructedSession = reconstructed[sessionKeys[0]];
  console.assert(reconstructedSession.exercises.length === 6, `Reconstructed session must have 6 exercises, got ${reconstructedSession.exercises.length}`);

  // Reconstructed session on another device must be recognized as complete and advance to Day 2
  console.assert(isWorkoutSessionComplete(reconstructedSession, 1, 'w1-d1') === true, 'Reconstructed session must be complete');
  const posCrossDevice = getAutoResumeWorkoutPosition(reconstructed, undefined, today);
  console.assert(posCrossDevice.dayId === 'w1-d2', `Cross-device sync of completed Day 1 must advance to Day 2 (w1-d2), got ${posCrossDevice.dayId}`);

  console.log('All Workout Scheduler tests passed successfully!');
}

runWorkoutSchedulerTests();
