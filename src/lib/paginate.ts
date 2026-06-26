/**
 * Pure pagination helper for listing pages (e.g. `/blog`).
 *
 * Design: design.md "Pure Logic Signatures" + Correctness Properties P27–P31.
 * Requirements: 32.1, 32.2, 32.3, 32.4, 32.5, 14.4, 14.5
 *
 * The function is pure and never mutates its input. The requested `page` is
 * clamped into the valid range `[1, totalPages]`, and `perPage` is defensively
 * clamped to `>= 1` so callers can never produce an empty/negative page.
 */
import type { PageResult } from '@app-types';

/**
 * Paginate a read-only collection.
 *
 * - `total` is the full collection length.
 * - `totalPages = max(1, ceil(total / perPage))` — an empty collection still
 *   yields exactly one (empty) page.
 * - The requested `page` is clamped to `[1, totalPages]`.
 * - `items` is the slice belonging to the (clamped) page.
 * - `hasPrev = page > 1`, `hasNext = page < totalPages`.
 *
 * @param items   The full, read-only collection to paginate.
 * @param page    The requested 1-based page number (clamped if out of range).
 * @param perPage Items per page; values `< 1` are clamped up to `1`.
 */
export function paginate<T>(
  items: readonly T[],
  page: number,
  perPage: number,
): PageResult<T> {
  const total = items.length;

  // Defensive clamp: a page must hold at least one item. Floor guards against
  // fractional inputs while keeping the value an integer.
  const safePerPage = Math.max(1, Math.floor(perPage));

  const totalPages = Math.max(1, Math.ceil(total / safePerPage));

  // Clamp the requested page into [1, totalPages]. Math.floor normalizes any
  // fractional page request to a whole page index.
  const clampedPage = Math.min(totalPages, Math.max(1, Math.floor(page)));

  const start = (clampedPage - 1) * safePerPage;
  const pageItems = items.slice(start, start + safePerPage);

  return {
    items: pageItems,
    page: clampedPage,
    totalPages,
    hasPrev: clampedPage > 1,
    hasNext: clampedPage < totalPages,
    total,
  };
}
