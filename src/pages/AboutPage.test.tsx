/**
 * Unit tests for AboutPage (task 14.11).
 *
 * AboutPage composes motion-aware components (SectionHeader/SplitText,
 * AnimationWrapper, TeamCard, CTA) and SEOHead, so renders are wrapped in
 * `MemoryRouter` (CTA link), `ReducedMotionProvider` (motion prefs), and
 * `HelmetProvider` (SEOHead). `matchMedia` and `IntersectionObserver` are
 * stubbed because jsdom does not implement them.
 *
 * Requirements: 11.1 (story/mission/team/differentiators/CTA sections),
 * 11.2 (a TeamCard per member with social links).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { axe } from 'jest-axe';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import { team } from '@data/team';

import { AboutPage } from './AboutPage';

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
          <AboutPage />
        </ReducedMotionProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('AboutPage', () => {
  it('renders the page-level h1 hero heading', () => {
    renderPage();
    const h1 = screen.getByRole('heading', {
      level: 1,
      name: 'A studio that sweats the details',
    });
    expect(h1.tagName).toBe('H1');
  });

  it('renders the remaining required sections (Req 11.1)', () => {
    renderPage();

    // Story hero (h1) + the remaining section openers as h2.
    for (const name of [
      'Software that earns its keep', // mission
      'Meet the team', // team profiles
      'What sets us apart', // differentiators
      'Want to work with us?', // CTA
    ]) {
      expect(
        screen.getByRole('heading', { name }),
      ).toBeInTheDocument();
    }

    // Landmark regions for the labelled sections are present.
    expect(
      screen.getByRole('region', { name: 'Our mission' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Our team' }),
    ).toBeInTheDocument();
  });

  it('renders a TeamCard for each team member with social links (Req 11.2)', () => {
    renderPage();

    expect(team.length).toBeGreaterThan(0);
    for (const member of team) {
      // Each member's name is rendered as a card heading.
      expect(
        screen.getByRole('heading', { level: 3, name: member.name }),
      ).toBeInTheDocument();

      // Social links are grouped in a list labelled with the member's name,
      // with one link per social entry.
      const socialList = screen.getByRole('list', {
        name: `${member.name} on social media`,
      });
      const links = within(socialList).getAllByRole('link');
      expect(links).toHaveLength(member.socials.length);
    }
  });

  it('renders a CTA section linking to /contact (Req 11.1)', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Want to work with us?' }),
    ).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: "Let's build" });
    expect(cta).toHaveAttribute('href', '/contact');
  });

  it('has no detectable accessibility violations', async () => {
    mockReducedMotion(true);
    const { container } = renderPage();
    expect(await axe(container)).toHaveNoViolations();
  });
});
