/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        alibaba: {
          orange: '#FF6A00',
          hover: '#E55F00',
          dark: '#0B1E36',
          slate: '#1E293B',
          gray: '#F3F4F6',
          border: '#E5E7EB',
          gold: '#F59E0B',
          green: '#10B981',
          red: '#EF4444',
          blue: '#2563EB',
        }
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0, 0, 0, 0.06)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
