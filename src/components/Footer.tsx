/**
 * Footer — global site footer (task 10.3).
 *
 * Renders on every page (Requirement 4.1) as the `contentinfo` landmark. Sources
 * all content from the typed Data_Layer (Requirement 4.2):
 *  - the brand name + tagline and the copyright line from `siteMetadata`;
 *  - site links from `footerNav` groups (internal `Link`s);
 *  - legal links from `footerLegalLinks`;
 *  - social profiles from `siteMetadata.social` (external, opened in a new tab
 *    with `rel="noopener noreferrer"`);
 *  - the contact email as a `mailto:` link from `siteMetadata.contactEmail`.
 *
 * _Requirements: 4.1, 4.2_
 */
import { Link } from 'react-router-dom';

import { Logo } from './Logo';
import { siteMetadata } from '@data/siteMetadata';
import { footerNav, footerLegalLinks } from '@data/navigation';
import type { SiteMetadata, SocialLink } from '@app-types';

export interface FooterProps {
  /** Site metadata source. Defaults to the shipped `siteMetadata`. */
  metadata?: SiteMetadata;
}

/** Human-readable labels for each social platform. */
const SOCIAL_LABELS: Record<SocialLink['platform'], string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  x: 'X',
  dribbble: 'Dribbble',
  email: 'Email',
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
};

/** Brand glyphs per social platform, drawn with `currentColor`. */
function SocialGlyph({ platform }: { platform: SocialLink['platform'] }): JSX.Element {
  const box = { width: 20, height: 20, viewBox: '0 0 24 24', 'aria-hidden': true } as const;
  switch (platform) {
    case 'instagram':
      return (
        <svg {...box} fill="none" stroke="currentColor" strokeWidth={1.8}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...box} fill="currentColor">
          <path d="M6.94 7.5a1.94 1.94 0 1 1 0-3.88 1.94 1.94 0 0 1 0 3.88ZM5.2 9h3.5v10.5H5.2V9Zm5.3 0h3.35v1.43h.05c.47-.84 1.6-1.73 3.3-1.73 3.53 0 4.18 2.2 4.18 5.05v5.75h-3.5v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.32-1.96 2.69v5.19H10.5V9Z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg {...box} fill="currentColor">
          <path d="M13.5 21v-8h2.7l.4-3.13H13.5V7.86c0-.9.25-1.52 1.55-1.52h1.65V3.54A22 22 0 0 0 14.34 3.4c-2.38 0-4.01 1.45-4.01 4.12v2.35H7.6V13h2.73v8h3.17Z" />
        </svg>
      );
    case 'x':
      return (
        <svg {...box} fill="currentColor">
          <path d="M17.53 3h3.02l-6.6 7.54L21.75 21h-6.06l-4.75-6.2L5.5 21H2.47l7.06-8.07L2.25 3h6.21l4.29 5.67L17.53 3Zm-1.06 16.2h1.67L7.6 4.7H5.8L16.47 19.2Z" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg {...box} fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.18-2.84.9.92-2.77-.2-.32A8 8 0 1 1 12 20Zm4.4-5.9c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06a6.55 6.55 0 0 1-1.93-1.19 7.22 7.22 0 0 1-1.33-1.66c-.14-.24 0-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.46-.4-.4-.54-.41h-.46a.9.9 0 0 0-.64.3 2.7 2.7 0 0 0-.84 2c0 1.18.86 2.32.98 2.48.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
        </svg>
      );
    default:
      return (
        <svg {...box} fill="none" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

/**
 * Build the href for a social link. The `email` platform becomes a `mailto:`
 * target; everything else is treated as an external URL.
 */
function socialHref(link: SocialLink): string {
  return link.platform === 'email' ? `mailto:${link.url}` : link.url;
}

export function Footer({ metadata = siteMetadata }: FooterProps = {}): JSX.Element {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="bg-mist-100 text-mist-300"
    >
      {/* Main: brand + contact block, then the link columns. */}
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.6fr_repeat(3,1fr)]">
        {/* Brand + contact */}
        <div className="flex flex-col gap-5">
          <Link
            to="/"
            aria-label="Ryze Technology home"
            className="inline-flex transition-opacity hover:opacity-80 focus-visible:opacity-80"
          >
            <Logo variant="full" height={34} tone="light" />
          </Link>
          <p className="max-w-sm text-base leading-relaxed text-ink-700">
            {metadata.defaultDescription}
          </p>
          <div className="mt-2 flex flex-col gap-1">
            <a
              href={`mailto:${metadata.contactEmail}`}
              className="font-mono text-sm text-ink-900 transition-colors hover:text-pulse-400"
            >
              {metadata.contactEmail}
            </a>
            {metadata.contactPhone !== undefined ? (
              <a
                href={`tel:${metadata.contactPhone}`}
                className="font-mono text-sm text-ink-900 transition-colors hover:text-pulse-400"
              >
                +91 {metadata.contactPhone}
              </a>
            ) : null}
            <p className="font-mono text-sm uppercase tracking-[0.18em] text-ink-600">
              Nagpur, India · Worldwide
            </p>
          </div>

          {/* Follow us — brand social icons. */}
          <div className="mt-4 flex flex-col gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-700">
              Follow us
            </p>
            <ul className="flex flex-wrap gap-3" aria-label="Social media">
              {metadata.social.map((link) => (
                <li key={link.platform}>
                  <a
                    href={socialHref(link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={SOCIAL_LABELS[link.platform]}
                    title={SOCIAL_LABELS[link.platform]}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-600/40 text-ink-700 transition-colors duration-200 hover:border-pulse-500 hover:bg-pulse-500 hover:text-ink-900 focus-visible:border-pulse-500 focus-visible:bg-pulse-500 focus-visible:text-ink-900"
                  >
                    <SocialGlyph platform={link.platform} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Link columns (first three groups). */}
        {footerNav.slice(0, 3).map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-700">
              {group.title}
            </h3>
            <ul className="mt-5 space-y-3">
              {group.links.map((link) => (
                <li key={`${group.title}-${link.label}-${link.path}`}>
                  <Link
                    to={link.path}
                    className="text-base text-ink-600 transition-colors hover:text-pulse-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Slim bottom bar: copyright + legal. */}
      <div className="border-t border-ink-600/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-sm text-ink-600">
            © {year} {metadata.siteName}. All rights reserved.
          </p>

          <ul className="flex flex-wrap gap-5" aria-label="Legal">
            {footerLegalLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="font-mono text-sm text-ink-600 transition-colors hover:text-pulse-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
