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
          green: "#F97316",     // Athletic Amber/Orange
          neon: "#FB923C",      // Bright Warm Orange
          red: "#EF4444",       // Athletic Red / Crimson
          blue: "#3B82F6",      // Electric Sapphire Blue
          yellow: "#60A5FA",    // Bright Slate Blue
          dark: "#0A0E17",      // Deep Midnight Navy Canvas
          card: "#111827",      // Slate Navy Card Surface
          border: "#1E293B",    // Steel Navy Border
          accent: "#162036"     // Elevated Navy Accent
        }
      },
      fontFamily: {
        display: ['Teko', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'dew-glow': '0 4px 16px rgba(249, 115, 22, 0.25)',
        'blue-glow': '0 4px 16px rgba(59, 130, 246, 0.25)',
        'red-glow': '0 4px 16px rgba(239, 68, 68, 0.22)',
        'yellow-glow': '0 4px 16px rgba(96, 165, 250, 0.20)',
      }
    },
  },
  plugins: [],
}
