/**
 * SEO metadata helpers.
 *
 * Pure logic layer. Target of property-based tests (Properties 11–14).
 * Requirements: 28.1, 28.2, 28.3, 28.4, 40.2
 */

/**
 * Single-character ellipsis (U+2026) appended when a description is truncated.
 *
 * Using the dedicated ellipsis glyph (rather than three dots) keeps the
 * appended marker exactly one code unit long, which lets us guarantee the
 * total output length never exceeds `maxLen` (Property 11).
 */
const ELLIPSIS = '\u2026';

/**
 * Normalize a meta description to a crawler-safe length.
 *
 * @param input - The raw description text.
 * @param maxLen - Maximum allowed output length (in characters). Defaults to
 *   160, the conventional safe limit for search/social previews.
 * @returns A trimmed description no longer than `maxLen`.
 *
 * Behavior:
 * - The input is trimmed first.
 * - If the trimmed input already fits within `maxLen`, it is returned unchanged
 *   with no ellipsis added (Property 14 — preservation when short).
 * - Otherwise the text is cut to fit, reserving one character for the ellipsis
 *   so the total length never exceeds `maxLen` (Property 11 — length bound).
 * - When a word boundary (whitespace) exists at or before the cut point, the
 *   cut is made there so the visible text never ends on a partial word
 *   (Property 13 — no mid-word cut). The ellipsis is then appended.
 * - If the leading token is itself longer than the available budget (no word
 *   boundary before the cut point), the single word is hard-cut so the length
 *   bound still holds.
 * - The function is idempotent: feeding its own output back in returns the same
 *   string, because a normalized output is already within `maxLen` and so takes
 *   the preservation path (Property 12 — idempotence).
 */
export function normalizeMetaDescription(input: string, maxLen = 160): string {
  const trimmed = input.trim();

  if (trimmed.length <= maxLen) {
    return trimmed;
  }

  // Reserve one character for the ellipsis so the total never exceeds maxLen.
  const budget = maxLen - ELLIPSIS.length;

  // `head` is the most text we could keep before the ellipsis.
  const head = trimmed.slice(0, budget);

  // The first character we are about to drop. If it is whitespace, `head`
  // already ends exactly on a word boundary and can be kept as-is.
  const nextChar = trimmed.charAt(budget);

  let body: string;
  if (/\s/.test(nextChar)) {
    body = head;
  } else {
    // The budget boundary falls inside a word. Back up to the last whitespace
    // run in `head` and drop the trailing partial word.
    const backed = head.replace(/\s*\S*$/, '');
    // If backing up consumed everything, there was no word boundary before the
    // budget (a single long leading token): hard-cut `head` to honor the bound.
    body = backed.length > 0 ? backed : head;
  }

  // Drop any trailing whitespace left before the ellipsis.
  body = body.replace(/\s+$/, '');

  return body + ELLIPSIS;
}
