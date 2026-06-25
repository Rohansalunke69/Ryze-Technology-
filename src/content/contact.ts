/**
 * Contact CTA and Footer content for the Ryze Portfolio Website.
 *
 * The contact section uses form mode posting to a separately hosted endpoint
 * (Requirements 6.1, 6.2). The footer carries the company name, anchors to all
 * six sections, and one or more external contact links (Requirements 7.1, 7.2,
 * 7.3). Nav anchors are reused from the shared navigation module.
 */

import type { ContactContent, FooterContent } from '../types/contact';
import { navLinks } from './navigation';

export const contactContent: ContactContent = {
  headline: 'Ready to build something great?',
  mode: 'form',
  endpoint: 'https://formspree.io/f/placeholder',
};

export const footerContent: FooterContent = {
  companyName: 'Ryze Technology',
  navLinks: [...navLinks],
  externalContacts: [
    { label: 'hello@ryzetechnology.com', href: 'mailto:hello@ryzetechnology.com' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/ryze-technology' },
    { label: 'GitHub', href: 'https://github.com/ryze-technology' },
    { label: 'X', href: 'https://x.com/ryzetech' },
  ],
};
