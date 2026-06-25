/**
 * CaseStudyCard
 *
 * A large, premium card representing one featured project. Each card shows the
 * project name, industry, at least one key metric, and a preview image rendered
 * through {@link ResponsiveImage} (Requirement 2.2). The whole card is a single
 * activation target: it is an anchor wrapping its content so it is natively
 * clickable and keyboard-operable (Enter), navigating to the case study's
 * `detailUrl` (Requirement 2.5). External (`http(s)`) destinations open in a new
 * tab with `rel="noopener noreferrer"`; internal routes use a plain `href`.
 *
 * Motion behaviour:
 *  - On Desktop_Viewport hover, the card applies a smooth scale transition and
 *    reveals additional project details (the full metric set) within ~300ms
 *    (Requirement 2.4).
 *  - Under Reduced_Motion_Mode the additional details are revealed without any
 *    scale or motion-based transition; a non-motion border/colour change marks
 *    the hover state instead (Requirement 2.6).
 *
 * Placeholder mode: when `caseStudy` is `null` the card renders its structural
 * elements (image area, title bar, industry bar, metric bar) without any
 * project content, keeping the Portfolio layout intact when no case studies are
 * available (Requirement 2.3).
 *
 * Requirements: 2.2, 2.3, 2.4, 2.5, 2.6
 */
import type { CaseStudy } from '@apptypes';
import { useReducedMotionContext } from '@hooks';
import { ResponsiveImage } from './ResponsiveImage';

export interface CaseStudyCardProps {
  /** The case study to render, or `null` for a structural placeholder card. */
  caseStudy: CaseStudy | null;
  /** Whether the parent section has entered the viewport (gates the entrance). */
  hasEntered?: boolean;
  /** Stagger index used to offset the entrance transition. */
  index?: number;
}

/** Whether a detail URL points at an external (absolute http) destination. */
function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
 * A single featured-work card. Renders placeholder structure when no case study
 * is supplied, otherwise the full project card with a hover-revealed detail set.
 */
export function CaseStudyCard({
  caseStudy,
  hasEntered = true,
  index = 0,
}: CaseStudyCardProps): JSX.Element {
  const reducedMotion = useReducedMotionContext();

  const entranceClass = hasEntered
    ? 'translate-y-0 opacity-100'
    : 'translate-y-6 opacity-0';

  // Placeholder mode (Requirement 2.3): structural elements, no project content.
  if (caseStudy === null) {
    return (
      <article
        data-testid="case-study-card-placeholder"
        aria-hidden="true"
        className={[
          'overflow-hidden rounded-3xl border border-white/5 bg-navy-800/60',
          'transition-all duration-700 ease-out',
          entranceClass,
        ].join(' ')}
        style={{ transitionDelay: hasEntered ? `${index * 90}ms` : '0ms' }}
      >
        {/* Image area placeholder, aspect-ratio stable to avoid layout shift. */}
        <div
          className="w-full animate-pulse bg-navy-700"
          style={{ aspectRatio: '16 / 10' }}
        />
        <div className="space-y-4 p-6 desktop:p-8">
          <div className="h-3 w-24 animate-pulse rounded-full bg-navy-700" />
          <div className="h-6 w-3/4 animate-pulse rounded-full bg-navy-700" />
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-navy-700" />
        </div>
      </article>
    );
  }

  const { projectName, industry, metrics, preview, detailUrl } = caseStudy;
  const primaryMetric = metrics[0];
  const external = isExternalUrl(detailUrl);
  const externalLinkProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  // Scale transition is applied only when motion is allowed (Requirement 2.4).
  // Under reduced motion a non-motion border/background change marks hover
  // instead, and no scale/transition class is present (Requirement 2.6).
  const interactionClass = reducedMotion
    ? 'hover:border-accent/40 hover:bg-navy-700/70 focus-visible:border-accent/40'
    : 'transition-transform duration-300 ease-out will-change-transform hover:scale-[1.03] focus-visible:scale-[1.03]';

  // The reveal of additional details: hidden then faded in on hover/focus when
  // motion is allowed; always visible (final state) under reduced motion.
  const detailsClass = reducedMotion
    ? 'opacity-100'
    : [
        'opacity-0 translate-y-2',
        'transition-[opacity,transform] duration-300 ease-out',
        'group-hover:opacity-100 group-hover:translate-y-0',
        'group-focus-within:opacity-100 group-focus-within:translate-y-0',
      ].join(' ');

  return (
    <article
      data-testid="case-study-card"
      className={[
        'group relative',
        'transition-all duration-700 ease-out',
        entranceClass,
      ].join(' ')}
      style={{ transitionDelay: hasEntered ? `${index * 90}ms` : '0ms' }}
    >
      <a
        href={detailUrl}
        {...externalLinkProps}
        data-testid="case-study-link"
        aria-label={`View case study: ${projectName}`}
        className={[
          'block h-full overflow-hidden rounded-3xl border border-white/5 bg-navy-800/60',
          'outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900',
          interactionClass,
        ].join(' ')}
      >
        {/* Preview image (Requirement 2.2). Lazy-loaded (below the fold). */}
        <div className="relative overflow-hidden">
          <ResponsiveImage
            image={preview}
            className="h-full w-full object-cover"
          />
          {external ? (
            <span className="sr-only">(opens in a new tab)</span>
          ) : null}
        </div>

        <div className="p-6 desktop:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {industry}
          </p>
          <h3 className="mt-3 text-2xl font-bold text-body desktop:text-3xl">
            {projectName}
          </h3>

          {/* At least one key metric is always visible (Requirement 2.2). */}
          {primaryMetric ? (
            <p
              data-testid="case-study-primary-metric"
              className="mt-4 text-lg font-semibold text-body"
            >
              <span className="text-accent">{primaryMetric.value}</span>
              <span className="ml-2 text-body-muted">{primaryMetric.label}</span>
            </p>
          ) : null}

          {/* Additional details revealed on hover / focus (Requirements 2.4, 2.6). */}
          <div
            data-testid="case-study-details"
            className={['mt-5', detailsClass].join(' ')}
          >
            <dl className="grid grid-cols-1 gap-2">
              {metrics.map((metric) => (
                <div
                  key={`${metric.label}-${metric.value}`}
                  className="flex items-baseline justify-between gap-4 border-t border-white/5 pt-2 text-sm"
                >
                  <dt className="text-body-muted">{metric.label}</dt>
                  <dd className="font-semibold text-body">{metric.value}</dd>
                </div>
              ))}
            </dl>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent">
              View case study
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </a>
    </article>
  );
}

export default CaseStudyCard;
