/**
 * Unit tests for ServicesPage (task 14.7).
 *
 * ServicesPage composes motion-aware components (SectionHeader/SplitText,
 * AnimationWrapper, MagneticButton) and SEOHead, so renders are wrapped in
 * `MemoryRouter` (ServiceCard links), `ReducedMotionProvider` (motion prefs),
 * and `HelmetProvider` (SEOHead). `matchMedia` and `IntersectionObserver` are
 * stubbed because jsdom does not implement them.
 *
 * Requirements: 9.1 (four service cards), 9.2 (process steps + maintenance
 * band), 9.3 (CTA section).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import { services } from '@data/services';

import { ServicesPage } from './ServicesPage';

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
          <ServicesPage />
        </ReducedMotionProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('ServicesPage', () => {
  it('renders the page-level h1 hero heading', () => {
    renderPage();
    const h1 = screen.getByRole('heading', { level: 1, name: 'Our Expertise' });
    expect(h1.tagName).toBe('H1');
  });

  it('renders all five service entities as cards with Learn More links (Req 9.1)', () => {
    renderPage();

    expect(services).toHaveLength(5);
    for (const service of services) {
      expect(
        screen.getByRole('heading', { level: 3, name: service.name }),
      ).toBeInTheDocument();
      const link = screen.getByRole('link', {
        name: `Learn more about ${service.name}`,
      });
      expect(link).toHaveAttribute('href', `/services/${service.slug}`);
    }
  });

  it('renders a numbered four-step process section (Req 9.2)', () => {
    renderPage();

    const processHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Our Process',
    });
    expect(processHeading).toBeInTheDocument();

    const list = screen.getByRole('list', { name: 'Our Process' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(4);

    for (const step of [
      'Discovery & Design',
      'Development',
      'Launch & Deploy',
      'Scale & Support',
    ]) {
      expect(within(list).getByText(step)).toBeInTheDocument();
    }
  });

  it('renders the support/maintenance band (Req 9.2)', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: "We Don't Stop at Launch" }),
    ).toBeInTheDocument();
  });

  it('renders a CTA section linking to /contact (Req 9.3)', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Have something to build?' }),
    ).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: "Let's build" });
    expect(cta).toHaveAttribute('href', '/contact');
  });
});
