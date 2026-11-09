import React, { useState } from 'react';

// Clean tight transparent cutouts from the official mascot sheet
const MASCOT_IMAGES = {
  workout: '/mascot/panda-workout.png',        // Dumbbell Strength
  running: '/mascot/panda-running.png',        // Cardio Running Hoodie
  hydration: '/mascot/panda-hydration.png',    // Shaker Bottle & Towel
  celebrating: '/mascot/panda-celebrating.png', // Gold Medal Champion
};

const MOTIVATION_QUOTES = [
  "You're doing incredible! Keep that momentum burning! 🔥",
  "Panda-San believes in you! Never break the daily streak! 🐾",
  "Consistency every day beats perfection once a week! 💪",
  "Champions show up every single day! Keep crushing it! 🏆",
  "Grab your water bottle, take a deep breath, and let's go! 💧",
  "Panda power is active! You are unstoppable today! ⚡",
];

export function PandaMascot({
  mood = 'workout', // 'workout' | 'running' | 'hydration' | 'celebrating'
  message = "Ready to conquer today's goals? Let's go!",
  subMessage = "",
  size = 'medium', // 'small' | 'medium' | 'large'
  showSpeechBubble = true,
  interactive = true,
}) {
  const [clickCount, setClickCount] = useState(0);
  const [temporaryCheer, setTemporaryCheer] = useState(null);

  const getPoseKey = () => {
    switch (mood) {
      case 'running':
      case 'cardio':
      case 'steps':
        return 'running';
      case 'celebrating':
      case 'dancing':
      case 'proud':
        return 'celebrating';
      case 'hydration':
      case 'recovery':
      case 'sleeping':
      case 'rest':
        return 'hydration';
      case 'workout':
      case 'motivating':
      case 'happy':
      default:
        return 'workout';
    }
  };

  const poseKey = getPoseKey();
  const mascotSrc = MASCOT_IMAGES[poseKey];

  const handlePandaClick = () => {
    if (!interactive) return;
    const next = clickCount + 1;
    setClickCount(next);
    const cheer = MOTIVATION_QUOTES[next % MOTIVATION_QUOTES.length];
    setTemporaryCheer(cheer);
    setTimeout(() => setTemporaryCheer(null), 4500);
  };

  const activeMessage = temporaryCheer || message;

  const sizeStyles = {
    small: {
      img: 'w-24 h-24 object-contain',
      badge: 'text-[9px] px-2 py-0.5',
    },
    medium: {
      img: 'w-44 h-44 sm:w-48 sm:h-48 object-contain',
      badge: 'text-[10px] px-3 py-1',
    },
    large: {
      img: 'w-56 h-56 sm:w-64 sm:h-64 object-contain',
      badge: 'text-xs px-3.5 py-1',
    },
  }[size] || {
    img: 'w-44 h-44 object-contain',
    badge: 'text-[10px] px-3 py-1',
  };

  return (
    <div className="flex flex-col items-center select-none w-full">
      {/* Harmonized 3D Speech Bubble (warm orange tone matching the panda) */}
      {showSpeechBubble && activeMessage && (
        <div className="panda-speech-bubble mb-3 max-w-[290px] w-full text-center z-10 animate-fade-in shadow-sm">
          <p className="text-xs sm:text-sm font-extrabold text-ink-900 leading-snug">
            {activeMessage}
          </p>
          {subMessage && !temporaryCheer && (
            <p className="text-[11px] text-pandaOrange-700 font-bold mt-0.5">
              {subMessage}
            </p>
          )}
        </div>
      )}

      {/* Floating Seamless Mascot (100% Transparent Background, No Box!) */}
      <div
        onClick={handlePandaClick}
        className={`relative ${interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} transition-transform duration-200 flex flex-col items-center`}
        title={interactive ? 'Tap Panda-San for motivation! 🐾' : ''}
      >
        <img
          src={mascotSrc}
          alt="PandaFit Official Mascot"
          className={`${sizeStyles.img} transition-all duration-300 animate-mascot-bounce`}
          loading="eager"
        />

        {/* Harmonized Status Badge */}
        <div className="mt-1 flex items-center gap-1.5 bg-pandaOrange-500 text-white font-extrabold uppercase tracking-wider rounded-full shadow-sm border border-pandaOrange-600 whitespace-nowrap px-3 py-0.5 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>
            {poseKey === 'running' && 'Speed Panda ⚡'}
            {poseKey === 'workout' && 'Power Panda 💪'}
            {poseKey === 'hydration' && 'Recovery Panda 💧'}
            {poseKey === 'celebrating' && 'Champion Panda 🏆'}
          </span>
        </div>
      </div>
    </div>
  );
}
