/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#08080A', // Deepest Obsidian void
          900: '#0D0D0F', // Main body background
          850: '#121215', // Base surface
          800: '#161618', // Elevated card surface
          750: '#1C1C20', // Card hover / elevated surface
          700: '#242429', // Card hairline border
          600: '#32323A', // Card highlight border
          500: '#48485C',
          400: '#6C6C82',
          300: '#9E9EB2',
        },
        ember: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FFA552', // Molten Gold-Amber
          500: '#FF6B35', // Primary Molten Amber-Ember Orange
          600: '#E85924', // Rich Ember
          700: '#C1440E', // Dim Ember Red (High Severity)
          800: '#9B3206', // Deep Ember Wine
          900: '#7C2605', // Burnt Charcoal Ember
          950: '#431202', // Deepest Dark Ember
        },
        jade: {
          300: '#6EE7B7',
          400: '#3FA796', // Muted Jade Green (Safe State)
          500: '#2E8B7D',
          600: '#1E6F62',
          700: '#13544A',
          800: '#0C3A33',
          900: '#062621',
          950: '#021613',
        },
        pearl: {
          50: '#FFFFFF', // Pure White
          100: '#FAFAFC', // Luminous Pearl
          200: '#F4F4F8', // High-contrast pearl text
          300: '#E2E8F0', // Soft Slate
          400: '#CBD5E1', // Muted Slate
          500: '#94A3B8', // Dim Slate
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'ember-glow': '0 0 25px -2px rgba(255, 107, 53, 0.45), 0 0 10px -2px rgba(255, 165, 82, 0.3)',
        'ember-sm': '0 0 14px -2px rgba(255, 107, 53, 0.35)',
        'ember-lg': '0 0 40px -4px rgba(255, 107, 53, 0.6)',
        'ember-red': '0 0 25px -2px rgba(193, 68, 14, 0.5)',
        'jade-glow': '0 0 20px -3px rgba(63, 167, 150, 0.35)',
        'obsidian-card': '0 10px 30px -10px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ember-pulse': 'emberPulse 1.8s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 15px rgba(255, 107, 53, 0.65))' },
          '50%': { opacity: 0.6, filter: 'drop-shadow(0 0 5px rgba(255, 107, 53, 0.25))' },
        },
        emberPulse: {
          '0%': { transform: 'scale(0.99)', opacity: 0.85 },
          '100%': { transform: 'scale(1.01)', opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}
