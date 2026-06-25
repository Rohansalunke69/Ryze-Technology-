/**
 * Pure logic for document metadata and footer copyright.
 *
 * These functions are side-effect-free and take primitive inputs, making them
 * trivially unit- and property-testable without a DOM. See design.md
 * "Pure Logic Interfaces (Logic Layer)" and Correctness Properties 10 and 11.
 */

/**
 * Maximum allowed length, in characters, for a rendered meta description.
 * Search engines truncate descriptions around this length, so the value is
 * normalized before rendering (Requirement 15.3).
 */
export const META_DESCRIPTION_MAX_LENGTH = 160;

/**
 * Normalize a meta description so it never exceeds the rendering limit.
 *
 * - Returns a string of at most {@link META_DESCRIPTION_MAX_LENGTH} characters.
 * - Returns the input unchanged when it is already within the limit.
 * - Idempotent: `normalizeMetaDescription(normalizeMetaDescription(x))`
 *   equals `normalizeMetaDescription(x)` for all inputs.
 *
 * Requirements: 15.2, 15.3
 */
export function normalizeMetaDescription(raw: string): string {
  if (raw.length <= META_DESCRIPTION_MAX_LENGTH) {
    return raw;
  }
  return raw.slice(0, META_DESCRIPTION_MAX_LENGTH);
}

/**
 * Return the four-digit calendar year of the given Date, used for the footer
 * copyright notice (Requirement 7.1).
 */
export function currentCopyrightYear(now: Date): number {
  return now.getFullYear();
}
