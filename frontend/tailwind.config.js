/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AI ITRI NTIC EVENT 2026 Color Palette
        primary: '#006AD7', // Professional Blue
        secondary: '#21277B', // Deep Navy
        accent: '#0EA5E9', // Light Blue Accent
        dark: '#0f172a',    // Background/Dark
        light: '#f8fafc',   // Foreground/Light
        muted: '#64748b',   // Muted Slate
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
