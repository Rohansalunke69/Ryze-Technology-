import type { Config } from 'tailwindcss';

/**
 * Ryze Portfolio Website design tokens.
 *
 * Color choices (Requirements 10.1, 10.2, 10.4, 10.5):
 *  - navy:   dark navy primary background (#0a0e1a base, #0b1120 surface)
 *  - cyan:   accent for Primary CTAs and emphasis (#22d3ee / #06b6d4)
 *  - text:   body text color chosen for >= 4.5:1 contrast on navy.
 *            #e2e8f0 on #0a0e1a ≈ 15.6:1 (passes AA body and large text).
 *            #94a3b8 muted on #0a0e1a ≈ 7.0:1 (still passes AA body).
 *
 * Breakpoints (Requirement 9):
 *  - mobile:  max 767px  (default / base styles)
 *  - tablet:  768px – 1023px
 *  - desktop: >= 1024px
 *
 * Tap target (Requirement 9.6): 44px minimum.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Override the default breakpoints so tablet/desktop map to the spec.
    screens: {
      tablet: '768px',
      desktop: '1024px',
    },
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a0e1a',
          900: '#0a0e1a',
          800: '#0b1120',
          700: '#111a2e',
        },
        accent: {
          DEFAULT: '#22d3ee',
          500: '#22d3ee',
          600: '#06b6d4',
        },
        body: {
          DEFAULT: '#e2e8f0',
          muted: '#94a3b8',
        },
      },
      fontSize: {
        // Body text sizes (Requirement 10.3): >= 16px mobile, >= 18px desktop.
        'body-mobile': ['1rem', { lineHeight: '1.6' }], // 16px
        'body-desktop': ['1.125rem', { lineHeight: '1.7' }], // 18px
      },
      spacing: {
        // Minimum tap-target size (Requirement 9.6).
        'tap-target': '44px',
      },
      minWidth: {
        'tap-target': '44px',
      },
      minHeight: {
        'tap-target': '44px',
      },
    },
  },
  plugins: [],
} satisfies Config;
