/**
 * Header and footer navigation data for the Ryze Technology site.
 *
 * Centralized, typed, static navigation source consumed by the Navigation and
 * Footer components. Dropdown parents (Work, Services, About) expose `children`;
 * the Contact item is flagged `cta` so it renders as a MagneticButton.
 *
 * Requirements: 1.2 (nav items incl. Work/Services/About dropdowns), 4.2 (footer links).
 */

import type { NavChild, NavItem } from '@app-types';

/**
 * Primary header navigation. Order is meaningful and preserved on render.
 */
export const navItems: NavItem[] = [
  {
    label: 'Work',
    path: '/portfolio',
  },
  {
    label: 'Services',
    children: [
      { label: 'Development', path: '/services/development', description: 'Custom web apps, native mobile apps, and databases' },
      { label: 'Design', path: '/services/design', description: 'Tactile user interfaces, wireframes, and brand books' },
      { label: 'Digital Marketing', path: '/services/digital-marketing', description: 'SEO growth, paid search, and WhatsApp notification funnels' },
      { label: 'Sales & Strategy', path: '/services/sales-strategy', description: 'Sales funnel setups and custom CRM consulting' },
      { label: 'Maintenance & Support', path: '/services/maintenance-support', description: '24/7 uptime care, patching, and AMC retainers' },
      { label: 'All Services', path: '/services', description: 'Overview of how we work and what we offer' },
    ],
  },
  {
    label: 'About',
    children: [
      { label: 'Team & Story', path: '/about', description: 'Who we are and how we got here' },
      { label: 'Manifesto', path: '/manifesto', description: 'What we believe and what we stand against' },
    ],
  },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/contact', cta: true },
];

/**
 * Footer navigation groupings. Provides reachable site links in the global
 * Footer alongside social links and the contact email (Requirement 4.2).
 */
export interface FooterNavGroup {
  title: string;
  links: NavChild[];
}

export const footerNav: FooterNavGroup[] = [
  {
    title: 'Work',
    links: [
      { label: 'Portfolio', path: '/portfolio' },
      { label: 'Case Studies', path: '/portfolio' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Development', path: '/services/development' },
      { label: 'Design', path: '/services/design' },
      { label: 'Digital Marketing', path: '/services/digital-marketing' },
      { label: 'Sales & Strategy', path: '/services/sales-strategy' },
      { label: 'Maintenance & Support', path: '/services/maintenance-support' },
      { label: 'All Services', path: '/services' },
    ],
  },
  {
    title: 'Team',
    links: [
      { label: 'About', path: '/about' },
      { label: 'Manifesto', path: '/manifesto' },
    ],
  },
  {
    title: 'Resources',
    links: [{ label: 'Blog', path: '/blog' }],
  },
  {
    title: 'Contact',
    links: [{ label: 'Get in touch', path: '/contact' }],
  },
];

/**
 * Legal links rendered in the footer's secondary row.
 */
export const footerLegalLinks: NavChild[] = [
  { label: 'Privacy', path: '/privacy' },
  { label: 'Terms', path: '/terms' },
  { label: 'Cookies', path: '/cookies' },
];
