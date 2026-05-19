/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#111827',
        muted: '#64748b',
        brand: '#2563eb',
        success: '#15803d',
        warning: '#b45309',
        danger: '#dc2626',
      },
    },
  },
  plugins: [],
};
