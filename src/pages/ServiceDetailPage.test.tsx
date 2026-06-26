/**
 * Tests for ServiceDetailPage (`/services/:slug`).
 *
 * Renders the page through a MemoryRouter at a `/services/:slug` route so the
 * `useParams` slug resolves against the real `services` data, wrapped in the
 * ReducedMotionProvider (motion off, so AnimationWrapper reveals content
 * immediately) and a HelmetProvider for SEOHead. `matchMedia` is mocked since
 * jsdom does not implement it.
 *
 * Covered behaviors:
 *  - a known slug renders the service name, features, and FAQ (Requirement 10.1);
 *  - the FAQ accordion toggles `aria-expanded` on click (Requirement 10.3);
 *  - related-by-service case study cards are present (Requirement 10.2);
 *  - an unknown slug renders the in-route not-found state (Requirement 10.4).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion } from '@/test/matchMedia';
import ServiceDetailPage from './ServiceDetailPage';

function renderAt(path: string): void {
  render(
    <HelmetProvider>
      <ReducedMotionProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/services/:slug" element={<ServiceDetailPage />} />
          </Routes>
        </MemoryRouter>
      </ReducedMotionProvider>
    </HelmetProvider>,
  );
}

beforeEach(() => {
  // Motion off: AnimationWrapper renders children in their final visible state.
  mockReducedMotion(true);
});

describe('ServiceDetailPage', () => {
  it('renders the resolved service name, features, and FAQ for a known slug', () => {
    renderAt('/services/websites');

    // Hero heading is the service name (Requirement 10.1).
    expect(
      screen.getByRole('heading', { level: 1, name: 'Websites' }),
    ).toBeInTheDocument();

    // A feature from the websites service (Requirement 10.1).
    expect(screen.getByText('Performance-first builds')).toBeInTheDocument();

    // A FAQ question rendered as an accordion trigger (Requirements 10.1, 10.3).
    expect(
      screen.getByRole('button', {
        name: /How long does a website project take/i,
      }),
    ).toBeInTheDocument();
  });

  it('toggles aria-expanded on the FAQ accordion trigger', () => {
    renderAt('/services/websites');

    const trigger = screen.getByRole('button', {
      name: /How long does a website project take/i,
    });

    // Collapsed by default.
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // The controlled panel is referenced and starts hidden.
    const panelId = trigger.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders related-by-service case study cards (getCaseStudiesByService)', () => {
    renderAt('/services/websites');

    // orange-city-grocers lists 'websites' in its services[] (Requirement 10.2).
    const card = screen.getByRole('link', {
      name: /aisle browsers into loyal subscribers/i,
    });
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('href', '/portfolio/orange-city-grocers');
  });

  it('renders the in-route not-found state for an unknown slug', () => {
    renderAt('/services/does-not-exist');

    expect(
      screen.getByRole('heading', { level: 1, name: /couldn.t find that service/i }),
    ).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /view all services/i });
    expect(link).toHaveAttribute('href', '/services');

    // The resolved-service content must not be present.
    expect(
      screen.queryByRole('heading', { level: 1, name: 'Websites' }),
    ).not.toBeInTheDocument();
  });
});
