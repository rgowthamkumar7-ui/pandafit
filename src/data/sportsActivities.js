/**
 * Sports & Workout Activities Database
 * Compendium of Physical Activities (Ainsworth et al.) MET values
 * 
 * Formula:
 * Calories Burned Per Hour = MET * weight_in_kg
 * Total Calories Burned   = MET * weight_in_kg * (duration_in_minutes / 60)
 */

export const SPORTS_ACTIVITIES = [
  // ── POPULAR SPORTS ──
  {
    id: 'badminton',
    label: 'Badminton',
    category: 'sports',
    emoji: '🏸',
    met: 6.0,
    intensity: 'Moderate to High',
    description: 'Rallies, footwork, and smash play',
    defaultDuration: 45,
  },
  {
    id: 'cricket',
    label: 'Cricket',
    category: 'sports',
    emoji: '🏏',
    met: 5.0,
    intensity: 'Moderate',
    description: 'Batting, bowling, running wickets & fielding',
    defaultDuration: 60,
  },
  {
    id: 'football',
    label: 'Football / Soccer',
    category: 'sports',
    emoji: '⚽',
    met: 8.0,
    intensity: 'High',
    description: 'Continuous running, sprints & ball control',
    defaultDuration: 60,
  },
  {
    id: 'basketball',
    label: 'Basketball',
    category: 'sports',
    emoji: '🏀',
    met: 7.0,
    intensity: 'High',
    description: 'Full court game, shooting & defensive footwork',
    defaultDuration: 45,
  },
  {
    id: 'tennis',
    label: 'Tennis',
    category: 'sports',
    emoji: '🎾',
    met: 7.3,
    intensity: 'High',
    description: 'Singles / doubles rallies and serve practice',
    defaultDuration: 60,
  },
  {
    id: 'table_tennis',
    label: 'Table Tennis',
    category: 'sports',
    emoji: '🏓',
    met: 4.0,
    intensity: 'Moderate',
    description: 'Fast reflex rallies and footwork',
    defaultDuration: 45,
  },
  {
    id: 'squash',
    label: 'Squash',
    category: 'sports',
    emoji: '💥',
    met: 11.5,
    intensity: 'Very High',
    description: 'High tempo court sprints and continuous rallies',
    defaultDuration: 40,
  },
  {
    id: 'volleyball',
    label: 'Volleyball',
    category: 'sports',
    emoji: '🏐',
    met: 5.5,
    intensity: 'Moderate to High',
    description: 'Jumping, spiking, and court movement',
    defaultDuration: 45,
  },
  {
    id: 'swimming',
    label: 'Swimming (Laps)',
    category: 'sports',
    emoji: '🏊',
    met: 7.5,
    intensity: 'High',
    description: 'Freestyle, breaststroke, and continuous laps',
    defaultDuration: 30,
  },

  // ── GYM & STRENGTH ──
  {
    id: 'weights',
    label: 'Gym / Weight Training',
    category: 'gym',
    emoji: '🏋️‍♂️',
    met: 5.5,
    intensity: 'Moderate to High',
    description: 'Dumbbells, barbell lifts & resistance machines',
    defaultDuration: 45,
  },
  {
    id: 'hiit',
    label: 'HIIT / Circuit',
    category: 'gym',
    emoji: '⚡',
    met: 8.5,
    intensity: 'Very High',
    description: 'Explosive intervals, burpees & kettlebells',
    defaultDuration: 30,
  },
  {
    id: 'calisthenics',
    label: 'Bodyweight / Calisthenics',
    category: 'gym',
    emoji: '🤸',
    met: 6.0,
    intensity: 'Moderate to High',
    description: 'Pushups, pullups, dips, squats & core work',
    defaultDuration: 35,
  },

  // ── CARDIO & OUTDOOR ──
  {
    id: 'running',
    label: 'Running / Jogging',
    category: 'cardio',
    emoji: '🏃',
    met: 9.0,
    intensity: 'High',
    description: 'Paced road or treadmill running (~8.5-9 km/h)',
    defaultDuration: 30,
  },
  {
    id: 'cycling',
    label: 'Cycling (Outdoor / Spin)',
    category: 'cardio',
    emoji: '🚴',
    met: 7.5,
    intensity: 'Moderate to High',
    description: 'Paced cycling or stationary spin class',
    defaultDuration: 45,
  },
  {
    id: 'jump_rope',
    label: 'Jump Rope / Skipping',
    category: 'cardio',
    emoji: '🪢',
    met: 10.0,
    intensity: 'Very High',
    description: 'Continuous rhythmic skipping and double-unders',
    defaultDuration: 20,
  },
  {
    id: 'boxing',
    label: 'Boxing / Kickboxing',
    category: 'cardio',
    emoji: '🥊',
    met: 8.0,
    intensity: 'High',
    description: 'Heavy bag rounds, shadowboxing & pad work',
    defaultDuration: 40,
  },
  {
    id: 'walking',
    label: 'Brisk Walking',
    category: 'cardio',
    emoji: '🚶',
    met: 4.0,
    intensity: 'Light to Moderate',
    description: 'Paced walking (~5 km/h outdoor or treadmill)',
    defaultDuration: 45,
  },
  {
    id: 'rowing',
    label: 'Rowing Machine',
    category: 'cardio',
    emoji: '🚣',
    met: 7.0,
    intensity: 'Moderate to High',
    description: 'Full-body ergometer power strokes',
    defaultDuration: 25,
  },
  {
    id: 'dance',
    label: 'Dance / Zumba',
    category: 'cardio',
    emoji: '💃',
    met: 6.5,
    intensity: 'Moderate to High',
    description: 'High-energy dance choreography & aerobic beats',
    defaultDuration: 45,
  },

  // ── MIND & BODY ──
  {
    id: 'yoga',
    label: 'Yoga & Stretch',
    category: 'mind_body',
    emoji: '🧘',
    met: 3.5,
    intensity: 'Light to Moderate',
    description: 'Asanas, deep stretching & breath control',
    defaultDuration: 40,
  },
  {
    id: 'pilates',
    label: 'Pilates',
    category: 'mind_body',
    emoji: '✨',
    met: 4.2,
    intensity: 'Moderate',
    description: 'Mat flow, core stabilization & postural work',
    defaultDuration: 40,
  },
  {
    id: 'other',
    label: 'Custom Active Play',
    category: 'other',
    emoji: '🌟',
    met: 5.0,
    intensity: 'Moderate',
    description: 'Active movement and recreational play',
    defaultDuration: 30,
  },
];

