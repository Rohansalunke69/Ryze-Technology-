/**
 * `smoothScrollToSection` — scrolls to an in-page section by id.
 *
 * Looks up the target element by id and calls `scrollIntoView` with the
 * behavior chosen by the pure {@link selectScrollBehavior} logic: `'smooth'`
 * when motion is allowed, `'auto'` (instant) under reduced motion. No-ops when
 * the document is unavailable or the target element does not exist.
 *
 * Validates Requirements 8.3, 8.4.
 */

import { selectScrollBehavior } from '../logic/scroll';

/**
 * Scroll the page to the section with the given id.
 *
 * @param id - The DOM id of the target section.
 * @param reducedMotion - Whether the user prefers reduced motion.
 */
export function smoothScrollToSection(
  id: string,
  reducedMotion: boolean,
): void {
  if (typeof document === 'undefined') {
    return;
  }

  const element = document.getElementById(id);
  if (element === null) {
    return;
  }

  element.scrollIntoView({ behavior: selectScrollBehavior(reducedMotion) });
}
