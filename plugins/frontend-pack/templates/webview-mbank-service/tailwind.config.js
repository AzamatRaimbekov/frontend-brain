/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  prefix: '',
  theme: {
    container: {},
    extend: {
      boxShadow: {},
      colors: {},
      backgroundImage: {
        'calendar-gradient-green':
          'linear-gradient(308deg, #61B3B8 6.71%, #118589 84.27%), linear-gradient(136deg, #09203F 0%, #537895 100%);',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE и Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari и Chrome */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })
    },
  ],
}
