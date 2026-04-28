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
          light: '#a78bfa', // Bright Violet
          DEFAULT: '#8b5cf6', // Violet 500
          dark: '#7c3aed', // Violet 600
        },
        accent: {
          light: '#22d3ee', // Cyan 400
          DEFAULT: '#06b6d4', // Cyan 500
          dark: '#0891b2', // Cyan 600
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

