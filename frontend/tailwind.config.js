/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff0f6',
          100: '#ffd6e8',
          200: '#ffadd1',
          300: '#ff75b3',
          400: '#ff3d94',
          500: '#e8006e',   // fucsia principal del logo
          600: '#c4005c',
          700: '#9a0049',
          800: '#700035',
          900: '#3d001d',
        },
        blush: '#fff5f9',
        petal: '#ffe4f0',
        gold:  '#c9a84c',
        dark:  '#1a0a10',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"Lato"', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #fff0f6 0%, #ffe4f0 40%, #ffd6e8 100%)',
        'dark-gradient': 'linear-gradient(135deg, #3d001d 0%, #1a0a10 100%)',
      },
      boxShadow: {
        'brand': '0 4px 24px rgba(232,0,110,0.18)',
        'brand-lg': '0 8px 40px rgba(232,0,110,0.25)',
      }
    },
  },
  plugins: [],
}
