/* eslint-disable global-require */
module.exports = {
  purge: ['./src/**/*.ejs'],
  theme: {
    extend: {},
  },
  variants: {
    textColor: ['responsive', 'hover', 'focus', 'visited'],
  },
  plugins: [require('@tailwindcss/typography')],
};
