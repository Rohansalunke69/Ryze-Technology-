// @ts-check
/**
 * Unit tests for the pure sitemap helpers (task 16.1).
 *
 * These exercise the build-time URL assembly without running an actual build:
 *   - every indexable static route and every data slug appears, and
 *   - noIndex routes (the 404) are EXCLUDED while privacy/terms/cookies
 *     (indexable) are INCLUDED.
 *
 * Requirements: 40.3, 40.4, 40.5.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  STATIC_ROUTES,
  DYNAMIC_ROUTE_GROUPS,
  buildSitemapUrls,
  extractSlugs,
  extractBaseUrl,
  renderSitemapXml,
} from './generate-sitemap.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '..', 'src', 'data');

/** Read the real slug groups straight from the data sources. */
function readRealSlugs() {
  /** @type {Record<string, string[]>} */
  const slugs = {};
  for (const group of DYNAMIC_ROUTE_GROUPS) {
    slugs[group.key] = extractSlugs(readFileSync(join(dataDir, group.file), 'utf8'));
  }
  return slugs;
}

const BASE_URL = 'https://ryze-technology.pages.dev';

describe('extractSlugs', () => {
  it('pulls single- and double-quoted slug literals in order, de-duped', () => {
    const source = `[
      { slug: 'alpha', x: 1 },
      { slug: "beta" },
      { slug: 'alpha' }
    ]`;
    expect(extractSlugs(source)).toEqual(['alpha', 'beta']);
  });

  it('returns an empty array when no slugs are present', () => {
    expect(extractSlugs('export const x = 1;')).toEqual([]);
  });
});

describe('extractBaseUrl', () => {
  it('reads the canonical baseUrl from siteMetadata source', () => {
    const source = readFileSync(join(dataDir, 'siteMetadata.ts'), 'utf8');
    expect(extractBaseUrl(source)).toBe(BASE_URL);
  });
});

describe('buildSitemapUrls', () => {
  const slugs = readRealSlugs();
  const urls = buildSitemapUrls(STATIC_ROUTES, slugs, BASE_URL);

  it('includes every indexable static route', () => {
    for (const route of STATIC_ROUTES) {
      if (route.noIndex) continue;
      const expected = route.path === '/' ? `${BASE_URL}/` : `${BASE_URL}${route.path}`;
      expect(urls).toContain(expected);
    }
  });

  it('includes the indexable legal routes (privacy/terms/cookies)', () => {
    expect(urls).toContain(`${BASE_URL}/privacy`);
    expect(urls).toContain(`${BASE_URL}/terms`);
    expect(urls).toContain(`${BASE_URL}/cookies`);
  });

  it('excludes noIndex routes such as the 404 catch-all', () => {
    expect(urls).not.toContain(`${BASE_URL}/404`);
    expect(urls.some((u) => u.includes('/404'))).toBe(false);
  });

  it('includes every dynamic data slug under its route prefix', () => {
    for (const group of DYNAMIC_ROUTE_GROUPS) {
      expect(slugs[group.key].length).toBeGreaterThan(0);
      for (const slug of slugs[group.key]) {
        expect(urls).toContain(`${BASE_URL}${group.prefix}/${slug}`);
      }
    }
  });

  it('produces only absolute, de-duplicated URLs on the configured origin', () => {
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) {
      expect(url.startsWith(`${BASE_URL}/`)).toBe(true);
    }
  });

  it('tolerates a baseUrl with a trailing slash without doubling it', () => {
    const out = buildSitemapUrls([{ path: '/about' }], {}, `${BASE_URL}/`);
    expect(out).toEqual([`${BASE_URL}/about`]);
  });
});

describe('renderSitemapXml', () => {
  it('wraps URLs in a valid urlset using the correct sitemap schema', () => {
    const xml = renderSitemapXml([`${BASE_URL}/`, `${BASE_URL}/about`]);
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
    expect(xml).toContain(`<loc>${BASE_URL}/</loc>`);
    expect(xml).toContain(`<loc>${BASE_URL}/about</loc>`);
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });

  it('escapes XML-special characters in URLs', () => {
    const xml = renderSitemapXml([`${BASE_URL}/a?b=1&c=2`]);
    expect(xml).toContain('&amp;');
    expect(xml).not.toContain('&c=2');
  });
});
