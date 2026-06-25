/**
 * Site-level document metadata (SEO / Open Graph) for the Ryze Portfolio Website.
 *
 * The description is authored to already satisfy the 50–160 character bounds
 * (Requirements 15.2, 15.3), so it does not require runtime normalization.
 */

import type { SiteMetadata } from '../types/metadata';

export const siteMetadata: SiteMetadata = {
  title: 'Ryze Technology — Full-Stack Product Studio',
  description:
    'Ryze Technology is a full-stack studio of seven engineers in Nagpur building websites, mobile and desktop apps, and business systems that scale.',
  canonicalUrl: 'https://ryzetechnology.com/',
  openGraph: {
    title: 'Ryze Technology — We build products that work forever',
    description:
      'Full-stack studio crafting premium websites, mobile and desktop apps, and business systems designed to scale.',
    imageUrl: 'https://ryzetechnology.com/og/ryze-technology-preview.png',
  },
};
