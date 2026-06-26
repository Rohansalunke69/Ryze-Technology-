/**
 * Type augmentation so `toHaveNoViolations` (from jest-axe) type-checks on
 * Vitest's `expect`. jest-dom matchers are typed via
 * `@testing-library/jest-dom/vitest` imported in setup.ts.
 */
import 'vitest';

interface AxeMatchers<R = unknown> {
  toHaveNoViolations(): R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Assertion<T = unknown> extends AxeMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
