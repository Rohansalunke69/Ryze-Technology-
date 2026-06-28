/**
 * Navigation — the sticky global header (task 10.2).
 *
 * Renders the data-driven primary navigation for the Site:
 *  - a sticky semantic `<header>` containing a `<nav aria-label="Primary">`
 *    landmark that stays reachable while scrolling (Requirement 1.1, 1.6);
 *  - the brand/logo linking home and the nav items from the Data_Layer,
 *    including the Work / Services / About dropdown parents (Requirement 1.2);
 *  - dropdown parents reveal their children on hover AND keyboard focus via a
 *    disclosure button carrying `aria-haspopup` / `aria-expanded`
 *    (Requirement 1.3);
 *  - the Contact item rendered as a MagneticButton call-to-action linking to
 *    `/contact` (Requirement 1.4);
 *  - an optional `transparentUntilScroll` mode: transparent background at the
 *    page top, solid once the visitor scrolls (Requirement 1.5).
 *
 * On mobile viewports the inline links are replaced by a hamburger control that
 * opens a full-screen Mobile_Menu overlay with focus trap, Escape-to-close,
 * focus restore to the toggle, and close-on-navigate (Requirements 2.1–2.6,
 * 38.4).
 *
 * Links carry `data-cursor="link"` so the CustomCursor can present its
 * hover-link state (design "Cursor States").
 *
 * _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 38.4_
 */
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Link, NavLink } from 'react-router-dom';

import { navItems as defaultNavItems } from '@data/navigation';
import type { NavChild, NavItem } from '@app-types';
import { useViewportCategory } from '@hooks/useViewportCategory';
import { MagneticButton } from './MagneticButton';
import { Logo } from './Logo';

export interface NavigationProps {
  /** Nav items to render. Defaults to the Data_Layer `navItems`. */
  items?: NavItem[];
  /**
   * When enabled the header is transparent at the very top of the page and
   * switches to a solid background once the visitor scrolls (Requirement 1.5).
   */
  transparentUntilScroll?: boolean;
}

/** Path the Contact CTA links to (Requirement 1.4). */
const CONTACT_PATH = '/contact';

/** Selector matching the elements a focus trap should cycle through. */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** True when the item is a dropdown parent (has children, no own path). */
function isDropdownParent(item: NavItem): item is NavItem & { children: NavChild[] } {
  return Array.isArray(item.children) && item.children.length > 0;
}

/**
 * Track whether the page has been scrolled past the top. Used to flip the
 * transparent-until-scroll header to a solid background (Requirement 1.5).
 */
function useScrolledPastTop(enabled: boolean): boolean {
  const [scrolled, setScrolled] = useState<boolean>(() => {
    if (!enabled || typeof window === 'undefined') return false;
    return window.scrollY > 0;
  });

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return undefined;
    }

    const handleScroll = (): void => {
      setScrolled(window.scrollY > 0);
    };

    // Sync once in case the page is already scrolled on mount.
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled]);

  return scrolled;
}

/**
 * Scroll progress in [0,1] across the first `max` pixels of the page. Drives the
 * header underline color morph (black → brand blue) as the visitor scrolls.
 */
