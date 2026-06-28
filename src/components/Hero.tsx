import { HeroFallback } from './HeroFallback';
import { MagneticButton } from './MagneticButton';
import { ScrollIndicator } from './ScrollIndicator';
import { SplitText } from './SplitText';

export interface HeroProps {
  /** Oversized hero headline (revealed via SplitText). */
  headline: string;
}

const SUBHEADLINE =
  'We design and build durable digital products — websites, mobile apps, ' +
  'and business systems engineered to work forever.';

const HERO_STATS = [
  { value: '50+', label: 'Projects shipped' },
  { value: '99.9%', label: 'Uptime we hold' },
  { value: '5★', label: 'Client rating' },
];

export function Hero({ headline }: HeroProps): JSX.Element {
  return (
    <section
      className="relative flex min-h-[100dvh] w-full items-center overflow-hidden bg-ink-900 [min-height:100vh]"
      aria-label="Intro"
    >
      {/* ── Background layers ── */}
      <div className="absolute inset-0">
        {/* Static fallback texture */}
        <div className="absolute inset-0">
          <HeroFallback />
        </div>

        {/* Living aurora energy field */}
        <div className="aurora" aria-hidden="true" />

        {/* Blueprint grid hairlines */}
        <div className="grid-overlay absolute inset-0" aria-hidden="true" />

        {/* Bottom fade into page */}
        <div
          className="absolute inset-x-0 bottom-0 z-[1] h-48 bg-gradient-to-b from-transparent to-ink-900"
          aria-hidden="true"
        />
      </div>

      {/* ── Floating geometric decoration ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Large outer ring */}
        <div
          className="hero-ring absolute right-[-5%] top-[10%] h-[clamp(320px,45vw,680px)] w-[clamp(320px,45vw,680px)] animate-float-slow"
          style={{ animationDelay: '0s' }}
        />
        {/* Medium inner ring */}
        <div
          className="hero-ring absolute right-[5%] top-[18%] h-[clamp(180px,25vw,380px)] w-[clamp(180px,25vw,380px)] animate-float"
          style={{ animationDelay: '1.5s', borderColor: 'rgba(87, 197, 247, 0.14)' }}
        />
        {/* Small accent ring */}
        <div
          className="hero-ring absolute right-[20%] top-[30%] h-[clamp(80px,10vw,160px)] w-[clamp(80px,10vw,160px)] animate-float-delayed"
          style={{ animationDelay: '3s', borderColor: 'rgba(30, 64, 175, 0.12)' }}
        />
        {/* Bottom-left accent */}
        <div
          className="absolute bottom-[25%] left-[5%] h-[clamp(60px,8vw,120px)] w-[clamp(60px,8vw,120px)] rotate-45 border border-[rgba(30,64,175,0.1)] animate-float"
          style={{ animationDelay: '2s' }}
        />
        {/* Dot cluster — right center */}
        <div className="absolute right-[12%] top-[55%] grid grid-cols-4 gap-3 opacity-30">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="h-1 w-1 rounded-full bg-pulse-700"
            />
          ))}
        </div>
      </div>

      {/* ── Hero content ── */}
      <div className="relative z-10 mx-auto w-full max-w-site px-6 pb-24 pt-36 sm:px-10 sm:pb-28 sm:pt-44">

        {/* Eyebrow badge */}
        <div className="mb-8 flex items-center gap-3">
          <span className="tag-pill">
            <span className="pulse-dot" aria-hidden="true" />
            Software Studio · Nagpur, India
          </span>
        </div>

        {/* Main headline */}
        <SplitText
          as="h1"
          by="word"
          text={headline}
          trigger="mount"
          className="max-w-[16ch] font-display text-[clamp(2.75rem,8vw,8rem)] font-bold leading-[0.9] tracking-[-0.03em] text-mist-100"
        />

        {/* Sub-content row */}
        <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-lg font-sans text-body-l leading-relaxed text-mist-300">
            {SUBHEADLINE}
          </p>

          <div className="flex flex-shrink-0 items-center gap-6">
            <MagneticButton
              as="a"
              href="/contact"
              ariaLabel="Start a project"
              className="btn-gradient-pulse"
            >
              Start a project
            </MagneticButton>
            <a
              href="/portfolio"
              data-cursor="link"
              className="group inline-flex items-center gap-2 font-display font-bold text-mono-eyebrow uppercase tracking-[0.2em] text-mist-100 transition-colors duration-200 ease-out hover:text-pulse-500 focus-visible:text-pulse-500"
            >
              See our work
              <span
                aria-hidden="true"
                className="transition-transform duration-200 ease-out group-hover:translate-x-1.5"
              >
                →
              </span>
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-ink-600 pt-8">
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-0.5">
              <span className="font-display text-2xl font-bold text-mist-100 stat-glow">
                {stat.value}
              </span>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist-300">
                {stat.label}
              </span>
            </div>
          ))}
          <div className="ml-auto hidden lg:block">
            <div className="rule-pulse h-px w-32" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Scroll affordance */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <ScrollIndicator />
      </div>
    </section>
  );
}

export default Hero;
