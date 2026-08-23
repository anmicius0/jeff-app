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
    },
  },
  plugins: [],
};
