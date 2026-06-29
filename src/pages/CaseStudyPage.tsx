/**
 * CaseStudyPage — `/portfolio/:slug` case study detail (task 14.5).
 *
 * Reads the `:slug` route param and resolves it against the typed case-study
 * collection with the pure `resolveBySlug` helper. When the slug resolves to a
 * case study the page renders, in order (design.md "/portfolio/:slug — Case
 * Study Detail"): Breadcrumb → hero → challenge → solution (+ tech-stack chips)
 * → results metric grid (one `AnimatedCounter` per Metric) → gallery that opens
 * an accessible `Lightbox` ("OPEN" cursor) → testimonial → technical breakdown
 * → key learnings → related projects (`getRelatedCaseStudies`) → CTA
 * (Requirements 8.1, 8.2, 8.3).
 *
 * When the slug resolves to nothing the page renders an in-route not-found
 * state — a "Project not found" heading, suggested case studies, and a link
 * back to the portfolio — and marks itself `noIndex` so the broken URL stays
 * out of search results (Requirement 8.4; design Error Handling "Entity slug
 * not found").
 *
 * _Requirements: 8.1, 8.2, 8.3, 8.4_
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { CaseStudy, SEOMeta } from '@app-types';
import { caseStudies } from '@data/caseStudies';
import { testimonials } from '@data/testimonials';
import { resolveBySlug } from '@lib/slug';
import { getRelatedCaseStudies } from '@lib/related';

import { Breadcrumb } from '@components/Breadcrumb';
import { SEOHead } from '@components/SEOHead';
import { SectionHeader } from '@components/SectionHeader';
import { AnimatedCounter } from '@components/AnimatedCounter';
import { Lightbox } from '@components/Lightbox';
import { CardImage } from '@components/CardImage';
import { CaseStudyCard } from '@components/CaseStudyCard';
import { TestimonialCard } from '@components/TestimonialCard';
import { CTA } from '@components/CTA';

/** Human-readable labels for the portfolio categories. */
const CATEGORY_LABELS: Record<CaseStudy['category'], string> = {
  websites: 'Websites',
  mobile: 'Mobile',
  systems: 'Systems',
};

/**
 * In-route not-found state shown when `/portfolio/:slug` resolves to no case
 * study (Requirement 8.4). Sets `noIndex` metadata and surfaces a handful of
 * real case studies as suggestions plus a link back to the portfolio index.
 */
