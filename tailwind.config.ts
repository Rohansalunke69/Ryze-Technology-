import type { Config } from 'tailwindcss';

/*
 * "Engineered Permanence" token system mirrored from the :root CSS custom
 * properties in src/index.css. Values reference the CSS variables so the
 * stylesheet remains the single source of truth; Tailwind utilities and JS
 * (via resolveConfig) read identical tokens.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: 'var(--ink-900)',
          800: 'var(--ink-800)',
          700: 'var(--ink-700)',
          600: 'var(--ink-600)',
        },
        mist: {
          300: 'var(--mist-300)',
          100: 'var(--mist-100)',
        },
        pulse: {
          500: 'var(--pulse-500)',
          400: 'var(--pulse-400)',
          700: 'var(--pulse-700)',
        },
        ember: {
          500: 'var(--ember-500)',
        },
        lime: {
          500: 'var(--lime-500)',
        },
      },
      fontFamily: {
        display: 'var(--font-display)',
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        'display-xl': 'var(--fs-display-xl)',
        'display-l': 'var(--fs-display-l)',
        h2: 'var(--fs-h2)',
        h3: 'var(--fs-h3)',
        'body-l': 'var(--fs-body-l)',
        body: 'var(--fs-body)',
        'mono-eyebrow': 'var(--fs-mono-eyebrow)',
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        7: 'var(--space-7)',
        8: 'var(--space-8)',
        9: 'var(--space-9)',
        10: 'var(--space-10)',
        11: 'var(--space-11)',
        12: 'var(--space-12)',
        13: 'var(--space-13)',
        14: 'var(--space-14)',
        15: 'var(--space-15)',
        16: 'var(--space-16)',
        'section-y': 'var(--section-y)',
        gutter: 'var(--gutter)',
        margin: 'var(--margin)',
      },
      maxWidth: {
        site: 'var(--max-width)',
      },
      transitionTimingFunction: {
        'out-expo': 'var(--ease-out-expo)',
        'in-out-quint': 'var(--ease-in-out-quint)',
        'out-back': 'var(--ease-out-back)',
      },
      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        slow: 'var(--dur-slow)',
        stagger: 'var(--stagger)',
      },
    },
  },
  plugins: [],
};

export default config;
