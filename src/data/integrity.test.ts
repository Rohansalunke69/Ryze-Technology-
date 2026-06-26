/**
 * Data-integrity tests run against the REAL shipped content modules.
 *
 * These are the CI gates referenced in design.md: Property 17 (unique slugs)
 * and Property 18 (contiguous process steps) run against the actual data
 * modules — not just generated input — so bad content fails the build. A small
 * generated-input portion additionally exercises the pure contiguity predicate
 * across many shapes.
 *
 * Framework: Vitest + fast-check (global numRuns >= 100, seeded in test setup).
 * Requirements: 29.3, 29.4, 42.6
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { uniqueSlugs } from '@lib/slug';

import { caseStudies } from './caseStudies';
import { services } from './services';
import { blogPosts } from './blogPosts';
import { processStepsContiguous } from './assertIntegrity';

describe('data integrity — slug uniqueness (real data)', () => {
  // Feature: ryze-technology-website, Property 17: slug uniqueness invariant (real data)
  // Validates: Requirements 29.3, 42.6
  it('every shipped collection has unique slugs', () => {
    expect(uniqueSlugs(caseStudies)).toBe(true);
    expect(uniqueSlugs(services)).toBe(true);
    expect(uniqueSlugs(blogPosts)).toBe(true);
  });
});

describe('data integrity — process-step contiguity (real data)', () => {
  // Feature: ryze-technology-website, Property 18: process-step contiguity (real data)
  // Validates: Requirements 29.4, 42.6
  it('every service has process step indices that are exactly 1..n, contiguous and strictly increasing', () => {
    for (const service of services) {
      const indices = service.process.map((step) => step.index);
      const expected = service.process.map((_, position) => position + 1);

      // Exactly 1..n in order (contiguous + strictly increasing). (Req 29.4)
      expect(indices).toEqual(expected);

      // The shared predicate agrees with the explicit check above. (Req 29.4)
      expect(processStepsContiguous(service.process)).toBe(true);
    }
  });
});

describe('data integrity — process-step contiguity predicate (generated input)', () => {
  /** Generates a contiguous 1..n step list of length `n`. */
  const contiguousArb = fc
    .integer({ min: 0, max: 12 })
    .map((n) => Array.from({ length: n }, (_, i) => ({ index: i + 1 })));

  // Feature: ryze-technology-website, Property 18: process-step contiguity (generated input)
  // Validates: Requirements 29.4
  it('accepts any well-formed contiguous 1..n list', () => {
    fc.assert(
      fc.property(contiguousArb, (steps) => {
        expect(processStepsContiguous(steps)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: ryze-technology-website, Property 18: process-step contiguity (generated input)
  // Validates: Requirements 29.4
  it('rejects a list with any single index perturbed away from its expected value', () => {
    const brokenArb = fc
      .integer({ min: 1, max: 12 })
      .chain((n) =>
        fc.record({
          steps: fc.constant(Array.from({ length: n }, (_, i) => ({ index: i + 1 }))),
          pos: fc.integer({ min: 0, max: n - 1 }),
          // Non-zero delta so the perturbed index can never equal pos + 1.
          // Sign is fast-check-controlled to keep runs deterministic/shrinkable.
          magnitude: fc.integer({ min: 1, max: 5 }),
          negative: fc.boolean(),
        }),
      );

    fc.assert(
      fc.property(brokenArb, ({ steps, pos, magnitude, negative }) => {
        const delta = negative ? -magnitude : magnitude;
        const broken = steps.map((step, i) =>
          i === pos ? { index: step.index + delta } : step,
        );
        expect(processStepsContiguous(broken)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});
