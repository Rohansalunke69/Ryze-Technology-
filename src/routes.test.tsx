/**
 * Router resolution tests (task 13.1).
 *
 * Renders the real `appRoutes` table through `createMemoryRouter` +
 * `RouterProvider` at a handful of representative paths and asserts the right
 * lazy Page_Module resolves. Because every page is `React.lazy`, the route's
 * chunk loads asynchronously — assertions use `await screen.findBy...` so the
 * Suspense fallback (RouteSkeleton) resolves to the real page first.
 *
 * Pages set metadata via react-helmet-async and navigate with router Links, so
 * the tree is wrapped in HelmetProvider + ReducedMotionProvider. Reduced motion
 * is forced ON (keeps the Hero on its static fallback, no WebGL probe) and
 * IntersectionObserver is stubbed (jsdom lacks it).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import { appRoutes } from './routes';

/** Minimal IntersectionObserver stub — jsdom does not implement it. */
class MockIntersectionObserver {
  constructor(_callback: IntersectionObserverCallback) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  mockReducedMotion(true);
});

afterEach(() => {
  resetMatchMedia();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function renderAt(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  return render(
    <HelmetProvider>
      <ReducedMotionProvider>
        <RouterProvider router={router} />
      </ReducedMotionProvider>
    </HelmetProvider>,
  );
}

describe('appRoutes', () => {
  it('resolves the HomePage at "/"', async () => {
    renderAt('/');
    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: 'Design. Develop. Grow.' },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
  });

  it('resolves the PortfolioListPage at "/portfolio"', async () => {
    renderAt('/portfolio');
    expect(
      await screen.findByRole('group', { name: 'Filter projects by category' }),
    ).toBeInTheDocument();
  });

  it('resolves the ContactPage at "/contact"', async () => {
    renderAt('/contact');
    expect(
      await screen.findByRole('region', { name: 'Contact form' }),
    ).toBeInTheDocument();
  });

  it('resolves the privacy LegalPage via the slug prop at "/privacy"', async () => {
    renderAt('/privacy');
    // legalDocs.privacy.title renders as the page <h1>.
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    await vi.waitFor(() => {
      expect(document.title).toMatch(/privacy/i);
    });
  });

  it('resolves the NotFoundPage for an unknown path (catch-all)', async () => {
    renderAt('/this-route-does-not-exist');
    expect(
      await screen.findByRole('heading', { level: 1, name: '404' }),
    ).toBeInTheDocument();
  });
});
