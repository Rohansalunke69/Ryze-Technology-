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
    // `min-h-screen` + vertically centered: the panel is exactly one viewport
    // tall and its (compact) content fits inside it — so when the wrapper is
    // sticky, all three challenges are fully visible AND the Philosophy card can
    // slide up over this panel. Compact scale keeps everything within the fold.
    <section
      aria-label="Challenges"
      className="flex min-h-screen w-full items-center bg-ink-900"
    >
      <div className="mx-auto w-full max-w-site px-6 py-8 sm:px-10 sm:py-12">
        <div className="grid items-center gap-x-12 gap-y-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-pulse-500">
              The challenges
            </p>
            <h2 className="mt-3 max-w-[14ch] font-display text-[clamp(1.6rem,4vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-mist-100">
              What&apos;s holding businesses back
            </h2>
          </div>

          <ul className="flex flex-col">
            {problems.map((problem, index) => (
              <li
                key={problem.title}
                className="grid grid-cols-[auto_1fr] items-start gap-4 border-t border-ink-600 py-4 sm:gap-5 sm:py-5"
              >
                <span
                  aria-hidden="true"
                  className="ghost-numeral text-[clamp(1.5rem,3.2vw,2.75rem)]"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col gap-1 pt-0.5">
                  <h3 className="font-display text-[clamp(1.05rem,1.8vw,1.6rem)] font-semibold leading-tight text-mist-100">
                    {problem.title}
                  </h3>
                  <p className="max-w-md font-sans text-[0.85rem] leading-snug text-mist-300 sm:text-[0.95rem] sm:leading-relaxed">
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
