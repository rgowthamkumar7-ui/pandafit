import React from 'react';
import { Check, Trash2, Flame } from 'lucide-react';

export function TaskItem({
  task,
  isChecked,
  streak = 0,
  onToggle,
  onDelete,
}) {
  return (
    <div
      className={`group relative flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all duration-150 select-none ${
        isChecked
          ? 'bg-bamboo-50 border-bamboo-200'
          : 'bg-white border-ink-200 hover:border-pandaOrange-300 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0 mr-2">
        {/* Duolingo 3D Chunky Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          className={`w-8 h-8 rounded-2xl flex items-center justify-center transition-all duration-150 ${
            isChecked
              ? 'btn-panda-green !py-0 shadow-sm'
              : 'border-2 border-ink-200 bg-white hover:border-bamboo-600 active:scale-90'
          }`}
          aria-label={isChecked ? `Uncheck ${task.name}` : `Check ${task.name}`}
        >
          {isChecked && <Check className="w-4 h-4 stroke-[3.5] text-white animate-pop-in" />}
        </button>

        {/* Task Details */}
        <div
          onClick={() => onToggle(task.id)}
          className="flex flex-col cursor-pointer flex-1 min-w-0"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{task.emoji || '⭐'}</span>
            <span
              className={`text-sm sm:text-base font-black truncate transition-all duration-150 ${
                isChecked
                  ? 'text-ink-400 line-through decoration-bamboo-600 decoration-2'
                  : 'text-ink-900'
              }`}
            >
              {task.name}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            {task.time && (
              <span className="text-[11px] font-extrabold text-ink-500 bg-ink-100 px-2 py-0.5 rounded-full">
                ⏰ {task.time}
              </span>
            )}

            {/* Streak Counter */}
            {streak > 0 && (
              <span
                className="flex items-center gap-0.5 text-[11px] font-black px-2 py-0.5 rounded-full bg-pandaOrange-100 text-pandaOrange-700 border border-pandaOrange-200"
                title={`${streak} consecutive days completed`}
              >
                <Flame className="w-3 h-3 text-pandaOrange-500 fill-pandaOrange-500" />
                {streak} {streak === 1 ? 'day streak' : 'day streak'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Action Button */}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Remove routine "${task.name}"?`)) {
              onDelete(task.id);
            }
          }}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 text-duoGray-300 hover:text-duoRed rounded-xl transition-all"
          title="Delete quest"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
