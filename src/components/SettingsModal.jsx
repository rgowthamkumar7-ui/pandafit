import React, { useState } from 'react';
import { X, Save, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  onLoadSampleData,
  onClearAllData,
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: settings.name || 'Panda Hero',
    weightUnit: settings.weightUnit || 'kg',
    calorieGoal: settings.calorieGoal || 2000,
    proteinGoal: settings.proteinGoal || 140,
    carbsGoal: settings.carbsGoal || 200,
    fatGoal: settings.fatGoal || 65,
    stepsGoal: settings.stepsGoal || 8000,
  });

  const [savedToast, setSavedToast] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      calorieGoal: Number(formData.calorieGoal),
      proteinGoal: Number(formData.proteinGoal),
      carbsGoal: Number(formData.carbsGoal),
      fatGoal: Number(formData.fatGoal),
      stepsGoal: Number(formData.stepsGoal),
    });
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-duoGray-700/50 backdrop-blur-sm animate-pop-in">
      <div className="bg-white w-full max-w-md rounded-3xl border-2 border-duoGray-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-pandaOrange-500 text-white flex items-center justify-between border-b-4 border-pandaOrange-700">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <div>
              <h2 className="text-base font-black">Preferences & Daily Goals</h2>
              <p className="text-xs text-white/90 font-bold">Tune your PandaFit journey</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {savedToast && (
            <div className="p-3 bg-duo-greenPale border-2 border-duo-green text-duo-green rounded-2xl flex items-center gap-2 font-black animate-pop-in">
              <CheckCircle2 className="w-4 h-4 text-duo-green" />
              Settings saved successfully! 🌟
            </div>
          )}

          {/* User Name */}
          <div>
            <label className="block text-xs font-black text-duoGray-600 uppercase tracking-wider mb-1">
              Your Hero Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="duo-input"
              placeholder="e.g. Alex 🐾"
            />
          </div>

          {/* Weight Unit */}
          <div>
            <label className="block text-xs font-black text-duoGray-600 uppercase tracking-wider mb-1">
              Weight Unit
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, weightUnit: 'kg' })}
                className={`py-2 rounded-2xl font-black border-2 transition-all ${
                  formData.weightUnit === 'kg'
                    ? 'btn-panda-orange !py-2'
                    : 'btn-panda-white !py-2'
                }`}
              >
                Kilograms (kg)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, weightUnit: 'lbs' })}
                className={`py-2 rounded-2xl font-black border-2 transition-all ${
                  formData.weightUnit === 'lbs'
                    ? 'btn-panda-orange !py-2'
                    : 'btn-panda-white !py-2'
                }`}
              >
                Pounds (lbs)
              </button>
            </div>
          </div>

          {/* Daily Goals */}
          <div className="pt-2 border-t-2 border-duoGray-100">
            <h3 className="text-xs font-black text-duoGray-600 uppercase tracking-wider mb-3">
              Daily Target Goals
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-duoGray-400 mb-1">
                  🔥 Calorie Goal (kcal)
                </label>
                <input
                  type="number"
                  value={formData.calorieGoal}
                  onChange={(e) => setFormData({ ...formData, calorieGoal: e.target.value })}
                  className="duo-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-duoGray-400 mb-1">
                  🚶 Steps Goal
                </label>
                <input
                  type="number"
                  value={formData.stepsGoal}
                  onChange={(e) => setFormData({ ...formData, stepsGoal: e.target.value })}
                  className="duo-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-duoGray-400 mb-1">
                  🍗 Protein Goal (g)
                </label>
                <input
                  type="number"
                  value={formData.proteinGoal}
                  onChange={(e) => setFormData({ ...formData, proteinGoal: e.target.value })}
                  className="duo-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-duoGray-400 mb-1">
                  🥖 Carbs Goal (g)
                </label>
                <input
                  type="number"
                  value={formData.carbsGoal}
                  onChange={(e) => setFormData({ ...formData, carbsGoal: e.target.value })}
                  className="duo-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-duoGray-400 mb-1">
                  🥑 Fat Goal (g)
                </label>
                <input
                  type="number"
                  value={formData.fatGoal}
                  onChange={(e) => setFormData({ ...formData, fatGoal: e.target.value })}
                  className="duo-input"
                />
              </div>
            </div>
          </div>

          {/* Demo Data & Reset */}
          <div className="pt-3 border-t-2 border-duoGray-100 space-y-2">
            <h3 className="text-xs font-black text-duoGray-600 uppercase tracking-wider mb-2">
              Data Quest Management
            </h3>

            <button
              type="button"
              onClick={() => {
                onLoadSampleData();
                alert('Loaded 7 days of realistic records! 🌟');
                onClose();
              }}
              className="btn-duo-blue w-full py-2.5 text-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-duoYellow fill-duoYellow" />
              Load 7-Day Demo Records
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all fitness diary data? This will clear all entries from localStorage.')) {
                  onClearAllData();
                  alert('Data reset successfully.');
                  onClose();
                }
              }}
              className="w-full py-2 px-3 text-duoRed hover:bg-duoRed-light rounded-2xl font-bold flex items-center justify-center gap-1.5 transition-colors text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset & Clear All Data
            </button>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              className="btn-panda-orange w-full py-3.5 text-sm uppercase tracking-wide flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