/**
 * Normalizes weight to kilograms
 */
export function normalizeToKg(weight, unit = 'kg') {
  const num = Number(weight);
  if (!num || isNaN(num) || num <= 0) return 70; // safe adult default
  if (unit?.toLowerCase() === 'lbs' || unit?.toLowerCase() === 'lb') {
    return Number((num * 0.453592).toFixed(1));
  }
  return num;
}

/**
 * Calculates hourly calorie burn rate for an activity and weight:
 * BurnRate (kcal/hr) = MET * weight_in_kg
 */
export function calculateHourlyBurnRate(activityIdOrMet, weightKg) {
  let met = 5.0;
  if (typeof activityIdOrMet === 'number') {
    met = activityIdOrMet;
  } else {
    const found = SPORTS_ACTIVITIES.find(a => a.id === activityIdOrMet);
    if (found) met = found.met;
  }
  const kg = Number(weightKg) || 70;
  return Math.round(met * kg);
}

/**
 * Calculates total calories burned for an activity, weight, and duration in minutes:
 * TotalBurn (kcal) = MET * weight_in_kg * (duration_minutes / 60)
 */
export function calculateTotalActivityBurn(activityIdOrMet, weightKg, durationMinutes) {
  const hourly = calculateHourlyBurnRate(activityIdOrMet, weightKg);
  const mins = Math.max(0, Number(durationMinutes) || 0);
  return Math.round(hourly * (mins / 60));
}

/**
 * Activity category filter tabs
 */
export const ACTIVITY_CATEGORIES = [
  { id: 'all', label: 'All Activities' },
  { id: 'sports', label: '🏸 Sports' },
  { id: 'gym', label: '🏋️ Gym & Lift' },
  { id: 'cardio', label: '🏃 Cardio & Run' },
  { id: 'mind_body', label: '🧘 Mind & Body' },
];
