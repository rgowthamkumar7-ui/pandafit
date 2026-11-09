import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { syncToSupabase } from '../utils/supabase';

const STORAGE_KEYS = {
  DAILY_LOGS: 'pandafit_daily_logs',
  MEALS: 'pandafit_meals',
  ROUTINE_TASKS: 'pandafit_routine_tasks',
  SETTINGS: 'pandafit_settings',
  CUSTOM_FOODS: 'pandafit_custom_foods',
};

const DEFAULT_SETTINGS = {
  name: 'Panda Friend',
  weightUnit: 'kg',
  calorieGoal: 2000,
  proteinGoal: 140,
  carbsGoal: 210,
  fatGoal: 65,
  stepsGoal: 8000,
  waterGoalGlasses: 8,
  healthSyncSource: 'none', // 'none' | 'google-fit' | 'apple-health'
  autoSyncSteps: false,
  lastStepsSyncTime: '',
  googleClientId: '',
};

const DEFAULT_ROUTINE_TASKS = [
  { id: 'task-water', name: 'Drink 2L Water', emoji: '💧', time: 'All day', createdAt: '2026-01-01' },
  { id: 'task-stretch', name: 'Morning Stretch', emoji: '🧘', time: '07:00 AM', createdAt: '2026-01-01' },
  { id: 'task-walk', name: 'Take 7,000+ Steps', emoji: '🚶', time: '12:30 PM', createdAt: '2026-01-01' },
  { id: 'task-vitamins', name: 'Take Daily Vitamins', emoji: '💊', time: '08:00 AM', createdAt: '2026-01-01' },
  { id: 'task-reading', name: 'Read for 15 mins', emoji: '📖', time: '09:30 PM', createdAt: '2026-01-01' },
];

