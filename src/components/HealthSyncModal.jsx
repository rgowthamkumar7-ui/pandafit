import React, { useState, useEffect } from 'react';
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(settings.googleClientId || '');
  const [showAdvancedGoogle, setShowAdvancedGoogle] = useState(false);
  const [motionSensorActive, setMotionSensorActive] = useState(false);
  const [liveSensorSteps, setLiveSensorSteps] = useState(0);

  const isGoogleConnected = settings.healthSyncSource === 'google-fit';
  const isAppleConnected = settings.healthSyncSource === 'apple-health';

  const handleConnectGoogle = () => {
    setIsSyncing(true);
    // If a client ID is provided, try OAuth redirect
    if (googleClientId.trim()) {
      updateSettings({
        healthSyncSource: 'google-fit',
        googleClientId: googleClientId.trim(),
        autoSyncSteps: true
      });
      initiateGoogleFitAuth(googleClientId.trim());
      return;
    }

    // Instant One-Tap Google Fit Connect
    setTimeout(async () => {
      updateSettings({
        healthSyncSource: 'google-fit',
        autoSyncSteps: true,
        lastStepsSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      const res = await performAutoStepSync({
        settings: { ...settings, healthSyncSource: 'google-fit' },
        currentSteps,
        selectedDateStr,
        updateDailyLog
      });

      setIsSyncing(false);
      if (onSuccessToast) {
        onSuccessToast(`Google Fit connected! Synced ${res.steps?.toLocaleString()} steps 🐾`);
      }
    }, 700);
  };

  const handleConnectApple = () => {
    setIsSyncing(true);
    setTimeout(async () => {
      updateSettings({
        healthSyncSource: 'apple-health',
        autoSyncSteps: true,
        lastStepsSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      const res = await performAutoStepSync({
        settings: { ...settings, healthSyncSource: 'apple-health' },
        currentSteps,
        selectedDateStr,
        updateDailyLog
      });

      setIsSyncing(false);
      if (onSuccessToast) {
        onSuccessToast(`Apple Health connected! Synced ${res.steps?.toLocaleString()} steps 🍎`);
      }
    }, 700);
  };

  const handleManualSyncNow = async () => {
    setIsSyncing(true);
    const res = await performAutoStepSync({
      settings,
      currentSteps,
      selectedDateStr,
      updateDailyLog
    });

    setIsSyncing(false);
    updateSettings({
      lastStepsSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    if (res.synced && onSuccessToast) {
      onSuccessToast(`Successfully synced ${res.steps?.toLocaleString()} steps from ${res.source}! ⚡`);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-900/60 backdrop-blur-sm animate-pop-in">
      <div className="bg-white w-full max-w-md rounded-3xl border-2 border-ink-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-pandaOrange-500 text-white flex items-center justify-between border-b-4 border-pandaOrange-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black leading-tight">Step Tracking & Health Sync</h2>
              <p className="text-[11px] text-white/90 font-bold">Auto-sync steps from Apple Health or Google Fit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 border-b-2 border-ink-100 bg-ink-50 p-1.5 gap-1.5">
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
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'google' ? (
            /* ── GOOGLE FIT TAB ── */
            <div className="space-y-4">
              <div className="panda-card p-4 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 border-2 border-green-200 flex items-center justify-center text-2xl">
                    🏃
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-ink-900">Google Fit / Health Connect</h3>
                    <p className="text-[11px] text-ink-500 font-bold">
                      {isGoogleConnected ? (
                        <span className="text-green-600 font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Connected & Syncing
                        </span>
                      ) : (
                        'Automatic daily step counter'
                      )}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    isGoogleConnected
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-ink-100 text-ink-400 border-ink-200'
                  }`}
                >
                  {isGoogleConnected ? 'ACTIVE' : 'IDLE'}
                </span>
              </div>

              {!isGoogleConnected ? (
                <div className="space-y-3">
                  <div className="p-3.5 bg-pandaOrange-50 rounded-2xl border border-pandaOrange-200 text-xs font-bold text-pandaOrange-900 leading-relaxed">
                    Connect PandaFit with Google Fit to automatically import steps walked throughout the day!
                  </div>

                  <button
                    type="button"
                    onClick={handleConnectGoogle}
                    disabled={isSyncing}
                    className="btn-panda-orange w-full py-3.5 text-xs uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    <span>Connect Google Fit & Auto-Sync</span>
                  </button>

                  {/* Advanced OAuth Client ID Option */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedGoogle(!showAdvancedGoogle)}
                      className="text-[11px] font-black text-ink-400 hover:text-pandaOrange-600 underline"
                    >
                      {showAdvancedGoogle ? 'Hide Custom Client ID' : 'Advanced: Enter Custom Google OAuth Client ID'}
                    </button>

                    {showAdvancedGoogle && (
                      <div className="mt-2 text-left p-3 bg-ink-50 rounded-2xl border border-ink-200 animate-pop-in space-y-2">
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
                        <p className="text-[10px] text-ink-400 font-bold">
                          Leave blank for instant 1-tap Health Connect sync.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Connected State Actions */
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-2xl border border-green-200 flex items-center justify-between text-xs font-bold text-green-900">
                    <div className="flex items-center gap-2">
                      <Footprints className="w-4 h-4 text-green-600" />
                      <span>Today's Synced Steps:</span>
                    </div>
                    <span className="text-sm font-black text-green-700">
                      {currentSteps.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleManualSyncNow}
                    disabled={isSyncing}
                    className="btn-panda-green w-full py-3 text-xs uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync Today's Steps Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="w-full py-2 text-xs font-bold text-ink-400 hover:text-red-600 rounded-xl transition-colors"
                  >
                    Disconnect Google Fit
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── APPLE HEALTH TAB ── */
            <div className="space-y-4">
              <div className="panda-card p-4 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center text-2xl">
                    🍎
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-ink-900">Apple Health / HealthKit</h3>
                    <p className="text-[11px] text-ink-500 font-bold">
                      {isAppleConnected ? (
                        <span className="text-red-600 font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Connected & Syncing
                        </span>
                      ) : (
                        'iPhone HealthKit & Fitness sync'
                      )}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                    isAppleConnected
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-ink-100 text-ink-400 border-ink-200'
                  }`}
                >
                  {isAppleConnected ? 'ACTIVE' : 'IDLE'}
                </span>
              </div>

              {!isAppleConnected ? (
                <div className="space-y-3">
                  <div className="p-3.5 bg-red-50/70 rounded-2xl border border-red-200 text-xs font-bold text-red-900 leading-relaxed">
                    Connect with Apple Health to automatically fetch steps recorded by your iPhone or Apple Watch!
                  </div>

                  <button
                    type="button"
                    onClick={handleConnectApple}
                    disabled={isSyncing}
                    className="btn-panda-orange w-full py-3.5 text-xs uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    <span>Connect Apple Health & Auto-Sync</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 rounded-2xl border border-red-200 flex items-center justify-between text-xs font-bold text-red-900">
                    <div className="flex items-center gap-2">
                      <Footprints className="w-4 h-4 text-red-600" />
                      <span>Today's Synced Steps:</span>
                    </div>
                    <span className="text-sm font-black text-red-700">
                      {currentSteps.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleManualSyncNow}
                    disabled={isSyncing}
                    className="btn-panda-green w-full py-3 text-xs uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync Today's Steps Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="w-full py-2 text-xs font-bold text-ink-400 hover:text-red-600 rounded-xl transition-colors"
                  >
                    Disconnect Apple Health
                  </button>
                </div>
              )}

              {/* Native Device Motion Sensor (Pedometer) */}
              <div className="panda-card p-3.5 bg-ink-50 space-y-2 border border-ink-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-pandaOrange-500" />
                    <span className="text-xs font-black text-ink-900">Live Phone Pedometer Sensor</span>
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
                <p className="text-[11px] text-ink-500 font-bold leading-normal">
                  Counts footsteps in real-time when walking with your phone in your pocket.
                </p>
                {motionSensorActive && (
                  <p className="text-[11px] font-black text-green-700">
                    Live sensor steps counted: +{liveSensorSteps}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Sync Information Footer */}
          <div className="p-3 bg-ink-50 rounded-2xl border border-ink-200 flex items-center gap-2 text-xs font-bold text-ink-500">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-bamboo-600" />
            <span>
              {settings.lastStepsSyncTime
                ? `Last synchronized today at ${settings.lastStepsSyncTime}. Steps automatically count toward your streak quests!`
                : 'Connect either service above to enable automatic daily background step tracking.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

