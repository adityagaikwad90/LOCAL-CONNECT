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
          light: '#f3c4a6',
          DEFAULT: '#e8a27d',
          dark: '#bf7855',
        },
        accent: {
          light: '#c5ddc7',
          DEFAULT: '#88b492',
          dark: '#5f896a',
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

