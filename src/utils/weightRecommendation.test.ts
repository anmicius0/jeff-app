import { describe, test, expect } from 'bun:test';
import { calculateAdaptiveRecommendation, parseTargetReps } from './weightRecommendation';
import { getNextScheduledWorkout } from './workoutScheduler';
import { Exercise, SetLog } from '../types/workout';

describe('Adaptive Weight Recommendation', () => {
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

  test('parses en-dash rep strings', () => {
    const reps = parseTargetReps('8–10');
    expect(reps.minReps).toBe(8);
    expect(reps.maxReps).toBe(10);
  });

  test('parses hyphen rep strings', () => {
    const repsHyphen = parseTargetReps('10-12');
    expect(repsHyphen.minReps).toBe(10);
    expect(repsHyphen.maxReps).toBe(12);
  });

  test('gives baseline weight for Set 1 without prior history', () => {
    const rec = calculateAdaptiveRecommendation({
      exercise: mockExercise,
      currentSetIndex: 0,
      completedSets: [],
    });
    expect(rec.trend).toBe('baseline');
    expect(rec.recommendedWeight).toBeGreaterThan(0);
  });

  test('auto-increases weight (+2.5kg) on high reps in previous set', () => {
    const completedSet1Easy: SetLog = {
      setNumber: 1,
      weight: 80,
      reps: 12,
      rpe: 8,
      completed: true,
    };
    const rec = calculateAdaptiveRecommendation({
      exercise: mockExercise,
      currentSetIndex: 1,
      completedSets: [completedSet1Easy],
    });
    expect(rec.trend).toBe('increase');
    expect(rec.recommendedWeight).toBe(82.5);
  });

  test('auto-increases weight (+2.5kg) on low RPE in previous set', () => {
    const completedSet1LowRpe: SetLog = {
      setNumber: 1,
      weight: 80,
      reps: 9,
      rpe: 6.5,
      completed: true,
    };
    const rec = calculateAdaptiveRecommendation({
      exercise: mockExercise,
      currentSetIndex: 1,
      completedSets: [completedSet1LowRpe],
    });
    expect(rec.trend).toBe('increase');
    expect(rec.recommendedWeight).toBe(82.5);
  });

  test('auto-decreases weight (-2.5kg) on failed reps in previous set', () => {
    const completedSet1Failed: SetLog = {
      setNumber: 1,
      weight: 80,
      reps: 6,
      rpe: 10,
      completed: true,
    };
    const rec = calculateAdaptiveRecommendation({
      exercise: mockExercise,
      currentSetIndex: 1,
      completedSets: [completedSet1Failed],
    });
    expect(rec.trend).toBe('decrease');
    expect(rec.recommendedWeight).toBe(77.5);
  });

  test('maintains weight when previous set was on target', () => {
    const completedSet1OnTarget: SetLog = {
      setNumber: 1,
      weight: 80,
      reps: 9,
      rpe: 8,
      completed: true,
    };
    const rec = calculateAdaptiveRecommendation({
      exercise: mockExercise,
      currentSetIndex: 1,
      completedSets: [completedSet1OnTarget],
    });
    expect(rec.trend).toBe('maintain');
    expect(rec.recommendedWeight).toBe(80);
  });

  test('scheduler advances from w1-d1 to w1-d2', () => {
    const nextDay = getNextScheduledWorkout(1, 1, 'w1-d1');
    expect(nextDay.dayId).toBe('w1-d2');
  });

  test('scheduler advances to Cycle 2 Week 1 upon completing Week 10 Day 6', () => {
    const nextCycle = getNextScheduledWorkout(1, 10, 'w10-d6');
    expect(nextCycle.cycle).toBe(2);
    expect(nextCycle.week).toBe(1);
  });
});
