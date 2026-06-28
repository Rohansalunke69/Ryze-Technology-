/**
 * Integration tests for AppLayout (task 13.2).
 *
 * AppLayout is the parent route element, so it can only be exercised through a
 * router. We recompose the real `appRoutes` into a `createMemoryRouter` so we
 * can pick the initial path, then wrap the `RouterProvider` in the same global
 * providers the app uses (`HelmetProvider` for SEOHead, `ReducedMotionProvider`
 * for motion prefs). Reduced motion is forced ON so the Hero paints its static
 * fallback (no WebGL) and Lenis is never instantiated, and `IntersectionObserver`
 * is stubbed because jsdom lacks it.
 *
 * The shell is asserted to render its landmark regions (banner/nav from
 * Navigation, the `main` wrapper, contentinfo from Footer) around the matched
 * lazy page (Requirement 38.1).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';

import { appRoutes } from '@/routes';

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
  // Reduced motion ON keeps the Hero static (no WebGL/Lenis) for a stable DOM.
  mockReducedMotion(true);
});

afterEach(() => {
  resetMatchMedia();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function renderAt(initialPath: string) {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [initialPath],
  });
  return render(
    <HelmetProvider>
      <ReducedMotionProvider>
        <RouterProvider router={router} />
      </ReducedMotionProvider>
    </HelmetProvider>,
  );
}

describe('AppLayout', () => {
  it('renders the shell landmarks (banner, main, contentinfo) around the page', async () => {
    renderAt('/');

    // Navigation renders a sticky <header> (banner) with a Primary <nav>.
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument();

    // Footer renders a <footer> (contentinfo).
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();

    // The lazy HomePage resolves inside the shell: wait for its single h1.
    // Generous timeout keeps this stable under heavy parallel-suite load.
    const heading = await screen.findByRole(
      'heading',
      { level: 1, name: 'Design. Develop. Grow.' },
      { timeout: 5000 },
    );
    expect(heading).toBeInTheDocument();

    // The page owns the single <main> landmark (the shell deliberately does
    // NOT add its own, to keep exactly one <main> per page — Req 38.1).
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('exposes the route announcer live region from PageTransition', async () => {
    renderAt('/');

    // Wait for the page to mount so the announcer reflects the route.
    await screen.findByRole('heading', { level: 1 }, { timeout: 5000 });
    expect(screen.getByTestId('route-announcer')).toBeInTheDocument();
  });
});
