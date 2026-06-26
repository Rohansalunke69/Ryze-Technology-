/**
 * Reading-time computation for blog/long-form content.
 *
 * Pure logic helper. Target of property-based tests (Properties 7–10).
 * Requirements: 27.1, 27.2, 27.3, 27.4
 */

/**
 * Count words in a string via whitespace tokenization.
 *
 * Splits on runs of whitespace (`/\s+/`) and discards empty tokens, so leading,
 * trailing, and repeated whitespace never inflate the count. This makes the word
 * count invariant under collapsing whitespace runs (Property 9).
 */
function countWords(content: string): number {
  return content.split(/\s+/).filter((token) => token.length > 0).length;
}

/**
 * Estimate reading time in whole minutes.
 *
 * @param content - The text to estimate. Word count is derived by whitespace
 *   tokenization (split on `/\s+/`, empty tokens dropped).
 * @param wordsPerMinute - Reading rate; defaults to 225 wpm.
 * @returns Reading time rounded up to whole minutes.
 *
 * Behavior:
 * - Non-empty content (≥ 1 word) always returns at least 1 (Property 7 — no
 *   "0 min read").
 * - More words never yields fewer minutes (Property 8 — monotonic in length).
 * - Collapsing whitespace runs does not change the result (Property 9 — word
 *   count ignores whitespace shape).
 * - Doubling the word count yields approximately double the minutes within
 *   rounding (Property 10 — proportional estimate).
 *
 * Empty or whitespace-only content has a word count of 0. We return 1 in that
 * case (rather than 0) so the UI never renders "0 min read"; the positivity
 * property only constrains non-empty content, so this choice is safe.
 */
export function computeReadingTime(content: string, wordsPerMinute = 225): number {
  const words = countWords(content);
  if (words === 0) {
    return 1;
  }
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
