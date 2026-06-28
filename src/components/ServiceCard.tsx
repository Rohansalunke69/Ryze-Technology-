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
    case 'code':
      return (
        <svg {...common}>
          <path d="m8 6-6 6 6 6" />
          <path d="m16 6 6 6-6 6" />
        </svg>
      );
    case 'palette':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="8.5" cy="9.5" r="1.2" />
          <circle cx="15.5" cy="9.5" r="1.2" />
          <circle cx="9.5" cy="15.5" r="1.2" />
          <path d="M12 21a3 3 0 0 0 0-6" />
        </svg>
      );
    case 'megaphone':
      return (
        <svg {...common}>
          <path d="M3 11v2a1 1 0 0 0 1 1h2l9 5V5L6 10H4a1 1 0 0 0-1 1Z" />
          <path d="M18 8a4 4 0 0 1 0 8" />
        </svg>
      );
    case 'target':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      );
    case 'wrench':
      return (
        <svg {...common}>
          <path d="M15 6a4 4 0 0 0-5.4 4.6L4 16.2 6.8 19l5.6-5.6A4 4 0 0 0 18 9l-2.5 2.5L13 9l2.5-2.5A4 4 0 0 0 15 6Z" />
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
        'group flex flex-col gap-4 rounded-lg border border-ink-600 bg-ink-800 p-6',
        'transition-colors duration-300 ease-out',
        'hover:border-pulse-500 focus-within:border-pulse-500',
      ].join(' ')}
    >
      <span className="text-pulse-500 transition-colors duration-300">
        <ServiceIcon name={service.icon} />
      </span>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-h3 text-mist-100">{service.name}</h3>
        <p className="font-sans text-body text-mist-300">
          {service.tagline.length > 0 ? service.tagline : service.summary}
        </p>
      </div>

      <Link
        to={`/services/${service.slug}`}
        data-cursor="link"
        aria-label={`Learn more about ${service.name}`}
        className={[
          'mt-auto inline-flex min-h-[44px] items-center gap-2 self-start',
          'font-mono text-sm tracking-wide text-pulse-500',
          'transition-transform duration-200 ease-out',
          'hover:translate-x-1 focus-visible:translate-x-1',
        ].join(' ')}
      >
        Learn More
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

export default ServiceCard;
