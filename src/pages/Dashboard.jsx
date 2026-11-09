import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Dumbbell,
  Scale,
  Flame,
  CheckCircle2,
  Settings,
  ArrowRight,
  Droplets,
  Footprints,
  Sparkles,
  Zap,
  Crown,
  Activity,
  RefreshCw
} from 'lucide-react';
import { PandaMascot } from '../components/PandaMascot';
import { ProgressRing } from '../components/ProgressRing';
import { SettingsModal } from '../components/SettingsModal';
import { HealthSyncModal } from '../components/HealthSyncModal';
import {
  performAutoStepSync,
  parseGoogleAuthTokenFromUrl
} from '../services/healthSync';
import { calculateDayTotals, calculateWeightTrend, formatTime12h, calculateStepCalories } from '../utils/calculations';

export function Dashboard({ storage, todayHelper }) {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHealthSyncOpen, setIsHealthSyncOpen] = useState(false);
  const [waterBonusAdded, setWaterBonusAdded] = useState(false);
  const [syncToast, setSyncToast] = useState('');
  const [isSyncingSteps, setIsSyncingSteps] = useState(false);

  const {
    dailyLogs,
    meals,
    routineTasks,
    settings,
    updateDailyLog,
    updateSettings,
    loadSampleData,
    clearAllData,
  } = storage;

  const { selectedDateStr, formattedDate, greeting, isToday } = todayHelper;

  const todayLog = dailyLogs[selectedDateStr] || {};
  const todayMeals = meals[selectedDateStr] || [];

  // Auto-sync steps on mount if configured
  useEffect(() => {
    // 1. Check for Google OAuth token in URL hash
    const tokenObj = parseGoogleAuthTokenFromUrl();
    if (tokenObj) {
      localStorage.setItem('pandafit_gfit_token', tokenObj.accessToken);
      updateSettings({ healthSyncSource: 'google-fit', autoSyncSteps: true });
      setSyncToast('Google Fit authenticated! Steps will sync automatically ⚡');
      setTimeout(() => setSyncToast(''), 3000);
    }

    // 2. Perform auto-sync if connected
    if (settings.autoSyncSteps && settings.healthSyncSource && settings.healthSyncSource !== 'none') {
      performAutoStepSync({
        settings,
        currentSteps: todayLog.steps || 0,
        selectedDateStr,
        updateDailyLog
      }).then((res) => {
        if (res.synced) {
          setSyncToast(`Auto-synced ${res.steps?.toLocaleString()} steps from ${res.source}! 🐾`);
          setTimeout(() => setSyncToast(''), 3000);
        }
      });
    }
  }, []);

  const previousDates = Object.keys(dailyLogs)
    .filter(d => d < selectedDateStr)
    .sort()
    .reverse();
  const prevDate = previousDates[0];
  const prevWeight = prevDate ? dailyLogs[prevDate]?.weight : null;
  const weightTrend = calculateWeightTrend(todayLog.weight, prevWeight, settings.weightUnit);

  const totals = useMemo(() => {
    return calculateDayTotals(todayMeals, todayLog, settings.calorieGoal);
  }, [todayMeals, todayLog, settings.calorieGoal]);

  const totalRoutines = routineTasks.length;
  const completedRoutines = routineTasks.filter(t => todayLog.routineChecks?.[t.id]).length;
  const routinePercentage = totalRoutines > 0 ? Math.round((completedRoutines / totalRoutines) * 100) : 0;

  const streakCount = useMemo(() => {
    const dates = Object.keys(dailyLogs).filter(d => dailyLogs[d]?.workoutDone || dailyLogs[d]?.steps > 0);
    return Math.max(dates.length, 3);
  }, [dailyLogs]);

  const { mascotPose, mascotSpeech, mascotSub } = useMemo(() => {
    const currentHour = new Date().getHours();

    if (totalRoutines > 0 && completedRoutines === totalRoutines) {
      return {
        mascotPose: 'celebrating',
        mascotSpeech: `LEGENDARY! You crushed all ${totalRoutines} daily quests today! 🎉`,
        mascotSub: "Panda-San is cheering you on to victory!",
      };
    }

    if (todayLog.workoutDone) {
      return {
        mascotPose: 'celebrating',
        mascotSpeech: `Workout conquered, ${settings.name}! Look at those gains! 💪`,
        mascotSub: `${todayLog.workoutCaloriesBurned || 0} kcal burned like a hero!`,
      };
    }

    if (currentHour >= 22 || currentHour < 5) {
      return {
        mascotPose: 'hydration',
        mascotSpeech: `Bedtime recharge! Great sleep builds tomorrow's strength! 🌙`,
        mascotSub: "Rest up your panda energy for tomorrow's quests.",
      };
    }

    if ((todayLog.steps || 0) >= 3000) {
      return {
        mascotPose: 'running',
        mascotSpeech: `Step powerhouse! You're blazing through today's goal! ⚡`,
        mascotSub: `${(todayLog.steps || 0).toLocaleString()} steps conquered!`,
      };
    }

    return {
      mascotPose: 'workout',
      mascotSpeech: `${greeting}, ${settings.name}! Ready to crush your fitness quest? 🐾`,
      mascotSub: 'Consistency is your greatest superpower!',
    };
  }, [totalRoutines, completedRoutines, todayLog, settings.name, greeting]);

  const handleQuickWakeUp = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    updateDailyLog(selectedDateStr, { wakeUpTime: timeStr });
  };

  const handleQuickWater = () => {
    setWaterBonusAdded(true);
    setTimeout(() => setWaterBonusAdded(false), 2500);
  };

  const handleQuickSyncSteps = async () => {
    if (!settings.healthSyncSource || settings.healthSyncSource === 'none') {
      setIsHealthSyncOpen(true);
      return;
    }

    setIsSyncingSteps(true);
    try {
      const res = await performAutoStepSync({
        settings,
        currentSteps: todayLog.steps || 0,
        selectedDateStr,
        updateDailyLog
      });

      if (res.synced) {
        setSyncToast(`Synced ${res.steps?.toLocaleString()} steps from ${res.source}! ⚡`);
        setTimeout(() => setSyncToast(''), 3000);
      }
    } catch (err) {
      console.warn('Manual sync failed:', err);
    } finally {
      setIsSyncingSteps(false);
    }
  };

  const activePose = waterBonusAdded ? 'hydration' : mascotPose;
  const activeSpeech = waterBonusAdded ? 'Hydration power-up! Refreshing water locked in! 💧' : mascotSpeech;
  const activeSub = waterBonusAdded ? '+250ml pure fitness boost!' : mascotSub;

  const stepCalories = calculateStepCalories(todayLog.steps || 0);
  const stepPercentage = Math.min(100, Math.round(((todayLog.steps || 0) / (settings.stepsGoal || 8000)) * 100));

  return (
    <div className="pb-28 pt-3 px-4 max-w-md mx-auto">
      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="p-3 bg-bamboo-100 border-2 border-bamboo-600 text-bamboo-800 font-black rounded-2xl mb-3 flex items-center gap-2 text-xs animate-pop-in shadow-md">
          <CheckCircle2 className="w-4 h-4 text-bamboo-600 flex-shrink-0" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* ── TOP STATS BAR (HARMONIZED WARM ORANGE) ── */}
      <div className="flex items-center justify-between mb-4 bg-white py-2.5 px-3 rounded-2xl border-2 border-ink-200">
        {/* Streak Badge */}
        <div className="flex items-center gap-1.5 font-black text-pandaOrange-500 text-sm">
          <Flame className="w-5 h-5 fill-pandaOrange-500 text-pandaOrange-500 animate-pulse" />
          <span>{streakCount} Days Streak</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1.5 font-black text-bamboo-600 text-sm">
          <Zap className="w-4 h-4 fill-bamboo-600 text-bamboo-600" />
          <span>{totals.consumedCalories} XP</span>
        </div>

        {/* Settings button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1.5 rounded-xl hover:bg-ink-100 text-ink-500 hover:text-ink-900 transition-colors"
          title="Settings & Goals"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* ── HERO MASCOT SECTION: CLEAN SEAMLESS 3D MASCOT ── */}
      <div className="panda-hero-box p-5 mb-5 flex flex-col items-center">
        <PandaMascot
          mood={activePose}
          message={activeSpeech}
          subMessage={activeSub}
          size="medium"
          showSpeechBubble={true}
          interactive={true}
        />
      </div>

      {/* ── SECTION TITLE ── */}
      <div className="flex items-center justify-between mt-2 mb-3 px-1">
        <h2 className="text-sm font-black text-ink-900 uppercase tracking-wide flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-pandaOrange-500" /> Daily Targets
        </h2>
        <span className="text-xs font-black text-pandaOrange-700 bg-pandaOrange-100 px-2.5 py-0.5 rounded-full border border-pandaOrange-200">
          {formattedDate}
        </span>
      </div>

      {/* ── CALORIE BALANCE CARD ── */}
      <div className="panda-card p-5 mb-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pandaOrange-100 flex items-center justify-center">
              <Flame className="w-4 h-4 text-pandaOrange-500 fill-pandaOrange-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-ink-900">Calorie Target</h3>
              <p className="text-[11px] text-ink-500 font-extrabold">Daily energy equation</p>
            </div>
          </div>
          <span className="text-xs font-black text-ink-800 bg-ink-100 px-3 py-1 rounded-full border border-ink-200">
            Goal: {settings.calorieGoal} kcal
          </span>
        </div>

        {/* Progress Ring & Breakdown */}
        <div className="flex items-center justify-between gap-4 mt-2">
          <ProgressRing
            value={totals.netCalories > 0 ? totals.netCalories : 0}
            max={settings.calorieGoal}
            size={146}
            strokeWidth={14}
            label="Net Consumed"
            unit="kcal"
            subText={
              totals.remainingCalories >= 0
                ? `${Math.round(totals.remainingCalories)} left`
                : `${Math.abs(Math.round(totals.remainingCalories))} over`
            }
          />

          <div className="flex-1 space-y-2">
            <div className="p-3 rounded-2xl bg-ink-50 border-2 border-ink-200">
              <p className="text-[10px] font-black text-ink-500 uppercase tracking-wider">🥗 Consumed</p>
              <p className="text-lg font-black text-ink-900">
                {totals.consumedCalories} <span className="text-xs font-extrabold text-ink-400">kcal</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-pandaOrange-50 border-2 border-pandaOrange-200">
              <p className="text-[10px] font-black text-pandaOrange-700 uppercase tracking-wider">🔥 Burned</p>
              <p className="text-lg font-black text-pandaOrange-600">
                {totals.totalBurned} <span className="text-xs font-extrabold text-pandaOrange-500">kcal</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STEPS PROGRESS TRACKER ── */}
      <div className="panda-card p-4 mb-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pandaOrange-100 flex items-center justify-center">
              <Footprints className="w-4 h-4 text-pandaOrange-600" />
            </div>
            <div>
              <h4 className="text-sm font-black text-ink-900">Daily Steps Quest</h4>
              <p className="text-[11px] text-ink-500 font-extrabold">~{stepCalories} kcal active burn</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-black text-ink-900">{(todayLog.steps || 0).toLocaleString()}</span>
            <span className="text-[10px] text-ink-400 font-bold block">/ {settings.stepsGoal?.toLocaleString()}</span>
          </div>
        </div>

        {/* 3D Progress Bar matching Orange Palette */}
        <div className="w-full bg-ink-100 h-4 rounded-full overflow-hidden p-0.5 border border-ink-200 my-1">
          <div
            className="bg-pandaOrange-500 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${stepPercentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-black mt-1">
          <span className="text-ink-500">{stepPercentage}% completed</span>
          <span className="text-pandaOrange-600">{stepPercentage >= 100 ? '🎉 QUEST COMPLETED!' : 'Keep stepping!'}</span>
        </div>

        {/* HealthKit / Google Fit Auto-Sync Row */}
        <div className="mt-3 pt-2.5 border-t border-ink-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsHealthSyncOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-black text-ink-600 hover:text-pandaOrange-600 transition-colors"
          >
            {settings.healthSyncSource === 'google-fit' ? (
              <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-lg border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Google Fit Auto-Sync
              </span>
            ) : settings.healthSyncSource === 'apple-health' ? (
              <span className="flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Apple Health Auto-Sync
              </span>
            ) : (
              <span className="flex items-center gap-1 text-ink-500 hover:text-ink-800">
                <Activity className="w-3.5 h-3.5 text-pandaOrange-500" /> Connect Google / Apple Fit
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleQuickSyncSteps}
            disabled={isSyncingSteps}
            className="btn-panda-white !py-1 !px-2.5 text-[10px] flex items-center gap-1 font-black"
          >
            <RefreshCw className={`w-3 h-3 text-pandaOrange-500 ${isSyncingSteps ? 'animate-spin' : ''}`} />
            <span>{settings.healthSyncSource === 'none' ? 'Setup' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* ── 4 ACTIVITY CARDS ── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Wake-Up */}
        <div
          onClick={() => navigate('/log')}
          className="panda-card panda-card-interactive p-3.5 bg-white flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black text-ink-600 flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-pandaOrange-500" /> Wake Up
            </span>
            <span className="text-base">⏰</span>
          </div>
          {todayLog.wakeUpTime ? (
            <div>
              <p className="text-lg font-black text-ink-900">
                {formatTime12h(todayLog.wakeUpTime)}
              </p>
              <span className="text-[10px] font-black text-bamboo-600 bg-bamboo-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                Logged ✓
              </span>
            </div>
          ) : (
            <div>
              <p className="text-xs text-ink-400 font-bold mb-1">Not logged yet</p>
              <button
                onClick={(e) => { e.stopPropagation(); handleQuickWakeUp(); }}
                className="btn-panda-white text-xs px-2.5 py-1 w-full text-center"
              >
                Log Now
              </button>
            </div>
          )}
        </div>

        {/* Workout */}
        <div
          onClick={() => navigate('/log')}
          className="panda-card panda-card-interactive p-3.5 bg-white flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black text-ink-600 flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-pandaOrange-500" /> Workout
            </span>
            <span className="text-base">💪</span>
          </div>
          {todayLog.workoutDone ? (
            <div>
              <span className="text-[10px] font-black text-bamboo-600 bg-bamboo-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-bamboo-600" /> Done!
              </span>
              <p className="text-xs font-black text-ink-900 mt-1 capitalize truncate">
                {todayLog.workoutType || 'Workout'} · {todayLog.workoutCaloriesBurned || 0} kcal
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-ink-400 font-bold mb-1">Pending today</p>
              <span className="btn-panda-orange text-[11px] px-2 py-1 block text-center rounded-xl">
                Log Session →
              </span>
            </div>
          )}
        </div>

        {/* Weight */}
        <div
          onClick={() => navigate('/log')}
          className="panda-card panda-card-interactive p-3.5 bg-white flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black text-ink-600 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-pandaOrange-500" /> Weight
            </span>
            <span className="text-base">⚖️</span>
          </div>
          {todayLog.weight ? (
            <div>
              <p className="text-lg font-black text-ink-900">
                {todayLog.weight} <span className="text-xs font-bold text-ink-400">{settings.weightUnit}</span>
              </p>
              {weightTrend && (
                <p className="text-[10px] font-extrabold text-bamboo-600 mt-0.5">
                  {weightTrend.text}
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-xs text-ink-400 font-bold mb-1">Not recorded</p>
              <span className="btn-panda-white text-xs px-2 py-1 block text-center rounded-xl">
                Record →
              </span>
            </div>
          )}
        </div>

        {/* Routines */}
        <div
          onClick={() => navigate('/routine')}
          className="panda-card panda-card-interactive p-3.5 bg-white flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black text-ink-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-bamboo-600" /> Quests
            </span>
            <span className="text-base">{routinePercentage === 100 ? '🏆' : '🎯'}</span>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-lg font-black text-ink-900">
                {completedRoutines}/{totalRoutines}
              </p>
              <span className="text-xs font-black text-pandaOrange-600">
                {routinePercentage}%
              </span>
            </div>
            <div className="w-full bg-ink-100 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-pandaOrange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${routinePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── HARMONIZED 3D ACTION BUTTONS (NO MISMATCHED STYLING) ── */}
      <div className="space-y-2.5 mb-6">
        <button
          onClick={() => navigate('/log')}
          className="btn-panda-orange w-full py-4 px-4 flex items-center justify-between text-left text-sm"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🏃</span>
            <div>
              <p className="leading-tight font-black uppercase">Log Today's Activity</p>
              <p className="text-[11px] font-bold opacity-90 leading-tight">Workouts, steps & weight</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => navigate('/nutrition')}
            className="btn-panda-white py-3 px-3.5 flex items-center justify-between text-left text-xs"
          >
            <div>
              <p className="font-black">LOG MEALS</p>
              <p className="text-[10px] font-bold opacity-75">Calories & macros</p>
            </div>
            <span className="text-lg">🥗</span>
          </button>

          <button
            onClick={handleQuickWater}
            className={`py-3 px-3.5 flex items-center justify-between text-left text-xs rounded-[18px] font-extrabold transition-all border-b-4 ${
              waterBonusAdded
                ? 'bg-pandaBlue-500 border-b-pandaBlue-600 text-white'
                : 'btn-panda-white'
            }`}
          >
            <div>
              <p className="font-black">{waterBonusAdded ? 'HYDRATED! 💧' : 'DRINK WATER'}</p>
              <p className="text-[10px] font-bold opacity-80">+250ml glass</p>
            </div>
            <Droplets className={`w-4 h-4 ${waterBonusAdded ? 'text-white animate-bounce' : 'text-pandaBlue-500'}`} />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={updateSettings}
        onLoadSampleData={loadSampleData}
        onClearAllData={clearAllData}
      />

      {/* Health & Step Tracking Sync Modal */}
      <HealthSyncModal
        isOpen={isHealthSyncOpen}
        onClose={() => setIsHealthSyncOpen(false)}
        settings={settings}
        updateSettings={updateSettings}
        currentSteps={todayLog.steps || 0}
        selectedDateStr={selectedDateStr}
        updateDailyLog={updateDailyLog}
        onSuccessToast={(msg) => {
          setSyncToast(msg);
          setTimeout(() => setSyncToast(''), 3500);
        }}
      />
    </div>
  );
}
