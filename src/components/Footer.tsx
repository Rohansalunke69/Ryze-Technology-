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

      {/* Slim bottom bar: copyright + social + legal. */}
      <div className="border-t border-ink-600/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-sm text-ink-600">
            © {year} {metadata.siteName}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <ul className="flex flex-wrap gap-5" aria-label="Social media">
              {metadata.social.map((link) => (
                <li key={link.platform}>
                  <a
                    href={socialHref(link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-ink-600 transition-colors hover:text-pulse-400"
                  >
                    {SOCIAL_LABELS[link.platform]}
                  </a>
                </li>
              ))}
            </ul>

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
      </div>
    </footer>
  );
}

export default Footer;
