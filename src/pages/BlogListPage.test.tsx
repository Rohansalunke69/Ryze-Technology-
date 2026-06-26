/**
 * Unit tests for BlogListPage (task 14.17).
 *
 * BlogListPage composes motion-aware components (SectionHeader/SplitText,
 * AnimationWrapper, Framer Motion filter indicator + grid, BlogCard, CTA) and
 * SEOHead, so renders are wrapped in `MemoryRouter` (BlogCard/CTA links),
 * `ReducedMotionProvider` (motion prefs), and `HelmetProvider` (SEOHead).
 * `matchMedia` and `IntersectionObserver` are stubbed because jsdom does not
 * implement them.
 *
 * Requirements: 14.1 (card grid with image/category/title/excerpt/date/reading
 * time), 14.2 (category filter + All), 14.3 (concrete filter shows only
 * matching, order preserved; All shows everything), 14.4 (pagination via the
 * pure helper), 14.5 (page change renders the page's items and enables
 * prev/next per hasPrev/hasNext).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { axe } from 'jest-axe';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import { blogPosts } from '@data/blogPosts';

import { BlogListPage } from './BlogListPage';

/** Posts shown per page — must match POSTS_PER_PAGE in BlogListPage. */
const POSTS_PER_PAGE = 6;

/** Minimal IntersectionObserver stub — never reports intersection. */
class MockIntersectionObserver {
  constructor(_callback: IntersectionObserverCallback) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  mockReducedMotion(false);
});

afterEach(() => {
  resetMatchMedia();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function renderPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <ReducedMotionProvider>
          <BlogListPage />
        </ReducedMotionProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

/**
 * The post slugs currently rendered as cards, in DOM order. Each BlogCard
 * renders two links to `/blog/:slug` (cover + title), so consecutive duplicates
 * are collapsed to a single slug per card while preserving order.
 */
function renderedCardSlugs(): string[] {
  const slugs = screen
    .getAllByRole('link')
    .map((link) => link.getAttribute('href') ?? '')
    .filter((href) => href.startsWith('/blog/'))
    .map((href) => href.replace('/blog/', ''));

  return slugs.filter((slug, i) => slug !== slugs[i - 1]);
}

const ALL_SLUGS = blogPosts.map((post) => post.slug);
const PAGE_1_SLUGS = ALL_SLUGS.slice(0, POSTS_PER_PAGE);
const PAGE_2_SLUGS = ALL_SLUGS.slice(POSTS_PER_PAGE);

describe('BlogListPage', () => {
  it('renders the page-level h1 hero heading', () => {
    renderPage();
    const h1 = screen.getByRole('heading', { level: 1, name: 'Blog' });
    expect(h1.tagName).toBe('H1');
  });

  it('renders the category filter with All + every BlogCategory (Req 14.2)', () => {
    renderPage();
    const group = screen.getByRole('group', {
      name: 'Filter posts by category',
    });
    for (const label of ['All', 'Engineering', 'Design', 'Process', 'Company']) {
      expect(
        within(group).getByRole('button', { name: label }),
      ).toBeInTheDocument();
    }
  });

  it('renders a BlogCard for the first page of posts initially (Req 14.1, 14.4)', () => {
    renderPage();
    expect(renderedCardSlugs()).toEqual(PAGE_1_SLUGS);
  });

  it('shows the full card content for each rendered post (Req 14.1)', () => {
    renderPage();
    const first = blogPosts[0]!;

    // Resolve the first post's card via its title link, then assert the card
    // exposes title, excerpt, category, and reading time (date is rendered as a
    // <time>). Reading-time text repeats across cards, so it is scoped here.
    const titleLink = screen.getByRole('link', { name: first.title });
    expect(titleLink).toHaveAttribute('href', `/blog/${first.slug}`);

    const card = titleLink.closest('article');
    expect(card).not.toBeNull();
    const inCard = within(card as HTMLElement);

    expect(inCard.getByText(first.excerpt)).toBeInTheDocument();
    expect(
      inCard.getByText(`${first.readingTimeMinutes} min read`),
    ).toBeInTheDocument();
    expect(inCard.getByText('Engineering')).toBeInTheDocument();
  });

  it('shows only matching posts when a concrete category is selected (Req 14.3)', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Engineering' }));

    const expected = blogPosts
      .filter((post) => post.category === 'engineering')
      .map((post) => post.slug)
      .slice(0, POSTS_PER_PAGE);
    await waitFor(() => expect(renderedCardSlugs()).toEqual(expected));
    expect(expected.length).toBeGreaterThan(0);
  });

  it('filters to the process category independently (Req 14.3)', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Process' }));

    const expected = blogPosts
      .filter((post) => post.category === 'process')
      .map((post) => post.slug)
      .slice(0, POSTS_PER_PAGE);
    await waitFor(() => expect(renderedCardSlugs()).toEqual(expected));
  });

  it('returns to showing every post when All is selected (Req 14.3)', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Design' }));
    await user.click(screen.getByRole('button', { name: 'All' }));

    await waitFor(() => expect(renderedCardSlugs()).toEqual(PAGE_1_SLUGS));
  });

  it('preserves collection order under any filter (Req 14.3)', async () => {
    const user = userEvent.setup();
    renderPage();

    for (const [label, category] of [
      ['Engineering', 'engineering'],
      ['Design', 'design'],
      ['Process', 'process'],
      ['Company', 'company'],
    ] as const) {
      await user.click(screen.getByRole('button', { name: label }));
      const expected = blogPosts
        .filter((post) => post.category === category)
        .map((post) => post.slug)
        .slice(0, POSTS_PER_PAGE);
      await waitFor(() => expect(renderedCardSlugs()).toEqual(expected));
    }
  });

  it('marks the active filter via aria-pressed (Req 14.2)', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Engineering' }));

    expect(
      screen.getByRole('button', { name: 'Engineering' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('disables Previous and enables Next on the first page (Req 14.5)', () => {
    renderPage();

    // Guard: the fixture must span more than one page for this assertion.
    expect(ALL_SLUGS.length).toBeGreaterThan(POSTS_PER_PAGE);

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('renders the next page items and toggles prev/next on page change (Req 14.4, 14.5)', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(renderedCardSlugs()).toEqual(PAGE_2_SLUGS));
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('returns to the first page and re-enables Next when navigating back (Req 14.5)', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(renderedCardSlugs()).toEqual(PAGE_2_SLUGS));

    await user.click(screen.getByRole('button', { name: 'Previous' }));
    await waitFor(() => expect(renderedCardSlugs()).toEqual(PAGE_1_SLUGS));
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('resets to the first page when the filter changes (Req 14.4)', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(renderedCardSlugs()).toEqual(PAGE_2_SLUGS));

    await user.click(screen.getByRole('button', { name: 'All' }));
    await waitFor(() => expect(renderedCardSlugs()).toEqual(PAGE_1_SLUGS));
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  it('has no axe-detectable accessibility violations', async () => {
    mockReducedMotion(true);
    const { container } = renderPage();
    expect(await axe(container)).toHaveNoViolations();
  });
});