function getStored(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

export function useStorage() {
  const [dailyLogs, setDailyLogs] = useState(() => getStored(STORAGE_KEYS.DAILY_LOGS, {}));
  const [meals, setMeals] = useState(() => getStored(STORAGE_KEYS.MEALS, {}));
  const [routineTasks, setRoutineTasks] = useState(() => getStored(STORAGE_KEYS.ROUTINE_TASKS, DEFAULT_ROUTINE_TASKS));
  const [settings, setSettings] = useState(() => getStored(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS));
  const [customFoods, setCustomFoods] = useState(() => getStored(STORAGE_KEYS.CUSTOM_FOODS, []));

  // Sync state changes to localStorage
  useEffect(() => {
    setStored(STORAGE_KEYS.DAILY_LOGS, dailyLogs);
  }, [dailyLogs]);

  useEffect(() => {
    setStored(STORAGE_KEYS.MEALS, meals);
  }, [meals]);

  useEffect(() => {
    setStored(STORAGE_KEYS.ROUTINE_TASKS, routineTasks);
  }, [routineTasks]);

  useEffect(() => {
    setStored(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    setStored(STORAGE_KEYS.CUSTOM_FOODS, customFoods);
  }, [customFoods]);

  // Save new custom or internet-searched food item
  const saveCustomFood = useCallback((foodItem) => {
    setCustomFoods(prev => {
      const exists = prev.some(f => f.name.toLowerCase() === foodItem.name.toLowerCase());
      if (exists) {
        return prev.map(f => f.name.toLowerCase() === foodItem.name.toLowerCase() ? { ...f, ...foodItem } : f);
      }
      return [foodItem, ...prev];
    });
  }, []);

  // Update a single day's log entry
  const updateDailyLog = useCallback((dateStr, updates) => {
    setDailyLogs(prev => {
      const existing = prev[dateStr] || {
        wakeUpTime: '',
        workoutDone: false,
        workoutType: 'weights',
        workoutDuration: 30,
        workoutCaloriesBurned: 0,
        steps: 0,
        weight: '',
        routineChecks: {},
        notes: '',
      };
      const updatedDay = { ...existing, ...updates };
      const nextLogs = { ...prev, [dateStr]: updatedDay };
      
      // Async sync to Supabase if available
      syncToSupabase('daily_logs', { date: dateStr, ...updatedDay });
      return nextLogs;
    });
  }, []);

  // Meal operations
  const addMeal = useCallback((dateStr, meal) => {
    const newMeal = {
      id: 'meal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      ...meal,
    };

    setMeals(prev => {
      const dayMeals = prev[dateStr] || [];
      const updated = { ...prev, [dateStr]: [...dayMeals, newMeal] };
      syncToSupabase('meals', { date: dateStr, meals: updated[dateStr] });
      return updated;
    });

    return newMeal;
  }, []);

  const deleteMeal = useCallback((dateStr, mealId) => {
    setMeals(prev => {
      const dayMeals = prev[dateStr] || [];
      const updated = {
        ...prev,
        [dateStr]: dayMeals.filter(m => m.id !== mealId),
      };
      syncToSupabase('meals', { date: dateStr, meals: updated[dateStr] });
      return updated;
    });
  }, []);

  // Routine tasks operations
  const addRoutineTask = useCallback((task) => {
    const newTask = {
      id: 'task-' + Date.now(),
      name: task.name,
      emoji: task.emoji || '⭐',
      time: task.time || '',
      createdAt: new Date().toISOString(),
    };
    setRoutineTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const deleteRoutineTask = useCallback((taskId) => {
    setRoutineTasks(prev => prev.filter(t => t.id !== taskId));
    // Clean up routineChecks in dailyLogs
    setDailyLogs(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(date => {
        if (updated[date]?.routineChecks?.[taskId] !== undefined) {
          const checks = { ...updated[date].routineChecks };
          delete checks[taskId];
          updated[date] = { ...updated[date], routineChecks: checks };
        }
      });
      return updated;
    });
  }, []);

  const toggleRoutineCheck = useCallback((dateStr, taskId) => {
    setDailyLogs(prev => {
      const day = prev[dateStr] || { routineChecks: {} };
      const checks = { ...(day.routineChecks || {}) };
      checks[taskId] = !checks[taskId];
      const updatedDay = { ...day, routineChecks: checks };
      return { ...prev, [dateStr]: updatedDay };
    });
  }, []);

  // Update Settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Detect if any demo / sample data exists in storage
  const hasDemoData = useMemo(() => {
    // 1. Check for sample meals
    const hasSampleMeal = Object.values(meals).some(dayList =>
      Array.isArray(dayList) && dayList.some(m => m.id && String(m.id).startsWith('sample-'))
    );
    if (hasSampleMeal) return true;

    // 2. Check for sample daily logs
    const hasSampleLog = Object.values(dailyLogs).some(log => {
      if (!log) return false;
      const isDemoNote = log.notes === 'Feeling energized today! Panda-San is cheering me on 🌸' ||
                         log.notes === 'Great consistent day! 💪';
      const isDemoSteps = [8420, 6500, 10240, 7890, 9300, 11200, 8500].includes(log.steps);
      const isDemoWake = ['06:45', '07:15', '06:30', '07:00', '08:00'].includes(log.wakeUpTime);
      return isDemoNote || (isDemoSteps && isDemoWake);
    });
    return hasSampleLog;
  }, [meals, dailyLogs]);

  // Completely wipe all demo / sample records and restore user's real diary
  const clearDemoRecords = useCallback(() => {
    // Clean meals: remove any meal with id starting with 'sample-'
    setMeals(prev => {
      const cleaned = {};
      Object.keys(prev).forEach(dateStr => {
        const remaining = (prev[dateStr] || []).filter(m => !String(m.id || '').startsWith('sample-'));
        if (remaining.length > 0) {
          cleaned[dateStr] = remaining;
        }
      });
      return cleaned;
    });

    // Clean dailyLogs: remove any logs created by demo generator
    setDailyLogs(prev => {
      const cleaned = {};
      Object.keys(prev).forEach(dateStr => {
        const log = prev[dateStr];
        if (!log) return;
        const isDemoNote = log.notes === 'Feeling energized today! Panda-San is cheering me on 🌸' ||
                           log.notes === 'Great consistent day! 💪';
        const isDemoSteps = [8420, 6500, 10240, 7890, 9300, 11200, 8500].includes(log.steps);
        const isDemoWake = ['06:45', '07:15', '06:30', '07:00', '08:00'].includes(log.wakeUpTime);
        if (!isDemoNote && !(isDemoSteps && isDemoWake)) {
          cleaned[dateStr] = log;
        }
      });
      return cleaned;
    });
  }, []);

  // Reset a specific day's log & meals to clean state
  const resetDayLog = useCallback((dateStr) => {
    setDailyLogs(prev => {
      const copy = { ...prev };
      delete copy[dateStr];
      return copy;
    });
    setMeals(prev => {
      const copy = { ...prev };
      delete copy[dateStr];
      return copy;
    });
  }, []);

  // Deprecated dummy load (safely does nothing to protect user's real data)
  const loadSampleData = useCallback(() => {
    console.warn('loadSampleData has been removed to protect user data.');
  }, []);

  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.DAILY_LOGS);
    localStorage.removeItem(STORAGE_KEYS.MEALS);
    localStorage.removeItem(STORAGE_KEYS.ROUTINE_TASKS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_FOODS);
    setDailyLogs({});
    setMeals({});
    setCustomFoods([]);
    setRoutineTasks(DEFAULT_ROUTINE_TASKS);
  }, []);

  return {
    dailyLogs,
    meals,
    routineTasks,
    settings,
    customFoods,
    hasDemoData,
    clearDemoRecords,
    resetDayLog,
    saveCustomFood,
    updateDailyLog,
    addMeal,
    deleteMeal,
    addRoutineTask,
    deleteRoutineTask,
    toggleRoutineCheck,
    updateSettings,
    loadSampleData,
    clearAllData,
  };
}
