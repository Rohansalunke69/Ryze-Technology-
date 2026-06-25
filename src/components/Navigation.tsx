/**
 * Navigation — sticky top navigation for the Ryze Portfolio Website.
 *
 * Renders a semantic `<nav>` landmark (Req 13.4) fixed to the top of the page.
 * On tablet and desktop viewports (>= 768px) the nav links are presented as a
 * horizontal row (Req 8.2). On mobile (< 768px) the links collapse behind a
 * toggleable hamburger menu control (Req 8.5) that exposes `aria-expanded` /
 * `aria-controls` and an accessible label.
 *
 * Activating a link smooth-scrolls to the corresponding section, honoring the
 * user's reduced-motion preference (Req 8.3, 8.4) via `smoothScrollToSection`,
 * and closes the mobile menu afterward.
 *
 * All interactive controls meet the 44x44px minimum tap target on mobile
 * (Req 9.6), carry a visible focus indicator (Req 13.1), and follow the visual
 * reading order for keyboard tab order (Req 13.2).
 *
 * Requirements: 8.2, 8.3, 8.4, 8.5, 9.6, 13.1, 13.2, 13.4
 */
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { NavLink } from '@apptypes';
import { navLinks as defaultNavLinks } from '@content/navigation';
import { smoothScrollToSection, useReducedMotionContext } from '@hooks';

export interface NavigationProps {
  /** Navigation links to render. Defaults to the authored `navLinks`. */
  links?: readonly NavLink[];
}

/** Shared focus-ring utility for visible keyboard focus indicators (Req 13.1). */
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900';

/** Tap-target + layout classes shared by every interactive link/button (Req 9.6). */
const tapTarget = 'min-h-tap-target min-w-tap-target inline-flex items-center';

export function Navigation({
  links = defaultNavLinks,
}: NavigationProps): JSX.Element {
  const reducedMotion = useReducedMotionContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuPanelId = 'primary-navigation-menu';

  const handleNavigate = (id: NavLink['id']): void => {
    smoothScrollToSection(id, reducedMotion);
    // Close the mobile menu after navigating (Req 8.5).
    setIsMenuOpen(false);
  };

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 top-0 z-50 bg-navy-900/95 backdrop-blur supports-[backdrop-filter]:bg-navy-900/80"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 tablet:px-6">
        {/* Brand / logo links back to the hero section. */}
        <button
          type="button"
          onClick={() => handleNavigate('hero')}
          aria-label="Ryze — back to top"
          className={`${tapTarget} ${focusRing} rounded px-2 text-xl font-bold tracking-tight text-body hover:text-accent`}
        >
          Ryze
        </button>

        {/* Desktop / tablet horizontal links (visible >= 768px) (Req 8.2). */}
        <ul className="hidden items-center gap-1 tablet:flex">
          {links.map((link) => (
            <li key={link.id}>
              <button
                type="button"
                onClick={() => handleNavigate(link.id)}
                className={`${tapTarget} ${focusRing} rounded px-3 text-body-mobile font-medium text-body hover:text-accent`}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger toggle (visible < 768px) (Req 8.5). */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls={menuPanelId}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className={`${tapTarget} ${focusRing} justify-center rounded text-body hover:text-accent tablet:hidden`}
        >
          {isMenuOpen ? (
            <X aria-hidden="true" className="h-6 w-6" />
          ) : (
            <Menu aria-hidden="true" className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu panel: rendered only when open (Req 8.5). */}
      {isMenuOpen && (
        <ul
          id={menuPanelId}
          className="flex flex-col gap-1 border-t border-navy-700 bg-navy-900 px-4 py-2 tablet:hidden"
        >
          {links.map((link) => (
            <li key={link.id}>
              <button
                type="button"
                onClick={() => handleNavigate(link.id)}
                className={`${tapTarget} ${focusRing} w-full justify-start rounded px-3 text-body-mobile font-medium text-body hover:text-accent`}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

export default Navigation;
