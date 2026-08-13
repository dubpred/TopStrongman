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
          green: "#1B4D3E",     // Deep Forest Green (Primary Contrast)
          neon: "#2D6A4F",      // Emerald Pine
          red: "#DC2626",       // Crimson Accent
          yellow: "#475569",    // Muted Slate
          dark: "#F8FAFC",      // Off-White / Crisp Canvas
          card: "#FFFFFF",      // Clean Card Surface
          border: "#D5E2D9",    // Sage Hairline Border
          accent: "#EBF2EE"     // Soft Sage Container Surface
        }
      },
      fontFamily: {
        display: ['Teko', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'dew-glow': '0 4px 16px rgba(27, 77, 62, 0.15)',
        'red-glow': '0 4px 16px rgba(220, 38, 38, 0.15)',
        'yellow-glow': '0 4px 16px rgba(71, 85, 105, 0.15)',
      }
    },
  },
  plugins: [],
}
