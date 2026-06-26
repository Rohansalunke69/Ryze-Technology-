/**
 * Tests for `normalizeMetaDescription`.
 *
 * Property-based tests (Properties 11–14) validate the universal correctness
 * properties from the design; unit tests pin specific examples and edge cases.
 *
 * Requirements: 28.1, 28.2, 28.3, 28.4, 40.2
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { normalizeMetaDescription } from './seo';

const ELLIPSIS = '\u2026';

/** A non-empty token containing only lowercase letters (never whitespace). */
const word = fc
  .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), {
    minLength: 1,
    maxLength: 8,
  })
  .map((chars) => chars.join(''));

describe('normalizeMetaDescription', () => {
  describe('unit examples', () => {
    it('returns a short trimmed string unchanged without an ellipsis', () => {
      expect(normalizeMetaDescription('  Hello world  ')).toBe('Hello world');
    });

    it('truncates long text at a word boundary and appends a single ellipsis', () => {
      const input = 'alpha beta gamma delta epsilon zeta';
      const result = normalizeMetaDescription(input, 20);
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result.endsWith(ELLIPSIS)).toBe(true);
      // Body (minus ellipsis) ends on a complete word, not mid-word.
      const body = result.slice(0, -ELLIPSIS.length);
      expect(input.startsWith(body)).toBe(true);
      expect(input.charAt(body.length)).toMatch(/\s/);
    });

    it('hard-cuts a single overlong word to honor the length bound', () => {
      const input = 'supercalifragilisticexpialidocious';
      const result = normalizeMetaDescription(input, 10);
      expect(result.length).toBe(10);
      expect(result.endsWith(ELLIPSIS)).toBe(true);
    });

    it('respects the default maximum length of 160', () => {
      const input = 'lorem ipsum dolor sit amet '.repeat(20);
      expect(normalizeMetaDescription(input).length).toBeLessThanOrEqual(160);
    });
  });

  // Feature: ryze-technology-website, Property 11: meta length bound
  // Validates: Requirements 28.1
  it('Property 11: output length never exceeds maxLen', () => {
    fc.assert(
      fc.property(fc.string(), fc.integer({ min: 1, max: 300 }), (input, maxLen) => {
        expect(normalizeMetaDescription(input, maxLen).length).toBeLessThanOrEqual(maxLen);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: ryze-technology-website, Property 12: meta idempotence
  // Validates: Requirements 28.2
  it('Property 12: normalizing an already-normalized string is stable', () => {
    fc.assert(
      fc.property(fc.string(), fc.integer({ min: 1, max: 300 }), (input, maxLen) => {
        const once = normalizeMetaDescription(input, maxLen);
        const twice = normalizeMetaDescription(once, maxLen);
        expect(twice).toBe(once);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: ryze-technology-website, Property 13: meta no mid-word cut
  // Validates: Requirements 28.3
  it('Property 13: truncation never ends the body on a partial word', () => {
    fc.assert(
      fc.property(
        fc.array(word, { minLength: 5, maxLength: 40 }),
        fc.integer({ min: 10, max: 80 }),
        (words, maxLen) => {
          const input = words.join(' ');
          // Only meaningful when truncation actually occurs.
          fc.pre(input.trim().length > maxLen);

          const result = normalizeMetaDescription(input, maxLen);
          expect(result.endsWith(ELLIPSIS)).toBe(true);

          const body = result.slice(0, -ELLIPSIS.length);
          // Words are at most 8 chars and maxLen >= 10, so a word boundary
          // always exists before the cut point: the body must be a run of
          // whole words followed by whitespace in the original text.
          expect(body.length).toBeGreaterThan(0);
          expect(input.startsWith(body)).toBe(true);
          expect(input.charAt(body.length)).toMatch(/\s/);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: ryze-technology-website, Property 14: meta preservation when short
  // Validates: Requirements 28.4
  it('Property 14: trimmed input within bound is returned unchanged', () => {
    fc.assert(
      fc.property(fc.string(), fc.nat({ max: 200 }), (input, slack) => {
        const trimmed = input.trim();
        const maxLen = trimmed.length + slack;
        const result = normalizeMetaDescription(input, maxLen);
        expect(result).toBe(trimmed);
        expect(result.endsWith(ELLIPSIS)).toBe(trimmed.endsWith(ELLIPSIS));
      }),
      { numRuns: 100 },
    );
  });
});
