import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { siteMetadata } from './content/site';

/**
 * App root assembly tests.
 *
 * Validates Requirements 8.1 (section order), 13.4 (landmarks), and
 * 15.1–15.5 (document head) for the assembled single-page site.
 */
describe('App root assembly', () => {
  const SECTION_ORDER = [
    'hero',
    'portfolio',
    'services',
    'differentiators',
    'team',
    'contact',
  ] as const;

  it('renders nav, main, and contentinfo landmarks (Req 13.4)', async () => {
    render(<App />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    // Navigation exposes the "Primary" nav landmark eagerly.
    expect(
      screen.getByRole('navigation', { name: 'Primary' }),
    ).toBeInTheDocument();
    // Footer is lazy-loaded; await its contentinfo landmark.
    expect(await screen.findByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders the six sections in narrative DOM order (Req 8.1)', async () => {
    const { container } = render(<App />);

    // The last lazy section must resolve before order can be asserted.
    await screen.findByRole('contentinfo');

    const renderedOrder = Array.from(
      container.querySelectorAll<HTMLElement>('section[id]'),
    )
      .map((el) => el.id)
      .filter((id): id is (typeof SECTION_ORDER)[number] =>
        (SECTION_ORDER as readonly string[]).includes(id),
      );

    expect(renderedOrder).toEqual([...SECTION_ORDER]);
  });

  it('nests every section within the main landmark (Req 13.4)', async () => {
    render(<App />);
    await screen.findByRole('contentinfo');

    const main = screen.getByRole('main');
    for (const id of SECTION_ORDER) {
      expect(main.querySelector(`section#${id}`)).not.toBeNull();
    }
  });
});

describe('Document head metadata (Req 15.1–15.5)', () => {
  const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');

  it('declares a title containing "Ryze Technology" (Req 15.1)', () => {
    const match = html.match(/<title>([^<]*)<\/title>/i);
    expect(match).not.toBeNull();
    expect(match![1]).toContain('Ryze Technology');
  });

  it('has a meta description of 50–160 characters (Req 15.2, 15.3)', () => {
    const match = html.match(
      /<meta\s+name="description"\s+content="([^"]*)"/is,
    );
    expect(match).not.toBeNull();
    const description = match![1].trim();
    expect(description.length).toBeGreaterThanOrEqual(50);
    expect(description.length).toBeLessThanOrEqual(160);

    // siteMetadata.description likewise satisfies the bounds (Req 15.2, 15.3).
    expect(siteMetadata.description.length).toBeGreaterThanOrEqual(50);
    expect(siteMetadata.description.length).toBeLessThanOrEqual(160);
  });

  it('declares Open Graph title, description, and image (Req 15.4)', () => {
    expect(html).toMatch(/<meta\s+property="og:title"\s+content="[^"]+"/i);
    expect(html).toMatch(
      /<meta\s+property="og:description"\s+content="[^"]+"/i,
    );
    expect(html).toMatch(/<meta\s+property="og:image"\s+content="[^"]+"/i);
  });

  it('declares a canonical link (Req 15.5)', () => {
    expect(html).toMatch(/<link\s+rel="canonical"\s+href="[^"]+"/i);
  });
});
