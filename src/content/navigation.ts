/**
 * Top-level navigation links for the Ryze Portfolio Website.
 *
 * The six entries map to the in-page section anchors in the design's fixed
 * render order: Hero, Portfolio, Services, Differentiators, Team, Contact
 * (Requirement 8.1). Labels are human-readable.
 */

import type { NavLink } from '../types/navigation';

export const navLinks: readonly NavLink[] = [
  { id: 'hero', label: 'Home' },
  { id: 'portfolio', label: 'Work' },
  { id: 'services', label: 'Services' },
  { id: 'differentiators', label: 'Why Ryze' },
  { id: 'team', label: 'Team' },
  { id: 'contact', label: 'Contact' },
];
