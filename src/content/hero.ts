/**
 * Hero section content for the Ryze Portfolio Website.
 *
 * Headline and subheadline are fixed per Requirements 1.1 and 1.2.
 * The primary CTA "See our work" scrolls to the Portfolio section (Requirement 1.5).
 */

import type { HeroContent } from '../types/hero';

export const heroContent: HeroContent = {
  headline: 'We build products that work forever',
  subheadline: 'Websites. Apps. Systems. Designed to scale.',
  visualKind: 'gradient',
  cta: {
    label: 'See our work',
    targetSection: 'portfolio',
  },
};
