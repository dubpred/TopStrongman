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
          green: "#69BE28",
          neon: "#76BD23",
          red: "#E31837",
          yellow: "#D2E000",
          dark: "#090F09",
          card: "#121C12",
          border: "#1F331F",
          accent: "#2A472A"
        }
      },
      fontFamily: {
        display: ['Teko', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'dew-glow': '0 0 25px rgba(105, 190, 40, 0.4)',
        'red-glow': '0 0 25px rgba(227, 24, 55, 0.4)',
        'yellow-glow': '0 0 25px rgba(210, 224, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
