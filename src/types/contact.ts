/**
 * Contact CTA and Footer content types.
 */

import type { NavLink } from './navigation';

/** Content for the Contact CTA section. */
export interface ContactContent {
  /** e.g. "Ready to build something great?" */
  headline: string;
  /** Form or "Schedule a call" CTA mode. */
  mode: 'form' | 'schedule';
  /** Required when mode === 'form'; separately hosted endpoint. */
  endpoint?: string;
  /** Required when mode === 'schedule'. */
  scheduleUrl?: string;
}

/** Content for the site footer. */
export interface FooterContent {
  companyName: 'Ryze Technology';
  /** Anchors to all six sections. */
  navLinks: NavLink[];
  /** At least one external contact link. */
  externalContacts: { label: string; href: string }[];
}
