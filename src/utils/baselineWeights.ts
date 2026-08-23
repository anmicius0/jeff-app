/**
 * Estimated 75th percentile working weights (in kg) for intermediate/advanced lifters
 * performing 8-12 hypertrophy reps according to standardized strength standards.
 */
export const EXERCISE_75TH_PERCENTILE_BASELINES: Record<string, number> = {
  // Upper Body - Chest
  'Flat Machine Chest Press': 75,
  'Flat DB Bench Press': 30,
  'Barbell Bench Press': 80,
  'Flat Smith Machine Bench Press': 70,
  'Bottom-Half 45° Incline DB Press': 26,
  'Bottom-Half 45° Incline Smith Machine Press': 65,
  '30* Smith Incline Pres': 65,
  'Bottom-Half 45° Incline Barbell Press': 70,
  'Bottom-Half Seated Cable Flye': 45,
  'Seated Cable Flye': 45,
  'Bottom-Half DB Flye': 18,
  'Bottom-Half Pec Deck': 50,
  'Pec Deck': 50,
  'Chest Press Machine': 75,
  'Dumbbell Chest Press': 30,

  // Upper Body - Back
  'Wide-Grip Pull-Up': 0, // Bodyweight
  'Wide-Grip Machine Pulldown': 65,
  'Wide-Grip Lat Pulldown': 65,
  'Neutral-Grip Lat Pulldown': 65,
  'Dual Neutral-Grip Lat Pulldown': 65,
  '1-Arm Lat Pulldown': 35,
  'Chest-Supported Machine Row': 60,
  'Chest-Supported Low Row': 60,
  'Chest-Supported T-Bar Row': 55,
  'Chest-Supported Incline DB Row': 24,
  'Smith Machine Deficit Row': 65,
  'Deficit Pendlay Row': 65,
  'Pendlay Deficit Row': 65,
  'Dual-Handle Elbows-Out Cable Row': 50,
  'T-Bar Row': 60,
  'Kroc Row': 36,
  'DB Row': 34,
  'Moto Row': 40,
  'DB Pullover': 24,
  'Machine Pullover': 50,

  // Shoulders & Rear Delts
  'Meadows Incline DB Lateral Raise': 10,
  'Incline Lying DB Lateral Raise': 10,
  'High-Cable Cuffed Lateral Raise': 10,
  'Behind Back Cable Cuffed Lateral Raise': 10,
  'High-Cable Lateral Raise': 10,
  'DB Lateral Raise': 12,
  'Cuffed Behind-The-Back Lateral Raise': 10,
  'Machine Lateral Raise': 45,
  'Machine Shoulder Press': 55,
  'Super-Stretch Reverse Pec Deck': 40,
  'Reverse Pec Deck': 45,
  'Bent-Over Reverse DB Flye': 12,
  'Cable Reverse Flye': 12.5,
  'Seated Dumbbell Shrug': 32,
  'Machine Shrug': 80,
  'Barbell Shrug': 100,

  // Lower Body - Quads & Squats
  'Bottom-Half Smith Machine Squat': 90,
  'High-Bar Back Squat': 105,
  'Bottom-Half Hack Squat': 100,
  'Super-ROM Leg Press': 160,
  'Belt Squat': 90,
  'Leg Extension': 60,
  'Sissy Squat': 0,
  'Reverse Nordic': 0,
  'DB Bulgarian Split Squat': 22,
  'Bottom-Half DB Bulgarian Split Squat': 20,
  'Smith Machine Reverse Lunge': 50,
  'DB Reverse Lunge': 20,
  'Walking Lunge': 20,

  // Lower Body - Hamstrings & Glutes & Calves
  'Seated Leg Curl': 55,
  'Lying Leg Curl': 45,
  'Nordic Ham Curl': 0,
  'Nordic Curl': 0,
  'Barbell RDL': 90,
  'DB RDL': 32,
  'Glute-Ham Raise': 0,
  'Single-Leg DB Hip Thrust': 24,
  'Machine Hip Thrust': 100,
  'Weighted 45° Hyperextension': 15,
  'Smith Machine Good Morning': 50,
  'Good Morning (Light Weight)': 30,
  'Good Morning(Light Weight)': 30,
  'Machine Hip Abduction': 65,
  'Machine Hip Adduction': 60,
  'Cable Hip Abduction': 20,
  'Cable Hip Adduction': 20,
  'Copenhagen Hip Adduction': 0,
  'Standing Calf Raise': 75,
  'Bottom-Half Standing Calf Raise': 75,
  'Leg Press Calf Press': 140,
  'Seated Calf Raise': 45,
  'Donkey Calf Raise': 60,

  // Arms - Biceps & Triceps
  'Seated Super-Bayesian High Cable Curl': 17.5,
  'Bayesian Cable Curl': 17.5,
  'Incline DB Stretch Curl': 14,
  'Incline DB Stretch-Curl': 14,
  'EZ-Bar Cable Curl': 35,
  'EZ-Bar Curl': 30,
  'DB Curl': 16,
  'Elbow Supported DB Curl': 14,
  'Bottom-Half Incline DB Curl': 14,
  'Bottom-Half Machine Preacher Curl': 32.5,
  'Machine Preacher Curl': 32.5,
  'Ez Bar Preacher Curl': 30,
  'Bottom-Half EZ-Bar Preacher Curl': 30,
  'Bottom-Half DB Preacher Curl': 14,
  'Inverse DB Zottman Curl': 14,
  'EZ-Bar Skull Crusher': 32.5,
  'DB Skull Crusher': 14,
  'Katana Triceps Extension': 15,
  'Overhead Cable Triceps Extension': 30,
  'Overhead Cable Triceps Extension (Bar)': 30,
  'Overhead Cable Triceps Extension (Rope)': 25,
  'Triceps Pressdown (Bar)': 40,
  'Triceps Pressdown (Rope)': 32.5,
  'Triceps Diverging Pressdown (Long Rope or 2 Ropes)': 35,
  'Triceps Diverging Pressdown': 35,

  // Core & Abs
  'Roman Chair Leg Raise': 0,
  'Ab Wheel Rollout': 0,
  'Hanging Leg Raise': 0,
  'Machine Crunch': 50,
  'Cable Crunch': 45,
};

