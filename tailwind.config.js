/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        legado: {
          gold: '#D4B74C',
          darkGold: '#8A7A42',
          cream: '#F5F3E4',
          lightCream: '#F8F6E9',
          softPink: '#FFCACB',
        },
      },
      fontFamily: {
        sans: ['Nunito Sans', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
      boxShadow: {
        soft: '0 10px 25px -5px rgba(212, 183, 76, 0.1), 0 10px 10px -5px rgba(212, 183, 76, 0.04)',
      },
      animation: {
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'pulse-gentle': 'pulse 3s infinite',
      },
      keyframes: {
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};