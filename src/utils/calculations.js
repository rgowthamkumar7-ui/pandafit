import { format, subDays, parseISO } from 'date-fns';
import { SPORTS_ACTIVITIES, calculateTotalActivityBurn } from '../data/sportsActivities';

/**
 * Calculates approximate calories burned from step count (~0.04 kcal / step)
 */
export function calculateStepCalories(steps) {
  const numSteps = Number(steps) || 0;
  return Math.round(numSteps * 0.04);
}

/**
 * Workout calorie burn rates per minute (approximate averages)
 * Backwards compatible alias of SPORTS_ACTIVITIES
 */
export const WORKOUT_TYPES = SPORTS_ACTIVITIES.map(a => ({
  id: a.id,
  label: a.label,
  emoji: a.emoji,
  calPerMin: Number((a.met * 70 / 60).toFixed(1)),
  met: a.met,
  category: a.category,
  intensity: a.intensity,
  description: a.description,
}));

/**
 * Estimates calories burned for a workout based on type, duration and optional body weight (kg)
 * Uses gold standard MET formula: MET * weightKg * (durationMinutes / 60)
 */
export function estimateWorkoutCalories(typeId, durationMinutes, weightKg = 70) {
  const kg = Number(weightKg) || 70;
  const minutes = Math.max(0, Number(durationMinutes) || 0);
  return calculateTotalActivityBurn(typeId, kg, minutes);
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
