/**
 * ServiceCard
 *
 * Renders a single service offering: an icon (resolved from a lucide-react icon
 * name), the category title, and the single-sentence description
 * (Requirement 3.3).
 *
 * Interaction:
 *  - On Desktop_Viewport a pointer hover applies a lift + cyan accent animation
 *    that completes within ~300ms (Requirement 3.4).
 *  - While Reduced_Motion_Mode is active the card uses a non-motion hover state
 *    (border + color change only, no transform) (Requirement 3.5).
 */
import {
  Globe,
  Monitor,
  Smartphone,
  Workflow,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useReducedMotionContext } from '@hooks';
import type { Service } from '@apptypes';

/**
 * Maps the content `iconName` strings to their lucide-react icon components.
 * Centralising the lookup keeps content free of component references and lets
 * the renderer fall back to a neutral icon for unknown names.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Globe,
  Smartphone,
  Monitor,
  Workflow,
};

/** The set of icon names known to {@link ICON_MAP}. */
export const KNOWN_ICON_NAMES = Object.keys(ICON_MAP);

export interface ServiceCardProps {
  /** The service offering to render. */
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps): JSX.Element {
  const reducedMotion = useReducedMotionContext();
  const { category, iconName, description } = service;

  // Fall back to a neutral icon if an unknown name slips through.
  const Icon = ICON_MAP[iconName] ?? Sparkles;

  // Hover styling diverges by motion preference:
  //  - Full motion: transform lift + cyan border/icon (Req 3.4).
  //  - Reduced motion: border + icon color change only, no transform (Req 3.5).
  const motionClasses = reducedMotion
    ? 'transition-colors duration-300 hover:border-accent'
    : 'transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-lg hover:shadow-accent/10';

  return (
    <article
      data-testid="service-card"
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      className={[
        'group flex h-full flex-col rounded-2xl border border-white/10 bg-navy-800 p-8',
        motionClasses,
      ].join(' ')}
    >
      <span className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:text-accent-500">
        <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h3 className="text-xl font-semibold text-body">{category}</h3>
      <p className="mt-3 text-body-mobile text-body-muted desktop:text-body-desktop">
        {description}
      </p>
    </article>
  );
}

export default ServiceCard;
