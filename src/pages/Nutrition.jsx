import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Search,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { DaySelector } from '../components/DaySelector';
import { MacroBar } from '../components/MacroBar';
import { OnlineFoodSearchModal } from '../components/OnlineFoodSearchModal';
import { FoodQuantityModal } from '../components/FoodQuantityModal';
import { INDIAN_FOOD_DATABASE } from '../data/indianFoodDatabase';
import { getLiveSearchSuggestions } from '../services/onlineFoodSearch';
import { calculateDayTotals } from '../utils/calculations';

const MEAL_CONFIG = [
  {
    id: 'breakfast',
    title: 'Breakfast',
    icon: Coffee,
    emoji: '🥞',
    targetKcal: 500,
    quickSuggestions: ['Plain Dosa', 'Masala Dosa', 'Ghee Roast Dosa', 'Rava Dosa', 'Steamed Idli', 'Medu Vada', 'South Indian Sambar', 'Fresh Coconut Chutney']
  },
  {
    id: 'lunch',
    title: 'Lunch',
    icon: Sun,
    emoji: '🥗',
    targetKcal: 700,
    quickSuggestions: ['Steamed White Rice', 'South Indian Sambar', 'Yellow Dal Tadka', 'Curd Rice', 'Plain Curd', 'Hyderabadi Chicken Dum Biryani', 'Chettinad Spicy Chicken Curry']
  },
  {
    id: 'dinner',
    title: 'Dinner',
    icon: Moon,
    emoji: '🍲',
    targetKcal: 500,
    quickSuggestions: ['Whole Wheat Chapati', 'Phulka', 'Malabar Parotta', 'Paneer Butter Masala', 'Palak Paneer', 'Egg Dosa', 'Paneer Dosa']
  },
  {
    id: 'snack',
    title: 'Snacks & Drinks',
    icon: Cookie,
    emoji: '☕',
    targetKcal: 300,
    quickSuggestions: ['Masala Chai', 'South Indian Filter Coffee', 'Neer Mor', 'Boiled Egg', 'Chicken 65', 'Kondakadalai Sundal', 'Medu Vada']
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

  const totals = useMemo(() => {
    return calculateDayTotals(dayMeals, dayLog, settings.calorieGoal);
  }, [dayMeals, dayLog, settings.calorieGoal]);

  // Search & Modal States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isOnlineSearchOpen, setIsOnlineSearchOpen] = useState(false);
  const [onlineSearchQuery, setOnlineSearchQuery] = useState('');
  const [quantityModalFood, setQuantityModalFood] = useState(null);
  const [quantityModalMeal, setQuantityModalMeal] = useState('breakfast');
  const [toastMessage, setToastMessage] = useState('');
  const searchContainerRef = useRef(null);

  // Live Dropdown Suggestions as user types (all variants like plain dosa, rava dosa, etc.)
  const liveSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return getLiveSearchSuggestions(searchQuery.trim(), 8);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTileClick = (food, mealType) => {
    setQuantityModalFood(food);
    setQuantityModalMeal(mealType);
    setIsSearchFocused(false);
  };

  const handleOpenOnlineSearch = (query = '', targetMeal = 'breakfast') => {
    setOnlineSearchQuery(query);
    setQuantityModalMeal(targetMeal);
    setIsOnlineSearchOpen(true);
    setIsSearchFocused(false);
  };

  const handleAddMealWithFeedback = (dateStr, payload) => {
    addMeal(dateStr, payload);
    setToastMessage(`Logged "${payload.name}" (${payload.serving || ''}) to ${payload.mealType.toUpperCase()}! 🥞`);
    setTimeout(() => setToastMessage(''), 3500);
  };

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

      {/* ── TOP STATS: CALORIE BALANCE & MACROS ── */}
      <div className="panda-card p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-pandaOrange-500 fill-pandaOrange-500" />
            <h2 className="text-sm font-black text-ink-900">Daily Calorie Target</h2>
          </div>
          <span className="text-xs font-black text-pandaOrange-700 bg-pandaOrange-100 border border-pandaOrange-200 px-2.5 py-0.5 rounded-full">
            Goal: {settings.calorieGoal} kcal
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 my-2 text-center items-center">
          <div className="bg-ink-50 p-2 rounded-2xl border-2 border-ink-200">
            <p className="text-[10px] font-black text-ink-500 uppercase">Consumed</p>
            <p className="text-base font-black text-ink-900">{totals.consumedCalories}</p>
          </div>

          <div className="text-xs font-black text-ink-300 text-center font-bold">−</div>

          <div className="bg-pandaOrange-50 p-2 rounded-2xl border-2 border-pandaOrange-200">
            <p className="text-[10px] font-black text-pandaOrange-700 uppercase">Burned</p>
            <p className="text-base font-black text-pandaOrange-600">{totals.totalBurned}</p>
          </div>
        </div>

        <div className="p-2.5 bg-ink-50 rounded-2xl border border-ink-200 flex items-center justify-between text-xs">
          <span className="font-black text-ink-800">Net Remaining:</span>
          <span className="font-black text-pandaOrange-600">
            {totals.remainingCalories >= 0
              ? `${Math.round(totals.remainingCalories)} kcal remaining`
              : `${Math.abs(Math.round(totals.remainingCalories))} kcal over`}
          </span>
        </div>
      </div>

      {/* ── DAILY MACRONUTRIENTS COMPACT BARS ── */}
      <div className="panda-card p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-ink-900 uppercase tracking-wide flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5 text-pandaOrange-500" /> Macronutrient Goals
          </h3>
          <span className="text-[10px] font-black text-ink-500">
            {totals.consumedCalories} kcal
          </span>
        </div>

        <MacroBar label="Protein" current={totals.consumedProtein} goal={settings.proteinGoal} emoji="🍗" color="orange" />
        <MacroBar label="Carbs" current={totals.consumedCarbs} goal={settings.carbsGoal} emoji="🥖" color="blue" />
        <MacroBar label="Fats" current={totals.consumedFat} goal={settings.fatGoal} emoji="🥑" color="green" />
      </div>

      {/* ── TOP SEARCH WITH AUTOCOMPLETE DROPDOWN ── */}
      <div ref={searchContainerRef} className="relative z-30">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search Chai, Dosa, Biryani, Idli..."
              className="panda-input pl-10 pr-8 text-xs sm:text-sm font-black"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchFocused(false);
                }}
                className="absolute right-3 top-3 text-ink-400 hover:text-ink-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleOpenOnlineSearch(searchQuery)}
            className="btn-panda-orange px-3.5 py-2.5 text-xs font-black flex items-center gap-1.5 flex-shrink-0"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search Web</span>
            <span className="sm:hidden">+ Web</span>
          </button>
        </div>

        {/* Live Suggestions Dropdown while typing */}
        {isSearchFocused && searchQuery.trim().length >= 1 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border-2 border-ink-200 shadow-2xl overflow-hidden z-40 animate-pop-in divide-y divide-ink-100">
            <div className="p-2 bg-ink-50 flex items-center justify-between text-[11px] font-black text-ink-500">
              <span>Suggestions ({liveSuggestions.length})</span>
              <span className="text-pandaOrange-600">Tap to select quantity</span>
            </div>

            {liveSuggestions.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs font-black text-ink-800">No instant match for "{searchQuery}"</p>
                <button
                  type="button"
                  onClick={() => handleOpenOnlineSearch(searchQuery)}
                  className="mt-2 text-xs font-black text-pandaOrange-600 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Search web database for "{searchQuery}"</span>
                </button>
              </div>
            ) : (
              liveSuggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTileClick(item, item.category || 'breakfast')}
                  className="w-full text-left p-2.5 hover:bg-pandaOrange-50 flex items-center gap-3 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-ink-100 border border-ink-200 flex-shrink-0 relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <span
                      className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-sm flex items-center justify-center border bg-white ${
                        item.diet === 'non-veg' ? 'border-red-600' : 'border-green-600'
                      }`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${
                          item.diet === 'non-veg' ? 'bg-red-600' : 'bg-green-600'
                        }`}
                      />
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-ink-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-ink-400 font-bold truncate">{item.serving}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-black text-pandaOrange-600 block">
                      🔥 {item.calories} kcal
                    </span>
                    <span className="text-[9px] font-black text-green-700">
                      {item.protein}g P
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── MEAL SECTIONS: BREAKFAST, LUNCH, DINNER, SNACK ── */}
      <div className="space-y-4">
        {MEAL_CONFIG.map((section) => {
          const loggedThisMeal = dayMeals.filter((m) => m.mealType === section.id);
          const mealCals = loggedThisMeal.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);

          // Get popular matching items for this meal's side-scroller
          const mealPresets = INDIAN_FOOD_DATABASE.filter(
            (f) => f.category === section.id || section.quickSuggestions.some((s) => f.name.toLowerCase().includes(s.toLowerCase()))
          );

          return (
            <div key={section.id} className="panda-card p-4 bg-white space-y-3">
              {/* Meal Header with Action */}
              <div className="flex items-center justify-between pb-2 border-b-2 border-ink-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{section.emoji}</span>
                  <div>
                    <h3 className="text-sm font-black text-ink-900">{section.title}</h3>
                    <p className="text-[10px] text-ink-400 font-bold">
                      {mealCals} kcal logged • Target ~{section.targetKcal} kcal
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenOnlineSearch('', section.id)}
                  className="btn-panda-orange !py-1.5 !px-3 text-xs font-black flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Log {section.title}</span>
                </button>
              </div>

              {/* Logged Foods in this meal */}
              {loggedThisMeal.length > 0 ? (
                <div className="space-y-1.5">
                  {loggedThisMeal.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-ink-50 hover:bg-ink-100 transition-colors gap-2"
                    >
                      {item.image && (
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-ink-200 flex-shrink-0">
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
                        <p className="text-[10px] text-ink-500 font-extrabold mt-0.5">
                          {item.calories} kcal • {item.protein}g P • {item.carbs}g C • {item.fat}g F
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteMeal(selectedDateStr, item.id)}
                        className="p-1.5 text-ink-400 hover:text-red-600 rounded-lg transition-colors flex-shrink-0"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-ink-400 font-bold italic py-0.5">
                  No {section.title.toLowerCase()} logged yet. Tap a quick tile below or search!
                </p>
              )}

              {/* ── TILED VIEW WITH HORIZONTAL SIDE-SCROLL (PHONE OPTIMIZED) ── */}
              <div className="pt-1">
                <p className="text-[10px] font-black text-ink-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Quick Add {section.title} (Side scroll ➔)</span>
                  <span className="text-pandaOrange-600">Tap to choose qty</span>
                </p>

                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
                  {mealPresets.slice(0, 8).map((food) => (
                    <div
                      key={food.id}
                      onClick={() => handleTileClick(food, section.id)}
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
                        <h5 className="text-[11px] font-black text-ink-900 leading-tight truncate mb-1">
                          {food.name}
                        </h5>
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

      {/* ── QUANTITY SELECTOR MODAL (ALLOWS SELECTING 1x, 2x, 3x...) ── */}
      <FoodQuantityModal
        isOpen={Boolean(quantityModalFood)}
        onClose={() => setQuantityModalFood(null)}
        food={quantityModalFood}
        targetMealType={quantityModalMeal}
        selectedDateStr={selectedDateStr}
        onConfirmAdd={handleAddMealWithFeedback}
      />

      {/* ── INTERNET FOOD SEARCH & ADD MODAL ── */}
      <OnlineFoodSearchModal
        isOpen={isOnlineSearchOpen}
        onClose={() => setIsOnlineSearchOpen(false)}
        initialQuery={onlineSearchQuery}
        targetMealType={quantityModalMeal}
        selectedDateStr={selectedDateStr}
        onAddMeal={handleAddMealWithFeedback}
        onSaveCustomFood={saveCustomFood}
      />
    </div>
  );
}
