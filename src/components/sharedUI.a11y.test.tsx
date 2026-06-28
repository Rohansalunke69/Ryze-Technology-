/**
 * Cross-component accessibility & integration tests for the shared UI (task 10.6).
 *
 * This suite is complementary to the per-component unit tests
 * (Navigation.test.tsx, Footer.test.tsx, Breadcrumb.test.tsx, cards.test.tsx):
 * it focuses on automated jest-axe audits and the cross-cutting accessibility
 * guarantees rather than re-asserting every rendered field.
 *
 * Everything is rendered inside a MemoryRouter + ReducedMotionProvider with a
 * mocked `matchMedia` (and a controllable `window.innerWidth`, which drives
 * `useViewportCategory`).
 *
 * Coverage:
 *  - Navigation: axe no-violations for the collapsed desktop header AND the
 *    open mobile menu; dropdown keyboard access (focus reveals children);
 *    Mobile_Menu focus trap + Escape-to-close + focus restore to the toggle
 *    (Requirements 1.3, 2.3, 2.4, 2.5, 38.4).
 *  - Footer: axe no-violations; renders its data-driven content (Requirement 4.2).
 *  - Breadcrumb: axe no-violations; Home-anchored trail with the last item
 *    marked aria-current="page" (Requirement 3.1).
 *  - CaseStudyCard (a representative card, using a real sample from the
 *    Data_Layer): axe no-violations; the shared reserved-box image degrades to
 *    a placeholder on load failure (Requirement 42.3).
 *
 * Framework: Vitest + @testing-library/react + jest-axe.
 * Requirements: 1.3, 2.3, 2.4, 2.5, 3.1, 4.2, 42.3, 38.4
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'jest-axe';

import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import { caseStudies } from '@data/caseStudies';
import type { CaseStudy } from '@app-types';

import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { Breadcrumb } from './Breadcrumb';
import { CaseStudyCard } from './CaseStudyCard';

function setViewportWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
}

function renderWithProviders(
  ui: React.ReactElement,
  initialEntries: string[] = ['/'],
): RenderResult {
  return render(
    <ReducedMotionProvider>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </ReducedMotionProvider>,
  );
}

beforeEach(() => {
  // Reduced motion on keeps the audited markup stable and avoids GSAP imports.
  mockReducedMotion(true);
});

afterEach(() => {
  resetMatchMedia();
  vi.restoreAllMocks();
});

describe('Navigation — accessibility (Req 1.3, 2.3, 2.4, 2.5, 38.4)', () => {
  it('has no axe violations in the collapsed desktop header', async () => {
    setViewportWidth(1280);
    const { container } = renderWithProviders(<Navigation />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('reveals dropdown children on keyboard focus (Req 1.3)', async () => {
    setViewportWidth(1280);
    renderWithProviders(<Navigation />);
    const servicesToggle = screen.getByRole('button', { name: /services/i });

    expect(servicesToggle).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('menuitem', { name: /digital marketing/i }),
    ).not.toBeInTheDocument();

    servicesToggle.focus();
    await waitFor(() => {
      expect(servicesToggle).toHaveAttribute('aria-expanded', 'true');
    });
    expect(
      screen.getByRole('menuitem', { name: /digital marketing/i }),
    ).toBeInTheDocument();
  });

  it('has no axe violations with the mobile menu open (Req 38.4)', async () => {
    setViewportWidth(500);
    const user = userEvent.setup();
    const { container } = renderWithProviders(<Navigation />);

    await user.click(screen.getByRole('button', { name: /open menu/i }));
    await screen.findByRole('dialog', { name: /site menu/i });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('traps focus inside the open mobile menu (Req 2.3)', async () => {
    setViewportWidth(500);
    const user = userEvent.setup();
    renderWithProviders(<Navigation />);

    await user.click(screen.getByRole('button', { name: /open menu/i }));
    const dialog = await screen.findByRole('dialog', { name: /site menu/i });
    const links = within(dialog).getAllByRole('link');
    const last = links[links.length - 1];

    last?.focus();
    expect(document.activeElement).toBe(last);
    // Tabbing past the last focusable cycles back inside the dialog.
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('closes on Escape and restores focus to the toggle (Req 2.4, 2.5)', async () => {
    setViewportWidth(500);
    const user = userEvent.setup();
    renderWithProviders(<Navigation />);

    const toggle = screen.getByRole('button', { name: /open menu/i });
    await user.click(toggle);
    await screen.findByRole('dialog', { name: /site menu/i });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: /site menu/i }),
      ).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: /open menu/i }),
      );
    });
  });
});

describe('Footer — accessibility & content (Req 4.2)', () => {
  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<Footer />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders the contentinfo landmark with data-driven content', () => {
    renderWithProviders(<Footer />);
    const footer = screen.getByRole('contentinfo');
    // Social + legal groupings are sourced from the Data_Layer.
    expect(within(footer).getByRole('list', { name: /social media/i })).toBeInTheDocument();
    expect(within(footer).getByRole('list', { name: /legal/i })).toBeInTheDocument();
    // Copyright line is derived from siteMetadata.
    expect(within(footer).getByText(/all rights reserved/i)).toBeInTheDocument();
  });
});

describe('Breadcrumb — accessibility & trail (Req 3.1)', () => {
  it('has no axe violations on a sub-page', async () => {
    const { container } = renderWithProviders(
      <Breadcrumb />,
      ['/portfolio/some-project'],
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('anchors the trail at Home and marks the last item as current', () => {
    renderWithProviders(<Breadcrumb />, ['/portfolio/some-project']);
    const nav = screen.getByRole('navigation', { name: /breadcrumb/i });

    // Trail starts at Home as a link to '/'.
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    );
    // The current (last) page is plain text with aria-current="page".
    const current = within(nav).getByText('Some Project');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(
      within(nav).queryByRole('link', { name: 'Some Project' }),
    ).toBeNull();
  });
});

describe('CaseStudyCard — accessibility & image fallback (Req 42.3)', () => {
  // Use a real sample from the Data_Layer for a representative card.
  const sample = caseStudies[0] as CaseStudy;

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <CaseStudyCard caseStudy={sample} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('degrades the hero image to a placeholder on load failure (Req 42.3)', () => {
    // A sample with no LQIP forces the solid-placeholder branch.
    const { blurDataURL: _omitLqip, ...heroWithoutLqip } = sample.hero;
    const noLqip: CaseStudy = {
      ...sample,
      hero: { ...heroWithoutLqip, alt: 'Case hero alt' },
    };
    const { container } = renderWithProviders(
      <CaseStudyCard caseStudy={noLqip} />,
    );

    const img = screen.getByRole('img', { name: 'Case hero alt' });
    fireEvent.error(img);

    const placeholder = container.querySelector(
      '[data-card-image-placeholder="true"]',
    );
    expect(placeholder).not.toBeNull();
    // The reserved box stays in place; the broken <img> is gone.
    expect(
      screen.queryByRole('img', { name: 'Case hero alt' })?.tagName,
    ).not.toBe('IMG');
  });
});
