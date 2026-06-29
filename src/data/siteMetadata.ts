/**
 * Site-wide metadata for SEO, Open Graph, and the global footer.
 *
 * Centralized, typed, static metadata consumed by SEOHead and Footer. The
 * `contactEndpoint` is read from injected environment configuration so the
 * static build holds no secrets (Requirement 41.2).
 *
 * Requirements: 40.1 (title template + default OG/canonical), 41.2 (env-injected
 * Form_Endpoint), 13.3 (Contact_Form POST target), 4.2 (footer contact details).
 */

import type { ImageAsset, SiteMetadata, SocialLink } from '@app-types';

/**
 * Fallback used when no `VITE_CONTACT_ENDPOINT` is injected at build time.
 * A SAME-ORIGIN relative path so the form always posts to the site's own
 * Cloudflare Pages Function (`functions/api/contact.ts`) regardless of which
 * domain the site is served from (pages.dev preview or the custom domain).
 */
const DEFAULT_CONTACT_ENDPOINT = '/api/contact';

/**
 * The form POST target, injected per environment. Reads
 * `import.meta.env.VITE_CONTACT_ENDPOINT` and falls back to a sane default so
 * the build never ships an empty endpoint.
 */
const contactEndpoint: string =
  import.meta.env.VITE_CONTACT_ENDPOINT ?? DEFAULT_CONTACT_ENDPOINT;

const defaultOgImage: ImageAsset = {
  src: '/images/og/default.png',
  width: 1200,
  height: 630,
  alt: 'Ryze Technology — a software studio engineering durable web, mobile, and business systems',
};

const social: SocialLink[] = [
  { platform: 'instagram', url: 'https://www.instagram.com/ryzetechnologyy' },
  { platform: 'linkedin', url: 'https://www.linkedin.com/groups/36950024' },
  { platform: 'facebook', url: 'https://www.facebook.com/share/1Mefe2LzFN/' },
  { platform: 'x', url: 'https://x.com/RyzeTechnologyy' },
  { platform: 'whatsapp', url: 'https://whatsapp.com/channel/0029VbCJcIG2kNFjSjODp82k' },
];

export const siteMetadata: SiteMetadata = {
  siteName: 'Ryze Technology',
  defaultTitle: 'Ryze Technology — Software Studio',
  titleTemplate: '%s — Ryze Technology',
  // 142 chars: within the 50–160 range for clean search/social previews.
  defaultDescription:
    'Ryze Technology is a software studio that designs and engineers durable websites, web apps, mobile apps, and business systems built to last.',
  baseUrl: 'https://ryze-technology.pages.dev',
  defaultOgImage,
  social,
  contactEmail: 'ryzetechonologyy@gmail.com',
  contactPhone: '7517358091',
  contactEndpoint,
};