function CaseStudyNotFound(): JSX.Element {
  const suggestions = caseStudies.slice(0, 3);
  const notFoundMeta: SEOMeta = {
    title: 'Project not found',
    description:
      'We could not find that case study. Explore our recent work or head back to the full portfolio.',
    canonical: 'https://ryze-technology.pages.dev/portfolio',
    noIndex: true,
  };

  return (
    <main id="main" className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-24">
      <SEOHead meta={notFoundMeta} />

      <Breadcrumb
        trail={[
          { label: 'Home', path: '/' },
          { label: 'Portfolio', path: '/portfolio' },
          { label: 'Project not found' },
        ]}
      />

      <header className="flex flex-col gap-6">
        <p className="font-mono text-mono-eyebrow uppercase tracking-widest text-pulse-500">
          404 · Case study
        </p>
        <h1 className="font-display text-display-l text-mist-100">
          Project not found
        </h1>
        <p className="max-w-2xl font-sans text-body-l text-mist-300">
          The case study you are looking for may have moved or never existed.
          Here is some of our recent work, or you can browse the full portfolio.
        </p>
        <Link
          to="/portfolio"
          className="font-mono text-sm uppercase tracking-widest text-pulse-500 underline-offset-4 hover:underline"
        >
          ← Back to portfolio
        </Link>
      </header>

      <section aria-label="Suggested projects" className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="You might like"
          title="Suggested projects"
          as="h2"
        />
        <div className="grid gap-8 md:grid-cols-2">
          {suggestions.map((study, index) => (
            <CaseStudyCard key={study.slug} caseStudy={study} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}

export function CaseStudyPage(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const caseStudy = resolveBySlug(caseStudies, slug ?? '');

  // Gallery / Lightbox state. The Lightbox is a no-op when the gallery is empty
  // or `open` is false, so it is always safe to render.
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (caseStudy === undefined) {
    return <CaseStudyNotFound />;
  }

  const {
    title,
    client,
    category,
    year,
    role,
    summary,
    hero,
    challenge,
    solution,
    results,
    gallery,
    techStack,
    learnings,
    testimonialId,
    seo,
  } = caseStudy;

  const testimonial =
    testimonialId !== undefined
      ? testimonials.find((t) => t.id === testimonialId)
      : undefined;

  const related = getRelatedCaseStudies(caseStudies, caseStudy);

  const openGallery = (index: number): void => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <main id="main" className="flex flex-col gap-24 pb-24">
      <SEOHead meta={seo} />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pt-12">
        <Breadcrumb
          trail={[
            { label: 'Home', path: '/' },
            { label: 'Portfolio', path: '/portfolio' },
            { label: title },
          ]}
        />

        {/* Hero */}
        <header className="flex flex-col gap-8">
          <p className="font-mono text-mono-eyebrow uppercase tracking-widest text-pulse-500">
            {client} · {CATEGORY_LABELS[category]}
          </p>
          <h1 className="max-w-4xl font-display text-display-l leading-tight text-mist-100">
            {title}
          </h1>
          <p className="max-w-2xl font-sans text-body-l text-mist-300">{summary}</p>
          <dl className="grid grid-cols-2 gap-6 font-mono text-sm text-mist-300 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <dt className="uppercase tracking-widest text-ink-400">Client</dt>
              <dd className="text-mist-100">{client}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="uppercase tracking-widest text-ink-400">Year</dt>
              <dd className="text-mist-100">{year}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="uppercase tracking-widest text-ink-400">Role</dt>
              <dd className="text-mist-100">{role}</dd>
            </div>
          </dl>
          <CardImage
            image={hero}
            className="overflow-hidden rounded-xl ring-1 ring-ink-600/60 [clip-path:inset(0_0_0_0)]"
          />
        </header>
      </div>

      {/* The Challenge */}
      <section
        aria-label="What we set out to solve"
        className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6"
      >
        <SectionHeader eyebrow="The Challenge" title="What we set out to solve" as="h2" />
        <p className="font-sans text-body-l leading-relaxed text-mist-300">{challenge}</p>
      </section>

      {/* What We Built */}
      <section
        aria-label="The solution"
        className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6"
      >
        <SectionHeader eyebrow="What We Built" title="The solution" as="h2" />
        <p className="font-sans text-body-l leading-relaxed text-mist-300">{solution}</p>
        {techStack.length > 0 ? (
          <ul className="flex flex-wrap gap-3" aria-label="Technologies used">
            {techStack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-ink-600 px-4 py-1 font-mono text-xs uppercase tracking-widest text-mist-300"
              >
                {tech}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {/* The Results */}
      {results.length > 0 ? (
        <section
          aria-label="Outcomes that mattered"
          className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6"
        >
          <SectionHeader eyebrow="The Results" title="Outcomes that mattered" as="h2" />
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((metric) => (
              <div
                key={metric.label}
                className="flex flex-col gap-2 border-t border-ink-600 pt-6"
              >
                <dt className="order-2 font-mono text-sm text-mist-300">
                  {metric.label}
                </dt>
                <dd className="order-1 font-display text-display-l text-mist-100">
                  <AnimatedCounter
                    value={metric.value}
                    {...(metric.prefix !== undefined ? { prefix: metric.prefix } : {})}
                    {...(metric.suffix !== undefined ? { suffix: metric.suffix } : {})}
                    {...(metric.decimals !== undefined ? { decimals: metric.decimals } : {})}
                  />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* Gallery / Lightbox */}
      {gallery.length > 0 ? (
        <section
          aria-label="A closer look"
          className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6"
        >
          <SectionHeader eyebrow="Gallery" title="A closer look" as="h2" />
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {gallery.map((image, index) => (
              <li key={image.src}>
                <button
                  type="button"
                  data-cursor="view"
                  onClick={() => openGallery(index)}
                  aria-label={`Open image ${index + 1}${image.alt ? `: ${image.alt}` : ''}`}
                  aria-haspopup="dialog"
                  className="group block w-full overflow-hidden rounded-xl ring-1 ring-ink-600/60 transition-shadow duration-300 ease-out hover:shadow-[0_0_40px_-8px_var(--pulse-500,#22d3ee)] focus-visible:shadow-[0_0_40px_-8px_var(--pulse-500,#22d3ee)]"
                >
                  <CardImage
                    image={image}
                    imgClassName="transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Testimonial */}
      {testimonial !== undefined ? (
        <section
          aria-label="Client testimonial"
          className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6"
        >
          <SectionHeader eyebrow="In their words" title="Client testimonial" as="h2" />
          <TestimonialCard testimonial={testimonial} />
        </section>
      ) : null}

      {/* Technical breakdown */}
      {techStack.length > 0 ? (
        <section
          aria-label="Technical breakdown"
          className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6"
        >
          <SectionHeader eyebrow="Under the hood" title="Technical breakdown" as="h2" />
          <ul className="flex flex-wrap gap-3" aria-label="Technical stack">
            {techStack.map((tech) => (
              <li
                key={tech}
                className="rounded-md bg-ink-800 px-4 py-2 font-mono text-sm text-mist-100 ring-1 ring-ink-600"
              >
                {tech}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Key learnings */}
      {learnings.length > 0 ? (
        <section
          aria-label="Key learnings"
          className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6"
        >
          <SectionHeader eyebrow="Reflections" title="Key learnings" as="h2" />
          <ul className="flex flex-col gap-4">
            {learnings.map((learning) => (
              <li
                key={learning}
                className="border-l-2 border-pulse-500 pl-4 font-sans text-body-l leading-relaxed text-mist-300"
              >
                {learning}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Related projects */}
      {related.length > 0 ? (
        <section
          aria-label="Related projects"
          className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6"
        >
          <SectionHeader eyebrow="Keep exploring" title="Related projects" as="h2" />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {related.map((study, index) => (
              <CaseStudyCard key={study.slug} caseStudy={study} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      <CTA
        heading="Have a project like this?"
        sub="Tell us what you're building. We'll figure out the rest together."
      />

      <Lightbox
        images={gallery}
        index={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
      />
    </main>
  );
}

export default CaseStudyPage;
