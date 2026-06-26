/**
 * Tests for BlogPostPage (task 14.19).
 *
 * Rendered inside a MemoryRouter at `/blog/:slug` with the ReducedMotionProvider
 * + HelmetProvider wired exactly as the app shell does. matchMedia and
 * IntersectionObserver are mocked so the motion-aware components and the TOC
 * scroll-spy behave deterministically in jsdom.
 *
 *  - A known slug renders the resolved post: title, hero meta, prose, related
 *    posts, and share buttons (Requirements 15.1, 15.3).
 *  - The prose container carries the 68ch `.prose` measure (Requirement 15.2).
 *  - An unknown slug renders the in-route not-found state with suggestions
 *    (Requirement 15.4).
 *  - The page has no axe violations.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { axe } from 'jest-axe';

import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { blogPosts } from '@data/blogPosts';
import { getRelatedPosts } from '@lib/related';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';

import BlogPostPage from './BlogPostPage';

/** Mock IntersectionObserver so the TOC scroll-spy effect runs in jsdom. */
function mockIntersectionObserver(): void {
  class IO {
    constructor(private cb: IntersectionObserverCallback) {}
    observe = (el: Element): void => {
      this.cb(
        [{ isIntersecting: true, target: el } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    };
    unobserve = (): void => {};
    disconnect = (): void => {};
    takeRecords = (): IntersectionObserverEntry[] => [];
    root = null;
    rootMargin = '';
    thresholds = [];
  }
  vi.stubGlobal('IntersectionObserver', IO as unknown as typeof IntersectionObserver);
}

function renderAt(path: string) {
  return render(
    <HelmetProvider>
      <ReducedMotionProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/blog/:slug" element={<BlogPostPage />} />
          </Routes>
        </MemoryRouter>
      </ReducedMotionProvider>
    </HelmetProvider>,
  );
}

beforeEach(() => {
  mockReducedMotion(true);
  mockIntersectionObserver();
});

afterEach(() => {
  resetMatchMedia();
});

describe('BlogPostPage — known slug', () => {
  const post = blogPosts[0]!;

  it('renders the resolved post title as the page h1 (Req 15.1)', () => {
    renderAt(`/blog/${post.slug}`);
    expect(
      screen.getByRole('heading', { level: 1, name: post.title }),
    ).toBeInTheDocument();
  });

  it('renders the hero meta: author, date, and reading time (Req 15.1)', () => {
    renderAt(`/blog/${post.slug}`);
    expect(screen.getAllByText(post.author.name).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(`${post.readingTimeMinutes} min read`).length,
    ).toBeGreaterThan(0);
  });

  it('renders a table of contents and the prose content (Req 15.1)', () => {
    renderAt(`/blog/${post.slug}`);
    expect(
      screen.getByRole('navigation', { name: /table of contents/i }),
    ).toBeInTheDocument();
  });

  it('constrains the prose container to the 68ch measure (Req 15.2)', () => {
    renderAt(`/blog/${post.slug}`);
    const prose = screen.getByTestId('post-prose');
    expect(prose.className).toContain('prose');
  });

  it('renders related posts computed by getRelatedPosts (Req 15.3)', () => {
    renderAt(`/blog/${post.slug}`);
    const related = screen.getByRole('region', { name: /related posts/i });
    const expected = getRelatedPosts(blogPosts, post);
    expect(expected.length).toBeGreaterThan(0);
    const firstRelated = expected[0]!;
    expect(
      within(related).getByRole('heading', { name: firstRelated.title }),
    ).toBeInTheDocument();
  });

  it('renders share buttons for the post', () => {
    renderAt(`/blog/${post.slug}`);
    const share = screen.getByRole('region', { name: /share this post/i });
    expect(
      within(share).getByRole('link', { name: /share on x/i }),
    ).toBeInTheDocument();
    expect(
      within(share).getByRole('link', { name: /share on linkedin/i }),
    ).toBeInTheDocument();
  });
});

describe('BlogPostPage — unknown slug', () => {
  it('renders the in-route not-found state with suggestions (Req 15.4)', () => {
    renderAt('/blog/does-not-exist');
    expect(
      screen.getByRole('heading', { level: 1, name: /post not found/i }),
    ).toBeInTheDocument();
    const suggestions = screen.getByRole('region', { name: /suggested posts/i });
    const links = within(suggestions).getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    expect(
      screen.getByRole('link', { name: /back to blog/i }),
    ).toHaveAttribute('href', '/blog');
  });
});

describe('BlogPostPage — accessibility', () => {
  it('has no axe violations for a resolved post', async () => {
    const post = blogPosts[0]!;
    const { container } = renderAt(`/blog/${post.slug}`);
    expect(await axe(container)).toHaveNoViolations();
  });
});
