/**
 * Unit + a11y tests for ManifestoPage (task 14.13 / 14.14).
 *
 * ManifestoPage composes motion-aware components (SectionHeader/SplitText,
 * AnimationWrapper) and SEOHead, so renders are wrapped in `MemoryRouter`
 * (CTA link), `ReducedMotionProvider` (motion prefs), and `HelmetProvider`
 * (SEOHead). `matchMedia` and `IntersectionObserver` are stubbed because jsdom
 * does not implement them.
 *
 * Requirements: 12.1 (hero, core beliefs, stand-against band, Ryze promise,
 * CTA), 12.2 + 37.2 (beliefs visible without pinning/scroll dependency under
 * reduced motion), 38.x (single h1, no axe violations).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { axe } from 'jest-axe';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';

import { ManifestoPage } from './ManifestoPage';

/** Minimal IntersectionObserver stub — never reports intersection. */
class MockIntersectionObserver {
  constructor(_callback: IntersectionObserverCallback) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  mockReducedMotion(false);
});

afterEach(() => {
  resetMatchMedia();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function renderPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <ReducedMotionProvider>
          <ManifestoPage />
        </ReducedMotionProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('ManifestoPage', () => {
  it('renders exactly one page-level h1 hero heading (Req 12.1, 38.1)', () => {
    renderPage();
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveAccessibleName('We build software to last.');
  });

  it('renders the core-beliefs section as an ordered list (Req 12.1)', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Core beliefs' }),
    ).toBeInTheDocument();

    const list = screen.getByRole('list', { name: 'Our core beliefs' });
    const items = within(list).getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(5);
    expect(items.length).toBeLessThanOrEqual(7);
  });

  it('renders the "What we stand against" band (Req 12.1)', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 2, name: 'What we stand against' }),
    ).toBeInTheDocument();
  });

  it('renders the "The Ryze promise" section (Req 12.1)', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { level: 2, name: 'The Ryze promise' }),
    ).toBeInTheDocument();
  });

  it('renders a CTA section linking to /contact (Req 12.1)', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: 'Build something that lasts.' }),
    ).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: "Let's build" });
    expect(cta).toHaveAttribute('href', '/contact');
  });

  it('shows every belief without scroll/pinning under reduced motion (Req 12.2, 37.2)', () => {
    // Reduced motion active: AnimationWrapper must render the final visible
    // state immediately, with no IntersectionObserver gating. The beliefs are
    // real ordered DOM and must all be present and readable.
    mockReducedMotion(true);
    renderPage();

    const list = screen.getByRole('list', { name: 'Our core beliefs' });
    const items = within(list).getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(5);

    // Each belief statement is an h3 inside the list and is in the document
    // regardless of any scroll position (no IntersectionObserver was triggered).
    const beliefHeadings = within(list).getAllByRole('heading', { level: 3 });
    expect(beliefHeadings.length).toBe(items.length);
    for (const heading of beliefHeadings) {
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAccessibleName(expect.stringMatching(/\S/));
    }
  });

  it('has no axe violations under reduced motion (Req 38.x)', async () => {
    mockReducedMotion(true);
    const { container } = renderPage();
    expect(await axe(container)).toHaveNoViolations();
  });
});
