import React, { useState, useMemo } from 'react';
import {
  Search,
  Globe,
  Plus,
  Sparkles,
  Utensils,
  Check,
  ChevronDown
} from 'lucide-react';
import { INDIAN_FOOD_DATABASE, INDIAN_MEAL_CATEGORIES } from '../data/indianFoodDatabase';

export function IndianFoodExplorer({
  selectedDateStr,
  onAddMeal,
  customFoods = [],
  onOpenOnlineSearch
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dietFilter, setDietFilter] = useState('all'); // 'all' | 'veg' | 'non-veg'
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [loggedToast, setLoggedToast] = useState('');

  // Combine prebuilt database + user's saved/online custom foods
  const allFoods = useMemo(() => {
    const combined = [...customFoods, ...INDIAN_FOOD_DATABASE];
    const map = new Map();
    combined.forEach(item => {
      const key = item.name.toLowerCase().trim();
      if (!map.has(key)) {
        map.set(key, item);
      }
    });
    return Array.from(map.values());
  }, [customFoods]);

  // Filtered food list
  const filteredFoods = useMemo(() => {
    return allFoods.filter(item => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesRegional = item.regionalName?.toLowerCase().includes(q);
        const matchesCuisine = item.cuisine?.toLowerCase().includes(q);
        const matchesTags = item.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesRegional && !matchesCuisine && !matchesTags) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'custom') {
          if (!item.isCustom) return false;
        } else if (item.category !== selectedCategory) {
          return false;
        }
      }

      // 3. Diet Filter
      if (dietFilter !== 'all') {
        if (item.diet !== dietFilter) return false;
      }

      return true;
    });
  }, [allFoods, searchQuery, selectedCategory, dietFilter]);

  const handleQuickLog = (food, mealType) => {
    onAddMeal(selectedDateStr, {
      name: food.name,
      mealType,
      calories: Number(food.calories) || 0,
      protein: Number(food.protein) || 0,
      carbs: Number(food.carbs) || 0,
      fat: Number(food.fat) || 0,
      serving: food.serving,
      image: food.image,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setActiveDropdownId(null);
    setLoggedToast(`Logged "${food.name}" to ${mealType.toUpperCase()}! 🌟`);
    setTimeout(() => setLoggedToast(''), 1800);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {loggedToast && (
        <div className="p-3 bg-bamboo-100 border-2 border-bamboo-600 text-bamboo-800 font-black rounded-2xl flex items-center gap-2 text-xs animate-pop-in shadow-md">
          <Check className="w-4 h-4 text-bamboo-600 stroke-[3]" />
          {loggedToast}
        </div>
      )}

      {/* Header & Add Online CTA */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-black text-ink-900 flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-pandaOrange-500" />
            South Indian & Indian Food Library
          </h3>
          <p className="text-[11px] text-ink-500 font-bold">
            Tap to log authentic dishes with verified macros
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenOnlineSearch(searchQuery)}
          className="btn-panda-orange px-3 py-2 text-xs font-black flex items-center gap-1.5 flex-shrink-0"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search Web / Add</span>
          <span className="sm:hidden">+ Online</span>
        </button>
      </div>

      {/* Live Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Dosa, Idli, Biryani, Curd Rice, Paneer, Chai..."
          className="panda-input pl-10 text-xs sm:text-sm font-black"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-ink-400 hover:text-ink-700 text-xs font-black"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Tabs & Diet Toggle */}
      <div className="space-y-2">
        {/* Categories */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {INDIAN_MEAL_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'btn-panda-orange !py-1.5 !text-xs'
                  : 'btn-panda-white !py-1.5 !text-xs text-ink-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
          {customFoods.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCategory('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                selectedCategory === 'custom'
                  ? 'btn-panda-orange !py-1.5 !text-xs'
                  : 'btn-panda-white !py-1.5 !text-xs text-ink-600'
              }`}
            >
              My Custom Items ⭐ ({customFoods.length})
            </button>
          )}
        </div>

        {/* Diet Filter Chips */}
        <div className="flex items-center gap-1.5 text-xs font-black">
          <span className="text-[10px] uppercase tracking-wider text-ink-400 mr-1">Diet:</span>
          <button
            type="button"
            onClick={() => setDietFilter('all')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-black transition-all ${
              dietFilter === 'all'
                ? 'bg-ink-800 text-white border-ink-800'
                : 'bg-white text-ink-600 border-ink-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setDietFilter('veg')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-black flex items-center gap-1 transition-all ${
              dietFilter === 'veg'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-green-700 border-green-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Pure Veg
          </button>
          <button
            type="button"
            onClick={() => setDietFilter('non-veg')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-black flex items-center gap-1 transition-all ${
              dietFilter === 'non-veg'
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-red-700 border-red-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Non-Veg
          </button>
        </div>
      </div>

      {/* Food Cards Grid */}
      <div className="space-y-3">
        {filteredFoods.length === 0 ? (
          /* Empty Search Fallback with One-Click Internet Search */
          <div className="panda-card p-6 text-center bg-white space-y-3">
            <span className="text-3xl block">🍲</span>
            <div>
              <h4 className="text-sm font-black text-ink-900">
                "{searchQuery}" not found in local library
              </h4>
              <p className="text-xs text-ink-500 font-bold mt-1">
                Search the internet to automatically fetch its verified macros and photo!
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenOnlineSearch(searchQuery)}
              className="btn-panda-orange mx-auto px-5 py-3 text-xs font-black inline-flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span>Search Internet for "{searchQuery}"</span>
            </button>
          </div>
        ) : (
          filteredFoods.map((food) => {
            const isDropdownOpen = activeDropdownId === food.id;

            return (
              <div
                key={food.id}
                className="panda-card p-3.5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-pandaOrange-300 transition-all shadow-sm"
              >
                {/* Image + Dish Info */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Photo Container */}
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-ink-100 flex-shrink-0 border-2 border-ink-100 relative">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    {/* Indian Veg / Non-Veg Indicator Stamp */}
                    <span
                      className={`absolute top-1 left-1 w-3.5 h-3.5 rounded-md flex items-center justify-center border bg-white shadow-sm ${
                        food.diet === 'non-veg' ? 'border-red-600' : 'border-green-600'
                      }`}
                      title={food.diet === 'non-veg' ? 'Non-Vegetarian' : 'Vegetarian'}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          food.diet === 'non-veg' ? 'bg-red-600' : 'bg-green-600'
                        }`}
                      />
                    </span>
                  </div>

                  {/* Title & Serving */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-black text-ink-900 leading-snug">
                        {food.name}
                      </h4>
                      {food.cuisine && (
                        <span className="text-[9px] font-black uppercase text-pandaOrange-600 bg-pandaOrange-50 px-1.5 py-0.5 rounded-md">
                          {food.cuisine}
                        </span>
                      )}
                    </div>

                    {food.regionalName && (
                      <p className="text-[10px] text-ink-400 font-bold truncate mt-0.5">
                        {food.regionalName}
                      </p>
                    )}

                    <p className="text-[10px] text-ink-500 font-bold truncate mt-0.5">
                      {food.serving}
                    </p>

                    {/* Macro Badges */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pandaOrange-100 text-pandaOrange-700 border border-pandaOrange-200">
                        🔥 {food.calories} kcal
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                        🍗 {food.protein}g P
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        🥖 {food.carbs}g C
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        🥑 {food.fat}g F
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Add Meal Dropdown / Action */}
                <div className="relative w-full sm:w-auto flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveDropdownId(isDropdownOpen ? null : food.id)}
                    className="btn-panda-orange w-full sm:w-auto px-3.5 py-2 text-xs font-black flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Log Dish</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Meal Target Popover */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 bottom-full sm:bottom-auto sm:top-full mt-1.5 mb-1.5 z-30 bg-white rounded-2xl border-2 border-ink-200 shadow-xl p-1.5 min-w-[150px] animate-pop-in">
                      <p className="text-[10px] font-black text-ink-400 px-2 py-1 uppercase tracking-wider">
                        Select Meal:
                      </p>
                      {[
                        { id: 'breakfast', label: 'Breakfast 🥞' },
                        { id: 'lunch', label: 'Lunch 🥗' },
                        { id: 'dinner', label: 'Dinner 🍲' },
                        { id: 'snack', label: 'Snacks ☕' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleQuickLog(food, m.id)}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-pandaOrange-50 text-xs font-black text-ink-800 hover:text-pandaOrange-600 flex items-center justify-between transition-colors"
                        >
                          <span>{m.label}</span>
                          <Plus className="w-3 h-3 text-pandaOrange-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Search Internet Banner */}
      <div className="panda-hero-box p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <h4 className="text-xs sm:text-sm font-black text-ink-900">
            Looking for something else?
          </h4>
          <p className="text-[11px] text-ink-500 font-bold mt-0.5">
            Search online across millions of products & authentic Indian recipes!
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenOnlineSearch(searchQuery)}
          className="btn-panda-orange px-4 py-2.5 text-xs font-black flex items-center gap-1.5 flex-shrink-0"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Search Internet</span>
        </button>
      </div>
    </div>
  );
}

