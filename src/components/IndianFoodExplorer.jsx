import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Globe,
  Plus,
  Sparkles,
  Utensils,
  ChevronRight,
  Coffee,
  Sun,
  Moon,
  Cookie,
  X
} from 'lucide-react';
import { INDIAN_FOOD_DATABASE } from '../data/indianFoodDatabase';
import { getLiveSearchSuggestions } from '../services/onlineFoodSearch';
import { FoodQuantityModal } from './FoodQuantityModal';

const MEAL_SECTIONS = [
  { id: 'breakfast', label: 'Breakfast 🥞', icon: Coffee, subtitle: 'South Indian tiffins & mornings' },
  { id: 'lunch', label: 'Lunch 🥗', icon: Sun, subtitle: 'Meals, biryanis & hearty rice bowls' },
  { id: 'dinner', label: 'Dinner 🍲', icon: Moon, subtitle: 'Rotis, curries & protein dishes' },
  { id: 'snack', label: 'Snacks & Drinks ☕', icon: Cookie, subtitle: 'Filter coffee, chai & tea-time snacks' },
];

export function IndianFoodExplorer({
  selectedDateStr,
  onAddMeal,
  customFoods = [],
  onOpenOnlineSearch
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedFoodForQuantity, setSelectedFoodForQuantity] = useState(null);
  const [targetMealForQuantity, setTargetMealForQuantity] = useState('breakfast');
  const searchContainerRef = useRef(null);

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

  // Live Autocomplete Suggestions as user types
  const liveSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return getLiveSearchSuggestions(searchQuery.trim(), 6);
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

  const handleTileClick = (food, defaultMeal = 'breakfast') => {
    setSelectedFoodForQuantity(food);
    setTargetMealForQuantity(defaultMeal);
    setIsSearchFocused(false);
  };

  return (
    <div className="space-y-5">
      {/* ── TOP SEARCH BAR WITH LIVE AUTOCOMPLETE DROPDOWN ── */}
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
              className="panda-input pl-10 pr-9 text-xs sm:text-sm font-black"
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
            onClick={() => onOpenOnlineSearch(searchQuery)}
            className="btn-panda-orange px-3.5 py-2.5 text-xs font-black flex items-center gap-1.5 flex-shrink-0"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search Web</span>
            <span className="sm:hidden">+ Web</span>
          </button>
        </div>

        {/* ── LIVE AUTOCOMPLETE DROPDOWN (WHILE TYPING) ── */}
        {isSearchFocused && searchQuery.trim().length >= 1 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border-2 border-ink-200 shadow-2xl overflow-hidden z-40 animate-pop-in">
            <div className="p-2 border-b border-ink-100 bg-ink-50 flex items-center justify-between text-[11px] font-black text-ink-500">
              <span>Matching Indian Dishes ({liveSuggestions.length})</span>
              <span className="text-pandaOrange-600">Tap to select quantity</span>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-ink-100">
              {liveSuggestions.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-xs font-black text-ink-800">No instant match for "{searchQuery}"</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchFocused(false);
                      onOpenOnlineSearch(searchQuery);
                    }}
                    className="mt-2 text-xs font-black text-pandaOrange-600 hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Search internet for "{searchQuery}"</span>
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
                    {/* Thumbnail */}
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

                    {/* Title & Macros */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-ink-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-ink-500 font-bold truncate">{item.serving}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-black text-pandaOrange-600 block">
                        🔥 {item.calories} kcal
                      </span>
                      <span className="text-[9px] font-black text-green-700">
                        {item.protein}g protein
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Bottom Search Web Link */}
            <div className="p-2.5 bg-pandaOrange-50 border-t border-pandaOrange-200 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSearchFocused(false);
                  onOpenOnlineSearch(searchQuery);
                }}
                className="text-xs font-black text-pandaOrange-700 hover:text-pandaOrange-800 flex items-center justify-center gap-1.5 mx-auto"
              >
                <Globe className="w-3.5 h-3.5 text-pandaOrange-600" />
                <span>Search internet database for "{searchQuery}"</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MEAL SECTIONS WITH TILED HORIZONTAL SIDE-SCROLL CAROUSEL ── */}
      <div className="space-y-6">
        {MEAL_SECTIONS.map((section) => {
          // Filter items belonging to this meal category
          const sectionFoods = allFoods.filter(
            (f) => f.category === section.id || (section.id === 'dinner' && f.category === 'lunch' && f.tags?.includes('dinner'))
          );

          return (
            <div key={section.id} className="space-y-2.5">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-ink-900 flex items-center gap-1.5">
                    {section.label}
                  </h4>
                  <p className="text-[10px] text-ink-400 font-bold">{section.subtitle}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenOnlineSearch(section.id === 'snack' ? 'Chai' : section.id === 'breakfast' ? 'Dosa' : 'Biryani')}
                  className="text-xs font-black text-pandaOrange-600 hover:text-pandaOrange-700 flex items-center gap-0.5"
                >
                  <span>+ Search</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* ── TILED VIEW WITH HORIZONTAL SIDE-SCROLL (CAROUSEL) ── */}
              <div className="flex gap-3 overflow-x-auto pb-2 pt-0.5 scrollbar-none snap-x snap-mandatory">
                {sectionFoods.slice(0, 10).map((food) => (
                  <div
                    key={food.id}
                    onClick={() => handleTileClick(food, section.id)}
                    className="w-36 flex-shrink-0 snap-start panda-card p-2 bg-white hover:border-pandaOrange-400 transition-all cursor-pointer flex flex-col justify-between select-none group"
                  >
                    {/* Compact Image Tile */}
                    <div className="relative w-full h-24 rounded-2xl overflow-hidden bg-ink-100 border border-ink-100 mb-2">
                      <img
                        src={food.image}
                        alt={food.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      {/* Diet Indicator */}
                      <span
                        className={`absolute top-1 left-1 w-3 h-3 rounded-md flex items-center justify-center border bg-white shadow-sm ${
                          food.diet === 'non-veg' ? 'border-red-600' : 'border-green-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            food.diet === 'non-veg' ? 'bg-red-600' : 'bg-green-600'
                          }`}
                        />
                      </span>

                      {/* Small Quick-Add Plus Overlay */}
                      <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-pandaOrange-600 group-hover:bg-pandaOrange-500 group-hover:text-white transition-colors">
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    {/* Compact Details */}
                    <div>
                      <h5 className="text-[11px] font-black text-ink-900 leading-tight line-clamp-2 mb-1">
                        {food.name}
                      </h5>

                      <div className="flex items-center justify-between text-[10px] font-black">
                        <span className="text-pandaOrange-600">🔥 {food.calories}</span>
                        <span className="text-green-700 bg-green-50 px-1 rounded">
                          {food.protein}g P
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── QUANTITY SELECTOR MODAL ── */}
      <FoodQuantityModal
        isOpen={Boolean(selectedFoodForQuantity)}
        onClose={() => setSelectedFoodForQuantity(null)}
        food={selectedFoodForQuantity}
        targetMealType={targetMealForQuantity}
        selectedDateStr={selectedDateStr}
        onConfirmAdd={onAddMeal}
      />
    </div>
  );
}
