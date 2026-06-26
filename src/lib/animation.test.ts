/**
 * Example-based tests for the imperative animation wrappers.
 *
 * Only `applySplit` is exercised here: it is pure DOM (no GSAP timeline, no
 * ScrollTrigger) so it is fully deterministic under jsdom. The motion helpers
 * (`revealOnScroll`, `pinSection`, `parallaxLayer`, `hoverDistort`) drive GSAP
 * scroll behavior and are covered by component/integration tests.
 *
 * These assertions lock in the accessibility contract for split reveals: the
 * wrapper exposes the original text via `aria-label`, the generated spans are
 * `aria-hidden`, and `revert()` fully restores the original content.
 *
 * Framework: Vitest (jsdom environment).
 * Requirements: 25.1, 25.2, 25.4, 37.2
 */
import { describe, it, expect, vi } from 'vitest';

// `src/lib/animation.ts` registers the GSAP ScrollTrigger plugin at module load,
// which reads `window.matchMedia` — absent in jsdom. Install a minimal stub
// before the module is imported (hoisted above the import below).
vi.hoisted(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

import { applySplit } from './animation';

describe('applySplit', () => {
  it('exposes the original text on the wrapper via aria-label (Requirement 25.2)', () => {
    const el = document.createElement('h2');
    el.textContent = 'Engineered Permanence';

    applySplit(el, 'word');

    expect(el.getAttribute('aria-label')).toBe('Engineered Permanence');
  });

  it('splits into one span per word, each marked aria-hidden (Requirements 25.1, 25.2)', () => {
    const el = document.createElement('h2');
    el.textContent = 'Built to last';

    const { spans } = applySplit(el, 'word');

    expect(spans).toHaveLength(3);
    expect(spans.map((span) => span.textContent)).toEqual(['Built', 'to', 'last']);
    spans.forEach((span) => {
      expect(span.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('splits per character and per line on request', () => {
    const charEl = document.createElement('span');
    charEl.textContent = 'Ryze';
    const charResult = applySplit(charEl, 'char');
    expect(charResult.spans.map((s) => s.textContent)).toEqual(['R', 'y', 'z', 'e']);

    const lineEl = document.createElement('span');
    lineEl.textContent = 'line one\nline two';
    const lineResult = applySplit(lineEl, 'line');
    expect(lineResult.spans.map((s) => s.textContent)).toEqual(['line one', 'line two']);
  });

  it('revert restores the original textContent and removes the added aria-label', () => {
    const el = document.createElement('h2');
    el.textContent = 'Engineered Permanence';

    const { revert } = applySplit(el, 'word');
    // Sanity check: content was actually transformed into spans.
    expect(el.querySelectorAll('span').length).toBeGreaterThan(0);

    revert();

    expect(el.textContent).toBe('Engineered Permanence');
    expect(el.querySelectorAll('span').length).toBe(0);
    expect(el.hasAttribute('aria-label')).toBe(false);
  });

  it('revert restores a pre-existing aria-label rather than dropping it', () => {
    const el = document.createElement('h2');
    el.textContent = 'Our Work';
    el.setAttribute('aria-label', 'Custom label');

    const { revert } = applySplit(el, 'word');
    // While split, the wrapper advertises the original text.
    expect(el.getAttribute('aria-label')).toBe('Our Work');

    revert();

    expect(el.getAttribute('aria-label')).toBe('Custom label');
  });
});
