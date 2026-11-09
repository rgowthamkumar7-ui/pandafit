import { format, subDays, parseISO } from 'date-fns';

/**
 * Calculates approximate calories burned from step count (~0.04 kcal / step)
 */
export function calculateStepCalories(steps) {
  const numSteps = Number(steps) || 0;
  return Math.round(numSteps * 0.04);
}

/**
 * Workout calorie burn rates per minute (approximate averages)
 */
export const WORKOUT_TYPES = [
  { id: 'weights', label: 'Weight Training', emoji: '🏋️‍♂️', calPerMin: 6.5 },
  { id: 'running', label: 'Running / Jogging', emoji: '🏃', calPerMin: 10.5 },
  { id: 'walking', label: 'Brisk Walking', emoji: '🚶', calPerMin: 4.5 },
  { id: 'cycling', label: 'Cycling', emoji: '🚴', calPerMin: 8.0 },
  { id: 'yoga', label: 'Yoga & Stretch', emoji: '🧘', calPerMin: 3.8 },
  { id: 'pilates', label: 'Pilates', emoji: '🤸', calPerMin: 5.2 },
  { id: 'hiit', label: 'HIIT / Circuit', emoji: '⚡', calPerMin: 9.5 },
  { id: 'swimming', label: 'Swimming', emoji: '🏊', calPerMin: 8.5 },
  { id: 'dance', label: 'Dance Fitness', emoji: '💃', calPerMin: 7.0 },
  { id: 'other', label: 'Other Active', emoji: '✨', calPerMin: 5.0 },
];

/**
 * Estimates calories burned for a workout based on type and duration
 */
export function estimateWorkoutCalories(typeId, durationMinutes) {
  const type = WORKOUT_TYPES.find(t => t.id === typeId) || WORKOUT_TYPES[0];
  const minutes = Math.max(0, Number(durationMinutes) || 0);
  return Math.round(minutes * type.calPerMin);
}

/**
 * Format 24h time ("06:30") into friendly 12h time ("6:30 AM")
 */
export function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [hourStr, minStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  if (isNaN(hour)) return timeStr;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minStr || '00'} ${ampm}`;
}

/**
 * Calculates weight difference and trend versus previous entry
 */
export function calculateWeightTrend(currentWeight, prevWeight, unit = 'kg') {
  if (!currentWeight || !prevWeight) return null;
  const diff = Number((Number(currentWeight) - Number(prevWeight)).toFixed(1));
  if (diff === 0) {
    return { diff: 0, text: `Same as yesterday`, status: 'same' };
  }
  const isDown = diff < 0;
  return {
    diff,
    text: `${isDown ? '🔻' : '🔺'} ${isDown ? diff : `+${diff}`} ${unit} vs yesterday`,
    status: isDown ? 'down' : 'up'
  };
}

/**
 * Computes task completion streak (consecutive days checked up to reference date)
 */
export function calculateTaskStreak(taskId, dailyLogs = {}, referenceDateStr) {
  if (!taskId || !referenceDateStr) return 0;
  let streak = 0;
  let currDate = parseISO(referenceDateStr);

  // If checked on reference date, start counting streak
  const refChecked = Boolean(dailyLogs[referenceDateStr]?.routineChecks?.[taskId]);
  if (!refChecked) {
    // If not checked today, check if yesterday was checked
    currDate = subDays(currDate, 1);
  }

  for (let i = 0; i < 60; i++) {
    const dStr = format(currDate, 'yyyy-MM-dd');
    const isChecked = Boolean(dailyLogs[dStr]?.routineChecks?.[taskId]);
    if (isChecked) {
      streak += 1;
      currDate = subDays(currDate, 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Computes totals for a given date
 */
export function calculateDayTotals(dayMeals = [], dayLog = {}, calorieGoal = 2000) {
  const consumed = dayMeals.reduce((acc, m) => {
    return {
      calories: acc.calories + (Number(m.calories) || 0),
      protein: acc.protein + (Number(m.protein) || 0),
      carbs: acc.carbs + (Number(m.carbs) || 0),
      fat: acc.fat + (Number(m.fat) || 0),
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const workoutBurned = Number(dayLog?.workoutCaloriesBurned) || 0;
  const stepBurned = calculateStepCalories(dayLog?.steps || 0);
  const totalBurned = workoutBurned + stepBurned;
  const netCalories = consumed.calories - totalBurned;
  const remainingCalories = calorieGoal - netCalories;

  return {
    consumedCalories: consumed.calories,
    consumedProtein: consumed.protein,
    consumedCarbs: consumed.carbs,
    consumedFat: consumed.fat,
    workoutCalories: workoutBurned,
    stepCalories: stepBurned,
    totalBurned,
    netCalories,
    remainingCalories,
  };
}
