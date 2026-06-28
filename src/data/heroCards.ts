/**
 * heroCards — data source for the HeroWebGL floating-cards scene (task 11.3).
 *
 * Each entry describes one image card rendered as a textured plane in the 3D
 * cloud. The scene reads this array and repeats it to fill the active card
 * count (determined by viewport category). To swap or add images, edit this
 * file only — the scene derives everything else from it.
 *
 * `orientation` drives the aspect ratio of the card's plane geometry:
 *   portrait  → 3:4 (taller than wide)
 *   landscape → 4:3 (wider than tall)
 *   square    → 1:1
 *
 * _Requirements: 19.5_
 */

export type HeroCardOrientation = 'portrait' | 'landscape' | 'square';

export interface HeroCard {
  /** Path relative to `public/` — served at this URL in production. */
  src: string;
  /** Accessible alt text for DOM fallback uses. */
  alt: string;
  /** Drives the plane's aspect ratio in the 3D scene. */
  orientation: HeroCardOrientation;
}

/** The nine showcase images for the floating-cards hero. */
export const heroCards: HeroCard[] = [
  {
    src: '/images/hero/search-ai.jpg',
    alt: 'AI-powered search interface with hands on laptop',
    orientation: 'landscape',
  },
  {
    src: '/images/hero/strategic-ads.webp',
    alt: 'Strategic ad campaigns — chess pieces symbolising targeted marketing',
    orientation: 'square',
  },
  {
    src: '/images/hero/social-marketing.jpg',
    alt: 'Social media marketing — phone with megaphone and platform icons',
    orientation: 'portrait',
  },
  {
    src: '/images/hero/dev-design.jpg',
    alt: 'Development and design — coding tools on a purple background',
    orientation: 'square',
  },
  {
    src: '/images/hero/editorial-tech.jpg',
    alt: 'Editorial technology — dark abstract hands and devices collage',
    orientation: 'landscape',
  },
  {
    src: '/images/hero/brand-glowup.jpg',
    alt: 'Brand glow-up — "Your Brand Called. It wants a Glow up" poster',
    orientation: 'portrait',
  },
  {
    src: '/images/hero/developers.jpg',
    alt: 'Developers — bold typographic poster with retro computer scene',
    orientation: 'landscape',
  },
  {
    src: '/images/hero/social-collage.jpg',
    alt: 'Social media collage — dark-toned hands across multiple devices',
    orientation: 'portrait',
  },
  {
    src: '/images/hero/stopwatch-collab.png',
    alt: 'Time management collaboration — team around a pink stopwatch from above',
    orientation: 'square',
  },
];
