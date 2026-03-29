/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        trello: { blue: '#0052CC', navy: '#091E42', light: '#F4F5F7' },
      },
      boxShadow: {
        card: '0 1px 3px rgba(9,30,66,0.25)',
        modal: '0 8px 32px rgba(9,30,66,0.35)',
      },
    },
  },
  plugins: [],
};
