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
          light: '#fb7185', // Rose 400
          DEFAULT: '#e11d48', // Rose 600
          dark: '#be123c', // Rose 700
        },
        accent: {
          light: '#fbbf24', // Amber 400
          DEFAULT: '#f59e0b', // Amber 500
          dark: '#d97706', // Amber 600
        },
        vibrant: {
          pink: '#f472b6',
          orange: '#fb923c',
          lime: '#a3e635',
          indigo: '#6366f1'
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
      },
    },
  },
  plugins: [],
}

