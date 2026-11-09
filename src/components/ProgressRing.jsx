import React from 'react';

export function ProgressRing({
  value = 0,
  max = 2000,
  size = 150,
  strokeWidth = 14,
  label = 'Remaining',
  unit = 'kcal',
  subText = '',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((value / (max || 1)) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isOver = value > max;

  return (
    <div className="relative inline-flex items-center justify-center select-none">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="pandaOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="pandaOrangeOver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </linearGradient>
        </defs>

        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isOver ? 'url(#pandaOrangeOver)' : 'url(#pandaOrangeGrad)'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Central Metric Value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
        <span className="text-2xl font-black text-ink-900 tracking-tight leading-none">
          {Math.round(value).toLocaleString()}
        </span>
        <span className="text-[11px] text-ink-500 font-extrabold mt-1">
          {label} {unit && `(${unit})`}
        </span>
        {subText && (
          <span className="text-[10px] text-pandaOrange-600 font-black mt-0.5">
            {subText}
          </span>
        )}
      </div>
    </div>
  );
}
