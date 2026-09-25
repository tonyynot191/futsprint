/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1e1b4b',    // Deep Indigo
          gold: '#fbbf24',    // FUT Gold Accent
          surface: '#f8fafc', // Light Slate Background
        }
      }
    },
  },
  plugins: [],
}