function useScrollProgress(max = 600): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onScroll = (): void => {
      setProgress(Math.min(1, Math.max(0, window.scrollY / max)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [max]);

  return progress;
}

/**
 * Interpolate the header underline color from black (at the top) to the Ryze
 * brand blue (once scrolled) based on `progress` in [0,1].
 */
function underlineColor(progress: number): string {
  const from = { r: 10, g: 10, b: 8 }; // #0a0a08 — black
  const to = { r: 33, g: 86, b: 201 }; // #2156c9 — brand blue
  const r = Math.round(from.r + (to.r - from.r) * progress);
  const g = Math.round(from.g + (to.g - from.g) * progress);
  const b = Math.round(from.b + (to.b - from.b) * progress);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * A single desktop dropdown parent. Reveals its children on hover and on
 * keyboard focus, exposing a disclosure button with `aria-haspopup` /
 * `aria-expanded` so the menu is reachable and announced (Requirement 1.3).
 */
function DesktopDropdown({ item }: { item: NavItem & { children: NavChild[] } }): JSX.Element {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLLIElement>(null);

  // Close when focus leaves the whole group (so keyboard tab-out collapses it).
  const handleBlur = useCallback((event: React.FocusEvent<HTMLLIElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next === null || !event.currentTarget.contains(next)) {
      setOpen(false);
    }
  }, []);

  const handleKeyDown = useCallback((event: ReactKeyboardEvent<HTMLLIElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
    }
  }, []);

  return (
    <li
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        data-cursor="link"
        className="inline-flex items-center gap-1 px-3 py-2 font-mono text-sm tracking-wide text-mist-100 transition-colors hover:text-pulse-500 focus-visible:text-pulse-500"
        onClick={() => setOpen((prev) => !prev)}
      >
        {item.label}
        <span aria-hidden="true" className="text-xs">
          ▾
        </span>
      </button>

      {open ? (
        // Wrapper carries a transparent top padding that BRIDGES the gap to the
        // button, so moving the cursor from the button to the panel never
        // leaves the hover container (fixes the "closes before click" bug).
        <div className="absolute left-0 top-full z-[70] pt-3">
          <ul
            id={menuId}
            role="menu"
            aria-label={item.label}
            className="flex w-[min(92vw,22rem)] flex-col rounded-xl border border-ink-600 bg-white p-2.5 shadow-[0_28px_70px_-18px_rgba(10,10,8,0.45)] ring-1 ring-black/5"
          >
            {item.children.map((child, index) => (
              <li key={`${child.label}-${child.path}`} role="none">
                {index > 0 ? (
                  <div
                    aria-hidden="true"
                    className="mx-2 h-px bg-gradient-to-r from-transparent via-black/40 to-transparent"
                  />
                ) : null}
                <Link
                  role="menuitem"
                  to={child.path}
                  data-cursor="link"
                  className="flex h-full flex-col gap-1 rounded-lg border border-transparent px-3.5 py-3 transition-colors hover:border-ink-600 hover:bg-ink-700 focus-visible:border-ink-600 focus-visible:bg-ink-700"
                  onClick={() => setOpen(false)}
                >
                  <span className="font-mono text-sm font-medium tracking-wide text-mist-100">
                    {child.label}
                  </span>
                  {child.description !== undefined ? (
                    <span className="block text-xs leading-snug text-mist-300">
                      {child.description}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/** Desktop / tablet inline navigation row. */
function DesktopNav({ items }: { items: NavItem[] }): JSX.Element {
  return (
    <ul className="hidden items-center gap-2 md:flex">
      {items.map((item) => {
        if (item.cta === true) {
          return (
            <li key={item.label}>
              <MagneticButton as="a" href={item.path ?? CONTACT_PATH} ariaLabel={item.label}>
                {item.label}
              </MagneticButton>
            </li>
          );
        }

        if (isDropdownParent(item)) {
          return <DesktopDropdown key={item.label} item={item} />;
        }

        return (
          <li key={item.label}>
            <NavLink
              to={item.path ?? '/'}
              data-cursor="link"
              className="inline-flex items-center px-3 py-2 font-mono text-sm tracking-wide text-mist-100 transition-colors hover:text-pulse-500 focus-visible:text-pulse-500"
            >
              {item.label}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Full-screen Mobile_Menu overlay. Traps focus, closes on Escape, and closes
 * when a link is selected (Requirements 2.3, 2.4, 2.6, 38.4).
 */
function MobileMenu({
  id,
  items,
  onClose,
}: {
  id: string;
  items: NavItem[];
  onClose: () => void;
}): JSX.Element {
  const panelRef = useRef<HTMLDivElement>(null);

  // Move initial focus into the menu when it opens.
  useEffect(() => {
    const panel = panelRef.current;
    if (panel === null) return;
    const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusables[0] ?? panel).focus();
  }, []);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (panel === null) return;

      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      // Cycle focus to keep it trapped inside the menu (Requirement 2.3).
      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) {
          event.preventDefault();
          last?.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first?.focus();
      }
    },
    [onClose],
  );

  // Flatten the nav tree into a single reachable link list.
  const links: NavChild[] = [];
  for (const item of items) {
    if (isDropdownParent(item)) {
      for (const child of item.children) links.push(child);
    } else if (item.path !== undefined) {
      links.push({ label: item.label, path: item.path });
    }
  }

  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-40 flex flex-col gap-2 overflow-y-auto bg-ink-900 px-6 pb-10 pt-24 md:hidden"
    >
      <nav aria-label="Mobile" className="flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={`${link.label}-${link.path}`}
            to={link.path}
            data-cursor="link"
            className="block border-b border-ink-700 py-4 font-display text-2xl text-mist-100 transition-colors hover:text-pulse-500 focus-visible:text-pulse-500"
            onClick={onClose}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function Navigation({
  items = defaultNavItems,
  transparentUntilScroll = false,
}: NavigationProps): JSX.Element {
  const category = useViewportCategory();
  const isMobile = category === 'mobile';
  const scrolled = useScrolledPastTop(transparentUntilScroll);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the Mobile_Menu when leaving the mobile breakpoint.
  useEffect(() => {
    if (!isMobile && menuOpen) {
      setMenuOpen(false);
    }
  }, [isMobile, menuOpen]);

  // Restore focus to the hamburger control after the menu closes
  // (Requirement 2.5).
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    // Defer so the toggle is back in the DOM/visible before focusing.
    requestAnimationFrame(() => toggleRef.current?.focus());
  }, []);

  const solid = !transparentUntilScroll || scrolled || menuOpen;
  const scrollProgress = useScrollProgress();

  return (
    <header
      style={{ borderBottomColor: underlineColor(scrollProgress) }}
      className={[
        'fixed inset-x-0 top-0 z-50 w-full border-b transition-colors duration-300',
        solid ? 'bg-ink-700/90 backdrop-blur-md shadow-[0_1px_14px_-6px_rgba(10,10,8,0.5)]' : 'bg-transparent',
      ].join(' ')}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5"
      >
        <Link
          to="/"
          data-cursor="link"
          aria-label="Ryze Technology home"
          className="transition-opacity hover:opacity-80 focus-visible:opacity-80"
        >
          <Logo variant="full" height={34} />
        </Link>

        {isMobile ? (
          <button
            ref={toggleRef}
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            data-cursor="link"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-mist-100 transition-colors hover:text-pulse-500 focus-visible:text-pulse-500 md:hidden"
            onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
          >
            <svg
              aria-hidden="true"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        ) : (
          <DesktopNav items={items} />
        )}
      </nav>

      {isMobile && menuOpen ? (
        <MobileMenu id={menuId} items={items} onClose={closeMenu} />
      ) : null}
    </header>
  );
}

export default Navigation;
