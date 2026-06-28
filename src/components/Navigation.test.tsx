/**
 * Unit tests for Navigation (task 10.2).
 *
 * Rendered inside a MemoryRouter + ReducedMotionProvider with a mocked
 * `matchMedia` and a controllable `window.innerWidth` (which drives
 * `useViewportCategory`). Verifies:
 *  - the `<nav aria-label="Primary">` landmark is present (Req 1.1, 1.6);
 *  - dropdown parents reveal their children on keyboard focus (Req 1.3);
 *  - the Contact CTA links to `/contact` (Req 1.4);
 *  - the mobile hamburger toggles the Mobile_Menu (`aria-expanded` flips),
 *    traps focus, closes on Escape, and restores focus to the toggle
 *    (Req 2.1–2.6, 38.4).
 *
 * Framework: Vitest + @testing-library/react.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 38.4
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';

import { Navigation } from './Navigation';

function setViewportWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
}

function renderNav(props?: Parameters<typeof Navigation>[0]) {
  return render(
    <ReducedMotionProvider>
      <MemoryRouter>
        <Navigation {...props} />
      </MemoryRouter>
    </ReducedMotionProvider>,
  );
}

afterEach(() => {
  resetMatchMedia();
  vi.restoreAllMocks();
});

describe('Navigation — desktop', () => {
  beforeEach(() => {
    mockReducedMotion(false);
    setViewportWidth(1280);
  });

  it('renders the Primary nav landmark', () => {
    renderNav();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });

  it('renders the brand link to home', () => {
    renderNav();
    const home = screen.getByRole('link', { name: 'Ryze Technology home' });
    expect(home).toHaveAttribute('href', '/');
  });

  it('reveals dropdown children when the parent is focused (Req 1.3)', async () => {
    renderNav();
    const servicesToggle = screen.getByRole('button', { name: /services/i });

    // Collapsed by default: children are not in the DOM.
    expect(servicesToggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menuitem', { name: /mobile apps/i })).not.toBeInTheDocument();

    // Focusing the parent opens the disclosure and reveals children.
    servicesToggle.focus();
    await waitFor(() => {
      expect(servicesToggle).toHaveAttribute('aria-expanded', 'true');
    });
    expect(screen.getByRole('menuitem', { name: /mobile apps/i })).toBeInTheDocument();
  });

  it('renders the Contact item as a CTA linking to /contact (Req 1.4)', () => {
    renderNav();
    const contact = screen.getByRole('link', { name: 'Contact' });
    expect(contact).toHaveAttribute('href', '/contact');
    expect(contact).toHaveAttribute('data-cursor', 'magnetic');
  });

  it('does not render the hamburger control on desktop', () => {
    renderNav();
    expect(screen.queryByRole('button', { name: /open menu/i })).not.toBeInTheDocument();
  });
});

describe('Navigation — transparentUntilScroll (Req 1.5)', () => {
  beforeEach(() => {
    mockReducedMotion(false);
    setViewportWidth(1280);
  });

  it('starts transparent at the top of the page', () => {
    setViewportWidth(1280);
    Object.defineProperty(window, 'scrollY', { writable: true, configurable: true, value: 0 });
    const { container } = renderNav({ transparentUntilScroll: true });
    const header = container.querySelector('header');
    expect(header?.className).toContain('bg-transparent');
  });
});

describe('Navigation — mobile menu (Req 2.x, 38.4)', () => {
  beforeEach(() => {
    mockReducedMotion(false);
    setViewportWidth(500);
  });

  it('renders a hamburger control instead of inline links (Req 2.1)', () => {
    renderNav();
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });

  it('toggles the menu and flips aria-expanded (Req 2.2)', async () => {
    const user = userEvent.setup();
    renderNav();
    const toggle = screen.getByRole('button', { name: /open menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);

    const dialog = await screen.findByRole('dialog', { name: /site menu/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('traps focus inside the open menu (Req 2.3)', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByRole('button', { name: /open menu/i }));

    const dialog = await screen.findByRole('dialog', { name: /site menu/i });
    const links = within(dialog).getAllByRole('link');
    const last = links[links.length - 1];

    // Focus the last link, then Tab — focus should cycle back to the first link.
    last?.focus();
    expect(document.activeElement).toBe(last);
    await user.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('closes on Escape and restores focus to the toggle (Req 2.4, 2.5)', async () => {
    const user = userEvent.setup();
    renderNav();
    const toggle = screen.getByRole('button', { name: /open menu/i });
    await user.click(toggle);
    await screen.findByRole('dialog', { name: /site menu/i });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /site menu/i })).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /open menu/i }));
    });
  });

  it('closes the menu when a link is selected (Req 2.6)', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByRole('button', { name: /open menu/i }));

    const dialog = await screen.findByRole('dialog', { name: /site menu/i });
    const workLink = within(dialog).getByRole('link', { name: /work/i });
    await user.click(workLink);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /site menu/i })).not.toBeInTheDocument();
    });
  });
});
