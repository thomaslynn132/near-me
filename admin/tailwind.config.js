/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
        secondary: '#ec4899',
        accent: '#06b6d4',
        background: '#0f172a',
        surface: '#1e293b',
        'surface-light': '#334155',
        border: '#475569',
      },
    },
  },
  plugins: [],
}
