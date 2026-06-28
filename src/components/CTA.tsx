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
  /** Oversized headline for the band. */
  heading: string;
  /** Optional supporting subtext beneath the heading. */
  sub?: string;
  /** Destination for the action. Defaults to `/contact`. */
  href?: string;
  /** Action label. Defaults to "Let's build". */
  label?: string;
}

export function CTA({
  heading,
  sub,
  href = '/contact',
  label = "Let's build",
}: CTAProps): JSX.Element {
  return (
    <section className="flex flex-col items-center gap-6 px-6 py-24 text-center">
      <h2 className="max-w-4xl font-display text-display-l text-mist-100">
        {heading}
      </h2>
      {sub !== undefined && sub.length > 0 ? (
        <p className="max-w-2xl font-sans text-body-l text-mist-300">{sub}</p>
      ) : null}
      <MagneticButton as="a" href={href} ariaLabel={label} className="mt-2">
        {label}
      </MagneticButton>
    </section>
  );
}

export default CTA;
