/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
module.exports = {
  theme: {
    extend: {
      colors: {
        'telegram-primary': '#0088CC',
        'telegram-primary-dark': '#007EBD',
        'telegram-bg': '#E5EBF0',
        'telegram-message-bg': '#DCF7C5',
        'telegram-dark-bg': '#0F1A24',
        'telegram-dark-hover': '#1F2B36',
        'telegram-dark-input': '#1A2733',
        'telegram-dark-message': '#1F2B36',
        'telegram-dark-text': '#E9EDEF'
      }
    }
  }
}

