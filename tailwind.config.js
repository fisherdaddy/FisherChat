/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
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
            color: '#0f172a',
            a: {
              color: '#0284c7',
              '&:hover': {
                color: '#0369a1',
              },
            },
            code: {
              color: '#1e293b',
              backgroundColor: 'rgba(203, 213, 225, 0.2)',
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
              backgroundColor: 'rgba(241, 245, 249, 0.8)',
              color: '#1e293b',
              padding: '1em',
              borderRadius: '0.5rem',
              overflowX: 'auto',
            },
            blockquote: {
              borderLeftColor: '#cbd5e1',
              color: '#475569',
            },
            h1: {
              color: '#0f172a',
            },
            h2: {
              color: '#0f172a',
            },
            h3: {
              color: '#0f172a',
            },
            h4: {
              color: '#0f172a',
            },
            strong: {
              color: '#0f172a',
            },
          },
        },
        dark: {
          css: {
            color: '#f8fafc',
            a: {
              color: '#38bdf8',
              '&:hover': {
                color: '#0ea5e9',
              },
            },
            code: {
              color: '#e2e8f0',
              backgroundColor: 'rgba(71, 85, 105, 0.2)',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            pre: {
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              color: '#e2e8f0',
              padding: '1em',
              borderRadius: '0.5rem',
              overflowX: 'auto',
            },
            blockquote: {
              borderLeftColor: '#334155',
              color: '#cbd5e1',
            },
            h1: {
              color: '#f8fafc',
            },
            h2: {
              color: '#f8fafc',
            },
            h3: {
              color: '#f8fafc',
            },
            h4: {
              color: '#f8fafc',
            },
            strong: {
              color: '#f1f5f9',
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