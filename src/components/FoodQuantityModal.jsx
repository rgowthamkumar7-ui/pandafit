import React, { useState, useMemo } from 'react';
import { X, Plus, Minus, Check, Flame, Utensils } from 'lucide-react';

export function FoodQuantityModal({
  isOpen,
  onClose,
  food,
  targetMealType = 'breakfast',
  selectedDateStr,
  onConfirmAdd
}) {
  if (!isOpen || !food) return null;

  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState(targetMealType || food.category || 'breakfast');

  // Multiplied macros based on selected quantity
  const scaledMacros = useMemo(() => {
    const q = Math.max(0.25, Number(quantity) || 1);
    return {
      quantity: q,
      calories: Math.round((Number(food.calories) || 0) * q),
      protein: Math.round(((Number(food.protein) || 0) * q) * 10) / 10,
      carbs: Math.round(((Number(food.carbs) || 0) * q) * 10) / 10,
      fat: Math.round(((Number(food.fat) || 0) * q) * 10) / 10,
    };
  }, [food, quantity]);

  const handleStep = (delta) => {
    setQuantity((prev) => Math.max(0.5, Math.round((prev + delta) * 10) / 10));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmAdd(selectedDateStr, {
      name: quantity === 1 ? food.name : `${quantity}x ${food.name}`,
      baseName: food.name,
      mealType,
      quantity: scaledMacros.quantity,
      calories: scaledMacros.calories,
      protein: scaledMacros.protein,
      carbs: scaledMacros.carbs,
      fat: scaledMacros.fat,
      serving: food.serving ? `${scaledMacros.quantity}x (${food.serving})` : `${scaledMacros.quantity} serving`,
      image: food.image,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-pop-in">
      <div className="bg-white w-full max-w-sm rounded-3xl border-2 border-ink-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header with Photo Preview */}
        <div className="relative h-36 bg-ink-100 overflow-hidden">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
            <div className="text-white">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md mb-1 ${
                  food.diet === 'non-veg' ? 'bg-red-600' : 'bg-green-600'
                }`}
              >
                {food.diet === 'non-veg' ? '🔴 Non-Veg' : '🟢 Pure Veg'}
              </span>
              <h3 className="text-sm font-black leading-tight drop-shadow-md">
                {food.name}
              </h3>
              <p className="text-[10px] opacity-90 font-bold drop-shadow-sm">
                Standard: {food.serving || '1 portion'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Target Meal Type */}
          <div>
            <label className="block text-[10px] font-black text-ink-500 uppercase tracking-wider mb-1.5">
              Select Meal
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'breakfast', label: 'Breakfast', emoji: '🥞' },
                { id: 'lunch', label: 'Lunch', emoji: '🥗' },
                { id: 'dinner', label: 'Dinner', emoji: '🍲' },
                { id: 'snack', label: 'Snacks', emoji: '☕' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMealType(m.id)}
                  className={`py-2 px-1 rounded-2xl text-[10px] font-black text-center transition-all ${
                    mealType === m.id
                      ? 'btn-panda-orange !py-1.5 !border-b-2'
                      : 'btn-panda-white !py-1.5'
                  }`}
                >
                  <span className="block text-sm leading-none mb-0.5">{m.emoji}</span>
                  <span className="truncate block">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector Stepper */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-black text-ink-500 uppercase tracking-wider">
                Select Quantity / Servings
              </label>
              <span className="text-xs font-black text-pandaOrange-600">
                {quantity} {quantity === 1 ? 'serving' : 'servings'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStep(-0.5)}
                className="btn-panda-white w-11 h-11 flex items-center justify-center text-lg font-black"
                disabled={quantity <= 0.5}
              >
                <Minus className="w-4 h-4 stroke-[3]" />
              </button>

              <input
                type="number"
                min="0.25"
                step="0.5"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0.25, parseFloat(e.target.value) || 1))}
                className="panda-input text-center text-base font-black flex-1 h-11 !py-0"
              />

              <button
                type="button"
                onClick={() => handleStep(0.5)}
                className="btn-panda-white w-11 h-11 flex items-center justify-center text-lg font-black"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Quick Quantity Chips */}
            <div className="flex gap-1.5 mt-2 justify-center">
              {[0.5, 1, 1.5, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuantity(num)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all ${
                    quantity === num
                      ? 'bg-pandaOrange-500 text-white shadow-sm'
                      : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                  }`}
                >
                  {num}x
                </button>
              ))}
            </div>
          </div>

          {/* Live Calculated Scaled Macros Card */}
          <div className="p-3 bg-pandaOrange-50/80 rounded-2xl border-2 border-pandaOrange-200 space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-black text-ink-700">Calculated Nutrition:</span>
              <span className="text-base font-black text-pandaOrange-600">
                🔥 {scaledMacros.calories} kcal
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center pt-1 border-t border-pandaOrange-200/60">
              <div className="p-1 rounded-lg bg-white/80">
                <p className="text-[9px] font-black text-green-700 uppercase">Protein</p>
                <p className="text-xs font-black text-ink-900">{scaledMacros.protein}g</p>
              </div>
              <div className="p-1 rounded-lg bg-white/80">
                <p className="text-[9px] font-black text-blue-700 uppercase">Carbs</p>
                <p className="text-xs font-black text-ink-900">{scaledMacros.carbs}g</p>
              </div>
              <div className="p-1 rounded-lg bg-white/80">
                <p className="text-[9px] font-black text-amber-700 uppercase">Fat</p>
                <p className="text-xs font-black text-ink-900">{scaledMacros.fat}g</p>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="btn-panda-orange w-full py-3.5 text-xs uppercase tracking-wide flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Add {quantity}x to {mealType.toUpperCase()}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

