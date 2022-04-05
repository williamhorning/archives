module.exports = {
  purge: {
    content: ['./**/*.html'],
  },

  darkMode: 'class', // or 'media' or 'false'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms'),]
}