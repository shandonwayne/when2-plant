/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FEFDFB',
          100: '#FDF8F0',
          200: '#F9EEDC',
          300: '#F5E4C8',
          400: '#EDD4A6',
          500: '#E5C484',
          600: '#D4A854',
          700: '#B88B3A',
          800: '#8C6A2C',
          900: '#604921',
        },
        earth: {
          50: '#F7F5F0',
          100: '#EBE6DA',
          200: '#D9D0BB',
          300: '#C3B494',
          400: '#A99670',
          500: '#8F7A55',
          600: '#746244',
          700: '#5B4D37',
          800: '#453A2B',
          900: '#332B21',
          950: '#1F1A14',
        },
        sage: {
          50: '#F4F6F0',
          100: '#E6EBD9',
          200: '#CDD7B5',
          300: '#ADBF87',
          400: '#8DA661',
          500: '#6F8A45',
          600: '#576D36',
          700: '#43542B',
          800: '#374425',
          900: '#2F3921',
        },
        month: {
          apr: '#6B8E23',
          may: '#8DA61F',
          jun: '#B5A41A',
          jul: '#D4942A',
          aug: '#E07040',
          sep: '#E05565',
          oct: '#C97090',
          nov: '#8AABB5',
        },
        'month-bg': {
          apr: '#3A5216',
          may: '#4A6118',
          jun: '#6B6B14',
          jul: '#8B6518',
          aug: '#A04828',
          sep: '#A03048',
          oct: '#8A4A68',
          nov: '#5A7A88',
        },
      },
      gridTemplateColumns: {
        '24': 'repeat(24, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-2': 'span 2 / span 2',
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
