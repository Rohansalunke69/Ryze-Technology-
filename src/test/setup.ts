// Vitest global setup: registers jest-dom and jest-axe matchers
// so component and accessibility assertions are available in every test.
import '@testing-library/jest-dom/vitest';
import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';

// Register the jest-axe accessibility matcher (e.g. expect(results).toHaveNoViolations()).
expect.extend(toHaveNoViolations);

// Ensure the DOM is reset between tests so renders don't leak across cases.
afterEach(() => {
  cleanup();
});
