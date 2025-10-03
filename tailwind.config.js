/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0b0d',
        foreground: '#f7f7f8'
      }
    },
  },
  darkMode: 'class',
  plugins: [],
};

