/**
 * Tests for CaseStudyPage (task 14.5).
 *
 * Rendered inside a MemoryRouter at `/portfolio/:slug` with the
 * ReducedMotionProvider + HelmetProvider wired exactly as the app shell does.
 * matchMedia and IntersectionObserver are mocked so the motion-aware hooks and
 * in-view counters behave deterministically in jsdom.
 *
 *  - A known slug renders the resolved case study: title, results counters, and
 *    related projects (Requirements 8.1, 8.2, 8.3).
 *  - An unknown slug renders the in-route not-found state with suggestions
 *    (Requirement 8.4).
 *  - Activating a gallery item opens the keyboard-navigable Lightbox dialog.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { caseStudies } from '@data/caseStudies';
import { mockReducedMotion } from '@/test/matchMedia';

import CaseStudyPage from './CaseStudyPage';

/** Mock IntersectionObserver so AnimatedCounter's useInView resolves in jsdom. */
function mockIntersectionObserver(): void {
  class IO {
    constructor(private cb: IntersectionObserverCallback) {}
    observe = (el: Element): void => {
      this.cb(
        [{ isIntersecting: true, target: el } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    };
    unobserve = (): void => {};
    disconnect = (): void => {};
    takeRecords = (): IntersectionObserverEntry[] => [];
    root = null;
    rootMargin = '';
    thresholds = [];
  }
  vi.stubGlobal('IntersectionObserver', IO as unknown as typeof IntersectionObserver);
}

function renderAt(path: string) {
  return render(
    <HelmetProvider>
      <ReducedMotionProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/portfolio/:slug" element={<CaseStudyPage />} />
          </Routes>
        </MemoryRouter>
      </ReducedMotionProvider>
    </HelmetProvider>,
  );
}

beforeEach(() => {
  // Reduced motion → counters land on their final value immediately.
  mockReducedMotion(true);
  mockIntersectionObserver();
});

describe('CaseStudyPage — known slug', () => {
  const study = caseStudies[0]!;

  it('renders the resolved case study title as the page h1', () => {
    renderAt(`/portfolio/${study.slug}`);
    expect(
      screen.getByRole('heading', { level: 1, name: study.title }),
    ).toBeInTheDocument();
  });

  it('renders the results section with an AnimatedCounter per metric (Req 8.2)', () => {
    renderAt(`/portfolio/${study.slug}`);
    const results = screen.getByRole('region', { name: /outcomes that mattered/i });
    for (const metric of study.results) {
      expect(within(results).getByText(metric.label)).toBeInTheDocument();
      // Under reduced motion the counter shows its final value immediately.
      const expected = `${metric.prefix ?? ''}${metric.value.toFixed(
        metric.decimals ?? 0,
      )}${metric.suffix ?? ''}`;
      expect(within(results).getByText(expected)).toBeInTheDocument();
    }
  });

  it('renders a related-projects section computed by getRelatedCaseStudies (Req 8.3)', () => {
    renderAt(`/portfolio/${study.slug}`);
    const related = screen.getByRole('region', { name: /related projects/i });
    // orange-city-grocers has an explicit relatedSlug → vidarbha-logistics-hub.
    expect(
      within(related).getByRole('link', { name: /vidarbha logistics/i }),
    ).toBeInTheDocument();
  });
});

describe('CaseStudyPage — unknown slug', () => {
  it('renders the in-route not-found state with suggestions (Req 8.4)', () => {
    renderAt('/portfolio/does-not-exist');
    expect(
      screen.getByRole('heading', { level: 1, name: /project not found/i }),
    ).toBeInTheDocument();
    const suggestions = screen.getByRole('region', { name: /suggested projects/i });
    // At least one real case study is offered as a suggestion.
    const links = within(suggestions).getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    // And a way back to the portfolio.
    expect(
      screen.getByRole('link', { name: /back to portfolio/i }),
    ).toHaveAttribute('href', '/portfolio');
  });
});

describe('CaseStudyPage — gallery lightbox', () => {
  it('opens the lightbox dialog when a gallery item is activated', async () => {
    const study = caseStudies[0]!;
    const user = userEvent.setup();
    renderAt(`/portfolio/${study.slug}`);

    expect(screen.queryByRole('dialog')).toBeNull();

    const gallery = screen.getByRole('region', { name: /a closer look/i });
    const firstItem = within(gallery).getAllByRole('button')[0]!;
    await user.click(firstItem);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
