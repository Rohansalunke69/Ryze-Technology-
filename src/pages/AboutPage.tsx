/**
 * AboutPage — `/about` studio story, team, and track record (task 14.11).
 *
 * Composition (design "/about"):
 *   Hero / story → Mission → Team profiles (one `TeamCard` per member with
 *   social links) → Differentiators → By-the-numbers (`AnimatedCounter`s) →
 *   Testimonials → CTA.
 *
 * The page renders all seven sections (Requirement 11.1), a `TeamCard` for every
 * `TeamMember` in the Data_Layer — each with its social links — (Requirement
 * 11.2), and the by-the-numbers metrics with `AnimatedCounter` components
 * (Requirement 11.3).
 *
 * Motion: section reveals use `AnimationWrapper`, which renders content in its
 * final visible state immediately under `prefers-reduced-motion`, so every
 * section stays readable with no scroll dependency (Requirements 25.1, 37.2).
 * The counters land on their target value immediately under reduced motion.
 *
 * _Requirements: 11.1, 11.2, 11.3_
 */
import type { SEOMeta } from '@app-types';
import { SectionHeader } from '@components/SectionHeader';
import { TeamCard } from '@components/TeamCard';
import { TestimonialCard } from '@components/TestimonialCard';
import { AnimatedCounter } from '@components/AnimatedCounter';
import { CTA } from '@components/CTA';
import { SEOHead } from '@components/SEOHead';
import { AnimationWrapper } from '@components/AnimationWrapper';
import { team } from '@data/team';
import { testimonials } from '@data/testimonials';
import { siteMetadata } from '@data/siteMetadata';
import { studioMetrics } from '@data/metrics';

/** Per-route metadata. Canonical resolves to `/about` on the site origin. */
const seo: SEOMeta = {
  title: 'About the Studio',
  description:
    'Meet Ryze Technology — a software studio in Nagpur building durable web, mobile, and business systems. Learn our story, our mission, and the team behind the work.',
  canonical: `${siteMetadata.baseUrl}/about`,
};

/** What sets the studio apart, rendered in the "Why Ryze" section. */
interface Differentiator {
  title: string;
  description: string;
}

const DIFFERENTIATORS: Differentiator[] = [
  {
    title: 'Built to last',
    description:
      'We engineer for the long haul — code you can maintain, systems that stay fast, and software that keeps earning its place years after launch.',
  },
  {
    title: 'Senior by default',
    description:
      'You work directly with the people writing the code. No hand-offs to a junior bench, no telephone game between you and the build.',
  },
  {
    title: 'Real-world ready',
    description:
      'We design for patchy networks, modest devices, and actual Indian conditions — not just the demo running on office wifi.',
  },
  {
    title: 'Partners, not vendors',
    description:
      'We stay on after launch to monitor, maintain, and improve, treating your product as something we are in for the long run.',
  },
];

/** Headline metrics for the by-the-numbers band (Req 11.3) — shared source of truth. */
const METRICS = studioMetrics;

/** Team members rendered in profile order (lowest `order` first). */
const orderedTeam = [...team].sort((a, b) => a.order - b.order);

