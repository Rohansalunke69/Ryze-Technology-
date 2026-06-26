import type { Config } from 'tailwindcss';

// Minimal token set for scaffolding. The full "Engineered Permanence" token
// system (colors, fluid type scale, spacing rhythm, grid, motion/easing) is
// authored in task 1.2 and mirrored from the :root CSS custom properties.
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: 'var(--ink-900)',
        },
        mist: {
          100: 'var(--mist-100)',
        },
        pulse: {
          500: 'var(--pulse-500)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
