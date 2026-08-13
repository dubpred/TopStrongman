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
          green: "#FFFFFF",     // Primary Stark White
          neon: "#F4F4F5",      // Off-white
          red: "#DC2626",       // Rogue Barbell Red Accent
          yellow: "#E4E4E7",    // Steel White
          dark: "#080808",      // Pure Industrial Iron Black
          card: "#121212",      // Matte Carbon Card Surface
          border: "#262626",    // Sharp Steel Hairline Border
          accent: "#1A1A1A"     // Elevated Gunmetal Panel
        },
        rogue: {
          black: "#080808",
          dark: "#121212",
          panel: "#181818",
          border: "#262626",
          borderStrong: "#404040",
          white: "#FFFFFF",
          gray: "#A1A1AA",
          muted: "#52525B",
          red: "#DC2626"
        }
      },
      fontFamily: {
        display: ['Teko', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'none': 'none',
      }
    },
  },
  plugins: [],
}
