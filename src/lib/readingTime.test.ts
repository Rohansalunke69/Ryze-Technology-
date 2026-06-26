/**
 * Property-based tests for computeReadingTime (Properties 7–10).
 *
 * Framework: Vitest + fast-check (global numRuns ≥ 100, seeded in test setup).
 * Requirements: 27.1, 27.2, 27.3, 27.4
 */
import { describe, it } from 'vitest';
import fc from 'fast-check';

import { computeReadingTime } from './readingTime';

/** A non-empty token containing no whitespace — i.e. exactly one "word". */
const wordArb = fc
  .string({ minLength: 1, maxLength: 10 })
  .map((s) => s.replace(/\s+/g, ''))
  .filter((s) => s.length > 0);

/** A run of one or more whitespace characters of varying kinds. */
const whitespaceRunArb = fc
  .array(fc.constantFrom(' ', '\t', '\n', '\r', '\f', '\v'), {
    minLength: 1,
    maxLength: 4,
  })
  .map((chars) => chars.join(''));

describe('computeReadingTime', () => {
  // Feature: ryze-technology-website, Property 7: reading time positivity
  // Validates: Requirements 27.1
  it('returns at least 1 minute for non-empty content', () => {
    fc.assert(
      fc.property(
        fc.array(wordArb, { minLength: 1, maxLength: 5000 }),
        fc.integer({ min: 1, max: 2000 }),
        (words, wpm) => {
          const content = words.join(' ');
          return computeReadingTime(content, wpm) >= 1;
        },
      ),
    );
  });

  // Feature: ryze-technology-website, Property 8: monotonic in length
  // Validates: Requirements 27.2
  it('never returns fewer minutes when words are added', () => {
    fc.assert(
      fc.property(
        fc.array(wordArb, { maxLength: 3000 }),
        fc.array(wordArb, { maxLength: 3000 }),
        fc.integer({ min: 1, max: 2000 }),
        (base, extra, wpm) => {
          const shorter = base.join(' ');
          const longer = base.concat(extra).join(' ');
          return computeReadingTime(shorter, wpm) <= computeReadingTime(longer, wpm);
        },
      ),
    );
  });

  // Feature: ryze-technology-website, Property 9: whitespace invariance
  // Validates: Requirements 27.3
  it('is unchanged when runs of whitespace are collapsed', () => {
    // Build content by interleaving words with arbitrary whitespace runs, then
    // compare against the same content with every whitespace run collapsed to a
    // single space. Word count — and thus reading time — must be identical.
    const spacedContentArb = fc
      .array(fc.oneof(wordArb, whitespaceRunArb), { maxLength: 500 })
      .map((parts) => parts.join(''));

    fc.assert(
      fc.property(spacedContentArb, fc.integer({ min: 1, max: 2000 }), (content, wpm) => {
        const collapsed = content.replace(/\s+/g, ' ');
        return computeReadingTime(content, wpm) === computeReadingTime(collapsed, wpm);
      }),
    );
  });

  // Feature: ryze-technology-website, Property 10: scaling
  // Validates: Requirements 27.4
  it('returns approximately double the minutes when the word count doubles', () => {
    fc.assert(
      fc.property(
        fc.array(wordArb, { minLength: 1, maxLength: 3000 }),
        fc.integer({ min: 1, max: 2000 }),
        (words, wpm) => {
          const single = computeReadingTime(words.join(' '), wpm);
          const doubled = computeReadingTime(words.concat(words).join(' '), wpm);
          // Within rounding: ceil(2n/wpm) is either 2*ceil(n/wpm) or one less.
          return Math.abs(doubled - 2 * single) <= 1;
        },
      ),
    );
  });
});
