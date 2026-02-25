/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme colors for AI ITRI NTIC EVENT 2026
        primary: '#3b82f6',
        secondary: '#93c5fd',
        dark: '#bfdbfe',
        light: '#0f172a',
        muted: '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
