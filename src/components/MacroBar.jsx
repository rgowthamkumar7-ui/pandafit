import React from 'react';

export function MacroBar({
  label = 'Protein',
  current = 0,
  goal = 140,
  unit = 'g',
  emoji = '🍗',
  color = 'orange', // 'orange' | 'blue' | 'green'
}) {
  const percentage = Math.min(Math.round(((current || 0) / (goal || 1)) * 100), 100);
  const remaining = Math.max(0, goal - current);
  const isGoalReached = current >= goal;

  const colorStyles = {
    orange: { bar: 'bg-pandaOrange-500', badge: 'bg-pandaOrange-100 text-pandaOrange-700' },
    blue: { bar: 'bg-pandaBlue-500', badge: 'bg-pandaBlue-100 text-pandaBlue-600' },
    green: { bar: 'bg-bamboo-600', badge: 'bg-bamboo-100 text-bamboo-700' },
  }[color] || { bar: 'bg-pandaOrange-500', badge: 'bg-pandaOrange-100 text-pandaOrange-700' };

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs font-black text-ink-800">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{emoji}</span>
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-ink-900">{Math.round(current)}</span>
          <span className="text-ink-400">/</span>
          <span className="text-ink-500">{goal}{unit}</span>
          <span className={`text-[10px] ml-1 px-2 py-0.5 rounded-full font-black ${colorStyles.badge}`}>
            {percentage}%
          </span>
        </div>
      </div>

      {/* Chunky 3D capsule */}
      <div className="w-full h-3 rounded-full overflow-hidden bg-ink-100 p-0.5 border border-ink-200">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorStyles.bar}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] text-ink-500 font-extrabold px-0.5">
        <span>{isGoalReached ? '🎉 Goal accomplished!' : `${remaining}${unit} left to reach target`}</span>
        <span>{percentage}%</span>
      </div>
    </div>
  );
}