/**
 * Gets the 75th percentile estimated baseline weight for any given exercise name.
 */
export function getEstimated75thPercentileWeight(exerciseName: string): number {
  if (EXERCISE_75TH_PERCENTILE_BASELINES[exerciseName] !== undefined) {
    return EXERCISE_75TH_PERCENTILE_BASELINES[exerciseName];
  }

  const cleanName = exerciseName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const matchedKey = Object.keys(EXERCISE_75TH_PERCENTILE_BASELINES).find((key) => {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanName.includes(cleanKey) || cleanKey.includes(cleanName);
  });

  if (matchedKey) {
    return EXERCISE_75TH_PERCENTILE_BASELINES[matchedKey];
  }

  // Fuzzy match or category heuristic
  const lower = exerciseName.toLowerCase();
  if (lower.includes('leg press')) return 140;
  if (lower.includes('squat') || lower.includes('hack')) return 85;
  if (lower.includes('rdl') || lower.includes('deadlift')) return 80;
  if (lower.includes('press') && (lower.includes('chest') || lower.includes('bench'))) return 65;
  if (lower.includes('row') || lower.includes('pulldown')) return 55;
  if (lower.includes('curl') || lower.includes('extension') || lower.includes('pressdown')) return 25;
  if (lower.includes('lateral raise') || lower.includes('flye')) return 12.5;
  if (lower.includes('calf')) return 60;
  if (lower.includes('raise') || lower.includes('crunch') || lower.includes('rollout')) return 0;

  return 40;
}
