/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,astro}",
  ],
  theme: {
    extend: {
      colors: {
        // Japanese-inspired color palette
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#334e68', // ai-iro (indigo) - primary brand color
          800: '#1e3a5f',
          900: '#102a43',
        },
        cream: {
          50: '#fcf9f3',  // washi (paper) - lightest
          100: '#f5f3ef',
          200: '#e8e4dc',
          300: '#d9d3c7',
          400: '#c5bba8',
        },
        charcoal: {
          400: '#627d98',
          500: '#486581',
          600: '#334e68',
          700: '#243b53',
          800: '#1a2f45',
          900: '#102a43', // sumi (ink)
        },
        terracotta: {
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#b54a32', // bengara (red earth)
          500: '#9c3e27',
          600: '#7c2d12',
        },
        sage: {
          100: '#ecfdf5',
          200: '#d1fae5',
          300: '#a7f3d0',
          400: '#6b9080', // matcha
          500: '#5a7a6a',
          600: '#4a6556',
        },
      },
      fontFamily: {
        serif: ['Noto Serif JP', 'Georgia', 'serif'],
        sans: ['Zen Kaku Gothic New', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        'warm': '0 4px 6px -1px rgba(16, 42, 67, 0.1), 0 2px 4px -1px rgba(16, 42, 67, 0.06)',
        'warm-lg': '0 10px 15px -3px rgba(16, 42, 67, 0.1), 0 4px 6px -2px rgba(16, 42, 67, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
