import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';

export function DaySelector({
  selectedDateStr,
  formattedDate,
  isToday,
  onPrev,
  onNext,
  onToday,
  onDateChange,
}) {
  return (
    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-2xl border-2 border-ink-200 shadow-sm mb-4">
      {/* Prev Button */}
      <button
        onClick={onPrev}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-ink-400 hover:text-ink-800 hover:bg-ink-100 active:scale-90 transition-all font-black"
        title="Previous day"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Date Title & Picker */}
      <div className="flex flex-col items-center relative">
        <label className="cursor-pointer group flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-pandaOrange-500 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-black text-ink-900 transition-colors">
            {formattedDate}
          </span>
          <input
            type="date"
            value={selectedDateStr}
            onChange={(e) => onDateChange && onDateChange(e.target.value)}
            className="absolute opacity-0 inset-0 cursor-pointer w-full h-full"
          />
        </label>

        {/* Today badge or jump to today button */}
        {isToday ? (
          <span className="text-[10px] font-black text-bamboo-600 bg-bamboo-50 px-2.5 py-0.5 rounded-full mt-0.5 border border-bamboo-200">
            Today
          </span>
        ) : (
          <button
            onClick={onToday}
            className="flex items-center gap-1 text-[10px] font-black text-pandaOrange-500 hover:underline mt-0.5 transition-all"
          >
            <Sparkles className="w-3 h-3 text-pandaOrange-500" /> Jump to Today
          </button>
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-ink-400 hover:text-ink-800 hover:bg-ink-100 active:scale-90 transition-all font-black"
        title="Next day"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
