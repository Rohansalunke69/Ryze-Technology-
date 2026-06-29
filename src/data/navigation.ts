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
    label: 'Home',
    path: '/',
  },
  {
    label: 'Work',
    path: '/portfolio',
  },
  {
    label: 'Services',
    children: [
      { label: 'Development', path: '/services/development', description: 'Web & mobile apps, websites, e-commerce, dashboards, APIs' },
      { label: 'Design', path: '/services/design', description: 'UI/UX, branding, prototyping, redesigns, design systems' },
      { label: 'Digital Marketing', path: '/services/digital-marketing', description: 'SEO, social, paid ads, content, email & WhatsApp' },
      { label: 'Sales & Strategy', path: '/services/sales-strategy', description: 'Lead gen, funnels, CRM setup, business consulting' },
      { label: 'Maintenance & Support', path: '/services/maintenance-support', description: 'Maintenance plans, support, hosting, optimization, AMC' },
    ],
  },
  {
    label: 'About',
    path: '/about',
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
    ],
  },
  {
    title: 'Team',
    links: [
      { label: 'About', path: '/about' },
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
