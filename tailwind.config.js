const { tokens } = require('./lib/design-tokens')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: tokens.colors.primary,
        gray: tokens.colors.gray,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        danger: tokens.colors.danger,
        green: tokens.colors.green,
        red: tokens.colors.red
      },
      spacing: tokens.spacing,
      borderRadius: tokens.radius,
      fontSize: tokens.fontSize,
      fontWeight: tokens.fontWeight,
      boxShadow: tokens.shadow,
      transitionDuration: tokens.transition
    }
  },
  plugins: []
}
