/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: '#070c14',
          panel: '#0d1520',
          card: '#0f1a2a',
          border: '#1a3050',
          accent: '#00c8e0',
          'accent-dim': '#007a8a',
          gold: '#f0a030',
          green: '#22c55e',
          red: '#ef4444',
          text: '#a8bdd0',
          'text-bright': '#d4e8f8',
        },
      },
      fontFamily: {
        mono: ['Consolas', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
}
