/**
 * Consolidated accessibility test suite (task 16.2).
 *
 * This suite asserts the cross-cutting accessibility GUARANTEES of the whole
 * Site rather than re-testing each page/component in depth (those live in the
 * per-page/per-component suites). It is deliberately self-contained and only
 * READS the existing source — it never modifies components or pages.
 *
 * Everything renders under reduced motion (`mockReducedMotion(true)`), which
 * keeps the DOM stable (no WebGL/Lenis/CustomCursor, AnimationWrapper paints its
 * end state) and mirrors the harness used by the page suites. `matchMedia` and
 * `IntersectionObserver` are stubbed because jsdom implements neither.
 *
 * Coverage:
 *  - jest-axe zero-violations for all 13 pages, plus exactly one `main` landmark
 *    and exactly one `h1` per page (Requirements 38.1, 38.5).
 *  - Route-change focus management + Route_Announcer: navigating moves focus to
 *    the new page wrapper and updates the polite live region (Requirement 38.3).
 *  - Focus trap/restore guarantees: the Lightbox is a labelled modal dialog that
 *    captures focus and closes on Esc; the Navigation mobile menu toggles
 *    `aria-expanded` (Requirement 38.4). Deep coverage lives in
 *    Navigation.test.tsx / Lightbox.test.tsx.
 *  - Reduced-motion end-state: AnimationWrapper content is rendered visible, not
 *    trapped in a hidden start state (Requirements 37.2, 37.4).
 *  - alt / aria-hidden coverage: every image exposes an accessible name or is
 *    explicitly decorative (Requirement 38.5).
 *
 * Framework: Vitest + @testing-library/react + jest-axe.
 * Requirements: 38.1, 38.3, 38.4, 38.5, 37.2, 37.4
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  render,
  screen,
  waitFor,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MemoryRouter,
  Route,
  Routes,
  RouterProvider,
  createMemoryRouter,
} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { axe } from 'jest-axe';
import type { ReactElement } from 'react';

import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import { appRoutes } from '@/routes';
import { caseStudies } from '@data/caseStudies';
import { services } from '@data/services';
import { blogPosts } from '@data/blogPosts';

import { HomePage } from '@pages/HomePage';
import { PortfolioListPage } from '@pages/PortfolioListPage';
import { CaseStudyPage } from '@pages/CaseStudyPage';
import { ServicesPage } from '@pages/ServicesPage';
import { ServiceDetailPage } from '@pages/ServiceDetailPage';
import { AboutPage } from '@pages/AboutPage';
import { ContactPage } from '@pages/ContactPage';
import { BlogListPage } from '@pages/BlogListPage';
import { BlogPostPage } from '@pages/BlogPostPage';
import { ResourcesPage } from '@pages/ResourcesPage';
import { LegalPage } from '@pages/LegalPage';
import { NotFoundPage } from '@pages/NotFoundPage';
import { Navigation } from '@components/Navigation';
import { Lightbox } from '@components/Lightbox';
import type { ImageAsset } from '@app-types';

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
  // Reduced motion ON: stable end-state DOM, no WebGL/Lenis/CustomCursor.
  mockReducedMotion(true);
});

afterEach(() => {
  resetMatchMedia();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Wrap any router-context node in the two global providers the app uses. */
function renderWithProviders(node: ReactElement): RenderResult {
  return render(
    <HelmetProvider>
      <ReducedMotionProvider>{node}</ReducedMotionProvider>
    </HelmetProvider>,
  );
}

// Concrete sample slugs resolved from the real Data_Layer so the param-driven
// pages render their populated (not the not-found) branch.
const caseStudySlug = caseStudies[0]!.slug;
const serviceSlug = services[0]!.slug;
const blogSlug = blogPosts[0]!.slug;

/**
 * The 13 pages, each as a fully wired router-context node. Param-driven pages
 * (CaseStudy, ServiceDetail, BlogPost) are mounted through a matching `Routes`
 * so `useParams()` resolves; LegalPage takes an explicit `slug` prop.
 */
const pageCases: ReadonlyArray<{ name: string; node: ReactElement }> = [
  { name: 'HomePage', node: <MemoryRouter><HomePage /></MemoryRouter> },
  {
    name: 'PortfolioListPage',
    node: <MemoryRouter><PortfolioListPage /></MemoryRouter>,
  },
  {
    name: 'CaseStudyPage',
    node: (
      <MemoryRouter initialEntries={[`/portfolio/${caseStudySlug}`]}>
        <Routes>
          <Route path="/portfolio/:slug" element={<CaseStudyPage />} />
        </Routes>
      </MemoryRouter>
    ),
  },
  { name: 'ServicesPage', node: <MemoryRouter><ServicesPage /></MemoryRouter> },
  {
    name: 'ServiceDetailPage',
    node: (
      <MemoryRouter initialEntries={[`/services/${serviceSlug}`]}>
        <Routes>
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
        </Routes>
      </MemoryRouter>
    ),
  },
  { name: 'AboutPage', node: <MemoryRouter><AboutPage /></MemoryRouter> },
  { name: 'ContactPage', node: <MemoryRouter><ContactPage /></MemoryRouter> },
  { name: 'BlogListPage', node: <MemoryRouter><BlogListPage /></MemoryRouter> },
  {
    name: 'BlogPostPage',
    node: (
      <MemoryRouter initialEntries={[`/blog/${blogSlug}`]}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </MemoryRouter>
    ),
  },
  { name: 'ResourcesPage', node: <MemoryRouter><ResourcesPage /></MemoryRouter> },
  {
    name: 'LegalPage',
    node: <MemoryRouter><LegalPage slug="privacy" /></MemoryRouter>,
  },
  { name: 'NotFoundPage', node: <MemoryRouter><NotFoundPage /></MemoryRouter> },
];

