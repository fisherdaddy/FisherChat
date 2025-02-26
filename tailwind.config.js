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
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#f8fafc', // slate-50
            a: {
              color: '#38bdf8', // sky-400
              '&:hover': {
                color: '#0ea5e9', // sky-500
              },
            },
            code: {
              color: '#e2e8f0', // slate-200
              backgroundColor: 'rgba(71, 85, 105, 0.2)', // slate-600 with opacity
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: 'rgba(15, 23, 42, 0.8)', // slate-900 with opacity
              color: '#e2e8f0', // slate-200
              padding: '1em',
              borderRadius: '0.5rem',
              overflowX: 'auto',
            },
            blockquote: {
              borderLeftColor: '#334155', // slate-700
              color: '#cbd5e1', // slate-300
            },
            h1: {
              color: '#f8fafc', // slate-50
            },
            h2: {
              color: '#f8fafc', // slate-50
            },
            h3: {
              color: '#f8fafc', // slate-50
            },
            h4: {
              color: '#f8fafc', // slate-50
            },
            strong: {
              color: '#f1f5f9', // slate-100
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 