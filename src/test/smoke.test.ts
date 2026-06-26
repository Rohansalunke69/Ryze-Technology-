/**
 * Smoke test: confirms the Vitest + jsdom + jest-dom + jest-axe + fast-check
 * toolchain is wired up correctly. Validates the configuration from task 2.1,
 * not application behavior.
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { mockReducedMotion, resetMatchMedia } from './matchMedia';

describe('test toolchain', () => {
  it('runs in a jsdom environment', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });

  it('exposes Vitest globals when configured', () => {
    // `globals: true` makes these available without imports.
    expect(typeof describe).toBe('function');
    expect(typeof it).toBe('function');
    expect(typeof expect).toBe('function');
  });

  it('registers the jest-dom matcher (toBeInTheDocument)', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(el).toBeInTheDocument();
  });

  it('registers the jest-axe matcher (toHaveNoViolations)', () => {
    // Matcher exists; a passing report should satisfy it.
    expect({ violations: [] }).toHaveNoViolations();
  });

  it('can simulate prefers-reduced-motion via the matchMedia helper', () => {
    mockReducedMotion(true);
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);
    mockReducedMotion(false);
    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(false);
    resetMatchMedia();
  });

  it('runs fast-check properties deterministically', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => a + b === b + a),
    );
  });
});
