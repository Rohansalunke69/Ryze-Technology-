/**
 * Global Vitest setup, loaded via `test.setupFiles` in vite.config.ts.
 *
 * Responsibilities:
 *  - Register jest-dom matchers (toBeInTheDocument, toHaveAttribute, …).
 *  - Register jest-axe's `toHaveNoViolations` matcher for a11y assertions
 *    (Requirements 38.1, 38.2).
 *  - Run React Testing Library cleanup after each test to unmount components
 *    and avoid cross-test DOM leakage.
 *  - Apply seeded fast-check defaults for reproducible property runs.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';
import { configureFastCheck } from './fastcheck';

// jest-axe exports `{ toHaveNoViolations: fn }`; register it on Vitest's expect.
expect.extend(toHaveNoViolations);

// Seed fast-check once for the whole test run (reproducible CI).
configureFastCheck();

// Unmount and clean up the DOM between tests.
afterEach(() => {
  cleanup();
});
