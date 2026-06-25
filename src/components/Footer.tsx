/**
 * Footer
 *
 * The site's `contentinfo` landmark. It carries the company name and a
 * copyright notice for the current calendar year (Req 7.1), in-page anchor
 * links to all six sections that trigger smooth scrolling with respect to the
 * reduced-motion preference (Req 7.2), and one or more external contact links
 * (mailto plus social), with off-site links opening in a new tab guarded by
 * `rel="noopener noreferrer"` (Req 7.3). The `<footer>` element provides the
 * `contentinfo` landmark required for accessibility (Req 13.4).
 *
 * Requirements: 7.1, 7.2, 7.3, 13.4
 */
import { footerContent } from '../content/contact';
import { currentCopyrightYear } from '../logic/metadata';
import { smoothScrollToSection } from '../hooks/smoothScrollToSection';
import { useReducedMotionContext } from '../hooks/MotionProvider';

/**
 * Whether a contact href points off-site (and should therefore open in a new
 * tab with a safe `rel`). `mailto:`/`tel:` and same-document links are treated
 * as in-place navigations.
 */
function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function Footer(): JSX.Element {
  const reducedMotion = useReducedMotionContext();
  const year = currentCopyrightYear(new Date());
  const { companyName, navLinks, externalContacts } = footerContent;

  return (
    <footer className="bg-navy-800 text-body-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 tablet:flex-row tablet:justify-between">
        {/* Brand + copyright */}
        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold text-body">{companyName}</span>
          <p className="text-sm">
            &copy; {year} {companyName}. All rights reserved.
          </p>
        </div>

        {/* Section anchors */}
        <nav aria-label="Footer" className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-body">
            Explore
          </h2>
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    smoothScrollToSection(link.id, reducedMotion);
                  }}
                  className="inline-flex min-h-tap-target items-center rounded text-sm transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* External / contact links */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-body">
            Connect
          </h2>
          <ul className="flex flex-col gap-1">
            {externalContacts.map((contact) => {
              const external = isExternalHref(contact.href);
              return (
                <li key={contact.href}>
                  <a
                    href={contact.href}
                    {...(external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="inline-flex min-h-tap-target items-center rounded text-sm transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {contact.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
