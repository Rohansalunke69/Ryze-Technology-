/**
 * Breadcrumb — location trail for sub-pages (task 10.3).
 *
 * Renders a `<nav aria-label="Breadcrumb">` containing an ordered list. The
 * trail starts at Home and follows the current path order (Requirement 3.1).
 * Every item except the last is a `Link`; the last item is the current page,
 * rendered as plain text with `aria-current="page"` and no link
 * (Requirements 3.2, 3.3).
 *
 * Callers may pass an explicit `trail`; otherwise the trail is derived from the
 * current location via `useLocation` + `buildBreadcrumbTrail` using a default
 * label map for the known routes (Requirement 3.4).
 *
 * _Requirements: 3.1, 3.2, 3.3, 3.4_
 */
import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  buildBreadcrumbTrail,
  type BreadcrumbItem,
} from '@lib/breadcrumb';

export interface BreadcrumbProps {
  /**
   * Explicit trail to render. When omitted, the trail is derived from the
   * current router location using {@link DEFAULT_LABEL_MAP}.
   */
  trail?: BreadcrumbItem[];
  /**
   * Override / extend the label map used when deriving the trail from the
   * location. Merged on top of {@link DEFAULT_LABEL_MAP}.
   */
  labelMap?: Record<string, string>;
}

/**
 * Sensible default labels for the site's known route segments. Keys are bare
 * path segments (looked up after the more specific cumulative path), so they
 * cover the segment wherever it appears in a path. Unknown segments fall back
 * to a humanized Title Case form inside `buildBreadcrumbTrail`.
 */
export const DEFAULT_LABEL_MAP: Record<string, string> = {
  '/': 'Home',
  portfolio: 'Portfolio',
  services: 'Services',
  development: 'Development',
  design: 'Design',
  'digital-marketing': 'Digital Marketing',
  'sales-strategy': 'Sales & Strategy',
  'maintenance-support': 'Maintenance & Support',
  about: 'About',
  contact: 'Contact',
  blog: 'Blog',
  resources: 'Resources',
  privacy: 'Privacy',
  terms: 'Terms',
  cookies: 'Cookies',
};

export function Breadcrumb({ trail, labelMap }: BreadcrumbProps = {}): JSX.Element {
  const location = useLocation();
  const resolvedTrail =
    trail ??
    buildBreadcrumbTrail(location.pathname, {
      ...DEFAULT_LABEL_MAP,
      ...labelMap,
    });

  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-2 font-mono text-mist-300">
        {resolvedTrail.map((item, index) => {
          const isLast = index === resolvedTrail.length - 1;
          return (
            <Fragment key={`${item.label}-${item.path ?? 'current'}`}>
              <li className="flex items-center gap-2">
                {isLast || item.path === undefined ? (
                  <span aria-current="page" className="text-mist-100">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className="text-mist-300 transition-colors hover:text-pulse-500"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" className="text-ink-600">
                  /
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
