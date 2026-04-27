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
          light: '#8B5CF6', // Violet 500
          DEFAULT: '#6D28D9', // Violet 700
          dark: '#4C1D95', // Violet 900
        },
        accent: {
          light: '#60A5FA', // Blue 400
          DEFAULT: '#2563EB', // Blue 600
          dark: '#1E40AF', // Blue 800
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

