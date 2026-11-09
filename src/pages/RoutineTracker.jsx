import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Flame,
  Sparkles,
  Trophy,
  X
} from 'lucide-react';
import { DaySelector } from '../components/DaySelector';
import { TaskItem } from '../components/TaskItem';
import { PandaMascot } from '../components/PandaMascot';
import { calculateTaskStreak } from '../utils/calculations';

const SUGGESTED_HABITS = [
  { name: 'Drink 2L Water', emoji: '💧', time: 'All day' },
  { name: 'Morning Sun & Stretch', emoji: '🧘', time: '07:00 AM' },
  { name: '10,000 Steps', emoji: '🚶', time: 'Evening' },
  { name: 'Take Vitamins', emoji: '💊', time: '08:00 AM' },
  { name: 'Read 20 Mins', emoji: '📖', time: '09:00 PM' },
  { name: 'No Screens Before Bed', emoji: '📵', time: '10:30 PM' },
  { name: 'Cold Shower', emoji: '🚿', time: 'Morning' },
  { name: 'Meditate 10 Mins', emoji: '🌸', time: 'Anytime' },
];

const EMOJI_OPTIONS = ['💧', '🧘', '🚶', '💊', '📖', '🥗', '🏋️', '😴', '☀️', '🚿', '📵', '🍵', '🍎', '⭐'];

