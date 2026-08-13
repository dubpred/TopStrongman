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
          green: "#F59E0B",     // Primary Championship Amber/Gold
          neon: "#FBBF24",      // Bright Gold Highlight
          red: "#EF4444",       // Athletic Red
          yellow: "#CBD5E1",    // Platinum Silver
          dark: "#0B0D11",      // Deep Matte Charcoal Canvas
          card: "#131720",      // Slate Card Surface
          border: "#1E2535",    // Clean Structural Border
          accent: "#1B2232"     // Elevated Container Accent
        },
        tier: {
          1: "#F59E0B",         // Tier 1 Gold
          2: "#E2E8F0",         // Tier 2 Platinum/Silver
          3: "#D97706",         // Tier 3 Bronze/Copper
          4: "#64748B",         // Tier 4 Steel
          5: "#475569"          // Tier 5 Muted Charcoal
        }
      },
      fontFamily: {
        display: ['Teko', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'dew-glow': '0 4px 16px rgba(245, 158, 11, 0.20)',
        'gold-glow': '0 0 20px rgba(245, 158, 11, 0.25)',
        'silver-glow': '0 0 16px rgba(226, 232, 240, 0.20)',
        'bronze-glow': '0 0 16px rgba(217, 119, 6, 0.20)',
      }
    },
  },
  plugins: [],
}
