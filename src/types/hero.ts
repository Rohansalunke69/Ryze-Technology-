/**
 * Hero section content types.
 */

import type { SectionId } from './navigation';

/** The kind of primary visual rendered in the hero. */
export type HeroVisualKind = 'illustration' | 'gradient' | 'video';

/** Static content for the Hero section. */
export interface HeroContent {
  /** e.g. "We build products that work forever" */
  headline: string;
  /** e.g. "Websites. Apps. Systems. Designed to scale." */
  subheadline: string;
  visualKind: HeroVisualKind;
  cta: {
    label: 'See our work' | "Let's talk";
    targetSection: SectionId;
  };
}
