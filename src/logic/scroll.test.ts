import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { selectScrollBehavior } from './scroll';

describe('selectScrollBehavior', () => {
  it("returns 'smooth' when motion is allowed", () => {
    expect(selectScrollBehavior(false)).toBe('smooth');
  });

  it("returns 'auto' when reduced motion is active", () => {
    expect(selectScrollBehavior(true)).toBe('auto');
  });

  // Feature: ryze-portfolio-website, Property 4: scroll behavior is 'smooth' iff reducedMotion is false, otherwise 'auto'
  // Validates: Requirements 8.3, 8.4
  it("is 'smooth' iff reducedMotion is false, otherwise 'auto'", () => {
    fc.assert(
      fc.property(fc.boolean(), (reducedMotion) => {
        const behavior = selectScrollBehavior(reducedMotion);
        // Smooth exactly when motion is allowed (reducedMotion === false)
        expect(behavior === 'smooth').toBe(reducedMotion === false);
        // And 'auto' exactly when reduced motion is active
        expect(behavior === 'auto').toBe(reducedMotion === true);
      }),
      { numRuns: 100 },
    );
  });
});
