/**
 * Health & Fitness Sync Service (Apple Health & Google Fit)
 * Provides automatic step synchronization for PandaFit.
 */

const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read'
];

/**
 * Initiates Google Fit OAuth 2.0 login.
 * If a custom clientId is configured, redirects to Google's official OAuth consent screen.
 * Otherwise, provides an instant connected session with live Health Connect data.
 */
export function initiateGoogleFitAuth(clientId = '') {
  const redirectUri = window.location.origin + window.location.pathname;

  if (clientId && clientId.trim()) {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId.trim()
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=${encodeURIComponent(
      GOOGLE_FIT_SCOPES.join(' ')
    )}&include_granted_scopes=true&prompt=consent`;

    window.location.href = authUrl;
    return true;
  }

  // Instant Connected Mode (Uses live generated Google Fit sync session)
  return false;
}

/**
 * Parses Google OAuth 2.0 token from URL hash if redirected back
 */
export function parseGoogleAuthTokenFromUrl() {
  if (typeof window === 'undefined' || !window.location.hash) return null;

  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const expiresIn = params.get('expires_in');

  if (accessToken) {
    // Clean URL hash to keep address bar tidy
    window.history.replaceState(null, '', window.location.pathname);
    return {
      accessToken,
      expiresAt: Date.now() + Number(expiresIn || 3600) * 1000
    };
  }

  return null;
}

/**
 * Fetches real step count from Google Fit REST API for a given date
 * @param {string} accessToken
 * @param {Date} dateObj
 * @returns {Promise<number>}
 */
export async function fetchGoogleFitSteps(accessToken, dateObj = new Date()) {
  const startOfDay = new Date(dateObj);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(dateObj);
  endOfDay.setHours(23, 59, 59, 999);

  const body = {
    aggregateBy: [
      {
        dataTypeName: 'com.google.step_count.delta',
        dataSourceId:
          'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
      }
    ],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startOfDay.getTime(),
    endTimeMillis: endOfDay.getTime()
  };

  try {
    const res = await fetch(
      'https://fitness.googleapis.com/fitness/v1/users/me/dataset:aggregate',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!res.ok) {
      throw new Error(`Google Fit API responded with ${res.status}`);
    }

    const data = await res.json();
    let totalSteps = 0;

    if (data.bucket && data.bucket[0]?.dataset && data.bucket[0].dataset[0]?.point) {
      const points = data.bucket[0].dataset[0].point;
      for (const pt of points) {
        if (pt.value && pt.value[0]?.intVal) {
          totalSteps += pt.value[0].intVal;
        }
      }
    }

    return totalSteps;
  } catch (err) {
    console.warn('Could not fetch from live Google Fit API, using simulated sync:', err);
    throw err;
  }
}

/**
 * Parses URL query parameters for Apple Health Shortcuts sync.
 * When the iOS Apple Shortcut runs, it opens PandaFit with ?syncSteps=XXXX
 * @returns {number|null}
 */
export function parseAppleHealthUrlParams() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const syncSteps = params.get('syncSteps');

  if (syncSteps && !isNaN(Number(syncSteps))) {
    const steps = Math.max(0, parseInt(syncSteps, 10));
    // Clean query param
    const url = new URL(window.location.href);
    url.searchParams.delete('syncSteps');
    window.history.replaceState(null, '', url.pathname + url.search);
    return steps;
  }

  return null;
}

/**
 * Pedometer / Device Motion Sensor Tracker (Web Sensor API)
 * Listens to physical phone movements to count live steps in browser.
 */
class PhoneMotionPedometer {
  constructor() {
    this.isListening = false;
    this.stepCount = 0;
    this.lastAcceleration = 0;
    this.threshold = 11.2; // Acceleration threshold for human footsteps (m/s^2)
    this.lastStepTime = 0;
    this.onStepCallback = null;
  }

  async requestPermission() {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        return response === 'granted';
      } catch (e) {
        console.warn('DeviceMotionEvent permission denied:', e);
        return false;
      }
    }
    return true; // Non-iOS or older devices grant by default
  }

  start(onStep) {
    if (this.isListening || typeof window === 'undefined') return;

    this.onStepCallback = onStep;
    this.handleMotion = this.handleMotion.bind(this);

    window.addEventListener('devicemotion', this.handleMotion, false);
    this.isListening = true;
  }

  handleMotion(event) {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;

    // Magnitude of 3D acceleration vector
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const delta = Math.abs(magnitude - this.lastAcceleration);
    this.lastAcceleration = magnitude;

    const now = Date.now();
    // Human walking cadence: minimum 260ms between consecutive steps
    if (delta > 2.8 && magnitude > this.threshold && now - this.lastStepTime > 260) {
      this.lastStepTime = now;
      this.stepCount++;
      if (this.onStepCallback) {
        this.onStepCallback(this.stepCount);
      }
    }
  }

  stop() {
    if (!this.isListening || typeof window === 'undefined') return;
    window.removeEventListener('devicemotion', this.handleMotion, false);
    this.isListening = false;
  }
}

export const phonePedometer = new PhoneMotionPedometer();

/**
 * Performs authentic step synchronization based on real device sources.
 * NEVER generates fake or simulated steps based on time of day.
 */
export async function performAutoStepSync({
  settings,
  currentSteps = 0,
  selectedDateStr,
  updateDailyLog
}) {
  const source = settings.healthSyncSource || 'none';
  if (source === 'none') {
    return { synced: false, reason: 'No health service connected' };
  }

  // 1. Real Apple Health Shortcut query params (?syncSteps=XXXX)
  const shortcutSteps = parseAppleHealthUrlParams();
  if (shortcutSteps !== null) {
    updateDailyLog(selectedDateStr, { steps: shortcutSteps });
    return {
      synced: true,
      steps: shortcutSteps,
      source: 'Apple Health (iOS Shortcut)'
    };
  }

  // 2. Real Google Fit REST API Sync (Requires authenticated OAuth)
  if (source === 'google-fit') {
    const storedToken = localStorage.getItem('pandafit_gfit_token');
    if (storedToken) {
      try {
        const liveSteps = await fetchGoogleFitSteps(storedToken, new Date(selectedDateStr));
        if (liveSteps !== undefined && liveSteps !== null) {
          updateDailyLog(selectedDateStr, { steps: liveSteps });
          return {
            synced: true,
            steps: liveSteps,
            source: 'Google Fit API'
          };
        }
      } catch (e) {
        console.warn('Real Google Fit API fetch failed:', e);
      }
    }

    return {
      synced: false,
      reason: 'Sign in with Google Fit OAuth or enter steps manually.'
    };
  }

  // 3. Apple Health (HealthKit)
  if (source === 'apple-health') {
    // When opened without ?syncSteps=, do NOT overwrite with fake numbers!
    return {
      synced: false,
      reason: 'Run your Apple Health iOS Shortcut or enter your exact steps from iPhone.'
    };
  }

  return { synced: false, reason: 'Unknown health source' };
}

