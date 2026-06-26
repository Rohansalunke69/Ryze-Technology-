/**
 * BlogPostPage — `/blog/:slug` blog post detail (task 14.19).
 *
 * Reads the `:slug` route param and resolves it against the typed blog
 * collection with the pure `resolveBySlug` helper. When the slug resolves to a
 * post the page renders, in order (design.md "10. /blog/:slug — Post"):
 * Breadcrumb → hero (title, category, date, reading time, author) → sticky
 * table of contents with scroll-spy → prose content constrained to a 68ch
 * measure → author bio → related posts (`getRelatedPosts`) → share buttons →
 * CTA (Requirements 15.1, 15.2, 15.3).
 *
 * When the slug resolves to nothing the page renders an in-route not-found
 * state — a "Post not found" heading, suggested posts, and a link back to the
 * blog — and marks itself `noIndex` so the broken URL stays out of search
 * results (Requirement 15.4; design Error Handling "Entity slug not found").
 *
 * _Requirements: 15.1, 15.2, 15.3, 15.4_
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { BlogPost, SEOMeta } from '@app-types';
import { blogPosts } from '@data/blogPosts';
import { siteMetadata } from '@data/siteMetadata';
import { resolveBySlug } from '@lib/slug';
import { getRelatedPosts } from '@lib/related';

import { Breadcrumb } from '@components/Breadcrumb';
import { SEOHead } from '@components/SEOHead';
import { SectionHeader } from '@components/SectionHeader';
import { BlogCard } from '@components/BlogCard';
import { CTA } from '@components/CTA';
import { AnimationWrapper } from '@components/AnimationWrapper';
import { MagneticButton } from '@components/MagneticButton';

/** Human-readable labels per blog category. */
const CATEGORY_LABELS: Record<BlogPost['category'], string> = {
  engineering: 'Engineering',
  design: 'Design',
  process: 'Process',
  company: 'Company',
};

/** Format an ISO 'YYYY-MM-DD' date as e.g. "Jan 5, 2025"; passthrough on parse failure. */
function formatDate(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** A rendered block of the post's markdown-ish content. */
type ContentBlock =
  | { kind: 'heading'; id: string; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] };

/** Turn a heading's text into a stable, URL-safe id for the TOC anchor. */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse the post's lightweight markdown content into a flat list of blocks:
 * `## ` lines become section headings (each with a unique anchor id), `- `
 * lines group into unordered lists, and remaining runs of text become
 * paragraphs. Pure and deterministic so the TOC, scroll-spy, and prose all
 * derive from the same source.
 */
function parseContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const seen = new Set<string>();

  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = (): void => {
    if (paragraph.length > 0) {
      blocks.push({ kind: 'paragraph', text: paragraph.join(' ') });
      paragraph = [];
    }
  };
  const flushList = (): void => {
    if (list.length > 0) {
      blocks.push({ kind: 'list', items: list });
      list = [];
    }
  };

  for (const raw of content.split('\n')) {
    const line = raw.trim();

    if (line.length === 0) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      flushList();
      const text = line.slice(3).trim();
      const base = slugifyHeading(text) || 'section';
      let id = base;
      let n = 1;
      while (seen.has(id)) {
        id = `${base}-${n}`;
        n += 1;
      }
      seen.add(id);
      blocks.push({ kind: 'heading', id, text });
      continue;
    }

    if (line.startsWith('- ')) {
      flushParagraph();
      list.push(line.slice(2).trim());
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

/** A single table-of-contents entry derived from a section heading. */
interface TocEntry {
  id: string;
  text: string;
}

/**
 * Sticky table of contents with scroll-spy. Observes each section heading and
 * highlights the entry whose section is currently in view (design "10. — TOC
 * sticky scroll-spy"). The IntersectionObserver is guarded so the component is
 * safe to render in environments that lack it.
 */
function TableOfContents({ entries }: { entries: TocEntry[] }): JSX.Element | null {
  const [activeId, setActiveId] = useState<string>(entries[0]?.id ?? '');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    const elements = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (observed) => {
        for (const entry of observed) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 },
    );

    for (const el of elements) {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-auto lg:block"
    >
      <p className="mb-4 font-mono text-mono-eyebrow uppercase tracking-widest text-pulse-500">
        On this page
      </p>
      <ol className="flex flex-col gap-3">
        {entries.map((entry) => {
          const isActive = entry.id === activeId;
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={[
                  'block font-sans text-body leading-snug transition-colors',
                  isActive
                    ? 'text-pulse-500'
                    : 'text-mist-300 hover:text-mist-100',
                ].join(' ')}
              >
                {entry.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * In-route not-found state shown when `/blog/:slug` resolves to no post
 * (Requirement 15.4). Sets `noIndex` metadata and surfaces a handful of real
 * posts as suggestions plus a link back to the blog index.
 */
function BlogPostNotFound(): JSX.Element {
  const suggestions = blogPosts.slice(0, 3);
  const notFoundMeta: SEOMeta = {
    title: 'Post not found',
    description:
      'We could not find that article. Explore our recent writing or head back to the full blog.',
    canonical: `${siteMetadata.baseUrl}/blog`,
    noIndex: true,
  };

  return (
    <main id="main" className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-24">
      <SEOHead meta={notFoundMeta} />

      <Breadcrumb
        trail={[
          { label: 'Home', path: '/' },
          { label: 'Blog', path: '/blog' },
          { label: 'Post not found' },
        ]}
      />

      <header className="flex flex-col gap-6">
        <p className="font-mono text-mono-eyebrow uppercase tracking-widest text-pulse-500">
          404 · Blog post
        </p>
        <h1 className="font-display text-display-l text-mist-100">Post not found</h1>
        <p className="max-w-2xl font-sans text-body-l text-mist-300">
          The article you are looking for may have moved or never existed. Here
          is some of our recent writing, or you can browse the full blog.
        </p>
        <Link
          to="/blog"
          className="font-mono text-sm uppercase tracking-widest text-pulse-500 underline-offset-4 hover:underline"
        >
          ← Back to blog
        </Link>
      </header>

      <section aria-label="Suggested posts" className="flex flex-col gap-8">
        <SectionHeader eyebrow="You might like" title="Suggested posts" as="h2" />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {suggestions.map((post, index) => (
            <BlogCard key={post.slug} post={post} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}

/**
 * The resolved-post rendering. Split out from {@link BlogPostPage} so all of
 * the post-only hooks (content parsing, scroll-spy) live behind a guaranteed
 * non-null `post`, keeping the hook order stable.
 */
function BlogPostArticle({ post }: { post: BlogPost }): JSX.Element {
  const {
    title,
    category,
    content,
    author,
    publishedAt,
    updatedAt,
    readingTimeMinutes,
    seo,
  } = post;

  const blocks = useMemo(() => parseContent(content), [content]);
  const tocEntries = useMemo<TocEntry[]>(
    () =>
      blocks
        .filter((block): block is Extract<ContentBlock, { kind: 'heading' }> =>
          block.kind === 'heading',
        )
        .map((block) => ({ id: block.id, text: block.text })),
    [blocks],
  );

  const related = getRelatedPosts(blogPosts, post);

  const shareUrl = seo.canonical;
  const shareTargets = [
    {
      label: 'Share on X',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl,
      )}&text=${encodeURIComponent(title)}`,
    },
    {
      label: 'Share on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl,
      )}`,
    },
  ] as const;

  return (
    <main id="main" className="flex flex-col gap-24 pb-24">
      <SEOHead meta={seo} />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pt-12">
        <Breadcrumb
          trail={[
            { label: 'Home', path: '/' },
            { label: 'Blog', path: '/blog' },
            { label: title },
          ]}
        />

        {/* Hero */}
        <header className="flex flex-col gap-6">
          <p className="font-mono text-mono-eyebrow uppercase tracking-widest text-pulse-500">
            {CATEGORY_LABELS[category]}
          </p>
          <h1 className="max-w-4xl font-display text-display-l leading-tight text-mist-100">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-sm text-mist-300">
            <span className="text-mist-100">{author.name}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
            {updatedAt !== undefined ? (
              <>
                <span aria-hidden="true">·</span>
                <span>Updated {formatDate(updatedAt)}</span>
              </>
            ) : null}
            <span aria-hidden="true">·</span>
            <span>{readingTimeMinutes} min read</span>
          </div>
        </header>
      </div>

      {/* TOC + prose content */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 lg:grid-cols-[16rem_1fr]">
        <TableOfContents entries={tocEntries} />

        <article
          data-testid="post-prose"
          className="prose font-sans text-body-l leading-relaxed text-mist-300"
        >
          {blocks.map((block, index) => {
            if (block.kind === 'heading') {
              return (
                <h2
                  key={block.id}
                  id={block.id}
                  className="mb-4 mt-12 scroll-mt-24 font-display text-h3 text-mist-100 first:mt-0"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.kind === 'list') {
              return (
                <ul
                  key={`list-${index}`}
                  className="mb-6 flex list-disc flex-col gap-2 pl-6"
                >
                  {block.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={`p-${index}`} className="mb-6">
                {block.text}
              </p>
            );
          })}
        </article>
      </div>

      {/* Author bio */}
      <section
        aria-label="About the author"
        className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6"
      >
        <SectionHeader eyebrow="Written by" title={author.name} as="h2" />
        <div className="flex items-center gap-4">
          <img
            src={author.avatar.src}
            alt={author.avatar.alt}
            width={author.avatar.width}
            height={author.avatar.height}
            className="h-16 w-16 rounded-full object-cover ring-1 ring-ink-600/60"
          />
          <p className="font-mono text-sm uppercase tracking-widest text-mist-300">
            {author.role}
          </p>
        </div>
      </section>

      {/* Related posts */}
      {related.length > 0 ? (
        <section
          aria-label="Related posts"
          className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6"
        >
          <SectionHeader eyebrow="Keep reading" title="Related posts" as="h2" />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item, index) => (
              <BlogCard key={item.slug} post={item} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Share buttons */}
      <section
        aria-label="Share this post"
        className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6"
      >
        <SectionHeader eyebrow="Pass it on" title="Share this post" as="h2" />
        <AnimationWrapper variant="fade">
          <ul className="flex flex-wrap gap-4">
            {shareTargets.map((target) => (
              <li key={target.label}>
                <MagneticButton
                  as="a"
                  href={target.href}
                  ariaLabel={target.label}
                >
                  {target.label}
                </MagneticButton>
              </li>
            ))}
          </ul>
        </AnimationWrapper>
      </section>

      <CTA
        heading="Enjoyed this read?"
        sub="Tell us what you're building. We'll help you ship something that lasts."
      />
    </main>
  );
}

export function BlogPostPage(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const post = resolveBySlug(blogPosts, slug ?? '');

  if (post === undefined) {
    return <BlogPostNotFound />;
  }

  return <BlogPostArticle post={post} />;
}

export default BlogPostPage;
