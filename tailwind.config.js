/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ffffff',
          hover: '#e5e5e5',
          focus: '#cccccc',
          dark: '#111111',
        },
        'on-primary': '#111111',
        ink: {
          DEFAULT: '#ffffff',
          muted: '#cacacb',
          subtle: '#9e9ea0',
          tertiary: '#707072',
          charcoal: '#39393b',
          ash: '#4b4b4d',
        },
        canvas: '#0b0b0c',
        'soft-cloud': '#18181b',
        surface: {
          1: '#141416',
          2: '#1c1c1f',
          3: '#242428',
          4: '#2c2c32',
        },
        hairline: {
          DEFAULT: '#27272a',
          strong: '#3f3f46',
          soft: '#1f1f23',
        },
        sale: {
          DEFAULT: '#d30005',
          deep: '#780700',
        },
        success: {
          DEFAULT: '#1eaa52',
          deep: '#007d48',
        },
        'semantic-success': '#1eaa52',
        accent: {
          teal: '#0a7281',
          pink: '#ed1aa0',
          purple: '#beaffd',
          info: '#1151ff',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Bebas Neue"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        xs: '4px',
        sm: '18px',
        md: '24px',
        lg: '30px',
        xl: '36px',
        pill: '9999px',
        full: '9999px',
      },
      spacing: {
        xxs: '2px',
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '18px',
        xl: '24px',
        xxl: '30px',
        section: '48px',
      },
      transitionTimingFunction: {
        'spring-smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring-snappy': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'apple-ease': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      keyframes: {
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'tap-pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'number-tick': {
          '0%': { opacity: '0.6', transform: 'translateY(-2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'scale-in': 'scale-in 0.12s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-slide-up': 'fade-slide-up 0.14s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-slide-down': 'fade-slide-down 0.14s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'tap-pop': 'tap-pop 0.1s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'number-tick': 'number-tick 0.08s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulse-subtle 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
