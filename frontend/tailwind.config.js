/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dew: {
          green: "#F59E0B",     // Championship Amber/Gold
          neon: "#FBBF24",      // Bright Gold
          red: "#EF4444",       // Athletic Red / Crimson
          yellow: "#CBD5E1",    // Platinum / Silver Slate
          dark: "#0F1115",      // Refined Deep Graphite Background
          card: "#161920",      // Slate Card Surface
          border: "#1E222D",    // Subtle Hairline Border
          accent: "#262C3A"     // Elevated Graphite Accent
        }
      },
      fontFamily: {
        display: ['Teko', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'dew-glow': '0 4px 16px rgba(245, 158, 11, 0.20)',
        'red-glow': '0 4px 16px rgba(239, 68, 68, 0.20)',
        'yellow-glow': '0 4px 16px rgba(203, 213, 225, 0.20)',
      }
    },
  },
  plugins: [],
}