export function AboutPage(): JSX.Element {
  return (
    <>
      <SEOHead meta={seo} />

      <main>
        {/* Hero / story (Req 11.1) */}
        <section className="mx-auto w-full max-w-site px-6 pb-16 pt-[clamp(8.5rem,20vh,13rem)] sm:px-10">
          <AnimationWrapper variant="rise">
            <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
              <div>
                <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-pulse-500">
                  Who we are
                </p>
                <h1 className="mt-5 max-w-[16ch] font-display text-[clamp(2.5rem,7vw,6rem)] font-bold leading-[0.95] tracking-[-0.03em] text-mist-100">
                  A studio that sweats the details
                </h1>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-ink-600 pt-6">
                <div className="flex flex-col gap-1">
                  <dt className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-mist-300">Founded</dt>
                  <dd className="font-display text-h3 font-bold text-mist-100">Nagpur, IN</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-mist-300">Focus</dt>
                  <dd className="font-display text-h3 font-bold text-mist-100">Durable software</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-mist-300">Disciplines</dt>
                  <dd className="font-display text-h3 font-bold text-mist-100">Web · Mobile · Systems</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-mist-300">Working</dt>
                  <dd className="font-display text-h3 font-bold text-mist-100">Worldwide</dd>
                </div>
              </dl>
            </div>
            <p className="mt-10 max-w-3xl font-sans text-body-l text-mist-300">
              Ryze Technology started in Nagpur with a simple conviction: that
              software built carefully, by people who care, holds up where
              software built quickly does not. We design and engineer the
              websites, apps, and systems that businesses depend on every day.
            </p>
          </AnimationWrapper>
        </section>

        {/* Mission (Req 11.1) */}
        <section aria-label="Our mission" className="border-y border-ink-600 bg-ink-800">
          <div className="mx-auto grid w-full max-w-site gap-10 px-6 py-[clamp(5rem,12vh,9rem)] sm:px-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <SectionHeader
              as="h2"
              eyebrow="Our mission"
              title="Software that earns its keep"
            />
            <p className="max-w-2xl font-sans text-body-l text-mist-300">
              We are here to build software that does real work — quietly,
              reliably, for years. Not the flashiest demo, but the system your
              team trusts, the app your customers come back to, the site that
              still feels fast long after launch.
            </p>
          </div>
        </section>

        {/* Team profiles (Req 11.2) */}
        <section aria-label="Our team" className="mx-auto w-full max-w-site px-6 py-[clamp(5rem,12vh,9rem)] sm:px-10">
          <SectionHeader as="h2" eyebrow="The people" title="Meet the team" />
          <AnimationWrapper variant="rise" stagger={0.08}>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {orderedTeam.map((member, index) => (
                <TeamCard key={member.id} member={member} index={index} />
              ))}
            </div>
          </AnimationWrapper>
        </section>

        {/* Differentiators (Req 11.1) */}
        <section aria-label="Why Ryze" className="border-y border-ink-600 bg-ink-800">
          <div className="mx-auto w-full max-w-site px-6 py-[clamp(5rem,12vh,9rem)] sm:px-10">
          <SectionHeader
            as="h2"
            eyebrow="Why Ryze"
            title="What sets us apart"
          />
          <AnimationWrapper variant="rise" stagger={0.1}>
            <ul className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
              {DIFFERENTIATORS.map((item) => (
                <li
                  key={item.title}
                  className="flex flex-col gap-3 border-t border-ink-600 pt-6"
                >
                  <h3 className="font-display text-h3 text-mist-100">
                    {item.title}
                  </h3>
                  <p className="font-sans text-body text-mist-300">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </AnimationWrapper>
          </div>
        </section>

        {/* By-the-numbers (Req 11.3) */}
        <section aria-label="By the numbers" className="mx-auto w-full max-w-site px-6 py-[clamp(5rem,12vh,9rem)] sm:px-10">
          <SectionHeader
            as="h2"
            align="center"
            eyebrow="Track record"
            title="By the numbers"
          />
          <AnimationWrapper variant="rise" stagger={0.08}>
            <dl className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-8 text-center lg:grid-cols-4">
              {METRICS.map((metric) => (
                <div
                  key={metric.label}
                  className="flex flex-col-reverse gap-2"
                >
                  <dt className="font-mono text-mono-eyebrow uppercase tracking-widest text-mist-300">
                    {metric.label}
                  </dt>
                  <dd>
                    <AnimatedCounter
                      value={metric.value}
                      suffix={metric.suffix}
                      className="font-display text-display-l text-mist-100"
                    />
                  </dd>
                </div>
              ))}
            </dl>
          </AnimationWrapper>
        </section>

        {/* Testimonials (Req 11.1) */}
        <section aria-label="What clients say" className="mx-auto w-full max-w-site px-6 py-[clamp(5rem,12vh,9rem)] sm:px-10">
          <SectionHeader
            as="h2"
            eyebrow="In their words"
            title="What clients say"
          />
          <AnimationWrapper variant="rise" stagger={0.08}>
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                />
              ))}
            </div>
          </AnimationWrapper>
        </section>

        {/* Closing CTA (Req 11.1) */}
        <CTA
          heading="Want to work with us?"
          sub="Tell us what you're building. We'll help you figure out the right way to make it real."
        />
      </main>
    </>
  );
}

export default AboutPage;
