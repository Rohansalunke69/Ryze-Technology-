import { describe, it, expect } from 'vitest';

// Smoke test: confirms the Vitest runner, jsdom environment, and globals
// are wired up correctly before feature tests are authored.
describe('test runner smoke test', () => {
  it('runs basic assertions', () => {
    expect(1 + 1).toBe(2);
  });

  it('has a jsdom document available', () => {
    expect(typeof document).toBe('object');
    expect(document.createElement('div')).toBeInstanceOf(HTMLElement);
  });
});