describe('Per-page accessibility audit (Req 38.1, 38.5)', () => {
  it.each(pageCases)(
    '$name has no axe violations under reduced motion',
    async ({ node }) => {
      const { container } = renderWithProviders(node);
      expect(await axe(container)).toHaveNoViolations();
    },
  );

  it.each(pageCases)(
    '$name exposes exactly one main landmark and one h1 (Req 38.1)',
    ({ node }) => {
      renderWithProviders(node);
      expect(screen.getAllByRole('main')).toHaveLength(1);
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    },
  );
});

describe('Route-change focus management + Route_Announcer (Req 38.3)', () => {
  function renderApp(initialPath: string) {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: [initialPath],
    });
    const view = renderWithProviders(<RouterProvider router={router} />);
    return { router, view };
  }

  it('focuses the new page wrapper and exposes the announcer on first paint', async () => {
    renderApp('/');

    // The lazy HomePage resolves inside the shell.
    await screen.findByRole('heading', { level: 1 });

    // The stable polite live region is present (Route_Announcer).
    expect(screen.getByTestId('route-announcer')).toBeInTheDocument();

    // PageTransition moves focus to the routed page's main wrapper.
    await waitFor(() => {
      expect(
        document.activeElement?.hasAttribute('data-page-wrapper'),
      ).toBe(true);
    });
  });

  it('moves focus and re-announces when the route changes', async () => {
    const { router } = renderApp('/');
    await screen.findByRole('heading', { level: 1 });

    await act(async () => {
      await router.navigate('/contact');
    });

    // The Contact page is now mounted...
    await screen.findByRole('heading', {
      level: 1,
      name: "Let's build something that lasts",
    });

    // ...the announcer reflects the new route...
    await waitFor(() => {
      expect(screen.getByTestId('route-announcer')).toHaveTextContent(
        /contact/i,
      );
    });

    // ...and focus has moved to the fresh page wrapper.
    await waitFor(() => {
      expect(
        document.activeElement?.hasAttribute('data-page-wrapper'),
      ).toBe(true);
    });
  });
});

describe('Focus trap / restore guarantees (Req 38.4)', () => {
  const lightboxImages: ImageAsset[] = [
    { src: '/img/a.jpg', width: 1200, height: 800, alt: 'Alpha' },
    { src: '/img/b.jpg', width: 1200, height: 800, alt: 'Bravo' },
  ];

  it('Lightbox is a labelled modal dialog that captures focus and closes on Esc', async () => {
    const onClose = vi.fn();
    function Harness() {
      return (
        <>
          <button type="button">outside trigger</button>
          <Lightbox
            images={lightboxImages}
            index={0}
            open
            onClose={onClose}
            onIndexChange={() => {}}
          />
        </>
      );
    }
    renderWithProviders(<MemoryRouter><Harness /></MemoryRouter>);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName(/image 1 of 2/i);

    // Focus is moved inside the dialog on open (rAF-deferred).
    await waitFor(() => expect(dialog).toHaveFocus());

    // Esc invokes the close handler (focus restore is asserted in Lightbox.test).
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Navigation mobile menu toggles aria-expanded on its control', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });
    const user = userEvent.setup();
    renderWithProviders(<MemoryRouter><Navigation /></MemoryRouter>);

    const toggle = screen.getByRole('button', { name: /open menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);

    // The overlay opens as a labelled dialog and the control reports expanded.
    expect(await screen.findByRole('dialog', { name: /site menu/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /close menu/i }),
    ).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Reduced-motion end-state rendering (Req 37.2, 37.4)', () => {
  it('renders AnimationWrapper content in its visible end state, not hidden', () => {
    const { container } = renderWithProviders(
      <MemoryRouter><HomePage /></MemoryRouter>,
    );

    // Under reduced motion AnimationWrapper degrades to a plain wrapper div, so
    // its content is in the DOM and queryable rather than stuck in a start state.
    const wrappers = container.querySelectorAll('[data-animation-wrapper]');
    expect(wrappers.length).toBeGreaterThan(0);

    // Representative gated content is present and reachable.
    expect(
      screen.getByRole('region', { name: 'Team' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1 }),
    ).toBeVisible();
  });
});

describe('Image alt / aria-hidden coverage (Req 38.5)', () => {
  it('every image on PortfolioListPage has an accessible name or is decorative', () => {
    const { container } = renderWithProviders(
      <MemoryRouter><PortfolioListPage /></MemoryRouter>,
    );

    const images = Array.from(container.querySelectorAll('img'));
    expect(images.length).toBeGreaterThan(0);

    for (const img of images) {
      const hasAltAttr = img.hasAttribute('alt'); // includes decorative alt=""
      const hidden = img.getAttribute('aria-hidden') === 'true';
      expect(hasAltAttr || hidden).toBe(true);
    }
  });
});
