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
          DEFAULT: '#19c37d',
          dark: '#10a26d'
        },
        secondary: {
          DEFAULT: '#444654',
          dark: '#343541'
        }
      }
    },
  },
  plugins: [],
} 