import React, { useState } from 'react';
import {
  X,
  Activity,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Zap,
  Flame,
  ShieldCheck,
  Footprints,
  Copy,
  Check,
  Info
} from 'lucide-react';
import {
  initiateGoogleFitAuth,
  phonePedometer,
  performAutoStepSync
} from '../services/healthSync';

export function HealthSyncModal({
  isOpen,
  onClose,
  settings,
  updateSettings,
  currentSteps = 0,
  selectedDateStr,
  updateDailyLog,
  onSuccessToast
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(
    settings.healthSyncSource === 'apple-health' ? 'apple' : 'google'
  );
  const [exactStepsInput, setExactStepsInput] = useState(String(currentSteps || ''));
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(settings.googleClientId || '');
  const [showAdvancedGoogle, setShowAdvancedGoogle] = useState(false);
  const [motionSensorActive, setMotionSensorActive] = useState(false);
  const [liveSensorSteps, setLiveSensorSteps] = useState(0);
  const [copiedShortcut, setCopiedShortcut] = useState(false);

  const isGoogleConnected = settings.healthSyncSource === 'google-fit';
  const isAppleConnected = settings.healthSyncSource === 'apple-health';

  const handleSaveExactSteps = (e) => {
    if (e) e.preventDefault();
    const finalSteps = Math.max(0, parseInt(exactStepsInput, 10) || 0);
    updateDailyLog(selectedDateStr, { steps: finalSteps });
    if (onSuccessToast) {
      onSuccessToast(`Updated steps to ${finalSteps.toLocaleString()}! Matches your phone 🐾`);
    }
    onClose();
  };

  const handleQuickAddSteps = (amount) => {
    const current = parseInt(exactStepsInput, 10) || 0;
    const nextVal = Math.max(0, current + amount);
    setExactStepsInput(String(nextVal));
  };

  const handleConnectGoogle = () => {
    if (googleClientId.trim()) {
      updateSettings({
        healthSyncSource: 'google-fit',
        googleClientId: googleClientId.trim(),
        autoSyncSteps: true
      });
      initiateGoogleFitAuth(googleClientId.trim());
      return;
    }

    updateSettings({
      healthSyncSource: 'google-fit',
      autoSyncSteps: false,
      lastStepsSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    if (onSuccessToast) {
      onSuccessToast('Google Fit source selected! Enter exact steps or provide OAuth credentials.');
    }
  };

  const handleConnectApple = () => {
    updateSettings({
      healthSyncSource: 'apple-health',
      autoSyncSteps: true,
      lastStepsSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    if (onSuccessToast) {
      onSuccessToast('Apple Health selected! Use iOS Shortcut or enter your exact phone steps 🍎');
    }
  };

  const handleDisconnect = () => {
    updateSettings({
      healthSyncSource: 'none',
      autoSyncSteps: false
    });
    if (motionSensorActive) {
      phonePedometer.stop();
      setMotionSensorActive(false);
    }
    if (onSuccessToast) {
      onSuccessToast('Health tracking disconnected.');
    }
  };

  const handleToggleMotionSensor = async () => {
    if (motionSensorActive) {
      phonePedometer.stop();
      setMotionSensorActive(false);
    } else {
      const granted = await phonePedometer.requestPermission();
      if (granted) {
        setMotionSensorActive(true);
        phonePedometer.start((stepCount) => {
          setLiveSensorSteps(stepCount);
          updateDailyLog(selectedDateStr, { steps: currentSteps + 1 });
        });
        if (onSuccessToast) {
          onSuccessToast('Live Phone Motion Pedometer is active! 🚶');
        }
      } else {
        alert('Motion permission was not granted by your browser.');
      }
    }
  };

  const handleCopyShortcutUrl = () => {
    const url = `${window.location.origin}/?syncSteps=`;
    navigator.clipboard.writeText(url);
    setCopiedShortcut(true);
    setTimeout(() => setCopiedShortcut(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-900/60 backdrop-blur-sm animate-pop-in">
      <div className="bg-white w-full max-w-md rounded-3xl border-2 border-ink-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-pandaOrange-500 text-white flex items-center justify-between border-b-4 border-pandaOrange-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
              <Footprints className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black leading-tight">Step Tracking & Phone Sync</h2>
              <p className="text-[11px] text-white/90 font-bold">Accurate steps matching your phone app</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* ── CARD 1: INSTANT EXACT STEP ENTRY (100% ACCURATE TO PHONE) ── */}
        <div className="p-4 bg-pandaOrange-50 border-b-2 border-pandaOrange-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-ink-900 uppercase tracking-wide flex items-center gap-1.5">
              <span>🎯 Enter Exact Steps From Phone</span>
            </label>
            <span className="text-[10px] font-black text-pandaOrange-700 bg-white px-2 py-0.5 rounded-full border border-pandaOrange-200">
              100% Accurate
            </span>
          </div>

          <form onSubmit={handleSaveExactSteps} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={exactStepsInput}
                  onChange={(e) => setExactStepsInput(e.target.value)}
                  placeholder="e.g. 5420"
                  className="panda-input text-xl font-black py-2.5 pl-3 pr-12 w-full bg-white"
                  min="0"
                  autoFocus
                />
                <span className="absolute right-3 top-3.5 text-xs font-black text-ink-400">
                  steps
                </span>
              </div>

              <button
                type="submit"
                className="btn-panda-orange !py-3 !px-4 text-xs font-black flex items-center gap-1 flex-shrink-0"
              >
                <span>Save Steps</span>
              </button>
            </div>

            {/* Quick Adjustment Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] font-extrabold text-ink-400 mr-1">Quick:</span>
              {[
                { label: '+500', val: 500 },
                { label: '+1,000', val: 1000 },
                { label: '+2,500', val: 2500 },
                { label: '+5,000', val: 5000 },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleQuickAddSteps(chip.val)}
                  className="btn-panda-white !py-0.5 !px-2 text-[10px] font-black"
                >
                  {chip.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setExactStepsInput('0')}
                className="text-[10px] font-bold text-ink-400 hover:text-red-600 ml-auto"
              >
                Reset to 0
              </button>
            </div>
          </form>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 border-b-2 border-ink-100 bg-ink-50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('apple')}
            className={`py-2 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'apple'
                ? 'bg-white shadow-sm border-2 border-ink-200 text-ink-900'
                : 'text-ink-400 hover:text-ink-800'
            }`}
          >
            <span className="text-base">🍎</span>
            <span>Apple Health</span>
            {isAppleConnected && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`py-2 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'google'
                ? 'bg-white shadow-sm border-2 border-ink-200 text-ink-900'
                : 'text-ink-400 hover:text-ink-800'
            }`}
          >
            <span className="text-base">🟢</span>
            <span>Google Fit</span>
            {isGoogleConnected && (
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'apple' ? (
            /* ── APPLE HEALTH TAB ── */
            <div className="space-y-3.5">
              <div className="panda-card p-3.5 bg-red-50/60 border border-red-200 space-y-2">
                <div className="flex items-center gap-2 text-red-900 font-black text-xs">
                  <span className="text-base">📲</span>
                  <span>How Apple Health Syncs with Web Apps</span>
                </div>
                <p className="text-[11px] text-ink-600 font-bold leading-relaxed">
                  For user privacy, iOS Safari does not let any web app silently read Apple HealthKit without an iOS Shortcut.
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-red-100 text-[11px] text-ink-800 space-y-1">
                  <p className="font-black text-red-800">1-Tap Apple Shortcut Setup:</p>
                  <ol className="list-decimal pl-4 space-y-1 font-semibold text-[10px] text-ink-600">
                    <li>Open the <strong>Shortcuts</strong> app on your iPhone.</li>
                    <li>Add action: <em>Find Health Samples</em> (Type: Steps, Date: Today).</li>
                    <li>Add action: <em>Open URL</em> with your PandaFit link + steps.</li>
                  </ol>
                </div>

                <button
                  type="button"
                  onClick={handleCopyShortcutUrl}
                  className="btn-panda-white w-full !py-2 text-xs flex items-center justify-center gap-1.5 font-black text-ink-800"
                >
                  {copiedShortcut ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span>Copied Sync URL to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-pandaOrange-500" />
                      <span>Copy iOS Shortcut Sync URL</span>
                    </>
                  )}
                </button>
              </div>

              {!isAppleConnected ? (
                <button
                  type="button"
                  onClick={handleConnectApple}
                  className="btn-panda-orange w-full py-2.5 text-xs uppercase tracking-wide flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>Set Apple Health as Primary Source</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="w-full py-2 text-xs font-bold text-ink-400 hover:text-red-600 rounded-xl transition-colors"
                >
                  Disconnect Apple Health
                </button>
              )}
            </div>
          ) : (
            /* ── GOOGLE FIT TAB ── */
            <div className="space-y-3.5">
              <div className="panda-card p-3.5 bg-green-50/60 border border-green-200 space-y-2">
                <div className="flex items-center gap-2 text-green-900 font-black text-xs">
                  <span className="text-base">🟢</span>
                  <span>Google Fit / Health Connect API</span>
                </div>
                <p className="text-[11px] text-ink-600 font-bold leading-relaxed">
                  Connect via Google OAuth to fetch step data directly from Google Fitness REST API.
                </p>

                {/* Advanced OAuth Client ID Option */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedGoogle(!showAdvancedGoogle)}
                    className="text-[11px] font-black text-ink-500 hover:text-pandaOrange-600 underline"
                  >
                    {showAdvancedGoogle ? 'Hide Custom Client ID' : '⚙️ Custom Google OAuth Client ID'}
                  </button>

                  {showAdvancedGoogle && (
                    <div className="mt-2 text-left p-2.5 bg-white rounded-xl border border-ink-200 animate-pop-in space-y-1.5">
                      <label className="block text-[10px] font-black text-ink-600 uppercase">
                        Google Cloud Client ID
                      </label>
                      <input
                        type="text"
                        value={googleClientId}
                        onChange={(e) => setGoogleClientId(e.target.value)}
                        placeholder="e.g. xxxxx.apps.googleusercontent.com"
                        className="panda-input text-xs font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>

              {!isGoogleConnected ? (
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  className="btn-panda-green w-full py-2.5 text-xs uppercase tracking-wide flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>Set Google Fit as Primary Source</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="w-full py-2 text-xs font-bold text-ink-400 hover:text-red-600 rounded-xl transition-colors"
                >
                  Disconnect Google Fit
                </button>
              )}
            </div>
          )}

          {/* Native Device Motion Sensor (Pedometer) */}
          <div className="panda-card p-3 bg-ink-50 space-y-2 border border-ink-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-pandaOrange-500" />
                <span className="text-xs font-black text-ink-900">Live Phone Accelerometer Pedometer</span>
              </div>
              <button
                type="button"
                onClick={handleToggleMotionSensor}
                className={`text-[10px] font-black px-2.5 py-1 rounded-xl transition-all ${
                  motionSensorActive
                    ? 'btn-panda-green !py-1'
                    : 'btn-panda-white !py-1'
                }`}
              >
                {motionSensorActive ? 'ACTIVE 🟢' : 'ENABLE'}
              </button>
            </div>
            <p className="text-[10px] text-ink-500 font-bold leading-normal">
              Counts physical footsteps in real-time when walking with your phone in hand or pocket.
            </p>
            {motionSensorActive && (
              <p className="text-[11px] font-black text-green-700">
                Live sensor footsteps counted: +{liveSensorSteps}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
