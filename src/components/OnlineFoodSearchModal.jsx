import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  Flame,
  Utensils,
  Sparkles,
  Info
} from 'lucide-react';
import { searchInternetFoods } from '../services/onlineFoodSearch';
import { PandaMascot } from './PandaMascot';

const POPULAR_INDIAN_SEARCHES = [
  'Chicken 65',
  'Ambur Mutton Biryani',
  'Mutton Sukka',
  'Prawn Roast',
  'Malabar Parotta',
  'Dal Makhani',
  'Pav Bhaji',
  'Poha',
  'Ragi Malt',
  'Mysore Pak',
  'Gulab Jamun',
  'Sweet Lassi',
  'Methi Thepla'
];

export function OnlineFoodSearchModal({
  isOpen,
  onClose,
  initialQuery = '',
  selectedDateStr,
  onAddMeal,
  onSaveCustomFood
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'manual'
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [toastMessage, setToastMessage] = useState('');

  // Manual Form State
  const [manualName, setManualName] = useState('');
  const [manualServing, setManualServing] = useState('1 serving (200g)');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualDiet, setManualDiet] = useState('veg');

  // Trigger search on mount if initialQuery is provided
  useEffect(() => {
    if (initialQuery && initialQuery.trim().length >= 2) {
      setSearchQuery(initialQuery);
      handlePerformSearch(initialQuery);
    }
  }, [initialQuery]);

  const handlePerformSearch = async (queryToSearch) => {
    const q = queryToSearch || searchQuery;
    if (!q || q.trim().length < 2) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const items = await searchInternetFoods(q.trim());
      setResults(items);
    } catch (err) {
      console.error('Error searching online foods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = (food) => {
    // 1. Add to today's meal diary
    onAddMeal(selectedDateStr, {
      name: food.name,
      mealType: selectedMealType,
      calories: Number(food.calories) || 0,
      protein: Number(food.protein) || 0,
      carbs: Number(food.carbs) || 0,
      fat: Number(food.fat) || 0,
      serving: food.serving,
      image: food.image,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // 2. Save permanently to custom Indian foods database
    onSaveCustomFood({
      id: food.id || `custom-${Date.now()}`,
      name: food.name,
      serving: food.serving,
      calories: Number(food.calories) || 0,
      protein: Number(food.protein) || 0,
      carbs: Number(food.carbs) || 0,
      fat: Number(food.fat) || 0,
      fiber: Number(food.fiber) || 0,
      diet: food.diet || 'veg',
      category: selectedMealType,
      image: food.image,
      isCustom: true,
      source: food.source || 'Internet Search',
    });

    setToastMessage(`Added "${food.name}" to ${selectedMealType}! 🌟`);
    setTimeout(() => {
      setToastMessage('');
      onClose();
    }, 1200);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const newFood = {
      id: `manual-${Date.now()}`,
      name: manualName.trim(),
      serving: manualServing.trim(),
      calories: Number(manualCalories) || 0,
      protein: Number(manualProtein) || 0,
      carbs: Number(manualCarbs) || 0,
      fat: Number(manualFat) || 0,
      fiber: 2,
      diet: manualDiet,
      category: selectedMealType,
      image: manualDiet === 'non-veg'
        ? 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
      isCustom: true,
      source: 'User Custom Recipe',
    };

    onAddMeal(selectedDateStr, {
      ...newFood,
      mealType: selectedMealType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    onSaveCustomFood(newFood);

    setToastMessage(`Saved & Logged "${newFood.name}"! 🌟`);
    setTimeout(() => {
      setToastMessage('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-900/60 backdrop-blur-sm animate-pop-in">
      <div className="bg-white w-full max-w-lg rounded-3xl border-2 border-ink-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-pandaOrange-500 text-white flex items-center justify-between border-b-4 border-pandaOrange-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black leading-tight">Internet Food Search & Add</h2>
              <p className="text-[11px] text-white/90 font-bold">Search any Indian dish or product across the web</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b-2 border-ink-100 bg-ink-50 px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`pb-2.5 px-3 text-xs font-black border-b-4 transition-all ${
              activeTab === 'search'
                ? 'border-pandaOrange-500 text-pandaOrange-600'
                : 'border-transparent text-ink-400 hover:text-ink-700'
            }`}
          >
            🌐 Internet Search
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 px-3 text-xs font-black border-b-4 transition-all ${
              activeTab === 'manual'
                ? 'border-pandaOrange-500 text-pandaOrange-600'
                : 'border-transparent text-ink-400 hover:text-ink-700'
            }`}
          >
            ✍️ Custom Recipe Entry
          </button>
        </div>

        {/* Meal Type Target Selector */}
        <div className="bg-pandaOrange-50/70 border-b border-pandaOrange-100 px-4 py-2.5 flex items-center justify-between">
          <span className="text-[11px] font-black text-ink-700 uppercase tracking-wider">
            Log to Meal:
          </span>
          <div className="flex gap-1.5">
            {[
              { id: 'breakfast', label: 'Breakfast 🥞' },
              { id: 'lunch', label: 'Lunch 🥗' },
              { id: 'dinner', label: 'Dinner 🍲' },
              { id: 'snack', label: 'Snack ☕' },
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMealType(m.id)}
                className={`text-[11px] px-2.5 py-1 rounded-xl font-black transition-all ${
                  selectedMealType === m.id
                    ? 'btn-panda-orange !py-1 !text-[11px]'
                    : 'btn-panda-white !py-1 !text-[11px]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Success Toast */}
        {toastMessage && (
          <div className="mx-4 mt-3 p-3 bg-bamboo-100 border-2 border-bamboo-600 text-bamboo-800 font-black rounded-2xl flex items-center gap-2 text-xs animate-pop-in">
            <CheckCircle2 className="w-4 h-4 text-bamboo-600 flex-shrink-0" />
            {toastMessage}
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'search' ? (
            <>
              {/* Search Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePerformSearch();
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Chicken 65, Ambur Biryani, MTR Gulab Jamun..."
                    className="panda-input pl-10 text-xs sm:text-sm font-black"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-panda-orange px-4 py-2.5 text-xs font-black flex items-center gap-1.5 flex-shrink-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  <span>Search Web</span>
                </button>
              </form>

              {/* Quick Suggestions Chips */}
              {!hasSearched && (
                <div>
                  <span className="text-[11px] font-black text-ink-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-pandaOrange-500 fill-pandaOrange-500" /> Popular Indian Dishes to Search:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_INDIAN_SEARCHES.map(dish => (
                      <button
                        key={dish}
                        type="button"
                        onClick={() => {
                          setSearchQuery(dish);
                          handlePerformSearch(dish);
                        }}
                        className="btn-panda-white px-2.5 py-1 text-xs font-black"
                      >
                        {dish}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                  <img
                    src="/mascot/panda-running.png"
                    alt="Panda mascot searching"
                    className="w-20 h-20 object-contain animate-bounce"
                  />
                  <div>
                    <p className="text-xs font-black text-ink-800">Searching the internet for nutrition facts...</p>
                    <p className="text-[11px] text-ink-400 font-bold mt-0.5">Scanning Open Food Facts & Indian Nutrition Knowledge Base 🐾</p>
                  </div>
                </div>
              )}

              {/* Results List */}
              {!loading && hasSearched && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-ink-500">
                    <span>Found {results.length} internet items for "{searchQuery}"</span>
                    <span className="text-pandaOrange-600">Tap to Log & Save</span>
                  </div>

                  {results.length === 0 ? (
                    <div className="panda-card p-6 text-center bg-ink-50">
                      <span className="text-3xl block mb-2">🔍</span>
                      <p className="text-xs font-black text-ink-800">No matching online results found</p>
                      <p className="text-[11px] text-ink-500 font-bold mt-1">
                        Try a different spelling or use the "Custom Recipe Entry" tab to add it manually!
                      </p>
                    </div>
                  ) : (
                    results.map((item) => (
                      <div
                        key={item.id}
                        className="panda-card p-3.5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-pandaOrange-400 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Dish Image */}
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-ink-100 flex-shrink-0 border-2 border-ink-100 relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                            {/* Diet Dot */}
                            <span
                              className={`absolute top-1 left-1 w-3 h-3 rounded-md flex items-center justify-center border bg-white ${
                                item.diet === 'non-veg' ? 'border-red-600' : 'border-green-600'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.diet === 'non-veg' ? 'bg-red-600' : 'bg-green-600'
                                }`}
                              />
                            </span>
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-black text-ink-900 leading-snug">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-ink-500 font-bold truncate">
                              {item.serving}
                            </p>

                            {/* Macro Pills */}
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pandaOrange-100 text-pandaOrange-700 border border-pandaOrange-200">
                                🔥 {item.calories} kcal
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                                🍗 {item.protein}g P
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                🥖 {item.carbs}g C
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                🥑 {item.fat}g F
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Add Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectFood(item)}
                          className="btn-panda-orange w-full sm:w-auto px-4 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 flex-shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add to {selectedMealType}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : (
            /* Manual Recipe Entry Form */
            <form onSubmit={handleManualSubmit} className="space-y-3 animate-pop-in">
              <div className="p-3 bg-pandaOrange-50 rounded-2xl border border-pandaOrange-200 flex items-center gap-2 text-xs font-bold text-pandaOrange-800">
                <Info className="w-4 h-4 flex-shrink-0 text-pandaOrange-600" />
                <span>Create any custom Indian food item. It will be added to your meal and saved in your personal database permanently!</span>
              </div>

              <div>
                <label className="block text-[11px] font-black text-ink-700 mb-1">
                  Dish / Product Name *
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Grandma's Chettinad Chicken Roast"
                  className="panda-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-ink-700 mb-1">
                    Serving Description
                  </label>
                  <input
                    type="text"
                    value={manualServing}
                    onChange={(e) => setManualServing(e.target.value)}
                    placeholder="e.g. 1 bowl (200g), 2 pcs"
                    className="panda-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-ink-700 mb-1">
                    Diet Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setManualDiet('veg')}
                      className={`py-2 rounded-xl text-xs font-black border-2 ${
                        manualDiet === 'veg'
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-ink-200 bg-white text-ink-400'
                      }`}
                    >
                      🟢 Veg
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualDiet('non-veg')}
                      className={`py-2 rounded-xl text-xs font-black border-2 ${
                        manualDiet === 'non-veg'
                          ? 'border-red-600 bg-red-50 text-red-700'
                          : 'border-ink-200 bg-white text-ink-400'
                      }`}
                    >
                      🔴 Non-Veg
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-black text-ink-500 mb-1 text-center">Calories (kcal) *</label>
                  <input
                    type="number"
                    value={manualCalories}
                    onChange={(e) => setManualCalories(e.target.value)}
                    placeholder="kcal"
                    className="panda-input text-center text-xs font-black"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-ink-500 mb-1 text-center">Protein (g)</label>
                  <input
                    type="number"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(e.target.value)}
                    placeholder="g"
                    className="panda-input text-center text-xs font-black"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-ink-500 mb-1 text-center">Carbs (g)</label>
                  <input
                    type="number"
                    value={manualCarbs}
                    onChange={(e) => setManualCarbs(e.target.value)}
                    placeholder="g"
                    className="panda-input text-center text-xs font-black"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-ink-500 mb-1 text-center">Fat (g)</label>
                  <input
                    type="number"
                    value={manualFat}
                    onChange={(e) => setManualFat(e.target.value)}
                    placeholder="g"
                    className="panda-input text-center text-xs font-black"
                    min="0"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-panda-orange w-full py-3.5 text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 mt-3"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Add & Save to {selectedMealType}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

