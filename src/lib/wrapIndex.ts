/**
 * Pure index-wrapping helper for the Lightbox/Carousel navigation.
 *
 * Design: design.md "Pure Logic Signatures" + Correctness Properties P32–P34.
 * Requirements: 33.2, 33.3, 33.4
 *
 * The function is pure. For a `length >= 1` it maps any integer `index` into
 * the range `[0, length - 1]` using modulo arithmetic with positive
 * normalization, so that navigation wraps continuously in both directions:
 * stepping past the last item lands on the first, and stepping before the
 * first lands on the last.
 */

/**
 * Map any integer `index` into the bounds of a collection of `length` items.
 *
 * For `length >= 1`:
 * - Returns a value in `[0, length - 1]` for any integer index.
 * - `wrapIndex(length, length) === 0` (next-from-last wraps to first).
 * - `wrapIndex(-1, length) === length - 1` (prev-from-first wraps to last).
 * - An index already within `[0, length - 1]` is returned unchanged.
 *
 * For `length <= 0` there is no valid position to wrap into, so the function
 * returns `0`. Callers (e.g. the Lightbox) guard empty galleries separately by
 * refusing to open, so this value is never used for navigation in practice.
 *
 * @param index  Any integer index (may be negative or out of bounds).
 * @param length The collection length.
 * @returns A normalized index in `[0, length - 1]`, or `0` when `length <= 0`.
 */
export function wrapIndex(index: number, length: number): number {
  // No valid slot to wrap into; the Lightbox guards empty arrays separately.
  if (length <= 0) return 0;

  // Positive-normalized modulo: JavaScript's `%` keeps the sign of the
  // dividend, so `(-1) % length` is negative. Adding `length` and taking the
  // modulo again folds the result into `[0, length - 1]`.
  return ((index % length) + length) % length;
}
