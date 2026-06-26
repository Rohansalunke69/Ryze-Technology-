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
      className="border-t border-ink-700 bg-ink-900 text-mist-300"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(auto-fit,minmax(8rem,1fr))]">
          {/* Brand + tagline */}
          <div>
            <Link
              to="/"
              className="font-display text-2xl tracking-tight text-mist-100"
            >
              {metadata.siteName}
            </Link>
            <p className="mt-4 max-w-xs text-sm text-mist-300">
              {metadata.defaultDescription}
            </p>
          </div>

          {/* Site link groups */}
          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="font-mono text-xs uppercase tracking-widest text-mist-100">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.label}-${link.path}`}>
                    <Link
                      to={link.path}
                      className="text-sm text-mist-300 transition-colors hover:text-pulse-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Social + contact email */}
        <div className="mt-12 flex flex-col gap-6 border-t border-ink-700 pt-8 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-6" aria-label="Social media">
            {metadata.social.map((link) => (
              <li key={link.platform}>
                <a
                  href={socialHref(link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-mist-300 transition-colors hover:text-pulse-500"
                >
                  {SOCIAL_LABELS[link.platform]}
                </a>
              </li>
            ))}
          </ul>

          <a
            href={`mailto:${metadata.contactEmail}`}
            className="font-mono text-sm text-mist-100 transition-colors hover:text-pulse-500"
          >
            {metadata.contactEmail}
          </a>
        </div>

        {/* Legal links + copyright */}
        <div className="mt-8 flex flex-col gap-4 text-xs text-mist-300 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {metadata.siteName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-6" aria-label="Legal">
            {footerLegalLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="transition-colors hover:text-pulse-500"
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
