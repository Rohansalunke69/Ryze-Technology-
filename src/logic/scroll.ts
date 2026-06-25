/**
 * Scroll-behavior selection (pure logic layer).
 *
 * Resolves the scroll behavior used for in-page anchor navigation based on the
 * user's reduced-motion preference. When reduced motion is active, scrolling is
 * instant (`'auto'`); otherwise it animates smoothly (`'smooth'`).
 *
 * Validates Requirements 8.3, 8.4.
 */

/**
 * Selects the scroll behavior for navigation/anchor scrolling.
 *
 * @param reducedMotion - Whether the user prefers reduced motion.
 * @returns `'auto'` when reduced motion is active, `'smooth'` otherwise.
 */
export function selectScrollBehavior(reducedMotion: boolean): ScrollBehavior {
  return reducedMotion ? 'auto' : 'smooth';
}
