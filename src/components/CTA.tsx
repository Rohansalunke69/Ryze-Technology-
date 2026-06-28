/**
 * CTA — premium call-to-action band with animated gradient backdrop.
 * Used across pages for the closing action section.
 *
 * _Requirements: 6.4, 9.3, 38.1_
 */
import { MagneticButton } from './MagneticButton';
import { siteMetadata } from '@data/siteMetadata';

export interface CTAProps {
  heading: string;
  sub?: string;
  href?: string;
  label?: string;
}

export function CTA({
  heading,
  sub,
  href = '/contact',
  label = "Let's build",
}: CTAProps): JSX.Element {
  return (
    <section className="relative overflow-hidden bg-ink-800">
      {/* Animated multi-color aurora backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 70% 60% at 20% 50%, rgba(37,99,235,0.14) 0%, transparent 60%)',
            'radial-gradient(ellipse 50% 70% at 80% 50%, rgba(87,197,247,0.10) 0%, transparent 60%)',
            'radial-gradient(ellipse 40% 40% at 50% 100%, rgba(99,102,241,0.12) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {/* Top edge hairline */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(87,197,247,0.3) 25%, rgba(87,197,247,0.6) 50%, rgba(87,197,247,0.3) 75%, transparent)',
        }}
      />

      {/* Floating geometric accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute left-[8%] top-[20%] h-28 w-28 rounded-full border border-pulse-500/8 animate-float-slow"
        />
        <div
          className="absolute right-[10%] bottom-[15%] h-20 w-20 rotate-45 border border-pulse-400/10 animate-float-delayed"
        />
        <div
          className="absolute right-[25%] top-[30%] h-12 w-12 rounded-full bg-pulse-500/4 animate-float"
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-site flex-col items-center gap-8 px-6 py-[clamp(6rem,14vh,10rem)] text-center sm:px-10">

        {/* Eyebrow label */}
        <span className="tag-pill">
          <span className="pulse-dot" aria-hidden="true" />
          Ready to start?
        </span>

        {/* Main heading */}
        <h2 className="max-w-4xl font-display text-display-l font-bold leading-[0.95] tracking-[-0.02em] text-mist-100">
          {heading}
        </h2>

        {sub !== undefined && sub.length > 0 ? (
          <p className="max-w-xl font-sans text-body-l text-mist-300 leading-relaxed">
            {sub}
          </p>
        ) : null}

        {/* CTA button row */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton
            as="a"
            href={href}
            ariaLabel={label}
            className="btn-gradient-pulse"
          >
            {label}
          </MagneticButton>
          <a
            href={`mailto:${siteMetadata.contactEmail}`}
            data-cursor="link"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-mist-300 transition-colors hover:text-mist-100"
          >
            or email us directly
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              →
            </span>
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {['No retainer required', 'First call free', 'Ship in weeks, not months'].map((item) => (
            <span key={item} className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-mist-300">
              <span aria-hidden="true" className="text-lime-500">✓</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CTA;
