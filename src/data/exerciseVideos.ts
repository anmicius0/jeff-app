/**
 * Mapping of all exercises to their official Jeff Nippard YouTube video IDs
 * Synced directly with UpperLower.html and WORKOUT_PLAN.md
 */
export const EXERCISE_VIDEO_MAP: Record<string, string> = {
  // Chest
  'Barbell Bench Press': 'nQL5ieH39sw',
  'Bottom-Half 45° Incline Barbell Press': 'sUGwbyfqTCM',
  'Bottom-Half 45° Incline DB Press': 'IWP7b1ux7tM',
  'Bottom-Half 45° Incline Smith Machine Press': '2SDvsxp9UtU',
  '30* Smith Incline Pres': '2SDvsxp9UtU',
  'Bottom-Half DB Flye': 'qJzc-iHKGdg',
  'Bottom-Half Pec Deck': 'NREhZ8eRDZ0',
  'Pec Deck': 'NREhZ8eRDZ0',
  'Bottom-Half Seated Cable Flye': 'tsJMV9Gxw-o',
  'Seated Cable Flye': 'tsJMV9Gxw-o',
  'Flat DB Bench Press': 'zGXvPjlgVkk',
  'Flat Machine Chest Press': 'zDecGJLyVm8',
  'Flat Smith Machine Bench Press': 'LgfwlDMVKnk',
  'Chest Press Machine': 'zDecGJLyVm8',
  'Dumbbell Chest Press': 'zGXvPjlgVkk',

  // Back
  '1-Arm Lat Pulldown': 'w5TnMeos5Z4',
  'Arm-Out Single-Arm DB Row': '1ydRu2K6oHg',
  'Chest-Supported Incline DB Row': 'okCWuhxJEvw',
  'Chest-Supported Machine Row': 'ijsSiWSzYw0',
  'Chest-Supported Low Row': 'ijsSiWSzYw0',
  'Chest-Supported T-Bar Row': 'q8qlHwcuOtc',
  'Cross-Body Lat Pull-Around': 'HupsDdoa_hU',
  'DB Row': 'roKtfQZbxzg',
  'Deficit Pendlay Row': 'MmuyHKYCLps',
  'Pendlay Deficit Row': 'MmuyHKYCLps',
  'Dual-Handle Elbows-Out Cable Row': 'qryIQcx4cTg',
  'Helms Row': 'DjO2G9DIerQ',
  'Neutral-Grip Lat Pulldown': 'lA4_1F9EAFU',
  'Dual Neutral-Grip Lat Pulldown': 'lA4_1F9EAFU',
  'Neutral-Grip Pull-Up': 'ErIEwtYEKnc',
  'Neutral-Grip Pullup': 'ErIEwtYEKnc',
  'Smith Machine Deficit Row': 'aaDD8tYM070',
  'Wide-Grip Lat Pulldown': 'IYXRrYXfVLc',
  'Wide-Grip Machine Pulldown': '1vGynj-nJSs',
  'Wide-Grip Pull-Up': 'yGnp0HU8BnA',
  'Moto Row': 'roKtfQZbxzg',
  'DB Pullover': 'okCWuhxJEvw',
  'Machine Pullover': '1vGynj-nJSs',
  'Kroc Row': 'roKtfQZbxzg',
  'T-Bar Row': 'q8qlHwcuOtc',
  'Pendlay Row': 'MmuyHKYCLps',

  // Shoulders & Rear Delts
  'Bent-Over Reverse DB Flye': '9BfxdGmekv4',
  'Cable Reverse Flye': 'XpjBvleEUWM',
  'Cuffed Behind-The-Back Lateral Raise': 'fjiOCmFljDM',
  'DB Lateral Raise': 'RyztKrzaMNk',
  'High-Cable Cuffed Lateral Raise': '8m2jNHBP580',
  'Behind Back Cable Cuffed Lateral Raise': '8m2jNHBP580',
  'High-Cable Lateral Raise': 'MnMux3Wc0Ac',
  'Meadows Incline DB Lateral Raise': 'XR5eA4ALDZE',
  'Incline Lying DB Lateral Raise': 'XR5eA4ALDZE',
  'Machine Lateral Raise': '8m2jNHBP580',
  'Machine Shoulder Press': '2SDvsxp9UtU',
  'Super-Stretch Reverse Pec Deck': 'mLAySMWAk90',
  'Reverse Pec Deck': 'mLAySMWAk90',
  'Cable Unilateral Face Pull': 'XpjBvleEUWM',
  'Seated Dumbbell Shrug': 'RyztKrzaMNk',
  'Machine Shrug': 'ijsSiWSzYw0',
  'Cable Shrug-In': 'qryIQcx4cTg',
  'Barbell Shrug': 'nQL5ieH39sw',
  'Trap Bar Shrug': 'nQL5ieH39sw',
  'Smith Machine Shrug': 'LgfwlDMVKnk',

  // Biceps & Forearms
  'Bayesian Cable Curl': 'CWH5J_7kzjM',
  'Bottom-Half Bayesian Cable Curl': 'HGmMVCJdl7U',
  'Bottom-Half DB Preacher Curl': 'hAELX8JE9uw',
  'Bottom-Half EZ-Bar Preacher Curl': 'vBxwU26FuYg',
  'Ez Bar Preacher Curl': 'vBxwU26FuYg',
  'Bottom-Half Incline DB Curl': 'AF03Jj-BJZs',
  'Bottom-Half Machine Preacher Curl': '_4Qy5oIgjmY',
  'Machine Preacher Curl': '_4Qy5oIgjmY',
  'DB Curl': 'XxGCRSJmgwY',
  'DB Hammer Curl': 'xY3sQXYhk7A',
  'EZ-Bar Cable Curl': 'ck1zjNTnFew',
  'EZ-Bar Curl': 'WMrgn4GG7mI',
  'Elbow Supported DB Curl': 'XxGCRSJmgwY',
  'Incline DB Stretch Curl': 'Z0NIYS9nyoQ',
  'Incline DB Stretch-Curl': 'Z0NIYS9nyoQ',
  'Inverse DB Zottman Curl': 'jBIvbpyb99M',
  'Reverse-Grip DB Curl': 'KYfVrzmh-GU',
  'Seated Super-Bayesian High Cable Curl': 'jQ9rkfvAbIc',

  // Triceps & Push
  'Bodyweight Dip': 'iswhjR-_-Xg',
  'Close-Grip Pushup (AMRAP)': 'z7Fx-RY4kXw',
  'DB Skull Crusher': 'fbLTzgTKOR8',
  'DB Triceps Kickback': 'YdUUYFgpA7g',
  'Diamond Pushup': 'lNudQ4rK8TA',
  'EZ-Bar Skull Crusher': 'oDKGCsTjAk8',
  'Katana Triceps Extension': 'R7f45Mv7yyg',
  'Overhead Cable Triceps Extension (Bar)': '9_I1PqZAjdA',
  'Overhead Cable Triceps Extension': '9_I1PqZAjdA',
  'Overhead Cable Triceps Extension (Rope)': 'GYoUoVNlbGc',
  'Triceps Diverging Pressdown (Long Rope or 2 Ropes)': '20tbMlP71Nc',
  'Triceps Diverging Pressdown': '20tbMlP71Nc',
  'Triceps Pressdown (Bar)': 'o4eazahiXQw',
  'Triceps Pressdown (Rope)': 'bCa036rGtVU',

  // Legs (Quads & Glutes)
  'Belt Squat': 'JvAc3k4Jdqw',
  'Bottom-Half DB Bulgarian Split Squat': 'DXN-xa9toNs',
  'Bottom-Half Hack Squat': 'gt8rRkyjaak',
  'Bottom-Half Smith Machine Squat': 'tEyxsEIgWAE',
  'DB Bulgarian Split Squat': 'Z1uu0uHYl20',
  'DB Reverse Lunge': 'QSGe2Sd8kUI',
  'DB Static Lunge': 'hci6iKFtTkg',
  'DB Walking Lunge': 'BC_eDtrB-M4',
  'Front Squat': 'TRwhJ0TCoqI',
  'High-Bar Back Squat': 'V-B_Y-OvOTQ',
  'Leg Extension': 'uFbNtqP966A',
  'Leg Press': '1yKAQLVV_XI',
  'Reverse Nordic': 'D-kqUKEQZZ0',
  'Sissy Squat': 'eWAjlO4FWPQ',
  'Smith Machine Reverse Lunge': 'D0KZo_gBsw0',
  'Super-ROM Leg Press': 'ir9wMH7r7vQ',

  // Hamstrings, Glutes & Lower Back
  'Barbell RDL': 'ggFtGGYobE4',
  'DB RDL': 'TZAmthQJkh8',
  'Deadlift': 'lOLP5MpkpNc',
  'Glute-Ham Raise': '9ksG-O0ZUto',
  'Good Morning (Light Weight)': 'c-Yj6God14s',
  'Good Morning(Light Weight)': 'c-Yj6God14s',
  'Lying Leg Curl': 'sX4tGtcc62k',
  'Nordic Ham Curl': 'fzpYiRtzmFA',
  'Nordic Curl': 'fzpYiRtzmFA',
  'Reverse Hyper': 'q-DGbOzW6Sk',
  'Seated Leg Curl': 'yv0aAY7M1mk',
  'Single-Leg DB Hip Thrust': 'V8uasBf-Es8',
  'Single-Leg Leg Press': 'zURHw38OZTM',
  'Smith Machine Good Morning': 'ABRT5jiwpRw',
  'Weighted 45° Hyperextension': 'lEeCPhlFZig',

  // Calves & Hips
  'Bottom-Half Standing Calf Raise': 'DagEZqpeAv0',
  'Cable Hip Abduction': '552L1K3Rb_Q',
  'Cable Hip Adduction': '6GYTbv-LtV0',
  'Copenhagen Hip Adduction': 'QRLGyl5-i4k',
  'Donkey Calf Raise': '0eQQwveeQzw',
  'Lateral Band Walk': 'sOYvvFPYdsU',
  'Leg Press Calf Press': 'S6DTPNZ_-F4',
  'Machine Hip Abduction': 'pozooPg6PBE',
  'Machine Hip Adduction': 'FMSCZYu1JhE',
  'Seated Calf Raise': '6pfj0G7VKdM',
  'Standing Calf Raise': 'KEDmNgu-uKU',

  // Abs & Core
  'Ab Wheel Rollout': 'gGTgyCU9gcg',
  'Cable Crunch': 'epBrpaGHMcg',
  'Long-Lever Plank': '9rFS1gg0vJM',
  'Machine Crunch': 'K2yKEoazT3g',
  'Roman Chair Leg Raise': 'irOzFVqJ0IE',
  'Swiss Ball Rollout': 'FvekMyIs-yk',
};

/**
 * Returns YouTube embed URL for a given exercise name, or null if unavailable
 */
export function getExerciseVideoEmbedUrl(exerciseName: string): string | null {
  if (EXERCISE_VIDEO_MAP[exerciseName]) {
    return `https://www.youtube.com/embed/${EXERCISE_VIDEO_MAP[exerciseName]}?rel=0&modestbranding=1&playsinline=1`;
  }

  // Fallback fuzzy search by name
  const cleanName = exerciseName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const matchedKey = Object.keys(EXERCISE_VIDEO_MAP).find((key) => {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanName.includes(cleanKey) || cleanKey.includes(cleanName);
  });

  if (matchedKey) {
    return `https://www.youtube.com/embed/${EXERCISE_VIDEO_MAP[matchedKey]}?rel=0&modestbranding=1&playsinline=1`;
  }

  return null;
}
