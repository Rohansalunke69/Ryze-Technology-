import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MotionProvider } from '@hooks';
import { navLinks } from '@content/navigation';
import { Navigation } from './Navigation';

/**
 * Install a `window.matchMedia` stub whose `matches` reflects the desired
 * reduced-motion preference. `MotionProvider` reads this on mount, so it must
 * be set before rendering.
 */
function mockReducedMotion(prefersReduced: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? prefersReduced : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

/** Render the Navigation inside the MotionProvider (provides reducedMotion). */
function renderNav(): void {
  render(
    <MotionProvider>
      <Navigation />
    </MotionProvider>,
  );
}

describe('Navigation', () => {
  let scrollIntoView: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Default: motion allowed. Individual tests may override before rendering.
    mockReducedMotion(false);

    // Provide a scroll spy; jsdom does not implement scrollIntoView.
    scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;

    // Add real section targets so smoothScrollToSection can resolve them.
    for (const link of navLinks) {
      const section = document.createElement('section');
      section.id = link.id;
      document.body.appendChild(section);
    }
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('renders a navigation landmark (Req 13.4)', () => {
    renderNav();
    const nav = screen.getByRole('navigation', { name: /primary/i });
    expect(nav).toBeInTheDocument();
  });

  it('renders all nav links plus the brand for desktop/tablet (Req 8.2)', () => {
    renderNav();
    // Brand button.
    expect(
      screen.getByRole('button', { name: /back to top/i }),
    ).toBeInTheDocument();
    // Every authored link label is present (desktop row renders them).
    for (const link of navLinks) {
      expect(
        screen.getAllByRole('button', { name: link.label }).length,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it('starts with the mobile menu collapsed (aria-expanded=false) (Req 8.5)', () => {
    renderNav();
    const toggle = screen.getByRole('button', { name: /open menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'primary-navigation-menu');
    // The mobile panel is not in the DOM while collapsed.
    expect(document.getElementById('primary-navigation-menu')).toBeNull();
  });

  it('toggles the mobile menu open and closed, updating aria-expanded (Req 8.5)', async () => {
    const user = userEvent.setup();
    renderNav();

    const toggle = screen.getByRole('button', { name: /open menu/i });
    await user.click(toggle);

    // After opening, aria-expanded flips and the panel with links appears.
    const openToggle = screen.getByRole('button', { name: /close menu/i });
    expect(openToggle).toHaveAttribute('aria-expanded', 'true');

    const panel = document.getElementById('primary-navigation-menu');
    expect(panel).not.toBeNull();
    const panelLinks = within(panel as HTMLElement).getAllByRole('button');
    expect(panelLinks).toHaveLength(navLinks.length);

    // Closing again hides the panel.
    await user.click(openToggle);
    expect(
      screen.getByRole('button', { name: /open menu/i }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('primary-navigation-menu')).toBeNull();
  });

  it('closes the mobile menu after a link is activated (Req 8.5)', async () => {
    const user = userEvent.setup();
    renderNav();

    await user.click(screen.getByRole('button', { name: /open menu/i }));
    const panel = document.getElementById('primary-navigation-menu') as HTMLElement;
    const firstLink = within(panel).getAllByRole('button')[0];
    await user.click(firstLink);

    // Navigation scrolled and the menu collapsed.
    expect(scrollIntoView).toHaveBeenCalled();
    expect(document.getElementById('primary-navigation-menu')).toBeNull();
  });

  it('scrolls smoothly when motion is allowed (Req 8.3)', async () => {
    mockReducedMotion(false);
    const user = userEvent.setup();
    renderNav();

    await user.click(screen.getAllByRole('button', { name: 'Work' })[0]);

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('scrolls instantly (auto) under reduced motion (Req 8.4)', async () => {
    mockReducedMotion(true);
    const user = userEvent.setup();
    renderNav();

    await user.click(screen.getAllByRole('button', { name: 'Work' })[0]);

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
  });

  it('gives every interactive control a 44px minimum tap target (Req 9.6)', () => {
    renderNav();
    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      expect(button.className).toMatch(/min-h-tap-target/);
      expect(button.className).toMatch(/min-w-tap-target/);
    }
  });

  it('provides visible focus indicators on interactive controls (Req 13.1)', () => {
    renderNav();
    for (const button of screen.getAllByRole('button')) {
      expect(button.className).toMatch(/focus-visible:ring/);
    }
  });

  it('has no axe accessibility violations when collapsed (Req 13.2, 13.4)', async () => {
    const { container } = render(
      <MotionProvider>
        <Navigation />
      </MotionProvider>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe accessibility violations when the mobile menu is open', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MotionProvider>
        <Navigation />
      </MotionProvider>,
    );
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
