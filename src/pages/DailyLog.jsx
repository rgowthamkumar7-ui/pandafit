import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun,
  Dumbbell,
  Footprints,
  Scale,
  Check,
  Clock,
  Save,
  CheckCircle2,
  Activity,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { DaySelector } from '../components/DaySelector';
import { PandaMascot } from '../components/PandaMascot';
import { HealthSyncModal } from '../components/HealthSyncModal';
import {
  WORKOUT_TYPES,
  estimateWorkoutCalories,
  calculateStepCalories,
  calculateWeightTrend,
  formatTime12h
} from '../utils/calculations';

export function DailyLog({ storage, todayHelper }) {
  const { dailyLogs, updateDailyLog, settings, updateSettings } = storage;
  const [isHealthSyncOpen, setIsHealthSyncOpen] = useState(false);
  const {
    selectedDateStr,
    formattedDate,
    isToday,
    goToPrevDay,
    goToNextDay,
    goToToday,
    setDateStr,
  } = todayHelper;

  const dayLog = useMemo(() => {
    return dailyLogs[selectedDateStr] || {
      wakeUpTime: '',
      workoutDone: false,
      workoutType: 'weights',
      workoutDuration: 30,
      workoutCaloriesBurned: 200,
      steps: 0,
      weight: '',
      notes: '',
    };
  }, [dailyLogs, selectedDateStr]);

  const [wakeUpTime, setWakeUpTime] = useState(dayLog.wakeUpTime || '');
  const [workoutDone, setWorkoutDone] = useState(Boolean(dayLog.workoutDone));
  const [workoutType, setWorkoutType] = useState(dayLog.workoutType || 'weights');
  const [workoutDuration, setWorkoutDuration] = useState(dayLog.workoutDuration || 30);
  const [workoutCalories, setWorkoutCalories] = useState(dayLog.workoutCaloriesBurned || 200);
  const [steps, setSteps] = useState(dayLog.steps || 0);
  const [weight, setWeight] = useState(dayLog.weight || '');
  const [notes, setNotes] = useState(dayLog.notes || '');
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  useEffect(() => {
    setWakeUpTime(dayLog.wakeUpTime || '');
    setWorkoutDone(Boolean(dayLog.workoutDone));
    setWorkoutType(dayLog.workoutType || 'weights');
    setWorkoutDuration(dayLog.workoutDuration || 30);
    setWorkoutCalories(dayLog.workoutCaloriesBurned || (dayLog.workoutDone ? 200 : 0));
    setSteps(dayLog.steps || 0);
    setWeight(dayLog.weight || '');
    setNotes(dayLog.notes || '');
  }, [dayLog]);

  const previousDates = Object.keys(dailyLogs)
    .filter(d => d < selectedDateStr)
    .sort()
    .reverse();
  const prevDate = previousDates[0];
  const prevWeight = prevDate ? dailyLogs[prevDate]?.weight : null;
  const weightTrend = calculateWeightTrend(weight, prevWeight, settings.weightUnit);

  const stepCalories = calculateStepCalories(steps);
  const totalBurned = (workoutDone ? Number(workoutCalories) || 0 : 0) + stepCalories;
  const stepPercentage = Math.min(100, Math.round(((Number(steps) || 0) / (settings.stepsGoal || 8000)) * 100));

  const handleDurationChange = (minutes) => {
    const mins = Math.max(0, Number(minutes) || 0);
    setWorkoutDuration(mins);
    setWorkoutCalories(estimateWorkoutCalories(workoutType, mins));
  };

  const handleWorkoutTypeChange = (typeId) => {
    setWorkoutType(typeId);
    setWorkoutCalories(estimateWorkoutCalories(typeId, workoutDuration));
  };

  const handleQuickWakeUp = (timeVal) => {
    setWakeUpTime(timeVal);
    saveUpdates({ wakeUpTime: timeVal });
  };

  const handleSetCurrentTime = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setWakeUpTime(timeStr);
    saveUpdates({ wakeUpTime: timeStr });
  };

  const handleAddSteps = (amount) => {
    const nextSteps = Math.max(0, (Number(steps) || 0) + amount);
    setSteps(nextSteps);
    saveUpdates({ steps: nextSteps });
  };

  const saveUpdates = (customFields = {}) => {
    const payload = {
      wakeUpTime,
      workoutDone,
      workoutType,
      workoutDuration: Number(workoutDuration) || 0,
      workoutCaloriesBurned: workoutDone ? Number(workoutCalories) || 0 : 0,
      steps: Number(steps) || 0,
      weight: weight !== '' ? Number(weight) : '',
      notes,
      ...customFields,
    };
    updateDailyLog(selectedDateStr, payload);
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 2000);
  };

  const handleSaveAll = (e) => {
    e?.preventDefault();
    saveUpdates();
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto">
      {/* Day Selector */}
      <DaySelector
        selectedDateStr={selectedDateStr}
        formattedDate={formattedDate}
        isToday={isToday}
        onPrev={goToPrevDay}
        onNext={goToNextDay}
        onToday={goToToday}
        onDateChange={setDateStr}
      />

      {/* ── CLEAN HARMONIZED MASCOT BANNER (NO BROKEN LAYOUT) ── */}
      <div className="panda-hero-box p-4 mb-4 flex items-center justify-between gap-4">
        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center">
          <img
            src={workoutDone ? '/mascot/panda-celebrating.png' : '/mascot/panda-running.png'}
            alt="Panda Mascot"
            className="w-24 h-24 object-contain filter drop-shadow-sm"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-ink-900 leading-snug">
            {workoutDone
              ? 'Awesome! Workout conquered! 🏆'
              : 'Every step builds your fitness streak! 🔥'}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 bg-white/80 border border-pandaOrange-200 px-2.5 py-1 rounded-xl w-fit">
            <span className="text-[11px] font-bold text-ink-600">Active burn:</span>
            <span className="text-[11px] font-black text-pandaOrange-600">{totalBurned} kcal 🔥</span>
          </div>
        </div>
      </div>

      {saveSuccessToast && (
        <div className="p-3 bg-pandaOrange-100 border-2 border-pandaOrange-500 text-pandaOrange-800 font-black rounded-2xl mb-4 flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-pandaOrange-600 flex-shrink-0" />
          Daily Log saved successfully! 🌟
        </div>
      )}

      {/* ── SECTION 1: WAKE UP TIME ── */}
      <div className="panda-card p-4 mb-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pandaOrange-100 flex items-center justify-center font-bold">
              <Sun className="w-4 h-4 text-pandaOrange-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-ink-900">Wake Up Time</h2>
              <p className="text-[11px] text-ink-500 font-bold">Morning rhythm tracker</p>
            </div>
          </div>
          {wakeUpTime && (
            <span className="text-xs font-black text-pandaOrange-700 bg-pandaOrange-100 px-2.5 py-0.5 rounded-full border border-pandaOrange-200">
              {formatTime12h(wakeUpTime)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <input
            type="time"
            value={wakeUpTime}
            onChange={(e) => setWakeUpTime(e.target.value)}
            className="panda-input flex-1"
          />
          <button
            type="button"
            onClick={handleSetCurrentTime}
            className="btn-panda-white px-3 py-2 text-xs flex items-center gap-1 font-black"
          >
            <Clock className="w-3.5 h-3.5 text-pandaOrange-600" /> Now
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-black text-ink-400 mr-1 uppercase">Quick:</span>
          {['06:00', '06:30', '07:00', '07:30', '08:00'].map((timePreset) => (
            <button
              key={timePreset}
              type="button"
              onClick={() => handleQuickWakeUp(timePreset)}
              className={`text-xs px-2.5 py-1 rounded-xl font-black transition-all ${wakeUpTime === timePreset
                  ? 'btn-panda-orange !py-1'
                  : 'btn-panda-white !py-1'
                }`}
            >
              {timePreset}
            </button>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: WORKOUT SESSION ── */}
      <div className="panda-card p-4 mb-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pandaOrange-100 flex items-center justify-center font-bold">
              <Dumbbell className="w-4 h-4 text-pandaOrange-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-ink-900">Workout Session</h2>
              <p className="text-[11px] text-ink-500 font-bold">Training & active movement</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const nextVal = !workoutDone;
              setWorkoutDone(nextVal);
              if (nextVal && !workoutCalories) {
                setWorkoutCalories(estimateWorkoutCalories(workoutType, workoutDuration));
              }
            }}
            className={`px-3 py-1.5 rounded-2xl font-black text-xs flex items-center gap-1.5 transition-all ${workoutDone
                ? 'btn-panda-green !py-1.5'
                : 'btn-panda-white !py-1.5'
              }`}
          >
            {workoutDone ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Done! 💪
              </>
            ) : (
              'Not Yet ⏳'
            )}
          </button>
        </div>

        {workoutDone && (
          <div className="space-y-3 pt-3 border-t-2 border-ink-100 animate-pop-in">
            <div>
              <label className="block text-xs font-black text-ink-700 mb-1.5 uppercase">
                Activity Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {WORKOUT_TYPES.slice(0, 8).map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleWorkoutTypeChange(type.id)}
                    className={`p-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all ${workoutType === type.id
                        ? 'btn-panda-orange !border-b-2 !py-2'
                        : 'btn-panda-white !py-2'
                      }`}
                  >
                    <span className="text-base">{type.emoji}</span>
                    <span className="truncate">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-black text-ink-600 mb-1">
                  ⏱️ Duration (min)
                </label>
                <input
                  type="number"
                  value={workoutDuration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="panda-input font-black"
                  min="0"
                  step="5"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-ink-600 mb-1">
                  🔥 Burned (kcal)
                </label>
                <input
                  type="number"
                  value={workoutCalories}
                  onChange={(e) => setWorkoutCalories(e.target.value)}
                  className="panda-input font-black text-pandaOrange-600"
                  min="0"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 3: STEPS TRACKER ── */}
      <div className="panda-card p-4 mb-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pandaOrange-100 flex items-center justify-center font-bold">
              <Footprints className="w-4 h-4 text-pandaOrange-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-ink-900">Daily Steps</h2>
              <p className="text-[11px] text-ink-500 font-bold">~{stepCalories} kcal active burn</p>
            </div>
          </div>
          <span className="text-xs font-black text-pandaOrange-700 bg-pandaOrange-100 px-2.5 py-0.5 rounded-full border border-pandaOrange-200">
            Goal: {settings.stepsGoal?.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            value={steps}
            onChange={(e) => setSteps(Math.max(0, Number(e.target.value) || 0))}
            className="panda-input text-lg font-black"
            placeholder="e.g. 8000"
            min="0"
            step="100"
          />
          <span className="text-xs font-black text-ink-400">steps</span>
        </div>

        <div className="w-full bg-ink-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-ink-200 mb-3">
          <div
            className="bg-pandaOrange-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${stepPercentage}%` }}
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-black text-ink-400 mr-1 uppercase">Quick Add:</span>
          {[
            { label: '+1,000', amount: 1000 },
            { label: '+2,500', amount: 2500 },
            { label: '+5,000', amount: 5000 },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleAddSteps(item.amount)}
              className="btn-panda-white text-xs px-2.5 py-1"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSteps(0)}
            className="text-xs px-2 py-1 text-ink-400 hover:text-red-600 font-bold ml-auto"
          >
            Reset
          </button>
        </div>

        {/* Auto-Sync with Apple / Google Fit */}
        <div className="mt-3 pt-2.5 border-t border-ink-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-ink-500">
            <Activity className="w-3.5 h-3.5 text-pandaOrange-500" />
            <span>
              {settings.healthSyncSource === 'google-fit'
                ? '🟢 Google Fit Connected'
                : settings.healthSyncSource === 'apple-health'
                  ? '🍎 Apple Health Connected'
                  : 'Connect Fit / Health'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsHealthSyncOpen(true)}
            className="btn-panda-white !py-1 !px-2.5 text-[10px] font-black flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3 text-pandaOrange-500" />
            <span>Auto-Sync</span>
          </button>
        </div>
      </div>

      {/* ── SECTION 4: WEIGHT TRACKER ── */}
      <div className="panda-card p-4 mb-5 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pandaOrange-100 flex items-center justify-center font-bold">
              <Scale className="w-4 h-4 text-pandaOrange-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-ink-900">Weight Record</h2>
              <p className="text-[11px] text-ink-500 font-bold">Track your trend over time</p>
            </div>
          </div>
          <span className="text-xs font-black text-ink-600 bg-ink-100 px-2.5 py-0.5 rounded-full border border-ink-200">
            Unit: {settings.weightUnit}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="panda-input text-lg font-black"
            placeholder={`e.g. 72.5 (${settings.weightUnit})`}
          />
          <span className="text-xs font-black text-ink-400">{settings.weightUnit}</span>
        </div>

        {weightTrend && (
          <div className="p-2.5 bg-bamboo-50 rounded-xl flex items-center justify-between text-xs border border-bamboo-200">
            <span className="font-black text-bamboo-700">{weightTrend.text}</span>
            <span className="text-[11px] text-ink-500 font-bold">vs {prevDate || 'prev'}</span>
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSaveAll}
        className="btn-panda-orange w-full py-4 text-sm uppercase tracking-wide flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" /> Save Today's Log
      </button>

      {/* Reset / Clear Day Button */}
      {dayLog && (dayLog.workoutDone || dayLog.steps > 0 || dayLog.weight || dayLog.wakeUpTime) && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Clear all logged values for ${formattedDate}?`)) {
                if (storage.resetDayLog) {
                  storage.resetDayLog(selectedDateStr);
                }
                setSteps(0);
                setWeight('');
                setWorkoutCalories(0);
                setWorkoutDuration(30);
                setNotes('');
                setSaveSuccessToast(true);
                setTimeout(() => setSaveSuccessToast(false), 2500);
              }
            }}
            className="text-[11px] font-bold text-ink-400 hover:text-red-600 transition-colors inline-flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear entries for {formattedDate}</span>
          </button>
        </div>
      )}

      {/* Health Sync Modal */}
      <HealthSyncModal
        isOpen={isHealthSyncOpen}
        onClose={() => setIsHealthSyncOpen(false)}
        settings={settings}
        updateSettings={updateSettings}
        currentSteps={Number(steps) || 0}
        selectedDateStr={selectedDateStr}
        updateDailyLog={updateDailyLog}
        onSuccessToast={(msg) => {
          setSaveSuccessToast(true);
          setTimeout(() => setSaveSuccessToast(false), 3000);
        }}
      />
    </div>
  );
}
