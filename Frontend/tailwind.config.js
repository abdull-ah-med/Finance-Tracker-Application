/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  daisyui: {
    themes: [
      {
        finance: {
          ...require('daisyui/src/colors/themes')['[data-theme=dark]'],
          primary: '#2563eb', // blue-600
          secondary: '#fbbf24', // amber-400
          accent: '#10b981', // emerald-500
          neutral: '#1e293b', // slate-800
          'base-100': '#0f172a', // slate-900
          info: '#38bdf8', // sky-400
          success: '#22d3ee', // cyan-400
          warning: '#f59e42', // orange-400
          error: '#ef4444', // red-500
        },
      },
      'dark',
    ],
    darkTheme: 'finance',
  },
  plugins: [require('daisyui')],
}
