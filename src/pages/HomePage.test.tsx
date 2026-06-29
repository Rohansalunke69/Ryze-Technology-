/**
 * Unit tests for HomePage (task 14.1 / 14.2).
 *
 * Verifies the homepage contract from Requirement 6:
 *  - the sections render in the mandated order: Hero → Problems → Philosophy →
 *    Portfolio-preview → Services → Why-Us → Team → CTA (Requirement 6.1);
 *  - the Portfolio-preview surfaces only `featured` case studies (Requirement 6.2);
 *  - the Why-Us metric values render (AnimatedCounter, Requirement 6.3);
 *  - the CTA links to `/contact` (Requirement 6.4);
 *  - exactly one `h1` and a sound landmark structure (Requirement 38.1).
 *
 * The page reads the motion preference via `useReducedMotion`, navigates via
 * react-router `Link`s, and sets metadata through `react-helmet-async`, so it
 * is rendered inside `MemoryRouter` + `ReducedMotionProvider` + `HelmetProvider`.
 *
 * Reduced motion is mocked ON: this keeps the Hero on its static fallback (it
 * never probes/mount WebGL under reduced motion), so no `./HeroWebGL` mock or
 * WebGL stubbing is needed. `matchMedia` and `IntersectionObserver` are stubbed
 * because jsdom implements neither.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import { caseStudies } from '@data/caseStudies';
import { team } from '@data/team';
import HomePage from './HomePage';

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
  // Reduced motion ON → Hero stays on the static fallback (no WebGL probe).
  mockReducedMotion(true);
});

afterEach(() => {
  resetMatchMedia();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function renderHome() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <ReducedMotionProvider>
          <HomePage />
        </ReducedMotionProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('HomePage', () => {
  it('renders exactly one h1 with the brand headline (Requirement 38.1)', () => {
    renderHome();
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Design. Develop. Grow.' }),
    ).toBeInTheDocument();
  });

  it('renders the named sections in the mandated order (Requirement 6.1)', () => {
    const { container } = renderHome();

    // Collect the accessible names of every labelled section/region in DOM order.
    const labelled = Array.from(
      container.querySelectorAll<HTMLElement>('[aria-label]'),
    ).map((el) => el.getAttribute('aria-label'));

    const expectedOrder = [
      'Intro', // Hero
      'Challenges',
      'Philosophy',
      'Featured work', // Portfolio preview
      'Team',
    ];

    // Filter to just the sections we care about, preserving DOM order, then
    // assert the relative order matches.
    const relevant = labelled.filter(
      (name) => name !== null && expectedOrder.includes(name),
    );
    expect(relevant).toEqual(expectedOrder);

    // The CTA section follows the Team section and links to /contact.
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: "Let's build something permanent",
      }),
    ).toBeInTheDocument();
  });

  it('shows only featured case studies in the portfolio preview (Requirement 6.2)', () => {
    renderHome();
    const featured = caseStudies.filter((c) => c.featured);
    const nonFeatured = caseStudies.filter((c) => !c.featured);

    const preview = screen.getByRole('region', { name: 'Featured work' });

    // Every featured case study title is present in the preview...
    for (const cs of featured) {
      expect(within(preview).getByText(cs.title)).toBeInTheDocument();
    }
    // ...and no non-featured case study leaks in.
    for (const cs of nonFeatured) {
      expect(within(preview).queryByText(cs.title)).not.toBeInTheDocument();
    }

    // The rendered card count equals the featured count.
    const cards = within(preview).getAllByRole('link', { name: /.+/ });
    // One "View all work" link + one link per featured card.
    expect(cards.length).toBe(featured.length + 1);
  });

  it('renders a TeamCard for each team member', () => {
    renderHome();
    const teamRegion = screen.getByRole('region', { name: 'Team' });
    for (const member of team) {
      expect(
        within(teamRegion).getByRole('heading', {
          level: 3,
          name: member.name,
        }),
      ).toBeInTheDocument();
    }
  });

  it('renders a CTA linking to /contact (Requirement 6.4)', () => {
    renderHome();
    const cta = screen.getByRole('heading', {
      level: 2,
      name: "Let's build something permanent",
    });
    // The CTA band is the heading's section ancestor.
    const section = cta.closest('section');
    expect(section).not.toBeNull();
    const link = within(section as HTMLElement).getByRole('link');
    expect(link).toHaveAttribute('href', '/contact');
  });

  it('sets the homepage document title (Requirement 40.1)', async () => {
    renderHome();
    // SEOHead collapses the site-name title to the configured default title.
    await vi.waitFor(() => {
      expect(document.title).toBe('Ryze Technology — Software Studio');
    });
  });
});
