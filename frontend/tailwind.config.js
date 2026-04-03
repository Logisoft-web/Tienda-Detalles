/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rose: {
          50:  '#fff0f5',
          100: '#ffe0ec',
          200: '#ffb3cc',
          300: '#ff80aa',
          400: '#ff4d88',
          500: '#e91e8c',   // rosa principal "Hecho con Amor"
          600: '#c4006e',
          700: '#9a0055',
          800: '#70003d',
          900: '#470026',
        },
        gold: {
          300: '#f9e4a0',
          400: '#f5d060',
          500: '#e8b923',   // dorado principal
          600: '#c49a0a',
          700: '#9a7800',
        },
        cream: '#fff8f9',
      },
      fontFamily: {
        script: ['"Dancing Script"', 'cursive'],
        sans:   ['"Poppins"', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #ffe0ec 0%, #fff0f5 50%, #fce4ec 100%)',
      },
    },
  },
  plugins: [],
}
