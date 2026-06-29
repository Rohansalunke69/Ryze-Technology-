/**
 * ProblemSection — the "What's holding businesses back" challenges panel.
 *
 * Purely presentational. The card-overlap (this panel sliding up over the Hero)
 * is done in HomePage with CSS `position: sticky` + z-index on the wrapper —
 * no GSAP pin here, so nothing fights the other ScrollTriggers.
 */

export interface ProblemItem {
  title: string;
  detail: string;
}

export interface ProblemSectionProps {
  problems: ReadonlyArray<ProblemItem>;
}

export function ProblemSection({ problems }: ProblemSectionProps): JSX.Element {
  return (
    <section aria-label="Challenges" className="w-full bg-ink-900">
      <div className="mx-auto w-full max-w-site px-6 py-[clamp(6rem,14vh,11rem)] sm:px-10">
        <div className="grid gap-x-12 gap-y-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-pulse-500">
              The challenges
            </p>
            {/* max-w widened 12ch → 15ch so the longer heading wraps to balanced
                lines ("What's holding" / "businesses back"); font scale unchanged. */}
            <h2 className="mt-6 max-w-[15ch] font-display text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.02em] text-mist-100">
              What&apos;s holding businesses back
            </h2>
          </div>

          <ul className="flex flex-col">
            {problems.map((problem, index) => (
              <li
                key={problem.title}
                className="grid grid-cols-[auto_1fr] items-start gap-6 border-t border-ink-600 py-8"
              >
                <span
                  aria-hidden="true"
                  className="ghost-numeral text-[clamp(2.5rem,6vw,4.5rem)]"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-3 pt-1">
                  <h3 className="font-display text-h3 font-semibold text-mist-100">
                    {problem.title}
                  </h3>
                  <p className="max-w-md font-sans text-body text-mist-300">
                    {problem.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default ProblemSection;
