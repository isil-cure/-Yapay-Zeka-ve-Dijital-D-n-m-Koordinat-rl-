/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        togu: {
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#c7dcfe',
          300: '#a0c4fc',
          400: '#70a2f8',
          500: '#487ff3',
          600: '#2b5de8',
          700: '#1e44d3',
          800: '#1c38aa',
          900: '#1b3286',
          950: '#111e52',
        },
      },
    },
  },
  plugins: [],
}
