import React, { useState, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import {
  LineChart,
  Calendar,
  Flame,
  Scale,
  Sparkles,
  Dumbbell,
  Clock,
  Trophy,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { PandaMascot } from '../components/PandaMascot';
import { SPORTS_ACTIVITIES } from '../data/sportsActivities';
import { formatTime12h, calculateDayTotals } from '../utils/calculations';

export function History({ storage, todayHelper }) {
  const { dailyLogs, meals, settings, hasDemoData, clearDemoRecords } = storage;
  const [dayRange, setDayRange] = useState(7);

  const rangeDays = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = dayRange - 1; i >= 0; i--) {
      const d = subDays(today, i);
      const dStr = format(d, 'yyyy-MM-dd');
      const dayLog = dailyLogs[dStr] || {};
      const dayMeals = meals[dStr] || [];
      const totals = calculateDayTotals(dayMeals, dayLog, settings.calorieGoal);

      days.push({
        dateObj: d,
        dateStr: dStr,
        dayLabel: format(d, 'EEE'),
        shortDate: format(d, 'M/d'),
        weight: dayLog.weight ? Number(dayLog.weight) : null,
        workoutDone: Boolean(dayLog.workoutDone),
        workoutType: dayLog.workoutType || '',
        workoutCalories: dayLog.workoutCaloriesBurned || 0,
        wakeUpTime: dayLog.wakeUpTime || '',
        consumedCalories: totals.consumedCalories,
        burnedCalories: totals.totalBurned,
        netCalories: totals.netCalories,
      });
    }
    return days;
  }, [dayRange, dailyLogs, meals, settings.calorieGoal]);

  const weightPoints = useMemo(() => {
    return rangeDays.map((d, index) => ({
      index,
      dateLabel: d.shortDate,
      dayLabel: d.dayLabel,
      weight: d.weight,
    }));
  }, [rangeDays]);

  const loggedWeights = weightPoints.filter(p => p.weight !== null);
  const hasWeightData = loggedWeights.length > 0;

  const weightStats = useMemo(() => {
    if (!hasWeightData) return { min: 60, max: 80 };
    const values = loggedWeights.map(p => p.weight);
    const minVal = Math.floor(Math.min(...values) - 1);
    const maxVal = Math.ceil(Math.max(...values) + 1);
    return { min: minVal, max: maxVal === minVal ? minVal + 2 : maxVal };
  }, [loggedWeights, hasWeightData]);

  const chartWidth = 330;
  const chartHeight = 160;
  const padding = { top: 25, bottom: 25, left: 35, right: 20 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const pointsWithCoords = useMemo(() => {
    return weightPoints.map((p, idx) => {
      const x = padding.left + (idx / Math.max(weightPoints.length - 1, 1)) * plotWidth;
      const y = p.weight !== null
        ? padding.top + ((weightStats.max - p.weight) / (weightStats.max - weightStats.min)) * plotHeight
        : null;
      return { ...p, x, y };
    });
  }, [weightPoints, weightStats, plotWidth, plotHeight, padding.left, padding.top]);

  const { linePath, areaPath } = useMemo(() => {
    const valid = pointsWithCoords.filter(p => p.y !== null);
    if (valid.length === 0) return { linePath: '', areaPath: '' };

    const line = valid.reduce((acc, curr, i) => {
      return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    const first = valid[0];
    const last = valid[valid.length - 1];
    const baselineY = padding.top + plotHeight;
    const area = `${line} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;

    return { linePath: line, areaPath: area };
  }, [pointsWithCoords, padding.top, plotHeight]);

  const maxCalorieVal = useMemo(() => {
    const allCals = rangeDays.flatMap(d => [d.consumedCalories, d.burnedCalories, settings.calorieGoal]);
    const max = Math.max(...allCals, 2000);
    return Math.ceil(max / 500) * 500;
  }, [rangeDays, settings.calorieGoal]);

  const barChartHeight = 170;
  const barPlotHeight = barChartHeight - 35;

  const workoutCount = rangeDays.filter(d => d.workoutDone).length;

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-black text-duoGray-700 flex items-center gap-1.5">
            <Trophy className="w-5 h-5 text-duoYellow fill-duoYellow" /> Progress & Badges
          </h1>
          <p className="text-xs text-duoGray-400 font-bold">Review your fitness achievements</p>
        </div>

        {/* 7 or 14 days toggle */}
        <div className="flex bg-ink-100 p-1 rounded-2xl border-2 border-ink-200">
          <button
            onClick={() => setDayRange(7)}
            className={`px-3 py-1 text-xs font-black rounded-xl transition-all ${
              dayRange === 7
                ? 'btn-panda-orange !py-1'
                : 'text-ink-400 hover:text-ink-800'
            }`}
          >
            7d
          </button>
          <button
            onClick={() => setDayRange(14)}
            className={`px-3 py-1 text-xs font-black rounded-xl transition-all ${
              dayRange === 14
                ? 'btn-panda-orange !py-1'
                : 'text-ink-400 hover:text-ink-800'
            }`}
          >
            14d
          </button>
        </div>
      </div>

      {/* Mascot Cheer Banner */}
      <div className="panda-hero-box p-4 mb-4 flex items-center gap-3.5">
        <PandaMascot mood="celebrating" size="small" showSpeechBubble={false} interactive={false} />
        <div className="flex-1">
          <p className="text-xs font-black text-ink-900">
            Look at that streak compounding! 🌟
          </p>
          <p className="text-[11px] text-pandaOrange-500 font-black mt-0.5">
            {workoutCount} workouts crushed in the last {dayRange} days!
          </p>
        </div>
      </div>

      {/* CHART 1: Weight Trend (Duolingo Blue) */}
      <div className="duo-card p-4 mb-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-duoBlue-light border border-duoBlue/30 flex items-center justify-center font-bold">
              <Scale className="w-4 h-4 text-duoBlue" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-duoGray-600">Weight Trend</h2>
              <p className="text-[10px] text-duoGray-400 font-bold">Gentle tracking ({settings.weightUnit})</p>
            </div>
          </div>
          {hasWeightData && (
            <span className="text-xs font-black text-duoBlue bg-duoBlue-light px-2.5 py-0.5 rounded-full border border-duoBlue/30">
              Latest: {loggedWeights[loggedWeights.length - 1].weight} {settings.weightUnit}
            </span>
          )}
        </div>

        {hasWeightData ? (
          <div className="w-full overflow-hidden flex justify-center py-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto max-w-sm select-none"
            >
              <defs>
                <linearGradient id="duoBlueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1CB0F6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1CB0F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[0, 0.5, 1].map((ratio) => {
                const y = padding.top + ratio * plotHeight;
                const val = (weightStats.max - ratio * (weightStats.max - weightStats.min)).toFixed(1);
                return (
                  <g key={ratio}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="#E5E5E5"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 6}
                      y={y + 3}
                      fontSize="9"
                      fill="#AFAFAF"
                      textAnchor="end"
                      fontWeight="700"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {areaPath && <path d={areaPath} fill="url(#duoBlueGrad)" />}

              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#1CB0F6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {pointsWithCoords.map((p) => (
                <g key={p.index}>
                  <text
                    x={p.x}
                    y={chartHeight - 6}
                    fontSize="9"
                    fill="#777777"
                    textAnchor="middle"
                    fontWeight="800"
                  >
                    {p.dayLabel}
                  </text>

                  {p.y !== null && (
                    <g>
                      <circle cx={p.x} cy={p.y} r="5.5" fill="#ffffff" stroke="#1CB0F6" strokeWidth="2.5" />
                      <circle cx={p.x} cy={p.y} r="2.5" fill="#1CB0F6" />
                      <text
                        x={p.x}
                        y={p.y - 8}
                        fontSize="9"
                        fill="#4B4B4B"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {p.weight}
                      </text>
                    </g>
                  )}
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="py-6 text-center bg-duoGray-50 rounded-2xl border border-dashed border-duoGray-200">
            <p className="text-xs font-black text-duoGray-600">No weight recorded for this period yet</p>
            <p className="text-[11px] text-duoGray-400 font-bold mt-1">
              Log your weight on the Activity page!
            </p>
          </div>
        )}
      </div>

      {/* CHART 2: Calorie History (Duolingo Colors) */}
      <div className="duo-card p-4 mb-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-duoOrange-light border border-duoOrange/30 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4 text-duoOrange fill-duoOrange" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-duoGray-600">Calorie Energy Chart</h2>
              <p className="text-[10px] text-duoGray-400 font-bold">Food Consumed vs Burned</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-[10px] font-black">
            <span className="flex items-center gap-1 text-duoBlue">
              <span className="w-2.5 h-2.5 rounded-full bg-duoBlue inline-block" /> Food
            </span>
            <span className="flex items-center gap-1 text-duo-green">
              <span className="w-2.5 h-2.5 rounded-full bg-duo-green inline-block" /> Burn
            </span>
          </div>
        </div>

        <div className="w-full overflow-hidden flex justify-center py-2">
          <svg
            viewBox={`0 0 ${chartWidth} ${barChartHeight}`}
            className="w-full h-auto max-w-sm select-none"
          >
            {/* Goal reference dashed line */}
            {(() => {
              const goalY =
                barPlotHeight - (settings.calorieGoal / maxCalorieVal) * barPlotHeight + 15;
              return (
                <g>
                  <line
                    x1="28"
                    y1={goalY}
                    x2={chartWidth - 10}
                    y2={goalY}
                    stroke="#58CC02"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text x={chartWidth - 8} y={goalY - 3} fontSize="8" fill="#46A302" textAnchor="end" fontWeight="bold">
                    Goal {settings.calorieGoal}
                  </text>
                </g>
              );
            })()}

            {/* Bars for each day */}
            {rangeDays.map((d, idx) => {
              const barGroupWidth = plotWidth / rangeDays.length;
              const groupCenterX = padding.left + idx * barGroupWidth + barGroupWidth / 2;
              const barWidth = Math.min(barGroupWidth * 0.35, 11);

              const consumedH = Math.min((d.consumedCalories / maxCalorieVal) * barPlotHeight, barPlotHeight);
              const burnedH = Math.min((d.burnedCalories / maxCalorieVal) * barPlotHeight, barPlotHeight);

              const consumedY = barPlotHeight - consumedH + 15;
              const burnedY = barPlotHeight - burnedH + 15;

              return (
                <g key={d.dateStr}>
                  {/* Consumed Bar (Blue) */}
                  <rect
                    x={groupCenterX - barWidth - 1}
                    y={consumedY}
                    width={barWidth}
                    height={Math.max(consumedH, 2)}
                    rx="3"
                    fill="#1CB0F6"
                  />

                  {/* Burned Bar (Green) */}
                  <rect
                    x={groupCenterX + 1}
                    y={burnedY}
                    width={barWidth}
                    height={Math.max(burnedH, 2)}
                    rx="3"
                    fill="#58CC02"
                  />

                  {/* Day Label */}
                  <text
                    x={groupCenterX}
                    y={barChartHeight - 6}
                    fontSize="9"
                    fill="#777777"
                    textAnchor="middle"
                    fontWeight="800"
                  >
                    {d.dayLabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Workout Days */}
      <div className="duo-card p-4 mb-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-duo-greenPale border border-duo-greenLight flex items-center justify-center font-bold">
              <Dumbbell className="w-4 h-4 text-duo-green" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-duoGray-600">Workout Days</h2>
              <p className="text-[10px] text-duoGray-400 font-bold">Active training sessions</p>
            </div>
          </div>
          <span className="text-xs font-black text-duo-green bg-duo-greenPale px-2.5 py-0.5 rounded-full border border-duo-greenLight">
            {workoutCount} / {rangeDays.length} days
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {rangeDays.slice(-7).map((d) => (
            <div
              key={d.dateStr}
              className={`p-2 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                d.workoutDone
                  ? 'border-duo-green bg-duo-greenPale text-duo-green font-black shadow-sm'
                  : 'border-duoGray-100 bg-duoGray-50 text-duoGray-300'
              }`}
            >
              <span className="text-[10px] font-black uppercase">{d.dayLabel}</span>
              <span className="text-base my-0.5">
                {d.workoutDone
                  ? (SPORTS_ACTIVITIES.find(a => a.id === d.workoutType)?.emoji || '💪')
                  : '💤'}
              </span>
              <span className="text-[9px] font-bold truncate">
                {d.workoutDone ? `${d.workoutCalories} kcal` : 'Rest'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Wake-Up Rhythm */}
      <div className="duo-card p-4 mb-5 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-duoYellow-light border border-duoYellow/30 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4 text-duoYellow fill-duoYellow" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-duoGray-600">Wake-Up Consistency</h2>
              <p className="text-[10px] text-duoGray-400 font-bold">Morning sleep rhythm</p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          {rangeDays.slice(-7).map((d) => (
            <div
              key={d.dateStr}
              className="flex items-center justify-between p-2 rounded-xl bg-duoGray-50 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-black text-duoGray-700 w-10">{d.dayLabel}</span>
                <span className="text-[11px] text-duoGray-400 font-bold">{d.shortDate}</span>
              </div>

              {d.wakeUpTime ? (
                <span className="font-black text-duo-green bg-duo-greenPale px-2 py-0.5 rounded-full text-[11px] border border-duo-greenLight">
                  ⏰ {formatTime12h(d.wakeUpTime)}
                </span>
              ) : (
                <span className="text-[10px] text-duoGray-300 italic font-bold">Not logged</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Demo Records Cleanup (Only visible if demo records currently exist in storage) */}
      {hasDemoData && (
        <div className="panda-card p-4 text-center space-y-2.5 bg-amber-50 border-2 border-amber-300 animate-pop-in">
          <div className="flex items-center justify-center gap-1.5 text-amber-900 font-black text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>7-Day Demo Records Detected</span>
          </div>
          <p className="text-[11px] text-amber-800 font-bold leading-normal">
            The 7-day demo records are currently saved in your diary. Click below to permanently remove all demo records and restore your real logs.
          </p>
          <button
            onClick={() => {
              clearDemoRecords();
              alert('Cleared all demo records! Your real diary has been restored 🐾');
            }}
            className="btn-panda-orange !py-2 !px-4 text-xs mx-auto inline-flex items-center gap-1.5 shadow-md"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Demo Records & Restore My Data
          </button>
        </div>
      )}
    </div>
  );
}
