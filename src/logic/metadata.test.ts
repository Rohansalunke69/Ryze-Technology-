import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  normalizeMetaDescription,
  currentCopyrightYear,
  META_DESCRIPTION_MAX_LENGTH,
} from './metadata';

describe('normalizeMetaDescription', () => {
  it('returns short input unchanged', () => {
    expect(normalizeMetaDescription('Ryze builds products that work forever.')).toBe(
      'Ryze builds products that work forever.',
    );
  });

  it('returns empty string unchanged', () => {
    expect(normalizeMetaDescription('')).toBe('');
  });

  it('returns a 160-character input unchanged (boundary)', () => {
    const exact = 'a'.repeat(META_DESCRIPTION_MAX_LENGTH);
    expect(normalizeMetaDescription(exact)).toBe(exact);
  });

  it('truncates a 161-character input to 160 characters (boundary)', () => {
    const tooLong = 'a'.repeat(META_DESCRIPTION_MAX_LENGTH + 1);
    const result = normalizeMetaDescription(tooLong);
    expect(result).toHaveLength(META_DESCRIPTION_MAX_LENGTH);
    expect(result).toBe('a'.repeat(META_DESCRIPTION_MAX_LENGTH));
  });

  // Feature: ryze-portfolio-website, Property 10: normalizeMetaDescription returns <= 160 chars, returns short input unchanged, and is idempotent
  // Validates: Requirements 15.3
  it('bounds length, preserves short input, and is idempotent', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 400 }), (raw) => {
        const once = normalizeMetaDescription(raw);

        // Bounded length: never exceeds the maximum.
        expect(once.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX_LENGTH);

        // Short input is returned unchanged.
        if (raw.length <= META_DESCRIPTION_MAX_LENGTH) {
          expect(once).toBe(raw);
        }

        // Idempotent: applying twice equals applying once.
        const twice = normalizeMetaDescription(once);
        expect(twice).toBe(once);
      }),
      { numRuns: 200 },
    );
  });

  // Exercise edge cases the prework flagged: lengths straddling the limit and unicode.
  it('handles unicode strings around the 160-character boundary', () => {
    fc.assert(
      fc.property(
        fc.array(fc.fullUnicode(), { minLength: 150, maxLength: 200 }).map((cps) => cps.join('')),
        (raw) => {
          const once = normalizeMetaDescription(raw);
          expect(once.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX_LENGTH);
          if (raw.length <= META_DESCRIPTION_MAX_LENGTH) {
            expect(once).toBe(raw);
          }
          expect(normalizeMetaDescription(once)).toBe(once);
        },
      ),
      { numRuns: 200 },
    );
  });
});

describe('currentCopyrightYear', () => {
  it('returns the calendar year of a known date', () => {
    expect(currentCopyrightYear(new Date('2024-06-15T12:00:00Z'))).toBe(2024);
  });

  // Feature: ryze-portfolio-website, Property 11: currentCopyrightYear returns the four-digit calendar year of the given Date
  // Validates: Requirements 7.1
  it('returns the four-digit calendar year of the given Date', () => {
    fc.assert(
      // Bounded away from the year-10000 edge so local-time conversion
      // (getFullYear uses local time) cannot roll a four-digit year over.
      fc.property(fc.date({ min: new Date('1000-01-01T00:00:00Z'), max: new Date('8999-12-31T00:00:00Z') }), (now) => {
        const year = currentCopyrightYear(now);

        // Matches the Date's own calendar year.
        expect(year).toBe(now.getFullYear());

        // Is an integer four-digit year.
        expect(Number.isInteger(year)).toBe(true);
        expect(year).toBeGreaterThanOrEqual(1000);
        expect(year).toBeLessThanOrEqual(9999);
      }),
      { numRuns: 200 },
    );
  });
});
