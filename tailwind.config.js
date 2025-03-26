/** @type {import('tailwindcss').Config} */

export default {
  mode: 'jit',
  content: ["./index.html", './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: theme => ({
        'radial-gradient': 'radial-gradient(circle, var(--tw-gradient-stops))',
      }),
      boxShadow: {
        glow: '0 0 2px #0f0, 0 0 4px #0f0, 0 0 6px #0f0, 0 0 8px #0f0',
      },
    }
  },

  plugins: [],
}

