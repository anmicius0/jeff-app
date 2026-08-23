import { WeakPointCategory } from '../types/workout';

export const WEAK_POINTS_DATA: WeakPointCategory[] = [
  {
    category: 'Shoulders',
    exercise1Options: [
      'Meadows Incline DB Lateral Raise',
      'Machine Lateral Raise',
      'Machine Shoulder Press',
    ],
    exercise2Options: [
      'Reverse Pec Deck',
      'Cable Unilateral Face Pull',
      'Cable Reverse Flye',
    ],
  },
  {
    category: 'Lats ("Back Width")',
    exercise1Options: ['Moto Row', 'DB Pullover', 'Machine Pullover'],
    exercise2Options: ['Pull-Up', 'Machine Pulldown', 'Helms Row'],
  },
  {
    category: 'Quads',
    exercise1Options: ['Sissy Squat', 'Reverse Nordic', 'Leg Extension'],
    exercise2Options: ['Single-Leg Leg Press', 'DB Bulgarian Split Squat', 'Walking Lunge'],
  },
  {
    category: 'Glutes',
    exercise1Options: ['Machine Hip Abduction', 'Cable Hip Abduction', 'Cable Pull-Through'],
    exercise2Options: ['DB Bulgarian Split Squat', 'Single-Leg DB Hip Thrust', 'Machine Hip Thrust'],
  },
  {
    category: 'Chest',
    exercise1Options: ['DB Flye', 'Pec Deck', 'Press-Around'],
    exercise2Options: [
      'Chest Press Machine',
      'Dumbbell Chest Press',
      'Deficit Pushup',
    ],
  },
  {
    category: 'Neck',
    exercise1Options: ['Head Harness Neck Curl', 'Plate-Loaded Neck Curl'],
    exercise2Options: ['Head Harness Neck Extension', 'Plate-Loaded Neck Extension'],
  },
  {
    category: 'Hamstrings',
    exercise1Options: ['Seated Leg Curl', 'Nordic Curl', 'Standing Cable Leg Curl'],
    exercise2Options: ['Lying Leg Curl', 'Swiss Ball Leg Curl', 'Sliding Leg Curl'],
  },
  {
    category: 'Calves',
    exercise1Options: ['Leg Press Calf Press', 'Seated Calf Raise'],
    exercise2Options: ['Single-Leg DB Calf Raise', 'Standing Calf Raise', 'Calf Raise Machine'],
  },
  {
    category: 'Mid-Back ("Back Thickness")',
    exercise1Options: ['Kroc Row', 'T-Bar Row', 'Pendlay Row'],
    exercise2Options: ['DB Row', 'Smith Machine Row', 'Meadows Row'],
  },
  {
    category: 'Upper Traps',
    exercise1Options: ['Seated Dumbbell Shrug', 'Machine Shrug', 'Cable Shrug-In'],
    exercise2Options: ['Barbell Shrug', 'Trap Bar Shrug', 'Smith Machine Shrug'],
  },
  {
    category: 'Abs',
    exercise1Options: ['Modified Candlestick', 'Lying Leg Raise', 'Hanging Leg Raise'],
    exercise2Options: ['Machine Crunch', 'Cable Crunch', 'Swiss Ball Crunch'],
  },
  {
    category: 'Forearms',
    exercise1Options: ['DB Wrist Curl (Flexion)', 'Reverse Grip EZ-Bar Curl', 'Wrist Roller'],
    exercise2Options: ['DB Wrist Curl (Extension)', 'Hand Gripper', 'Plate Pinch'],
  },
];
