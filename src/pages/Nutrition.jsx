import React, { useState, useMemo } from 'react';
import {
  Utensils,
  Plus,
  Trash2,
  Flame,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { DaySelector } from '../components/DaySelector';
import { MacroBar } from '../components/MacroBar';
import { IndianFoodExplorer } from '../components/IndianFoodExplorer';
import { OnlineFoodSearchModal } from '../components/OnlineFoodSearchModal';
import { calculateDayTotals } from '../utils/calculations';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, emoji: '🥞' },
  { id: 'lunch', label: 'Lunch', icon: Sun, emoji: '🥗' },
  { id: 'dinner', label: 'Dinner', icon: Moon, emoji: '🍲' },
  { id: 'snack', label: 'Snacks', icon: Cookie, emoji: '☕' },
];

export function Nutrition({ storage, todayHelper }) {
  const {
    dailyLogs,
    meals,
    addMeal,
    deleteMeal,
    settings,
    customFoods = [],
    saveCustomFood,
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

  const dayLog = dailyLogs[selectedDateStr] || {};
  const dayMeals = meals[selectedDateStr] || [];

  const totals = useMemo(() => {
    return calculateDayTotals(dayMeals, dayLog, settings.calorieGoal);
  }, [dayMeals, dayLog, settings.calorieGoal]);

  const [isOnlineSearchOpen, setIsOnlineSearchOpen] = useState(false);
  const [onlineSearchQuery, setOnlineSearchQuery] = useState('');

  const handleOpenOnlineSearch = (query = '') => {
    setOnlineSearchQuery(query);
    setIsOnlineSearchOpen(true);
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto space-y-4">
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

      {/* ── SECTION 1: CALORIE BALANCE CARD ── */}
      <div className="panda-card p-5 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-pandaOrange-500 fill-pandaOrange-500" />
            <h2 className="text-sm font-black text-ink-900">Daily Calorie Target</h2>
          </div>
          <span className="text-xs font-black text-pandaOrange-700 bg-pandaOrange-100 border border-pandaOrange-200 px-2.5 py-0.5 rounded-full">
            Goal: {settings.calorieGoal} kcal
          </span>
        </div>

        {/* Formula Display */}
        <div className="grid grid-cols-3 gap-2 my-2 text-center items-center">
          <div className="bg-ink-50 p-2.5 rounded-2xl border-2 border-ink-200">
            <p className="text-[10px] font-black text-ink-500 uppercase">Consumed</p>
            <p className="text-base font-black text-ink-900">{totals.consumedCalories}</p>
          </div>

          <div className="text-xs font-black text-ink-300 text-center font-bold">−</div>

          <div className="bg-pandaOrange-50 p-2.5 rounded-2xl border-2 border-pandaOrange-200">
            <p className="text-[10px] font-black text-pandaOrange-700 uppercase">Burned</p>
            <p className="text-base font-black text-pandaOrange-600">{totals.totalBurned}</p>
          </div>
        </div>

        <div className="p-3 bg-ink-50 rounded-2xl border border-ink-200 mt-2 flex items-center justify-between">
          <span className="text-xs font-black text-ink-800">Net Balance:</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-ink-900">{totals.netCalories}</span>
            <span className="text-[11px] font-extrabold text-ink-500">
              ({totals.remainingCalories >= 0 ? `${Math.round(totals.remainingCalories)} remaining` : `${Math.abs(Math.round(totals.remainingCalories))} over`})
            </span>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: MACRONUTRIENTS ── */}
      <div className="panda-card p-4 space-y-3.5 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-ink-900 flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-pandaOrange-500" /> Daily Macronutrients
          </h2>
          <span className="text-[11px] font-black text-ink-500">
            {totals.consumedCalories} kcal logged
          </span>
        </div>

        <MacroBar
          label="Protein"
          current={totals.consumedProtein}
          goal={settings.proteinGoal}
          emoji="🍗"
          color="orange"
        />

        <MacroBar
          label="Carbohydrates"
          current={totals.consumedCarbs}
          goal={settings.carbsGoal}
          emoji="🥖"
          color="blue"
        />

        <MacroBar
          label="Healthy Fats"
          current={totals.consumedFat}
          goal={settings.fatGoal}
          emoji="🥑"
          color="green"
        />
      </div>

      {/* ── SECTION 3: AUTHENTIC SOUTH INDIAN & INDIAN FOOD EXPLORER ── */}
      <div className="pt-2">
        <IndianFoodExplorer
          selectedDateStr={selectedDateStr}
          onAddMeal={addMeal}
          customFoods={customFoods}
          onOpenOnlineSearch={handleOpenOnlineSearch}
        />
      </div>

      {/* ── SECTION 4: TODAY'S LOGGED FOOD DIARY ── */}
      <div className="space-y-3 pt-4 border-t-2 border-ink-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-ink-700 uppercase tracking-wider">
            Today's Logged Meals ({dayMeals.length})
          </h3>
          {dayMeals.length > 0 && (
            <span className="text-pandaOrange-600 font-black text-xs">
              {totals.consumedCalories} kcal total
            </span>
          )}
        </div>

        {dayMeals.length === 0 ? (
          <div className="panda-card p-6 text-center bg-ink-50">
            <span className="text-3xl block mb-2">🍛</span>
            <p className="text-xs font-black text-ink-800">No meals logged for this day yet</p>
            <p className="text-[11px] text-ink-500 font-bold mt-0.5">
              Choose from the authentic South Indian library above or search the web!
            </p>
          </div>
        ) : (
          MEAL_TYPES.map((typeObj) => {
            const mealsOfType = dayMeals.filter((m) => m.mealType === typeObj.id);
            if (mealsOfType.length === 0) return null;
            const groupCalories = mealsOfType.reduce((acc, m) => acc + (Number(m.calories) || 0), 0);

            return (
              <div key={typeObj.id} className="panda-card p-3.5 space-y-2.5 bg-white">
                <div className="flex items-center justify-between pb-2 border-b-2 border-ink-100">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{typeObj.emoji}</span>
                    <span className="text-xs font-black text-ink-900 capitalize">
                      {typeObj.label}
                    </span>
                  </div>
                  <span className="text-xs font-black text-ink-600 bg-ink-100 px-2 py-0.5 rounded-full border border-ink-200">
                    {groupCalories} kcal
                  </span>
                </div>

                <div className="space-y-2">
                  {mealsOfType.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-ink-50 hover:bg-ink-100 transition-colors gap-2.5"
                    >
                      {/* Photo Thumbnail if available */}
                      {item.image && (
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-ink-200 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-ink-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-ink-500 font-extrabold mt-0.5">
                          {item.calories} kcal • {item.protein}g P • {item.carbs}g C • {item.fat}g F
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteMeal(selectedDateStr, item.id)}
                        className="p-1.5 text-ink-400 hover:text-red-600 rounded-lg transition-colors flex-shrink-0"
                        title="Delete meal entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Online Food Search & Add Modal */}
      <OnlineFoodSearchModal
        isOpen={isOnlineSearchOpen}
        onClose={() => setIsOnlineSearchOpen(false)}
        initialQuery={onlineSearchQuery}
        selectedDateStr={selectedDateStr}
        onAddMeal={addMeal}
        onSaveCustomFood={saveCustomFood}
      />
    </div>
  );
}
