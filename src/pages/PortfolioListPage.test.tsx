/**
 * Unit tests for PortfolioListPage (task 14.3).
 *
 * PortfolioListPage composes motion-aware components (SectionHeader/SplitText,
 * AnimationWrapper, Framer Motion filter indicator + grid) and SEOHead, so
 * renders are wrapped in `MemoryRouter` (CaseStudyCard links),
 * `ReducedMotionProvider` (motion prefs), and `HelmetProvider` (SEOHead).
 * `matchMedia` and `IntersectionObserver` are stubbed because jsdom does not
 * implement them.
 *
 * Requirements: 7.1 (card grid), 7.2 (filter bar), 7.3 (concrete filter shows
 * only matching), 7.4 (All shows everything), 7.5 (order preserved).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import { caseStudies } from '@data/caseStudies';

import { PortfolioListPage } from './PortfolioListPage';

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
          <PortfolioListPage />
        </ReducedMotionProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

/** The case-study cards rendered as links to `/portfolio/:slug`, in DOM order. */
function renderedCardSlugs(): string[] {
  return screen
    .getAllByRole('link')
    .map((link) => link.getAttribute('href') ?? '')
    .filter((href) => href.startsWith('/portfolio/'))
    .map((href) => href.replace('/portfolio/', ''));
}

describe('PortfolioListPage', () => {
  it('renders the page-level h1 hero heading', () => {
    renderPage();
    const h1 = screen.getByRole('heading', { level: 1, name: 'Our Work' });
    expect(h1.tagName).toBe('H1');
  });

  it('renders the filter bar with All, Websites, Mobile, Systems (Req 7.2)', () => {
    renderPage();
    const group = screen.getByRole('group', {
      name: 'Filter projects by category',
    });
    for (const label of ['All', 'Websites', 'Mobile', 'Systems']) {
      expect(
        within(group).getByRole('button', { name: label }),
      ).toBeInTheDocument();
    }
  });

  it('renders a CaseStudyCard for every case study initially (Req 7.1, 7.4)', () => {
    renderPage();
    const slugs = renderedCardSlugs();
    expect(slugs).toEqual(caseStudies.map((cs) => cs.slug));
  });

  it('shows only matching case studies when a concrete category is selected (Req 7.3)', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Websites' }));

    const expected = caseStudies
      .filter((cs) => cs.category === 'websites')
      .map((cs) => cs.slug);
    // The grid uses AnimatePresence, so non-matching cards animate out rather
    // than disappearing synchronously; wait for the exit to settle.
    await waitFor(() => expect(renderedCardSlugs()).toEqual(expected));

    // Every rendered card genuinely belongs to the websites category.
    expect(expected.length).toBeGreaterThan(0);
  });

  it('filters to the mobile category independently (Req 7.3)', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Mobile' }));

    const expected = caseStudies
      .filter((cs) => cs.category === 'mobile')
      .map((cs) => cs.slug);
    await waitFor(() => expect(renderedCardSlugs()).toEqual(expected));
  });

  it('returns to showing every case study when All is selected (Req 7.4)', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Systems' }));
    await user.click(screen.getByRole('button', { name: 'All' }));

    await waitFor(() =>
      expect(renderedCardSlugs()).toEqual(caseStudies.map((cs) => cs.slug)),
    );
  });

  it('preserves the relative collection order under any filter (Req 7.5)', async () => {
    const user = userEvent.setup();
    renderPage();

    // For each concrete category, the rendered order is the collection order
    // restricted to that category (a subsequence of the original order).
    for (const category of ['websites', 'mobile', 'systems'] as const) {
      const button = screen.getByRole('button', {
        name: category === 'websites'
          ? 'Websites'
          : category === 'mobile'
            ? 'Mobile'
            : 'Systems',
      });
      await user.click(button);

      const expected = caseStudies
        .filter((cs) => cs.category === category)
        .map((cs) => cs.slug);
      await waitFor(() => expect(renderedCardSlugs()).toEqual(expected));
    }
  });

  it('marks the active filter via aria-pressed (Req 7.2)', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Websites' }));

    expect(screen.getByRole('button', { name: 'Websites' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
