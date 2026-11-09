import React, { useState, useMemo, useEffect } from 'react';
import {
  Dumbbell,
  Check,
  Search,
  Flame,
  Clock,
  Scale,
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Activity,
  Info
} from 'lucide-react';
import {
  SPORTS_ACTIVITIES,
  ACTIVITY_CATEGORIES,
  calculateHourlyBurnRate,
  calculateTotalActivityBurn,
  normalizeToKg
} from '../../data/sportsActivities';

export function SportsActivityTracker({
  dayLog = {},
  selectedDateStr,
  settings = {},
  currentWeight = null,
  prevWeight = null,
  onSaveWorkout,
}) {
  // Determine user's effective weight for today in kg
  const effectiveWeightKg = useMemo(() => {
    if (currentWeight && Number(currentWeight) > 0) {
      return normalizeToKg(currentWeight, settings.weightUnit);
    }
    if (prevWeight && Number(prevWeight) > 0) {
      return normalizeToKg(prevWeight, settings.weightUnit);
    }
    if (settings.startingWeight && Number(settings.startingWeight) > 0) {
      return normalizeToKg(settings.startingWeight, settings.weightUnit);
    }
    return 70; // Standard adult default
  }, [currentWeight, prevWeight, settings.startingWeight, settings.weightUnit]);

  // Existing day workout states
  const [workoutDone, setWorkoutDone] = useState(Boolean(dayLog.workoutDone));
  const [selectedActivityId, setSelectedActivityId] = useState(dayLog.workoutType || 'badminton');
  const [duration, setDuration] = useState(dayLog.workoutDuration || 45);
  const [caloriesBurned, setCaloriesBurned] = useState(dayLog.workoutCaloriesBurned || 0);
  const [manualCalorieOverride, setManualCalorieOverride] = useState(false);

  // Multi-session list if saved in dayLog
  const [activityList, setActivityList] = useState(dayLog.activities || []);

  // UI state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Sync with dayLog changes when date changes
  useEffect(() => {
    setWorkoutDone(Boolean(dayLog.workoutDone));
    setSelectedActivityId(dayLog.workoutType || 'badminton');
    setDuration(dayLog.workoutDuration || 45);
    setCaloriesBurned(dayLog.workoutCaloriesBurned || 0);
    setActivityList(dayLog.activities || []);
    setManualCalorieOverride(false);
  }, [dayLog, selectedDateStr]);

  // Selected activity object
  const activeActivity = useMemo(() => {
    return SPORTS_ACTIVITIES.find(a => a.id === selectedActivityId) || SPORTS_ACTIVITIES[0];
  }, [selectedActivityId]);

  // Calculated hourly burn rate for current activity and weight
  const hourlyBurnRate = useMemo(() => {
    return calculateHourlyBurnRate(activeActivity.met, effectiveWeightKg);
  }, [activeActivity, effectiveWeightKg]);

  // Calculate estimated calories when duration, weight, or activity changes
  useEffect(() => {
    if (!manualCalorieOverride) {
      const estimated = calculateTotalActivityBurn(activeActivity.met, effectiveWeightKg, duration);
      setCaloriesBurned(estimated);
    }
  }, [duration, activeActivity, effectiveWeightKg, manualCalorieOverride]);

  // Filtered activities list
  const filteredActivities = useMemo(() => {
    return SPORTS_ACTIVITIES.filter(act => {
      const matchesCategory = selectedCategory === 'all' || act.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() ||
        act.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Handle switching activity
  const handleSelectActivity = (act) => {
    setSelectedActivityId(act.id);
    setManualCalorieOverride(false);
    const newCal = calculateTotalActivityBurn(act.met, effectiveWeightKg, duration);
    setCaloriesBurned(newCal);
    setIsSelectorOpen(false);

    // Save update
    if (onSaveWorkout) {
      onSaveWorkout({
        workoutDone: true,
        workoutType: act.id,
        workoutDuration: duration,
        workoutCaloriesBurned: newCal,
        activities: activityList.length > 0 ? activityList : [{
          id: act.id,
          label: act.label,
          emoji: act.emoji,
          duration,
          calories: newCal,
          hourlyBurn: calculateHourlyBurnRate(act.met, effectiveWeightKg)
        }]
      });
    }
  };

  // Handle duration change
  const handleDurationChange = (newMins) => {
    const mins = Math.max(1, Number(newMins) || 0);
    setDuration(mins);
    setManualCalorieOverride(false);
    const newCal = calculateTotalActivityBurn(activeActivity.met, effectiveWeightKg, mins);
    setCaloriesBurned(newCal);

    if (onSaveWorkout && workoutDone) {
      onSaveWorkout({
        workoutDone: true,
        workoutType: selectedActivityId,
        workoutDuration: mins,
        workoutCaloriesBurned: newCal,
      });
    }
  };

  // Handle manual calorie change
  const handleCaloriesChange = (newCals) => {
    const cals = Math.max(0, Number(newCals) || 0);
    setCaloriesBurned(cals);
    setManualCalorieOverride(true);

    if (onSaveWorkout && workoutDone) {
      onSaveWorkout({
        workoutDone: true,
        workoutType: selectedActivityId,
        workoutDuration: duration,
        workoutCaloriesBurned: cals,
      });
    }
  };

  // Toggle workout status
  const handleToggleDone = () => {
    const nextVal = !workoutDone;
    setWorkoutDone(nextVal);
    const calcCals = nextVal && (!caloriesBurned || caloriesBurned === 0)
      ? calculateTotalActivityBurn(activeActivity.met, effectiveWeightKg, duration)
      : caloriesBurned;

    if (nextVal) {
      setCaloriesBurned(calcCals);
    }

    if (onSaveWorkout) {
      onSaveWorkout({
        workoutDone: nextVal,
        workoutType: selectedActivityId,
        workoutDuration: nextVal ? duration : 0,
        workoutCaloriesBurned: nextVal ? calcCals : 0,
      });
    }
  };

  // Add multiple activity sessions
  const handleAddSessionToList = () => {
    const newSession = {
      sessionId: Date.now().toString(),
      id: activeActivity.id,
      label: activeActivity.label,
      emoji: activeActivity.emoji,
      duration,
      calories: caloriesBurned,
      hourlyBurn: hourlyBurnRate,
      weightKg: effectiveWeightKg,
    };

    const updatedList = [...activityList, newSession];
    const totalDuration = updatedList.reduce((acc, item) => acc + (Number(item.duration) || 0), 0);
    const totalCals = updatedList.reduce((acc, item) => acc + (Number(item.calories) || 0), 0);

    setActivityList(updatedList);
    setWorkoutDone(true);
    setDuration(totalDuration);
    setCaloriesBurned(totalCals);

    if (onSaveWorkout) {
      onSaveWorkout({
        workoutDone: true,
        workoutType: activeActivity.id,
        workoutDuration: totalDuration,
        workoutCaloriesBurned: totalCals,
        activities: updatedList,
      });
    }
  };

  // Remove a session
  const handleRemoveSession = (sessionId) => {
    const updatedList = activityList.filter(s => s.sessionId !== sessionId);
    const totalDuration = updatedList.reduce((acc, item) => acc + (Number(item.duration) || 0), 0);
    const totalCals = updatedList.reduce((acc, item) => acc + (Number(item.calories) || 0), 0);

    setActivityList(updatedList);
    if (updatedList.length === 0) {
      setWorkoutDone(false);
      setDuration(45);
      setCaloriesBurned(0);
      if (onSaveWorkout) {
        onSaveWorkout({
          workoutDone: false,
          workoutDuration: 0,
          workoutCaloriesBurned: 0,
          activities: [],
        });
      }
    } else {
      setDuration(totalDuration);
      setCaloriesBurned(totalCals);
      if (onSaveWorkout) {
        onSaveWorkout({
          workoutDone: true,
          workoutDuration: totalDuration,
          workoutCaloriesBurned: totalCals,
          activities: updatedList,
        });
      }
    }
  };

  return (
    <div className="panda-card p-4 mb-4 bg-white">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pandaOrange-100 flex items-center justify-center font-bold">
            <Dumbbell className="w-4 h-4 text-pandaOrange-600" />
          </div>
          <div>
            <h2 className="text-sm font-black text-ink-900">Activity & Sports</h2>
            <p className="text-[11px] text-ink-500 font-bold">
              Weight-adjusted calorie burn
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleDone}
          className={`px-3 py-1.5 rounded-2xl font-black text-xs flex items-center gap-1.5 transition-all ${
            workoutDone
              ? 'btn-panda-green !py-1.5 shadow-sm'
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

      {/* ── LOGGED SESSIONS LIST (IF MULTIPLE SAVED) ── */}
      {activityList.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-[10px] font-black uppercase text-ink-400 tracking-wider">
            Logged Today ({activityList.length} session{activityList.length > 1 ? 's' : ''}):
          </p>
          {activityList.map((session) => (
            <div
              key={session.sessionId || session.id + session.duration}
              className="p-2.5 bg-ink-50 border border-ink-200 rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{session.emoji}</span>
                <div>
                  <span className="font-black text-ink-900">{session.label}</span>
                  <p className="text-[10px] text-ink-500 font-bold">
                    ⏱️ {session.duration} min • ~{session.hourlyBurn || Math.round(session.calories / (session.duration / 60))} kcal/hr rate
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-black text-pandaOrange-600 bg-pandaOrange-50 px-2 py-0.5 rounded-lg border border-pandaOrange-200 text-[11px]">
                  +{session.calories} kcal
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSession(session.sessionId)}
                  className="p-1 text-ink-400 hover:text-red-600 transition-colors"
                  title="Remove session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ACTIVE WORKOUT / SPORT BUILDER ── */}
      {workoutDone && (
        <div className="space-y-4 pt-2 border-t-2 border-ink-100 animate-pop-in">
          {/* Body Weight Anchor Info */}
          <div className="flex items-center justify-between p-2.5 bg-bamboo-50 rounded-xl border border-bamboo-200 text-xs">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-bamboo-600 flex-shrink-0" />
              <div>
                <span className="font-black text-bamboo-900">
                  Body Weight: {effectiveWeightKg} kg
                </span>
                <p className="text-[10px] text-bamboo-700 font-bold">
                  {currentWeight ? 'Logged today' : prevWeight ? 'From recent log' : 'Default profile weight'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black text-bamboo-700 bg-bamboo-100 px-2 py-0.5 rounded-full">
              Accurate MET Burn
            </span>
          </div>

          {/* Current Activity Selected Card */}
          <div className="p-3 bg-pandaOrange-50/50 rounded-2xl border-2 border-pandaOrange-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{activeActivity.emoji}</span>
                <div>
                  <h3 className="font-black text-ink-900 text-sm flex items-center gap-1.5">
                    {activeActivity.label}
                    <span className="text-[10px] font-black text-pandaOrange-700 bg-pandaOrange-100 px-2 py-0.2 rounded-full border border-pandaOrange-300">
                      MET {activeActivity.met}
                    </span>
                  </h3>
                  <p className="text-[11px] text-ink-500 font-bold">
                    {activeActivity.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                className="btn-panda-white !py-1 !px-2.5 text-xs font-black flex items-center gap-1"
              >
                <span>{isSelectorOpen ? 'Close' : 'Change'}</span>
                {isSelectorOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* ── HOURLY BURN RATE HIGHLIGHT ── */}
            <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-pandaOrange-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-pandaOrange-500 fill-pandaOrange-500" />
                <span className="text-xs font-black text-ink-700">Average Burn Rate:</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-pandaOrange-600">
                  ~{hourlyBurnRate} kcal
                </span>
                <span className="text-[10px] font-bold text-ink-400"> / hour</span>
              </div>
            </div>
          </div>

          {/* ── EXPANDABLE ACTIVITIES & SPORTS PICKER ── */}
          {isSelectorOpen && (
            <div className="p-3 bg-ink-50 rounded-2xl border-2 border-ink-200 space-y-3 animate-pop-in">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {ACTIVITY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'btn-panda-orange !py-1'
                        : 'btn-panda-white !py-1'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Activity Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-ink-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search badminton, cricket, football, gym, running..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="panda-input !pl-9 !py-1.5 text-xs w-full"
                />
              </div>

              {/* Activities Grid */}
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {filteredActivities.map((act) => {
                  const actHourly = calculateHourlyBurnRate(act.met, effectiveWeightKg);
                  const isSelected = selectedActivityId === act.id;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => handleSelectActivity(act)}
                      className={`p-2 rounded-xl text-left transition-all border-2 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-pandaOrange-50 border-pandaOrange-500 shadow-sm'
                          : 'bg-white border-ink-200 hover:border-pandaOrange-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xl">{act.emoji}</span>
                        <span className="text-xs font-black text-ink-900 truncate">
                          {act.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-ink-400">MET {act.met}</span>
                        <span className="text-pandaOrange-600 font-black">~{actHourly} kcal/h</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── DURATION & TOTAL BURN CONTROLS ── */}
          <div className="space-y-3">
            {/* Duration Input & Quick Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black text-ink-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-pandaOrange-600" />
                  <span>How long did you play / workout?</span>
                </label>
                <span className="text-xs font-black text-pandaOrange-600 bg-pandaOrange-50 px-2 py-0.5 rounded-lg border border-pandaOrange-200">
                  {duration} minutes ({Number((duration / 60).toFixed(1))} hrs)
                </span>
              </div>

              {/* Stepper & Input */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => handleDurationChange(Math.max(5, duration - 5))}
                  className="btn-panda-white px-3 py-2 text-sm font-black"
                >
                  -5m
                </button>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="panda-input text-center font-black text-base flex-1"
                  min="1"
                  step="5"
                />
                <button
                  type="button"
                  onClick={() => handleDurationChange(duration + 5)}
                  className="btn-panda-white px-3 py-2 text-sm font-black"
                >
                  +5m
                </button>
              </div>

              {/* Quick Duration Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black text-ink-400 uppercase">Presets:</span>
                {[15, 30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleDurationChange(mins)}
                    className={`text-xs px-2.5 py-0.5 rounded-xl font-black transition-all ${
                      duration === mins
                        ? 'btn-panda-orange !py-0.5'
                        : 'btn-panda-white !py-0.5'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Total Burned Calorie Output */}
            <div className="p-3 bg-pandaOrange-50 rounded-2xl border-2 border-pandaOrange-300">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-pandaOrange-900 flex items-center gap-1">
                  <Flame className="w-4 h-4 text-pandaOrange-600 fill-pandaOrange-600" />
                  <span>Total Calories Burned:</span>
                </span>
                <span className="text-[10px] font-bold text-pandaOrange-700">
                  {manualCalorieOverride ? '✏️ Custom Value' : '⚡ MET Calculated'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={caloriesBurned}
                  onChange={(e) => handleCaloriesChange(e.target.value)}
                  className="panda-input font-black text-xl text-pandaOrange-600 flex-1"
                  min="0"
                />
                <span className="text-sm font-black text-ink-500">kcal</span>
              </div>

              <p className="text-[10px] text-pandaOrange-700 font-bold mt-1.5 flex items-center gap-1">
                <Info className="w-3 h-3 flex-shrink-0" />
                <span>Formula: ({hourlyBurnRate} kcal/hr) × ({duration}/60 hrs) = ~{calculateTotalActivityBurn(activeActivity.met, effectiveWeightKg, duration)} kcal</span>
              </p>
            </div>

            {/* Optional: Add as additional session button */}
            <button
              type="button"
              onClick={handleAddSessionToList}
              className="btn-panda-white w-full py-2 text-xs font-black flex items-center justify-center gap-1.5 border-dashed"
            >
              <Plus className="w-3.5 h-3.5 text-pandaOrange-600" />
              <span>Log as separate session (+ Add another sport)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
