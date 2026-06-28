/**
 * RouteSkeleton — branded Suspense fallback for lazily-loaded Page_Modules
 * (task 13.1).
 *
 * Every route in `src/routes.tsx` wraps its `React.lazy` page in a
 * `<Suspense fallback={<RouteSkeleton />}>`. While the route's JS chunk is
 * in-flight this skeleton holds the viewport on the "Engineered Permanence"
 * dark-navy (ink) surface so the transition never flashes white.
 *
 * Visual contract (uses existing Tailwind design tokens only):
 *   - `bg-ink-900` surface, full-height so it fills the route outlet;
 *   - a mono, uppercase "Loading" eyebrow in `text-pulse-500` (cyan accent);
 *   - a pulsing accent bar (`animate-pulse`) plus a few muted
 *     `text-mist-300` placeholder bars to suggest incoming content.
 *
 * Accessibility: the region is `role="status"` with `aria-live="polite"` and
 * an `aria-label`, so assistive tech announces the loading state once; the
 * visible "Loading" label is also exposed to sighted users. The pulse
 * animation is purely decorative.
 */
import { Loader } from './Loader';

export interface RouteSkeletonProps {
  /** Optional accessible label; defaults to a generic "Loading page". */
  label?: string;
}

export function RouteSkeleton({ label = 'Loading page' }: RouteSkeletonProps = {}): JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-12 bg-ink-900 px-6 py-24 text-center"
    >
      <p className="font-mono text-mono-eyebrow uppercase tracking-widest text-pulse-500">
        Loading
      </p>

      {/* Premium 3D boxes loader */}
      <Loader />
    </div>
  );
}

export default RouteSkeleton;