export function RoutineTracker({ storage, todayHelper }) {
  const {
    dailyLogs,
    routineTasks,
    addRoutineTask,
    deleteRoutineTask,
    toggleRoutineCheck,
  } = storage;

  const {
    selectedDateStr,
    formattedDate,
    isToday,
    goToPrevDay,
    goToNextDay,
    goToToday,
    setDateStr,
  } = todayHelper;

  const currentDayLog = dailyLogs[selectedDateStr] || {};
  const currentChecks = currentDayLog.routineChecks || {};

  const [showAddForm, setShowAddForm] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskEmoji, setTaskEmoji] = useState('⭐');
  const [taskTime, setTaskTime] = useState('');

  const totalTasks = routineTasks.length;
  const completedCount = routineTasks.filter(t => currentChecks[t.id]).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Mascot dynamic state based on routine completion
  const { mascotPose, mascotMessage } = useMemo(() => {
    if (totalTasks === 0) {
      return {
        mascotPose: 'workout',
        mascotMessage: "Ready to embark on your daily fitness quest? 🐾",
      };
    }
    if (completionPercentage === 100) {
      return {
        mascotPose: 'celebrating',
        mascotMessage: "LEGENDARY SCORE! All quests completed! Panda happy dance! 🏆🎉",
      };
    }
    if (completionPercentage >= 60) {
      return {
        mascotPose: 'running',
        mascotMessage: `Over halfway there (${completionPercentage}%)! You're on fire today! ⚡`,
      };
    }
    if (completionPercentage > 0) {
      return {
        mascotPose: 'workout',
        mascotMessage: `Great momentum! ${completedCount} of ${totalTasks} quests checked! 💪`,
      };
    }
    return {
      mascotPose: 'workout',
      mascotMessage: "Every quest completed earns you strength! Check your first one! ⭐",
    };
  }, [totalTasks, completionPercentage, completedCount]);

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    addRoutineTask({
      name: taskName.trim(),
      emoji: taskEmoji,
      time: taskTime.trim(),
    });

    setTaskName('');
    setTaskEmoji('⭐');
    setTaskTime('');
    setShowAddForm(false);
  };

  const handleAddSuggested = (suggested) => {
    const exists = routineTasks.some(t => t.name.toLowerCase() === suggested.name.toLowerCase());
    if (exists) {
      alert(`"${suggested.name}" is already in your routine quests! 🌟`);
      return;
    }
    addRoutineTask(suggested);
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto">
      {/* Date Navigation */}
      <DaySelector
        selectedDateStr={selectedDateStr}
        formattedDate={formattedDate}
        isToday={isToday}
        onPrev={goToPrevDay}
        onNext={goToNextDay}
        onToday={goToToday}
        onDateChange={setDateStr}
      />

      {/* Duolingo Quest Header with Seamless Mascot */}
      <div className="panda-hero-box p-5 mb-4 flex flex-col items-center">
        <PandaMascot
          mood={mascotPose}
          message={mascotMessage}
          subMessage={`${completedCount} of ${totalTasks} daily quests completed (${completionPercentage}%)`}
          size="medium"
          showSpeechBubble={true}
          interactive={true}
        />

        {/* 3D Progress Bar */}
        <div className="w-full bg-ink-100 h-4 rounded-full overflow-hidden mt-3 p-0.5 border border-ink-200">
          <div
            className="bg-bamboo-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Suggested Habits (Quests) */}
      <div className="mb-4">
        <span className="text-xs font-black text-duoGray-600 uppercase tracking-wider flex items-center gap-1 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-duoYellow fill-duoYellow" /> Suggested Quests (Tap to Add)
        </span>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SUGGESTED_HABITS.map((habit) => (
            <button
              key={habit.name}
              type="button"
              onClick={() => handleAddSuggested(habit)}
              className="btn-duo-white flex-shrink-0 px-3 py-2 text-xs flex items-center gap-1.5"
            >
              <span>{habit.emoji}</span>
              <span>{habit.name}</span>
              <Plus className="w-3 h-3 text-duo-green" />
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Quest Button / Modal Form */}
      <div className="mb-4">
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="w-full py-3.5 bg-white hover:bg-duoGray-50 border-2 border-dashed border-duoGray-200 rounded-2xl font-black text-duoGray-500 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4 text-duo-green" /> Create Custom Quest Task
          </button>
        ) : (
          <form
            onSubmit={handleCreateTask}
            className="duo-card p-4 space-y-3 animate-pop-in bg-white"
          >
            <div className="flex items-center justify-between pb-2 border-b-2 border-duoGray-100">
              <h3 className="text-sm font-black text-duoGray-600">New Habit Quest 🎯</h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="w-7 h-7 rounded-full bg-duoGray-100 flex items-center justify-center text-duoGray-400 hover:text-duoGray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-black text-duoGray-500 mb-1">
                Quest / Habit Name
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g. Read 15 mins, Drink 2L water, Stretch..."
                className="duo-input"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-duoGray-500 mb-1">
                Choose Emoji
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setTaskEmoji(em)}
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center text-base border-2 transition-all ${
                      taskEmoji === em
                        ? 'border-duo-green bg-duo-greenPale scale-110 shadow-sm'
                        : 'border-duoGray-100 bg-white hover:bg-duoGray-50'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-duoGray-500 mb-1">
                Scheduled Time / Frequency (optional)
              </label>
              <input
                type="text"
                value={taskTime}
                onChange={(e) => setTaskTime(e.target.value)}
                placeholder="e.g. Morning, 07:30 AM, Before bed..."
                className="duo-input"
              />
            </div>

            <button
              type="submit"
              className="btn-panda-orange w-full py-3.5 text-xs uppercase tracking-wide"
            >
              <Plus className="w-4 h-4 stroke-[3] inline mr-1" /> Add to Quests
            </button>
          </form>
        )}
      </div>

      {/* Routine Task List */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-black text-duoGray-500 uppercase tracking-wider flex items-center justify-between">
          <span>Daily Quests ({routineTasks.length})</span>
          <span className="text-duo-green font-black">
            {completedCount}/{totalTasks} Accomplished
          </span>
        </h3>

        {routineTasks.length === 0 ? (
          <div className="duo-card p-6 text-center bg-duoGray-50">
            <span className="text-3xl block mb-2">⭐</span>
            <p className="text-xs font-black text-duoGray-600">No habit quests created yet</p>
            <p className="text-[11px] text-duoGray-400 font-bold mt-0.5">
              Add your habits above or click any of the suggested chips!
            </p>
          </div>
        ) : (
          routineTasks.map((task) => {
            const isChecked = Boolean(currentChecks[task.id]);
            const streak = calculateTaskStreak(task.id, dailyLogs, selectedDateStr);

            return (
              <TaskItem
                key={task.id}
                task={task}
                isChecked={isChecked}
                streak={streak}
                onToggle={(id) => toggleRoutineCheck(selectedDateStr, id)}
                onDelete={deleteRoutineTask}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
