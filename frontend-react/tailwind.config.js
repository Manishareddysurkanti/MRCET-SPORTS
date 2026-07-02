/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f172a',      // Slate 900
          card: '#1e293b',    // Slate 800
          border: '#334155',  // Slate 700
          text: '#f8fafc',    // Slate 50
          muted: '#94a3b8',   // Slate 400
        },
        primary: {
          light: '#6366f1',   // Indigo 500
          DEFAULT: '#4f46e5', // Indigo 600
          dark: '#3730a3',    // Indigo 800
        },
        secondary: {
          light: '#10b981',   // Emerald 500
          DEFAULT: '#059669', // Emerald 600
          dark: '#065f46',    // Emerald 800
        }
      }
    },
  },
  plugins: [],
}
