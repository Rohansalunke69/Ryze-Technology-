/**
 * Pure viewport classification helper.
 *
 * Maps a raw pixel width to a single semantic {@link ViewportCategory} bucket.
 * This is the one source of truth for responsive breakpoints: the
 * `useViewportCategory` hook reads layout width through this function so that
 * components never re-derive breakpoints inline (which would risk flicker at
 * the edges). The function is pure (no React, no DOM) so it can be unit- and
 * property-tested in isolation and reused on the server during prerender.
 *
 * The breakpoints are ordered and non-overlapping, partitioning the half-open
 * width domain `[0, ∞)` into four contiguous bands:
 *
 *   [0, 768)      -> 'mobile'
 *   [768, 1024)   -> 'tablet'
 *   [1024, 1536)  -> 'desktop'
 *   [1536, ∞)     -> 'wide'
 *
 * Because the bands are half-open and contiguous, every width of at least 0
 * maps to exactly one category (totality), and increasing width never moves to
 * a "smaller" category (monotonicity). These align with the Tailwind-mirrored
 * design tokens (`md = 768`, `lg = 1024`, `2xl = 1536`).
 *
 * _Requirements: 35.1, 35.2_
 */
import type { ViewportCategory } from '@app-types';

/**
 * Lower-bound width (inclusive, in CSS pixels) at which each category begins.
 *
 * Each entry is the smallest width that maps to that category; the category
 * extends up to (but not including) the next breakpoint. `mobile` starts at 0
 * so the domain is fully covered from the origin.
 */
export const VIEWPORT_BREAKPOINTS = {
  /** [0, 768): phones and small handsets. */
  mobile: 0,
  /** [768, 1024): tablets / large handsets in landscape. */
  tablet: 768,
  /** [1024, 1536): laptops and standard desktops. */
  desktop: 1024,
  /** [1536, ∞): large and ultra-wide desktop displays. */
  wide: 1536,
} as const satisfies Record<ViewportCategory, number>;

/**
 * Classify a viewport `width` (in CSS pixels) into a semantic category.
 *
 * @param width - The viewport width in CSS pixels. Expected to be `>= 0`;
 *   negative or non-finite inputs are coerced to the `mobile` band so the
 *   function is total and never throws.
 * @returns Exactly one of `'mobile' | 'tablet' | 'desktop' | 'wide'`.
 *
 * Behavior:
 * - Totality & determinism: every `width >= 0` returns exactly one category,
 *   and the result depends only on `width` (Property 35; Requirement 35.1).
 * - Monotonic boundaries: the bands are ordered and contiguous with no overlap
 *   or gap, so a larger width never maps to a smaller category
 *   (Property 36; Requirement 35.2).
 */
export function viewportCategory(width: number): ViewportCategory {
  // Coerce out-of-domain inputs (negative / NaN) into the lowest band so the
  // mapping stays total. NaN comparisons are always false, so the explicit
  // guard ensures NaN resolves to 'mobile' rather than falling through.
  if (!(width >= VIEWPORT_BREAKPOINTS.tablet)) {
    return 'mobile';
  }
  if (width < VIEWPORT_BREAKPOINTS.desktop) {
    return 'tablet';
  }
  if (width < VIEWPORT_BREAKPOINTS.wide) {
    return 'desktop';
  }
  return 'wide';
}
