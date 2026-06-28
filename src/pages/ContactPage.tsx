/**
 * ContactPage — `/contact` (task 14.15).
 *
 * Composition (design "8. /contact"):
 *   Editorial hero → two-column layout (Contact_Form + "what happens next"
 *   rail) → direct-email band → closing CTA.
 *
 * The page renders the `ContactForm` (Requirements 13.1–13.6) beneath a single
 * page `h1`, exposes the studio's contact details, and closes with a CTA that
 * offers a direct email path. Section reveals use `AnimationWrapper`, which
 * renders content in its final visible state immediately under
 * `prefers-reduced-motion` (Requirements 25.1, 37.2).
 *
 * _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 38.6_
 */
import type { SEOMeta } from '@app-types';
import { CTA } from '@components/CTA';
import { SEOHead } from '@components/SEOHead';
import { AnimationWrapper } from '@components/AnimationWrapper';
import { ContactForm } from '@components/ContactForm';
import { siteMetadata } from '@data/siteMetadata';

/** Per-route metadata. Canonical resolves to `/contact` on the site origin. */
const seo: SEOMeta = {
  title: 'Contact',
  description:
    'Tell Ryze Technology about your project. Share your goals, budget, and timeline, and we will help you figure out the right way to build it.',
  canonical: `${siteMetadata.baseUrl}/contact`,
};

/** "What happens next" steps shown in the rail beside the form. */
const NEXT_STEPS: ReadonlyArray<{ title: string; description: string }> = [
  {
    title: 'We read every word',
    description:
      'A real person — not a bot — reads your message and replies, usually within one business day.',
  },
  {
    title: 'A short discovery call',
    description:
      'We talk through goals, scope, and constraints to make sure we are the right fit before anything else.',
  },
  {
    title: 'A clear, honest plan',
    description:
      'You get a straight proposal: what we would build, how long it takes, and what it costs.',
  },
];

export function ContactPage(): JSX.Element {
  return (
    <>
      <SEOHead meta={seo} />

      <main>
        {/* Editorial hero */}
        <section className="mx-auto w-full max-w-site px-6 pb-12 pt-[clamp(8.5rem,20vh,13rem)] sm:px-10">
          <AnimationWrapper variant="rise">
            <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-pulse-500">
              Get in touch
            </p>
            <h1 className="mt-5 max-w-[18ch] font-display text-[clamp(2.5rem,8vw,7rem)] font-bold leading-[0.92] tracking-[-0.03em] text-mist-100">
              {"Let's build something that lasts"}
            </h1>
            <p className="mt-8 max-w-2xl font-sans text-body-l text-mist-300">
              Tell us what you&rsquo;re working on. Share as much or as little as
              you like — we&rsquo;ll read every word and get back to you with a
              thoughtful reply, not a canned one.
            </p>
          </AnimationWrapper>
        </section>

        {/* Two-column: form + "what happens next" rail (Req 13.1–13.6) */}
        <section
          aria-label="Contact form"
          className="mx-auto w-full max-w-site px-6 py-[clamp(2.5rem,6vh,4.5rem)] sm:px-10"
        >
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <AnimationWrapper variant="rise">
              <ContactForm />
            </AnimationWrapper>

            <AnimationWrapper variant="fade">
              <div className="flex flex-col gap-8 lg:border-l lg:border-ink-600 lg:pl-12">
                <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-pulse-500">
                  What happens next
                </p>
                <ol className="flex flex-col gap-8">
                  {NEXT_STEPS.map((step, index) => (
                    <li key={step.title} className="flex gap-4">
                      <span
                        aria-hidden="true"
                        className="font-mono text-h3 font-bold leading-none text-pulse-500/40"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <h2 className="font-display text-h4 text-mist-100">
                          {step.title}
                        </h2>
                        <p className="font-sans text-body text-mist-300">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </AnimationWrapper>
          </div>
        </section>

        {/* Direct-email band */}
        <section
          aria-label="Contact details"
          className="border-y border-ink-600 bg-ink-800"
        >
          <div className="mx-auto w-full max-w-site px-6 py-[clamp(3.5rem,9vh,6rem)] sm:px-10">
            <AnimationWrapper variant="fade">
              <div className="flex flex-col gap-4">
                <p className="font-mono text-mono-eyebrow uppercase tracking-[0.22em] text-pulse-500">
                  Prefer email?
                </p>
                <a
                  href={`mailto:${siteMetadata.contactEmail}`}
                  className="font-display text-[clamp(1.75rem,5vw,3.5rem)] font-bold leading-[0.95] tracking-[-0.02em] text-mist-100 underline-offset-4 transition-colors hover:text-pulse-500 hover:underline"
                >
                  {siteMetadata.contactEmail}
                </a>
                {siteMetadata.contactPhone !== undefined ? (
                  <a
                    href={`tel:${siteMetadata.contactPhone}`}
                    className="font-mono text-body-l text-mist-100 underline-offset-4 transition-colors hover:text-pulse-500 hover:underline"
                  >
                    +91 {siteMetadata.contactPhone}
                  </a>
                ) : null}
                <p className="max-w-2xl font-sans text-body text-mist-300">
                  We typically reply within one business day.
                </p>
              </div>
            </AnimationWrapper>
          </div>
        </section>

        {/* Closing CTA */}
        <CTA
          heading="Rather just say hello?"
          sub="Drop us a line and we'll take it from there."
          href={`mailto:${siteMetadata.contactEmail}`}
          label="Email us"
        />
      </main>
    </>
  );
}

export default ContactPage;
