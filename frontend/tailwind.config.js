/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Named palette tokens (Swappable for AMPS branding)
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#102a43',
          900: '#0a192f',
          950: '#060d1b',
        },
        gold: {
          50: '#fffbe6',
          100: '#fff1b8',
          200: '#ffe58f',
          300: '#ffd666',
          400: '#ffc069',
          500: '#d97706',
          600: '#f59e0b',
          700: '#b45309',
          800: '#78350f',
          900: '#451a03',
        },
        maroon: {
          50: '#fdf2f2',
          100: '#fde8e8',
          200: '#fbd5d5',
          300: '#f8b4b4',
          400: '#f98080',
          500: '#991b1b',
          600: '#800000',
          700: '#6b0000',
          800: '#520000',
          900: '#380000',
        },
        // Semantic aliases mapping to school design system
        brand: {
          primary: '#0a192f',    // Navy 900
          secondary: '#d97706',  // Gold 500
          accent: '#800000',     // Maroon 600
          dark: '#060d1b',
          light: '#f0f4f8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        cinzel: ['Cinzel', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
