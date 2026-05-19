/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg:           '#070c14',
          panel:        '#0d1520',
          card:         '#0f1a2a',
          deep:         '#060d18',
          border:       '#1a3050',
          'border-dim': '#0f2035',
          accent:       '#00c8e0',
          'accent-dim': '#007a8a',
          gold:         '#f0a030',
          'gold-dim':   '#8a5a10',
          green:        '#22c55e',
          amber:        '#f59e0b',
          red:          '#ef4444',
          purple:       '#a855f7',
          text:         '#a8bdd0',
          'text-bright':'#d4e8f8',
          'text-dim':   '#5a7a96',
        },
      },
      fontFamily: {
        mono: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%':   { opacity: '0.6' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
