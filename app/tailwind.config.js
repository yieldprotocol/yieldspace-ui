const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
    colors: {
      gray: colors.zinc,
      green: colors.emerald,
      primary: colors.indigo,
      secondary: colors.violet,
    },
  },
  plugins: [],
};
