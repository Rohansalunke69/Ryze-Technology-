/**
 * Pure, side-effect-free viewport and layout selectors.
 *
 * These functions take primitive inputs and return primitive outputs so they
 * can be unit- and property-tested in isolation from React and the DOM.
 *
 * Breakpoints (CSS pixels):
 *   - mobile:  width < 768
 *   - tablet:  768 <= width < 1024
 *   - desktop: width >= 1024
 */

import type { ColumnCount, ViewportCategory } from '@apptypes';

/**
 * Ordering rank for viewport categories under `mobile < tablet < desktop`.
 * Lower rank means a smaller category.
 */
const CATEGORY_RANK: Record<ViewportCategory, number> = {
  mobile: 0,
  tablet: 1,
  desktop: 2,
};

/** Tablet breakpoint lower bound in CSS pixels (inclusive). */
const TABLET_MIN_PX = 768;
/** Desktop breakpoint lower bound in CSS pixels (inclusive). */
const DESKTOP_MIN_PX = 1024;

/**
 * Classify a raw viewport width into a {@link ViewportCategory}.
 *
 * Returns `mobile` when `widthPx < 768`, `tablet` when `768 <= widthPx < 1024`,
 * and `desktop` when `widthPx >= 1024`. The mapping partitions the non-negative
 * width axis and is monotonic across the boundaries.
 *
 * @param widthPx - Viewport width in CSS pixels (expected non-negative).
 */
export function selectViewportCategory(widthPx: number): ViewportCategory {
  if (widthPx < TABLET_MIN_PX) {
    return 'mobile';
  }
  if (widthPx < DESKTOP_MIN_PX) {
    return 'tablet';
  }
  return 'desktop';
}

/**
 * Map a {@link ViewportCategory} to the grid column count used by grid sections.
 *
 * Returns 1 for `mobile`, 2 for `tablet`, and 4 for `desktop`.
 *
 * @param category - The resolved viewport category.
 */
export function selectColumnCount(category: ViewportCategory): ColumnCount {
  switch (category) {
    case 'mobile':
      return 1;
    case 'tablet':
      return 2;
    case 'desktop':
      return 4;
  }
}

/**
 * Resolve the effective category when multiple breakpoints match at once
 * (e.g. overlapping media queries or an orientation change mid-navigation).
 *
 * Returns the smallest category present under the ordering
 * `mobile < tablet < desktop`, so `mobile` takes precedence over `tablet`
 * and `desktop`.
 *
 * @param matches - A non-empty list of matching viewport categories.
 * @throws RangeError when `matches` is empty.
 */
export function resolveViewportPrecedence(
  matches: ViewportCategory[],
): ViewportCategory {
  if (matches.length === 0) {
    throw new RangeError(
      'resolveViewportPrecedence requires at least one matching category',
    );
  }

  return matches.reduce((smallest, current) =>
    CATEGORY_RANK[current] < CATEGORY_RANK[smallest] ? current : smallest,
  );
}
