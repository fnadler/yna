import type { Config } from 'tailwindcss'

/**
 * Tokens portados de yna-care-hub-design-system.html (fonte única de verdade).
 * Valores dependentes de tema vivem como CSS vars em src/index.css
 * (:root = light · .dark = dark) e são referenciados aqui via var().
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4749A8',
          600: '#3A3C8E',
          400: '#6C6FC2',
          300: '#9395D6',
          200: '#B8B9E5',
          100: 'var(--yna-primary-100)',
          50: 'var(--yna-primary-50)',
        },
        lavender: { DEFAULT: '#DCD4F0', soft: '#EDE8F7' },
        pink: { DEFAULT: '#F2A8C5', soft: '#FBE2EC' },
        yellow: { DEFAULT: '#FBC85E', soft: '#FDEEC8' },
        cream: '#F4F1F4',
        success: { DEFAULT: '#4EA88B', bg: 'var(--success-bg)' },
        warning: { DEFAULT: '#E8A640', bg: 'var(--warning-bg)', ink: 'var(--warning-ink)' },
        danger: { DEFAULT: '#D75A6E', bg: 'var(--danger-bg)', ink: 'var(--danger-ink)' },
        info: { DEFAULT: '#4749A8', bg: 'var(--info-bg)' },
        page: 'var(--page-bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface-2)',
          hover: 'var(--surface-hover)',
          sunken: 'var(--surface-sunken)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        ink: {
          DEFAULT: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        DEFAULT: '14px',
        lg: '20px',
        xl: '28px',
        '2xl': '36px',
        pill: '9999px',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      backgroundImage: {
        'yna-gradient':
          'linear-gradient(135deg, #DCD4F0 0%, #B8B9E5 25%, #F2A8C5 65%, #FBC85E 100%)',
        'yna-gradient-soft':
          'linear-gradient(135deg, #EDE8F7 0%, #F4ECF2 50%, #FDEEC8 100%)',
        'yna-gradient-radial':
          'radial-gradient(circle at 70% 30%, #4749A8 0%, #9395D6 30%, #F2A8C5 65%, #FBC85E 100%)',
        'yna-gradient-button':
          'linear-gradient(120deg, #4749A8 0%, #6A6CC0 50%, #F2A8C5 100%)',
      },
      transitionTimingFunction: {
        organic: 'cubic-bezier(.34, 1.2, .64, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
