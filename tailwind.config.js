/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          '50': '#f0faff',
          '100': '#e0f2fe',
          '200': '#b9e6fe',
          '300': '#7cd4fd',
          '400': '#36befc',
          '500': '#0ba9f9',
          '600': '#028ee6',
          '700': '#0171b7',
          '800': '#025c94',
          '900': '#064d79',
          '950': '#04304e',
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.2s ease-out forwards',
      }
    },
  },
  plugins: [],
} 