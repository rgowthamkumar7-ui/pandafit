import React, { useState, useMemo } from 'react';
import {
  Coffee,
  Sun,
  Moon,
  Cookie,
  Plus,
  Trash2,
  Flame,
  Scale,
  Sparkles,
  CheckCircle2,
  X,
  ChevronRight,
  TrendingUp,
  Apple
} from 'lucide-react';
import { DaySelector } from '../components/DaySelector';
import { HEALTHIFY_FOOD_DATABASE } from '../data/healthifyFoodDatabase';
import { HealthifyFoodModal } from '../components/nutrition/HealthifyFoodModal';
import { HealthifyFoodSearchModal } from '../components/nutrition/HealthifyFoodSearchModal';
import { calculateDayTotals } from '../utils/calculations';

// 5 HealthifyMe Meal Slots
const HEALTHIFY_MEAL_SLOTS = [
  {
    id: 'breakfast',
    title: 'Breakfast',
    emoji: '🥞',
    targetRatio: 0.25, // 25% of daily goal (~500 kcal)
    quickSuggestions: ['Plain Dosa', 'Masala Dosa', 'Ghee Roast Dosa', 'Steamed Idli', 'Medu Vada', 'South Indian Sambar', 'Fresh Coconut Chutney']
  },
  {
    id: 'morning_snack',
    title: 'Mid-Morning Snack',
    emoji: '☕',
    targetRatio: 0.10, // 10% of daily goal (~200 kcal)
    quickSuggestions: ['Masala Chai', 'South Indian Filter Coffee', 'Neer Mor', 'Boiled Egg', 'Kondakadalai Sundal']
  },
  {
    id: 'lunch',
    title: 'Lunch',
    emoji: '🥗',
    targetRatio: 0.35, // 35% of daily goal (~700 kcal)
    quickSuggestions: ['Steamed White Rice', 'South Indian Sambar', 'Yellow Dal Tadka', 'Curd Rice', 'Plain Curd', 'Hyderabadi Chicken Dum Biryani', 'Chettinad Spicy Chicken Curry']
  },
  {
    id: 'evening_snack',
    title: 'Evening Snack & Tea',
    emoji: '🍵',
    targetRatio: 0.10, // 10% of daily goal (~200 kcal)
    quickSuggestions: ['South Indian Filter Coffee', 'Masala Chai', 'Chicken 65', 'Kondakadalai Sundal', 'Medu Vada']
  },
  {
    id: 'dinner',
    title: 'Dinner',
    emoji: '🍲',
    targetRatio: 0.20, // 20% of daily goal (~400 kcal)
    quickSuggestions: ['Whole Wheat Chapati', 'Phulka', 'Malabar Parotta', 'Paneer Butter Masala', 'Palak Paneer', 'Egg Dosa', 'Paneer Dosa']
  },
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

  // Totals & Macros calculation
  const totals = useMemo(() => {
    return calculateDayTotals(dayMeals, dayLog, settings.calorieGoal);
  }, [dayMeals, dayLog, settings.calorieGoal]);

  // Modals state
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [activeSlotForSearch, setActiveSlotForSearch] = useState('breakfast');
  const [quickTileFoodForModal, setQuickTileFoodForModal] = useState(null);
  const [quickTileSlotForModal, setQuickTileSlotForModal] = useState('breakfast');
  const [toastMessage, setToastMessage] = useState('');

  const handleOpenSearchModal = (slotId = 'breakfast') => {
    setActiveSlotForSearch(slotId);
    setSearchModalOpen(true);
  };

  const handleOpenQuickTileModal = (food, slotId) => {
    setQuickTileFoodForModal(food);
    setQuickTileSlotForModal(slotId);
  };

  const handleAddMealWithToast = (dateStr, payload) => {
    addMeal(dateStr, payload);
    setToastMessage(`Logged "${payload.name}" to ${payload.mealType.replace('_', ' ').toUpperCase()}! 🌟`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const calorieGoal = settings.calorieGoal || 2000;
  const proteinGoal = settings.proteinGoal || 140;
  const carbsGoal = settings.carbsGoal || 210;
  const fatGoal = settings.fatGoal || 65;

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-pandaOrange-500 text-white font-black rounded-2xl flex items-center justify-between text-xs animate-pop-in shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-base">✅</span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="p-1 hover:opacity-80">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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

      {/* ── HEALTHIFYME BENCHMARK: DAILY CALORIE & MACRO TARGET CARD ── */}
      <div className="panda-card p-4 bg-white space-y-3.5 border-2 border-ink-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pandaOrange-100 flex items-center justify-center">
              <Flame className="w-4 h-4 text-pandaOrange-600 fill-pandaOrange-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-ink-900 leading-tight">Calorie Budget</h2>
              <p className="text-[10px] text-ink-500 font-bold">HealthifyMe Macro Breakdown</p>
            </div>
          </div>
          <span className="text-xs font-black text-pandaOrange-700 bg-pandaOrange-100 border border-pandaOrange-200 px-2.5 py-0.5 rounded-full">
            Goal: {calorieGoal.toLocaleString()} kcal
          </span>
        </div>

        {/* 3 Metrics: Consumed - Burned = Remaining */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-ink-50 p-2.5 rounded-2xl border border-ink-100">
            <p className="text-[10px] font-black text-ink-400 uppercase">Food In</p>
            <p className="text-base font-black text-ink-900 mt-0.5">{totals.consumedCalories}</p>
            <span className="text-[9px] text-ink-400 font-bold">kcal</span>
          </div>
          <div className="bg-ink-50 p-2.5 rounded-2xl border border-ink-100">
            <p className="text-[10px] font-black text-ink-400 uppercase">Active Burn</p>
            <p className="text-base font-black text-green-700 mt-0.5">{totals.totalBurned}</p>
            <span className="text-[9px] text-green-600 font-bold">kcal</span>
          </div>
          <div className="bg-pandaOrange-50 p-2.5 rounded-2xl border border-pandaOrange-200">
            <p className="text-[10px] font-black text-pandaOrange-600 uppercase">Remaining</p>
            <p className="text-base font-black text-pandaOrange-700 mt-0.5">
              {Math.max(0, totals.remainingCalories)}
            </p>
            <span className="text-[9px] text-pandaOrange-600 font-bold">kcal left</span>
          </div>
        </div>

        {/* Macro Bars (HealthifyMe Color-Coded) */}
        <div className="space-y-2 pt-1 border-t border-ink-100">
          {/* Protein */}
          <div>
            <div className="flex justify-between text-[11px] font-black mb-1">
              <span className="text-green-700">🍗 Protein ({totals.consumedProtein}g / {proteinGoal}g)</span>
              <span className="text-ink-500">{Math.min(100, Math.round((totals.consumedProtein / proteinGoal) * 100))}%</span>
            </div>
            <div className="w-full bg-ink-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totals.consumedProtein / proteinGoal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between text-[11px] font-black mb-1">
              <span className="text-blue-700">🥖 Carbs ({totals.consumedCarbs}g / {carbsGoal}g)</span>
              <span className="text-ink-500">{Math.min(100, Math.round((totals.consumedCarbs / carbsGoal) * 100))}%</span>
            </div>
            <div className="w-full bg-ink-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totals.consumedCarbs / carbsGoal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex justify-between text-[11px] font-black mb-1">
              <span className="text-amber-700">🥑 Fats ({totals.consumedFat}g / {fatGoal}g)</span>
              <span className="text-ink-500">{Math.min(100, Math.round((totals.consumedFat / fatGoal) * 100))}%</span>
            </div>
            <div className="w-full bg-ink-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totals.consumedFat / fatGoal) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH TRIGGER BUTTON ── */}
      <button
        type="button"
        onClick={() => handleOpenSearchModal('breakfast')}
        className="w-full py-3.5 px-4 bg-white border-2 border-ink-200 rounded-2xl flex items-center justify-between hover:border-pandaOrange-400 transition-all group shadow-sm"
      >
        <div className="flex items-center gap-2.5 text-ink-400">
          <span className="text-lg">🔍</span>
          <span className="text-xs font-black text-ink-600 group-hover:text-ink-900">
            Search food, dishes, ingredients (e.g. Dosa, Idli)...
          </span>
        </div>
        <span className="btn-panda-orange !py-1 !px-2.5 text-[10px] font-black">
          + Track
        </span>
      </button>

      {/* ── 5 HEALTHIFYME MEAL SLOTS ── */}
      <div className="space-y-4">
        {HEALTHIFY_MEAL_SLOTS.map((slot) => {
          const loggedInSlot = dayMeals.filter((m) => m.mealType === slot.id);
          const slotCalories = loggedInSlot.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
          const slotTarget = Math.round(calorieGoal * slot.targetRatio);

          // Get quick suggestions from verified database
          const slotPresets = HEALTHIFY_FOOD_DATABASE.filter((f) =>
            slot.quickSuggestions.some((s) => f.name.toLowerCase().includes(s.toLowerCase()))
          );

          return (
            <div key={slot.id} className="panda-card p-4 bg-white space-y-3 border-2 border-ink-100">
              {/* Slot Header */}
              <div className="flex items-center justify-between pb-2 border-b-2 border-ink-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{slot.emoji}</span>
                  <div>
                    <h3 className="text-sm font-black text-ink-900">{slot.title}</h3>
                    <p className="text-[10px] text-ink-500 font-bold">
                      {slotCalories} kcal logged • Budget ~{slotTarget} kcal
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenSearchModal(slot.id)}
                  className="btn-panda-orange !py-1.5 !px-3 text-xs font-black flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+ Track Food</span>
                </button>
              </div>

              {/* Logged Foods List */}
              {loggedInSlot.length > 0 ? (
                <div className="space-y-1.5">
                  {loggedInSlot.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-ink-50 hover:bg-ink-100 transition-colors gap-2.5"
                    >
                      {item.image && (
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-ink-200 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-ink-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-pandaOrange-700 font-extrabold mt-0.5">
                          {item.serving || `${item.quantity || 1} serving`}
                        </p>
                        <p className="text-[9px] text-ink-400 font-bold">
                          {item.protein || 0}g P • {item.carbs || 0}g C • {item.fat || 0}g F
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0 flex items-center gap-2">
                        <span className="text-xs font-black text-ink-900">
                          {item.calories} kcal
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteMeal(selectedDateStr, item.id)}
                          className="p-1.5 text-ink-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-ink-400 font-bold italic py-1">
                  No {slot.title.toLowerCase()} logged yet. Tap "+ Track Food" or a quick tile below!
                </p>
              )}

              {/* ── QUICK ADD TILES (HORIZONTAL SIDE-SCROLL) ── */}
              <div className="pt-1">
                <p className="text-[10px] font-black text-ink-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Quick Add {slot.title} (Side-scroll ➔)</span>
                  <span className="text-pandaOrange-600">Tap to select portion</span>
                </p>

                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x">
                  {slotPresets.slice(0, 8).map((food) => (
                    <div
                      key={food.id}
                      onClick={() => handleOpenQuickTileModal(food, slot.id)}
                      className="w-28 sm:w-32 flex-shrink-0 snap-start rounded-2xl border-2 border-ink-100 p-1.5 bg-white hover:border-pandaOrange-400 transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
                    >
                      {/* Compact Image Tile */}
                      <div className="relative w-full h-20 rounded-xl overflow-hidden bg-ink-100 mb-1.5">
                        <img
                          src={food.image}
                          alt={food.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <span
                          className={`absolute top-1 left-1 w-2.5 h-2.5 rounded-sm flex items-center justify-center border bg-white ${
                            food.diet === 'non-veg' ? 'border-red-600' : 'border-green-600'
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              food.diet === 'non-veg' ? 'bg-red-600' : 'bg-green-600'
                            }`}
                          />
                        </span>
                        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-white/90 shadow flex items-center justify-center text-pandaOrange-600">
                          <Plus className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>

                      {/* Title & Calories */}
                      <div>
                        <h5 className="text-[11px] font-black text-ink-900 leading-tight truncate mb-0.5">
                          {food.name}
                        </h5>
                        <p className="text-[9px] text-ink-400 font-bold truncate mb-1">
                          1 {food.unit} ({food.unitWeightGrams}g)
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-black">
                          <span className="text-pandaOrange-600">🔥 {food.calories}</span>
                          <span className="text-green-700 font-bold">{food.protein}g P</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── HEALTHIFYME PORTION & UNIT MODAL (FROM QUICK TILES) ── */}
      <HealthifyFoodModal
        isOpen={Boolean(quickTileFoodForModal)}
        onClose={() => setQuickTileFoodForModal(null)}
        food={quickTileFoodForModal}
        targetMealSlot={quickTileSlotForModal}
        selectedDateStr={selectedDateStr}
        onAddMeal={handleAddMealWithToast}
      />

      {/* ── HEALTHIFYME FULL SEARCH & DISCOVERY MODAL ── */}
      <HealthifyFoodSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        targetMealSlot={activeSlotForSearch}
        selectedDateStr={selectedDateStr}
        onAddMeal={handleAddMealWithToast}
        customFoods={customFoods}
        onSaveCustomFood={saveCustomFood}
      />
    </div>
  );
}
