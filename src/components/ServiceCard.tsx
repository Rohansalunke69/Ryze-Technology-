/**
 * ServiceCard — service offering card (task 10.5).
 *
 * Presents a line-draw icon (mapped from `service.icon`), the service name, its
 * tagline/summary, and a "Learn More" `Link` to `/services/:slug`. On hover the
 * cyan ("pulse") border ignites (design "Services" section). The card carries
 * `data-cursor="link"` so the custom cursor shows its interactive-link state.
 *
 * Icons are small inline SVGs (no icon dependency); an unknown key falls back to
 * a neutral square so the card never renders empty.
 *
 * _Requirements: 9.1_
 */
import { Link } from 'react-router-dom';

import type { Service } from '@app-types';

export interface ServiceCardProps {
  /** The service to render. */
  service: Service;
  /** Position in a grid; drives a small stagger delay. */
  index?: number;
}

/** Minimal line-draw icons keyed by `service.icon`. */
function ServiceIcon({ name }: { name: string }): JSX.Element {
  const common = {
    width: 32,
    height: 32,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'globe':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
        </svg>
      );
    case 'smartphone':
      return (
        <svg {...common}>
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <path d="M11 18h2" />
        </svg>
      );
    case 'monitor':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      );
    case 'workflow':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <path d="M10 6.5h4a3 3 0 0 1 3 3V14" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      );
  }
}

export function ServiceCard({ service, index = 0 }: ServiceCardProps): JSX.Element {
  return (
    <article
      style={{ ['--card-index' as string]: index }}
      className={[
        'group flex flex-col gap-4 rounded-xl border border-ink-600 bg-ink-800 p-6',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:border-pulse-500 hover:shadow-lg hover:shadow-pulse-500/5',
        'focus-within:border-pulse-500 focus-within:-translate-y-1 focus-within:shadow-lg focus-within:shadow-pulse-500/5',
      ].join(' ')}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ink-900 border border-ink-600 text-pulse-500 transition-all duration-300 group-hover:border-pulse-500/30 group-hover:bg-pulse-500/5">
        <ServiceIcon name={service.icon} />
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <h3 className="font-display text-h3 text-mist-100">{service.name}</h3>
        <p className="font-sans text-body text-mist-300 leading-relaxed">
          {service.tagline.length > 0 ? service.tagline : service.summary}
        </p>
      </div>

      <Link
        to={`/services/${service.slug}`}
        data-cursor="link"
        aria-label={`Learn more about ${service.name}`}
        className={[
          'mt-auto inline-flex min-h-[44px] items-center gap-2 self-start',
          'font-mono text-sm font-semibold tracking-wide text-pulse-500',
          'transition-colors duration-200',
          'hover:text-pulse-700',
        ].join(' ')}
      >
        Learn More
        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
      </Link>
    </article>
  );
}

export default ServiceCard;
