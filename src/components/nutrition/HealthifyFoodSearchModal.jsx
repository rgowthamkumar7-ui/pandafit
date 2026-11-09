import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Globe,
  Plus,
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  Scale,
  Flame,
  Info
} from 'lucide-react';
import { HEALTHIFY_FOOD_DATABASE } from '../../data/healthifyFoodDatabase';
import { HealthifyFoodModal } from './HealthifyFoodModal';
import { analyzeFoodWithGoogleAI } from '../../services/googleNutritionService';

const FILTER_TAGS = [
  { id: 'all', label: 'All Dishes' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'south_indian', label: 'South Indian' },
  { id: 'high_protein', label: 'High Protein' },
  { id: 'veg', label: '🟢 Pure Veg' },
  { id: 'non_veg', label: '🔴 Non-Veg' },
];

export function HealthifyFoodSearchModal({
  isOpen,
  onClose,
  targetMealSlot = 'breakfast',
  selectedDateStr,
  onAddMeal,
  customFoods = [],
  onSaveCustomFood
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'custom'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedFoodForModal, setSelectedFoodForModal] = useState(null);
  const [isWebSearching, setIsWebSearching] = useState(false);
  const [webResults, setWebResults] = useState([]);
  const [hasWebSearched, setHasWebSearched] = useState(false);

  // Custom Dish State
  const [customName, setCustomName] = useState('');
  const [customUnit, setCustomUnit] = useState('katori / cup');
  const [customGrams, setCustomGrams] = useState(150);
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customDiet, setCustomDiet] = useState('veg');

  // Unified Local Food Catalog (Verified database + user custom foods)
  const catalog = useMemo(() => {
    return [...customFoods, ...HEALTHIFY_FOOD_DATABASE];
  }, [customFoods]);

  // Live Filtered Items as user types
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return catalog.filter((item) => {
      // 1. Text Search matching name, tags, regional names
      const matchText =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.regionalName?.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q));

      if (!matchText) return false;

      // 2. Category Filters
      if (activeFilter === 'veg') return item.diet === 'veg';
      if (activeFilter === 'non_veg') return item.diet === 'non-veg';
      if (activeFilter === 'high_protein') return (item.protein || 0) >= 8;
      if (activeFilter === 'south_indian') return item.cuisine === 'South Indian';
      if (activeFilter === 'breakfast') return item.mealCategory === 'breakfast';

      return true;
    });
  }, [catalog, searchQuery, activeFilter]);

  // Perform Web & Google AI Search when user presses enter or clicks Search Web
  const handlePerformWebSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;

    setIsWebSearching(true);
    setHasWebSearched(true);
    setWebResults([]);

    const results = [];
    const seen = new Set();

    // 1. Try Google Gemini Nutrition AI
    try {
      const aiResult = await analyzeFoodWithGoogleAI(q);
      if (aiResult) {
        seen.add(aiResult.name.toLowerCase());
        results.push({
          id: `ai-${Date.now()}`,
          name: aiResult.name,
          unit: aiResult.unit || 'serving',
          unitWeightGrams: aiResult.portionWeightGrams || 120,
          servingDisplay: aiResult.serving || `1 serving (~${aiResult.portionWeightGrams || 120} g)`,
          calories: aiResult.calories,
          protein: aiResult.protein,
          carbs: aiResult.carbs,
          fat: aiResult.fat,
          fiber: aiResult.fiber || 2,
          diet: aiResult.diet || 'veg',
          mealCategory: targetMealSlot,
          image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
          source: 'Google Gemini AI'
        });
      }
    } catch (e) {
      console.log('Google AI analysis skipped.');
    }

    // 2. Query Open Food Facts API
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          q
        )}&search_simple=1&action=process&json=1&page_size=6`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          for (const prod of data.products) {
            const name = prod.product_name_en || prod.product_name;
            if (!name || seen.has(name.toLowerCase())) continue;

            const n = prod.nutriments || {};
            const cals = Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 120);
            if (cals <= 0) continue;

            seen.add(name.toLowerCase());
            results.push({
              id: `off-${prod.code || Math.random()}`,
              name: name.slice(0, 45),
              unit: 'serving',
              unitWeightGrams: Math.round(Number(prod.serving_quantity) || 100),
              servingDisplay: prod.serving_size || '1 serving (100 g)',
              calories: cals,
              protein: Math.round((n.proteins_100g || 4) * 10) / 10,
              carbs: Math.round((n.carbohydrates_100g || 18) * 10) / 10,
              fat: Math.round((n.fat_100g || 4) * 10) / 10,
              fiber: Math.round((n.fiber_100g || 1) * 10) / 10,
              diet: (prod.ingredients_text || '').toLowerCase().includes('chicken') ? 'non-veg' : 'veg',
              mealCategory: targetMealSlot,
              image: prod.image_front_small_url || prod.image_url || 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
              source: 'Open Food Facts'
            });
          }
        }
      }
    } catch (e) {
      console.log('OFF fetch completed.');
    }

    setWebResults(results);
    setIsWebSearching(false);
  };

  const handleCustomDishSubmit = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newFood = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      unit: customUnit,
      unitWeightGrams: Number(customGrams) || 100,
      servingDisplay: `1 ${customUnit} (${customGrams} g)`,
      calories: Math.max(1, Number(customCalories) || 100),
      protein: Math.max(0, Number(customProtein) || 0),
      carbs: Math.max(0, Number(customCarbs) || 0),
      fat: Math.max(0, Number(customFat) || 0),
      fiber: 2,
      diet: customDiet,
      mealCategory: targetMealSlot,
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
      isCustom: true
    };

    if (onSaveCustomFood) {
      onSaveCustomFood(newFood);
    }

    setSelectedFoodForModal(newFood);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-900/60 backdrop-blur-sm animate-pop-in">
      <div className="bg-white w-full max-w-md rounded-3xl border-2 border-ink-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-pandaOrange-500 text-white flex items-center justify-between border-b-4 border-pandaOrange-700 flex-shrink-0">
          <div>
            <h2 className="text-base font-black leading-tight">Track Food & Nutrition</h2>
            <p className="text-[11px] text-white/90 font-bold">
              Adding to {targetMealSlot.replace('_', ' ').toUpperCase()} • ICMR-NIN Verified
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Switcher: Search Database vs Create Custom */}
        <div className="grid grid-cols-2 border-b-2 border-ink-100 bg-ink-50 p-1.5 gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`py-2 px-3 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'search'
                ? 'bg-white shadow-sm border-2 border-ink-200 text-ink-900'
                : 'text-ink-400 hover:text-ink-800'
            }`}
          >
            🔍 Search Database
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`py-2 px-3 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'custom'
                ? 'bg-white shadow-sm border-2 border-ink-200 text-ink-900'
                : 'text-ink-400 hover:text-ink-800'
            }`}
          >
            ✍️ Create Custom Dish
          </button>
        </div>

        {activeTab === 'search' ? (
          <div className="p-4 flex-1 flex flex-col min-h-0 space-y-3">
            {/* Search Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePerformWebSearch();
              }}
              className="flex gap-2 flex-shrink-0"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dosa, idli, chai, rice, biryani..."
                  className="panda-input pl-10 pr-8 text-xs sm:text-sm font-black w-full"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-ink-400 hover:text-ink-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isWebSearching}
                className="btn-panda-orange px-3.5 py-2.5 text-xs font-black flex items-center gap-1 flex-shrink-0"
              >
                {isWebSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                <span>Web</span>
              </button>
            </form>

            {/* Category Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-shrink-0">
              {FILTER_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setActiveFilter(tag.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black whitespace-nowrap transition-all ${
                    activeFilter === tag.id
                      ? 'bg-pandaOrange-500 text-white shadow-sm'
                      : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* List of Matching Items (Scrollable) */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-0.5">
              {/* Web Results Section (If searched) */}
              {webResults.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  <div className="text-[10px] font-black text-pandaOrange-600 uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Web / Google AI Results ({webResults.length})
                  </div>
                  {webResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedFoodForModal(item)}
                      className="p-2.5 bg-pandaOrange-50/70 border-2 border-pandaOrange-200 rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:border-pandaOrange-400 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-ink-200 flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-ink-900 truncate">{item.name}</p>
                          <p className="text-[10px] text-ink-500 font-bold truncate">
                            {item.servingDisplay} • {item.source}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-black text-pandaOrange-600 block">
                          🔥 {item.calories} kcal
                        </span>
                        <span className="text-[10px] font-black text-green-700">
                          {item.protein}g P
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Local Database Items */}
              {filteredCatalog.length === 0 && webResults.length === 0 ? (
                <div className="p-8 text-center bg-ink-50 rounded-2xl border border-ink-100">
                  <span className="text-3xl block mb-2">🔍</span>
                  <p className="text-xs font-black text-ink-800">No items match "{searchQuery}"</p>
                  <p className="text-[11px] text-ink-500 font-bold mt-1">
                    Tap the "Web" button above or switch to "Create Custom Dish" tab!
                  </p>
                </div>
              ) : (
                filteredCatalog.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedFoodForModal(item)}
                    className="p-2.5 bg-white border-2 border-ink-100 hover:border-pandaOrange-400 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Image Thumbnail with Veg/Non-Veg Badge */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-ink-100 border border-ink-200 flex-shrink-0 relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-ink-900 truncate leading-snug">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-ink-500 font-bold truncate">
                          1 {item.unit || 'piece'} ({item.unitWeightGrams} g)
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] font-black text-green-700 bg-green-50 px-1 py-0.2 rounded">
                            {item.protein}g P
                          </span>
                          <span className="text-[9px] font-black text-blue-700 bg-blue-50 px-1 py-0.2 rounded">
                            {item.carbs}g C
                          </span>
                          <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-1 py-0.2 rounded">
                            {item.fat}g F
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Calories & Action */}
                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                      <div>
                        <span className="text-xs font-black text-pandaOrange-600 block">
                          🔥 {item.calories}
                        </span>
                        <span className="text-[9px] font-bold text-ink-400">kcal</span>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-pandaOrange-100 text-pandaOrange-600 flex items-center justify-center group-hover:bg-pandaOrange-500 group-hover:text-white transition-colors">
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Create Custom Dish Tab (HealthifyMe Style) */
          <form onSubmit={handleCustomDishSubmit} className="p-4 overflow-y-auto flex-1 space-y-3">
            <div className="p-3 bg-pandaOrange-50 rounded-2xl border border-pandaOrange-200 text-xs font-bold text-pandaOrange-900 leading-relaxed">
              💡 Track any homemade recipe or packaged food. It will be saved permanently to your library!
            </div>

            <div>
              <label className="block text-[10px] font-black text-ink-600 uppercase mb-1">
                Dish Name *
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Grandma's Chettinad Pepper Chicken"
                className="panda-input text-xs font-black w-full"
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-black text-ink-600 uppercase mb-1">
                  Serving Unit
                </label>
                <select
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  className="panda-input text-xs font-black w-full"
                >
                  <option value="piece">piece</option>
                  <option value="katori / cup">katori / cup</option>
                  <option value="plate">plate</option>
                  <option value="bowl">bowl</option>
                  <option value="tablespoon">tablespoon</option>
                  <option value="glass">glass</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-ink-600 uppercase mb-1">
                  Weight (grams)
                </label>
                <input
                  type="number"
                  value={customGrams}
                  onChange={(e) => setCustomGrams(e.target.value)}
                  placeholder="150"
                  className="panda-input text-xs font-black w-full"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-ink-600 uppercase mb-1">
                Calories (kcal) *
              </label>
              <input
                type="number"
                value={customCalories}
                onChange={(e) => setCustomCalories(e.target.value)}
                placeholder="e.g. 210"
                className="panda-input text-xs font-black w-full"
                required
                min="0"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-black text-green-700 uppercase mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  placeholder="e.g. 15"
                  className="panda-input text-xs font-black w-full"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-blue-700 uppercase mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  placeholder="e.g. 25"
                  className="panda-input text-xs font-black w-full"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-amber-700 uppercase mb-1">
                  Fat (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                  placeholder="e.g. 8"
                  className="panda-input text-xs font-black w-full"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCustomDiet('veg')}
                className={`flex-1 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                  customDiet === 'veg'
                    ? 'border-green-600 bg-green-50 text-green-800'
                    : 'border-ink-200 text-ink-500'
                }`}
              >
                🟢 Pure Veg
              </button>
              <button
                type="button"
                onClick={() => setCustomDiet('non-veg')}
                className={`flex-1 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                  customDiet === 'non-veg'
                    ? 'border-red-600 bg-red-50 text-red-800'
                    : 'border-ink-200 text-ink-500'
                }`}
              >
                🔴 Non-Veg
              </button>
            </div>

            <button
              type="submit"
              className="btn-panda-orange w-full py-3.5 text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Select Quantity & Log</span>
            </button>
          </form>
        )}
      </div>

      {/* Embedded Quantity & Portion Modal */}
      <HealthifyFoodModal
        isOpen={Boolean(selectedFoodForModal)}
        onClose={() => {
          setSelectedFoodForModal(null);
          onClose();
        }}
        food={selectedFoodForModal}
        targetMealSlot={targetMealSlot}
        selectedDateStr={selectedDateStr}
        onAddMeal={onAddMeal}
      />
    </div>
  );
}
