import { useState, useEffect, useCallback } from 'react';
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

  // Load realistic 7-day demo data
  const loadSampleData = useCallback(() => {
    const today = new Date();
    const sampleLogs = {};
    const sampleMeals = {};

    const weights = [73.2, 73.0, 72.9, 72.7, 72.8, 72.5, 72.4];
    const stepsArr = [8420, 6500, 10240, 7890, 9300, 11200, 8500];
    const workouts = [
      { done: true, type: 'weights', dur: 45, cal: 320 },
      { done: false, type: 'walking', dur: 0, cal: 0 },
      { done: true, type: 'running', dur: 35, cal: 380 },
      { done: true, type: 'yoga', dur: 30, cal: 130 },
      { done: false, type: 'walking', dur: 0, cal: 0 },
      { done: true, type: 'cycling', dur: 40, cal: 310 },
      { done: true, type: 'weights', dur: 50, cal: 350 },
    ];
    const wakeTimes = ['06:45', '07:15', '06:30', '06:30', '07:00', '08:00', '06:30'];

    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const dStr = format(d, 'yyyy-MM-dd');
      const idx = 6 - i;

      sampleLogs[dStr] = {
        wakeUpTime: wakeTimes[idx],
        workoutDone: workouts[idx].done,
        workoutType: workouts[idx].type,
        workoutDuration: workouts[idx].dur,
        workoutCaloriesBurned: workouts[idx].cal,
        steps: stepsArr[idx],
        weight: weights[idx],
        routineChecks: {
          'task-water': true,
          'task-stretch': idx % 2 === 0,
          'task-walk': stepsArr[idx] >= 7000,
          'task-vitamins': true,
          'task-reading': idx > 2,
        },
        notes: i === 0 ? 'Feeling energized today! Panda-San is cheering me on 🌸' : 'Great consistent day! 💪',
      };

      sampleMeals[dStr] = [
        {
          id: `sample-m1-${dStr}`,
          name: idx % 2 === 0 ? 'Idli Sambar (2 pcs) & Coconut Chutney' : 'Masala Dosa with Sambar & Chutney',
          mealType: 'breakfast',
          calories: idx % 2 === 0 ? 210 : 360,
          protein: idx % 2 === 0 ? 7 : 6.5,
          carbs: idx % 2 === 0 ? 38 : 52,
          fat: idx % 2 === 0 ? 3.5 : 14,
          image: idx % 2 === 0 
            ? 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'
            : 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
          time: '08:15',
        },
        {
          id: `sample-m2-${dStr}`,
          name: idx % 2 === 0 
            ? 'South Indian Meals (Sambar, Rasam, Poriyal, Curd)' 
            : 'Hyderabadi Chicken Dum Biryani with Raita',
          mealType: 'lunch',
          calories: idx % 2 === 0 ? 590 : 680,
          protein: idx % 2 === 0 ? 15 : 38,
          carbs: idx % 2 === 0 ? 105 : 76,
          fat: idx % 2 === 0 ? 11 : 24,
          image: idx % 2 === 0
            ? 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80'
            : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
          time: '12:45',
        },
        {
          id: `sample-m3-${dStr}`,
          name: idx % 2 === 0 ? 'South Indian Filter Coffee & Sundal' : 'Neer Mor (Spiced Buttermilk)',
          mealType: 'snack',
          calories: idx % 2 === 0 ? 275 : 55,
          protein: idx % 2 === 0 ? 12.5 : 3,
          carbs: idx % 2 === 0 ? 35 : 4.5,
          fat: idx % 2 === 0 ? 9 : 2.2,
          image: idx % 2 === 0
            ? 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
            : 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
          time: '16:30',
        },
        {
          id: `sample-m4-${dStr}`,
          name: idx % 2 === 0 
            ? 'Whole Wheat Chapati (2 pcs) with Paneer Butter Masala' 
            : 'Yellow Dal Tadka with 2 Ghee Phulkas & Jeera Rice',
          mealType: 'dinner',
          calories: idx % 2 === 0 ? 490 : 420,
          protein: idx % 2 === 0 ? 18 : 15,
          carbs: idx % 2 === 0 ? 52 : 68,
          fat: idx % 2 === 0 ? 23 : 9.5,
          image: idx % 2 === 0
            ? 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80'
            : 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
          time: '19:45',
        },
      ];
    }

    setDailyLogs(prev => ({ ...prev, ...sampleLogs }));
    setMeals(prev => ({ ...prev, ...sampleMeals }));
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
