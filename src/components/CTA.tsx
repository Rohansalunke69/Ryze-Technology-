/**
 * CTA — reusable call-to-action band (task 10.4).
 *
 * Renders an oversized display heading, an optional supporting line, and a
 * `MagneticButton` rendered as an anchor that links to `href` (default
 * `/contact`) with `label` (default "Let's build"). Used across pages —
 * notably the HomePage CTA section, which must link to `/contact` via a
 * MagneticButton (Requirement 6.4), and the ServicesPage CTA section
 * (Requirement 9.3).
 *
 * The heading is an `h2` so the band slots beneath a page's single `h1`,
 * preserving the ordered heading hierarchy (Requirement 38.1).
 *
 * _Requirements: 6.4, 9.3, 38.1_
 */
import { MagneticButton } from './MagneticButton';

export interface CTAProps {
  /** Optional category/status eyebrow label. */
  eyebrow?: string;
  /** Oversized headline for the band. */
  heading: React.ReactNode;
  /** Optional supporting subtext beneath the heading. */
  sub?: string;
  /** Destination for the action. Defaults to `/contact`. */
  href?: string;
  /** Action label. Defaults to "Let's build". */
  label?: string;
}

export function CTA({
  eyebrow,
  heading,
  sub,
  href = '/contact',
  label = "Let's build",
}: CTAProps): JSX.Element {
  return (
    <section className="flex flex-col items-center gap-6 px-6 py-24 text-center">
      {eyebrow !== undefined && eyebrow.length > 0 ? (
        <div className="inline-flex items-center justify-center rounded-full border border-pulse-500/20 bg-pulse-500/10 px-5 py-2 mb-3 shadow-sm">
          <span className="font-mono text-base font-extrabold uppercase tracking-[0.2em] text-pulse-500">
            {eyebrow}
          </span>
        </div>
      ) : null}
      <h2 className="max-w-6xl font-display text-[clamp(2.5rem,5vw,4.5rem)] text-mist-100 text-balance leading-[1.1]">
        {heading}
      </h2>
      {sub !== undefined && sub.length > 0 ? (
        <p className="max-w-2xl font-sans text-body-l text-mist-300 text-balance mx-auto">{sub}</p>
      ) : null}
      <MagneticButton as="a" href={href} ariaLabel={label} className="mt-2">
        {label}
      </MagneticButton>
    </section>
  );
}

export default CTA;
