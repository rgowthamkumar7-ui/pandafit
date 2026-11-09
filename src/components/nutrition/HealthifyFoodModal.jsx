import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Minus, Check, Scale, Flame } from 'lucide-react';

export function HealthifyFoodModal({
  isOpen,
  onClose,
  food,
  targetMealSlot = 'breakfast',
  selectedDateStr,
  onAddMeal
}) {
  if (!isOpen || !food) return null;

  const [quantity, setQuantity] = useState(1);
  const [mealSlot, setMealSlot] = useState(targetMealSlot || food.mealCategory || 'breakfast');
  const [useCustomGrams, setUseCustomGrams] = useState(false);
  const [customGramsInput, setCustomGramsInput] = useState(String(food.unitWeightGrams || 100));

  // Sync state whenever food or target meal changes
  useEffect(() => {
    if (food) {
      setQuantity(1);
      setMealSlot(targetMealSlot || food.mealCategory || 'breakfast');
      setUseCustomGrams(false);
      setCustomGramsInput(String(food.unitWeightGrams || 100));
    }
  }, [food, targetMealSlot]);

  const baseWeightGrams = food.unitWeightGrams || 100;

  // Real-time macro scaling
  const scaled = useMemo(() => {
    let multiplier = 1;
    let finalGrams = baseWeightGrams;

    if (useCustomGrams) {
      const g = Math.max(10, Number(customGramsInput) || baseWeightGrams);
      multiplier = g / baseWeightGrams;
      finalGrams = Math.round(g);
    } else {
      multiplier = Math.max(0.25, Number(quantity) || 1);
      finalGrams = Math.round(baseWeightGrams * multiplier);
    }

    return {
      multiplier,
      totalGrams: finalGrams,
      calories: Math.round((Number(food.calories) || 0) * multiplier),
      protein: Math.round(((Number(food.protein) || 0) * multiplier) * 10) / 10,
      carbs: Math.round(((Number(food.carbs) || 0) * multiplier) * 10) / 10,
      fat: Math.round(((Number(food.fat) || 0) * multiplier) * 10) / 10,
      fiber: Math.round(((Number(food.fiber) || 1) * multiplier) * 10) / 10,
    };
  }, [food, quantity, useCustomGrams, customGramsInput, baseWeightGrams]);

  const handleStepQuantity = (delta) => {
    setUseCustomGrams(false);
    setQuantity((prev) => Math.max(0.5, Math.round((prev + delta) * 10) / 10));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onAddMeal) return;

    const portionLabel = useCustomGrams
      ? `${scaled.totalGrams} g`
      : `${quantity} ${food.unit || 'serving'} (${scaled.totalGrams} g)`;

    const payload = {
      name: food.name,
      baseName: food.name,
      mealType: mealSlot,
      quantity: scaled.multiplier,
      unit: food.unit || 'serving',
      portionWeightGrams: scaled.totalGrams,
      serving: portionLabel,
      calories: scaled.calories,
      protein: scaled.protein,
      carbs: scaled.carbs,
      fat: scaled.fat,
      fiber: scaled.fiber,
      image: food.image,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAddMeal(selectedDateStr, payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-900/60 backdrop-blur-sm animate-pop-in">
      <div className="bg-white w-full max-w-sm rounded-3xl border-2 border-ink-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Photo & Header */}
        <div className="relative h-36 bg-ink-100 overflow-hidden flex-shrink-0">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-4">
            <div className="text-white">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md mb-1 ${
                  food.diet === 'non-veg' ? 'bg-red-600' : 'bg-green-600'
                }`}
              >
                {food.diet === 'non-veg' ? '🔴 Non-Veg' : '🟢 Pure Veg'}
              </span>
              <h3 className="text-base font-black leading-tight drop-shadow-md">
                {food.name}
              </h3>
              <p className="text-[11px] opacity-90 font-bold drop-shadow-sm flex items-center gap-1.5 mt-0.5">
                <Scale className="w-3 h-3 text-pandaOrange-400" />
                <span>Base unit: 1 {food.unit || 'piece'} ({baseWeightGrams} g)</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Destination Meal Slot Switcher */}
          <div>
            <label className="block text-[10px] font-black text-ink-500 uppercase tracking-wider mb-1.5">
              Log to Meal Slot
            </label>
            <div className="grid grid-cols-5 gap-1">
              {[
                { id: 'breakfast', label: 'B\'fast', emoji: '🥞' },
                { id: 'morning_snack', label: 'Mid-Morn', emoji: '☕' },
                { id: 'lunch', label: 'Lunch', emoji: '🥗' },
                { id: 'evening_snack', label: 'Snack', emoji: '🍵' },
                { id: 'dinner', label: 'Dinner', emoji: '🍲' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMealSlot(m.id)}
                  className={`py-1.5 px-0.5 rounded-xl text-[9px] font-black text-center transition-all ${
                    mealSlot === m.id
                      ? 'bg-pandaOrange-500 text-white shadow-sm'
                      : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                  }`}
                >
                  <span className="block text-xs leading-none mb-0.5">{m.emoji}</span>
                  <span className="truncate block">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* HealthifyMe Portion & Unit Selector */}
          <div className="bg-ink-50 p-3.5 rounded-2xl border border-ink-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-ink-500 uppercase tracking-wider">
                Quantity & Portion
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setUseCustomGrams(false)}
                  className={`text-[10px] font-black px-2 py-0.5 rounded-md transition-colors ${
                    !useCustomGrams ? 'bg-pandaOrange-500 text-white' : 'text-ink-400 hover:text-ink-700'
                  }`}
                >
                  By {food.unit || 'Units'}
                </button>
                <button
                  type="button"
                  onClick={() => setUseCustomGrams(true)}
                  className={`text-[10px] font-black px-2 py-0.5 rounded-md transition-colors ${
                    useCustomGrams ? 'bg-pandaOrange-500 text-white' : 'text-ink-400 hover:text-ink-700'
                  }`}
                >
                  By Grams (g)
                </button>
              </div>
            </div>

            {!useCustomGrams ? (
              /* Unit Stepper */
              <div>
                <div className="flex items-center justify-center gap-4 py-1">
                  <button
                    type="button"
                    onClick={() => handleStepQuantity(-0.5)}
                    disabled={quantity <= 0.5}
                    className="btn-panda-white w-10 h-10 flex items-center justify-center text-lg font-black disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="text-center min-w-[100px]">
                    <span className="text-2xl font-black text-ink-900 leading-none">
                      {quantity} {food.unit || 'pc'}
                    </span>
                    <span className="block text-[11px] font-bold text-pandaOrange-600 mt-0.5">
                      ~{scaled.totalGrams} grams
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStepQuantity(0.5)}
                    className="btn-panda-white w-10 h-10 flex items-center justify-center text-lg font-black"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>

                {/* Quick Chips */}
                <div className="flex gap-1.5 mt-2 justify-center flex-wrap">
                  {[0.5, 1, 1.5, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setUseCustomGrams(false);
                        setQuantity(num);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${
                        quantity === num
                          ? 'bg-pandaOrange-500 text-white'
                          : 'bg-white text-ink-600 hover:bg-ink-100 border border-ink-200'
                      }`}
                    >
                      {num}x
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Custom Grams Direct Input */
              <div className="space-y-1.5 py-1">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customGramsInput}
                    onChange={(e) => setCustomGramsInput(e.target.value)}
                    placeholder="e.g. 150"
                    className="panda-input text-lg font-black py-2 text-center"
                    min="1"
                    autoFocus
                  />
                  <span className="text-sm font-black text-ink-600">grams</span>
                </div>
                <div className="flex gap-1.5 justify-center flex-wrap">
                  {[50, 100, 150, 200, 250, 300].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setCustomGramsInput(String(g))}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-white border border-ink-200 hover:bg-ink-100"
                    >
                      {g}g
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Macro Breakdown Card (HealthifyMe Color-Coded) */}
          <div className="p-3 bg-pandaOrange-50/70 rounded-2xl border-2 border-pandaOrange-200 space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-black text-ink-700">Calculated Nutrition:</span>
              <span className="text-base font-black text-pandaOrange-600">
                🔥 {scaled.calories} kcal
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 text-center pt-1 border-t border-pandaOrange-200/60">
              <div className="p-1 rounded-lg bg-white/90">
                <p className="text-[9px] font-black text-green-700 uppercase">Protein</p>
                <p className="text-xs font-black text-ink-900">{scaled.protein}g</p>
              </div>
              <div className="p-1 rounded-lg bg-white/90">
                <p className="text-[9px] font-black text-blue-700 uppercase">Carbs</p>
                <p className="text-xs font-black text-ink-900">{scaled.carbs}g</p>
              </div>
              <div className="p-1 rounded-lg bg-white/90">
                <p className="text-[9px] font-black text-amber-700 uppercase">Fat</p>
                <p className="text-xs font-black text-ink-900">{scaled.fat}g</p>
              </div>
              <div className="p-1 rounded-lg bg-white/90">
                <p className="text-[9px] font-black text-purple-700 uppercase">Fiber</p>
                <p className="text-xs font-black text-ink-900">{scaled.fiber}g</p>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="btn-panda-orange w-full py-3.5 text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-md"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              Log to {mealSlot.replace('_', ' ').toUpperCase()} ({scaled.calories} kcal)
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
