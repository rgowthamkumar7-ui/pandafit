/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Orange Master Palette (Harmonized with Panda's workout gear)
        pandaOrange: {
          50: '#FFF8F1',
          100: '#FEEDDD',
          200: '#FDD8B5',
          300: '#FCBE87',
          400: '#FB9A52',
          500: '#F97316', // Primary Brand Orange
          600: '#EA580C', // 3D Bottom Bevel Shadow
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Bamboo Energy Green (Fresh Grass / Completed Quests)
        bamboo: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          500: '#22C55E',
          600: '#16A34A', // Primary Green Accent
          700: '#15803D', // Green 3D shadow
        },
        // Fresh Sky Blue (Hydration & Metrics)
        pandaBlue: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          500: '#0EA5E9',
          600: '#0284C7',
        },
        // High-Contrast Friendly Neutrals
        ink: {
          900: '#1A1C20', // Bold headings
          800: '#2D3139', // Body text
          500: '#64748B', // Supporting labels
          400: '#94A3B8', // Subdued metadata
          200: '#E2E8F0', // 3D borders
          100: '#F1F5F9', // Card background surfaces
          50: '#F8FAFC',  // App canvas
        },
        // Gamified Helper Aliases (Harmonized with Panda Palette)
        duoGray: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#1E293B',
        },
        'duo-green': '#16A34A',
        'duo-greenPale': '#F0FDF4',
        'duo-greenLight': '#BBF7D0',
        'duo-greenDark': '#15803D',
        duoOrange: {
          DEFAULT: '#F97316',
          light: '#FFF8F1',
        },
        duoBlue: {
          DEFAULT: '#0EA5E9',
          light: '#F0F9FF',
        },
        duoYellow: {
          DEFAULT: '#EAB308',
          light: '#FEFCE8',
        },
        duoRed: {
          DEFAULT: '#EF4444',
          light: '#FEF2F2',
        },
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '22px',
        '3xl': '28px',
        'full': '9999px',
      },
      fontFamily: {
        sans: ['"Nunito"', '"Quicksand"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'mascot-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(0.98)' },
        },
      },
      animation: {
        'mascot-bounce': 'mascot-bounce 2.2s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
