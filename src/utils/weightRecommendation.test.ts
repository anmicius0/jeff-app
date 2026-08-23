import { calculateAdaptiveRecommendation, parseTargetReps } from './weightRecommendation';
import { getNextScheduledWorkout } from './workoutScheduler';
import { Exercise, SetLog } from '../types/workout';

function runTests() {
  console.log('Running Adaptive Weight Recommendation tests...');

  const mockExercise: Exercise = {
    id: 'ex-1',
    name: 'Barbell Bench Press',
    intensityTechnique: 'N/A',
    warmupSets: '2',
    workingSets: 3,
    reps: '8–10',
    earlyRpe: '8',
    lastSetRpe: '10',
    rest: '3–5 min',
    notes: 'Standard bench press',
  };

  // Test 1: Rep parsing
  const reps = parseTargetReps('8–10');
  console.assert(reps.minReps === 8 && reps.maxReps === 10, 'Target reps parsed correctly');

  const repsHyphen = parseTargetReps('10-12');
  console.assert(repsHyphen.minReps === 10 && repsHyphen.maxReps === 12, 'Target reps with hyphen parsed correctly');

  // Test 2: Set 1 (no sets logged today, no prior history) -> Baseline
  const recSet1NoHistory = calculateAdaptiveRecommendation({
    exercise: mockExercise,
    currentSetIndex: 0,
    completedSets: [],
  });
  console.assert(recSet1NoHistory.trend === 'baseline', 'Set 1 with no history gives baseline');
  console.assert(recSet1NoHistory.recommendedWeight > 0, 'Baseline weight is positive');

  // Test 3: Set 2 within session - Set 1 exceeded reps (12 reps with target 8-10) -> Auto-increase (+2.5kg)
  const completedSet1Easy: SetLog = {
    setNumber: 1,
    weight: 80,
    reps: 12,
    rpe: 8,
    completed: true,
  };
  const recSet2Increase = calculateAdaptiveRecommendation({
    exercise: mockExercise,
    currentSetIndex: 1,
    completedSets: [completedSet1Easy],
  });
  console.assert(recSet2Increase.trend === 'increase', 'Set 2 auto-increases on high reps');
  console.assert(recSet2Increase.recommendedWeight === 82.5, `Recommended weight should be 82.5, got ${recSet2Increase.recommendedWeight}`);

  // Test 4: Set 2 within session - Set 1 low RPE (RPE 6.5) -> Auto-increase (+2.5kg)
  const completedSet1LowRpe: SetLog = {
    setNumber: 1,
    weight: 80,
    reps: 9,
    rpe: 6.5,
    completed: true,
  };
  const recSet2LowRpe = calculateAdaptiveRecommendation({
    exercise: mockExercise,
    currentSetIndex: 1,
    completedSets: [completedSet1LowRpe],
  });
  console.assert(recSet2LowRpe.trend === 'increase', 'Set 2 auto-increases on low RPE');
  console.assert(recSet2LowRpe.recommendedWeight === 82.5, `Recommended weight should be 82.5, got ${recSet2LowRpe.recommendedWeight}`);

  // Test 5: Set 2 within session - Set 1 failed reps (6 reps when target was 8-10) -> Auto-decrease (-2.5kg)
  const completedSet1Failed: SetLog = {
    setNumber: 1,
    weight: 80,
    reps: 6,
    rpe: 10,
    completed: true,
  };
  const recSet2Decrease = calculateAdaptiveRecommendation({
    exercise: mockExercise,
    currentSetIndex: 1,
    completedSets: [completedSet1Failed],
  });
  console.assert(recSet2Decrease.trend === 'decrease', 'Set 2 auto-decreases on failed reps');
  console.assert(recSet2Decrease.recommendedWeight === 77.5, `Recommended weight should be 77.5, got ${recSet2Decrease.recommendedWeight}`);

  // Test 6: Set 2 within session - Set 1 on target (9 reps @ RPE 8) -> Maintain
  const completedSet1OnTarget: SetLog = {
    setNumber: 1,
    weight: 80,
    reps: 9,
    rpe: 8,
    completed: true,
  };
  const recSet2Maintain = calculateAdaptiveRecommendation({
    exercise: mockExercise,
    currentSetIndex: 1,
    completedSets: [completedSet1OnTarget],
  });
  console.assert(recSet2Maintain.trend === 'maintain', 'Set 2 maintains weight on target performance');
  console.assert(recSet2Maintain.recommendedWeight === 80, `Recommended weight should be 80, got ${recSet2Maintain.recommendedWeight}`);

  // Test 7: Scheduler - Next workout day progression
  const nextDay = getNextScheduledWorkout(1, 1, 'w1-d1');
  console.assert(nextDay.dayId === 'w1-d2', `w1-d1 advances to w1-d2, got ${nextDay.dayId}`);

  // Test 8: Scheduler - Week 10 Day 6 (last active workout of cycle) cycle completion
  const nextCycle = getNextScheduledWorkout(1, 10, 'w10-d6');
  console.assert(nextCycle.cycle === 2 && nextCycle.week === 1, `w10-d6 advances to Cycle 2 Week 1, got C${nextCycle.cycle} W${nextCycle.week}`);

  console.log('All tests passed successfully!');
}

runTests();
