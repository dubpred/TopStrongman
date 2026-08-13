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
          green: "#10B981",     // High-Visibility Athletic Emerald
          neon: "#34D399",      // Vibrant Mint Highlight
          red: "#EF4444",       // High-Contrast Athletic Crimson
          yellow: "#E2E8F0",    // Crisp Platinum Slate
          dark: "#090B0E",      // Deep Obsidian Background
          card: "#12161F",      // Dark Charcoal Surface
          border: "#252E3E",    // Defined Contrast Border
          accent: "#181E2B"     // Elevated Container Accent
        }
      },
      fontFamily: {
        display: ['Teko', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'dew-glow': '0 4px 16px rgba(16, 185, 129, 0.22)',
        'red-glow': '0 4px 16px rgba(239, 68, 68, 0.22)',
        'yellow-glow': '0 4px 16px rgba(226, 232, 240, 0.15)',
      }
    },
  },
  plugins: [],
}
