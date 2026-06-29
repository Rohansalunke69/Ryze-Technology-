#!/usr/bin/env node
// @ts-check
/**
 * Post-build sitemap generator (task 16.1).
 *
 * Emits `dist/sitemap.xml` from the canonical static route table plus the
 * dynamic `:slug` routes backed by the typed data modules. Run AFTER
 * `vite build` has produced `dist/` (it is chained into the `build` script).
 *
 * Requirements:
 *   - 40.3 — a sitemap covering every public route, including dynamic detail
 *     pages for case studies, services, and blog posts.
 *   - 40.4 — sitemap.xml + robots.txt are emitted for crawlers.
 *
 * ── Why regex extraction of slugs? ──────────────────────────────────────────
 * The slug data lives in `src/data/*.ts` (TypeScript). A plain Node `.mjs`
 * script cannot `import` TS modules without a compile/loader step, and pulling
 * in a TS toolchain (tsx/esbuild) just to read a handful of string literals is
 * disproportionate for a static-content site. Instead we read the source files
 * and extract the `slug: '...'` string literals with a regex. The data files
 * are hand-authored, append-only content tables, so this is robust and keeps
 * the build free of extra runtime/dev dependencies. The same approach reads the
 * canonical `baseUrl` from `src/data/siteMetadata.ts`.
 *
 * The exported `buildSitemapUrls` / `extractSlugs` / `extractBaseUrl` helpers
 * are pure so they can be unit-tested without running a build
 * (see scripts/generate-sitemap.test.mjs).
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const distDir = join(projectRoot, 'dist');
const dataDir = join(projectRoot, 'src', 'data');

/**
 * Canonical static route table. `noIndex` routes are EXCLUDED from the sitemap
 * (matching the SPA's per-route `noIndex` SEO directives). Only the catch-all
 * 404 is non-indexable; privacy/terms/cookies ARE indexable.
 *
 * @type {{ path: string, noIndex?: boolean }[]}
 */
export const STATIC_ROUTES = [
  { path: '/' },
  { path: '/portfolio' },
  { path: '/services' },
  { path: '/about' },
  { path: '/contact' },
  { path: '/blog' },
  { path: '/resources' },
  { path: '/privacy' },
  { path: '/terms' },
  { path: '/cookies' },
  // Catch-all 404 — never indexed, never in the sitemap.
  { path: '/404', noIndex: true },
];

/**
 * Maps a data-slug group to the dynamic route prefix it expands into.
 * @type {{ key: string, prefix: string, file: string }[]}
 */
export const DYNAMIC_ROUTE_GROUPS = [
  { key: 'caseStudies', prefix: '/portfolio', file: 'caseStudies.ts' },
  { key: 'services', prefix: '/services', file: 'services.ts' },
  { key: 'blogPosts', prefix: '/blog', file: 'blogPosts.ts' },
];

/**
 * Extract `slug: '...'` string literals from a TS source file's text.
 * Handles single and double quotes. Returns slugs in source order, de-duped.
 *
 * @param {string} source - raw TS file contents
 * @returns {string[]}
 */
export function extractSlugs(source) {
  const slugRegex = /\bslug\s*:\s*['"]([^'"]+)['"]/g;
  /** @type {string[]} */
  const slugs = [];
  let match;
  while ((match = slugRegex.exec(source)) !== null) {
    if (!slugs.includes(match[1])) {
      slugs.push(match[1]);
    }
  }
  return slugs;
}

/**
 * Extract the canonical `baseUrl: '...'` from siteMetadata source text.
 *
 * @param {string} source - raw siteMetadata.ts contents
 * @returns {string | null}
 */
export function extractBaseUrl(source) {
  const match = /\bbaseUrl\s*:\s*['"]([^'"]+)['"]/.exec(source);
  return match ? match[1] : null;
}

/**
 * Build the ordered, de-duplicated list of absolute sitemap URLs.
 *
 * @param {{ path: string, noIndex?: boolean }[]} routes - static route table
 * @param {Record<string, string[]>} slugs - dynamic slugs keyed by group key
 *   (see DYNAMIC_ROUTE_GROUPS) → array of slug strings
 * @param {string} baseUrl - site origin, e.g. https://ryze-technology.pages.dev
 * @returns {string[]} absolute URLs, noIndex routes excluded
 */
export function buildSitemapUrls(routes, slugs, baseUrl) {
  const origin = baseUrl.replace(/\/+$/, '');
  /** @param {string} path */
  const toAbsolute = (path) => (path === '/' ? `${origin}/` : `${origin}${path}`);

  /** @type {string[]} */
  const urls = [];

  // Static routes (indexable only).
  for (const route of routes) {
    if (route.noIndex) continue;
    urls.push(toAbsolute(route.path));
  }

  // Dynamic :slug routes.
  for (const group of DYNAMIC_ROUTE_GROUPS) {
    const groupSlugs = slugs[group.key] ?? [];
    for (const slug of groupSlugs) {
      urls.push(toAbsolute(`${group.prefix}/${slug}`));
    }
  }

  // De-dupe defensively while preserving order.
  return [...new Set(urls)];
}

/**
 * Render a `<urlset>` XML document from a list of absolute URLs.
 *
 * @param {string[]} urls
 * @returns {string}
 */
export function renderSitemapXml(urls) {
  const body = urls
    .map((url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n  </url>`)
    .join('\n');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${body}\n` +
    '</urlset>\n'
  );
}

/** @param {string} value */
function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Read slugs for every dynamic group from the data source files.
 * @returns {Record<string, string[]>}
 */
function readAllSlugs() {
  /** @type {Record<string, string[]>} */
  const slugs = {};
  for (const group of DYNAMIC_ROUTE_GROUPS) {
    const filePath = join(dataDir, group.file);
    const source = readFileSync(filePath, 'utf8');
    slugs[group.key] = extractSlugs(source);
  }
  return slugs;
}

function main() {
  console.log('Sitemap generator (Requirements 40.3, 40.4)');
  console.log('-------------------------------------------');

  if (!existsSync(distDir)) {
    console.error(
      `\u2717 No build output at "${distDir}". Run \`npm run build\` first.`,
    );
    process.exit(1);
  }

  const metaSource = readFileSync(join(dataDir, 'siteMetadata.ts'), 'utf8');
  const baseUrl = extractBaseUrl(metaSource);
  if (!baseUrl) {
    console.error('\u2717 Could not read baseUrl from src/data/siteMetadata.ts');
    process.exit(1);
  }

  const slugs = readAllSlugs();
  const urls = buildSitemapUrls(STATIC_ROUTES, slugs, baseUrl);
  const xml = renderSitemapXml(urls);

  const outPath = join(distDir, 'sitemap.xml');
  writeFileSync(outPath, xml, 'utf8');

  const dynamicCount = DYNAMIC_ROUTE_GROUPS.reduce(
    (n, g) => n + (slugs[g.key]?.length ?? 0),
    0,
  );
  console.log(`Base URL: ${baseUrl}`);
  console.log(
    `Static routes: ${STATIC_ROUTES.filter((r) => !r.noIndex).length} ` +
      `(excluded noIndex: ${STATIC_ROUTES.filter((r) => r.noIndex).length})`,
  );
  console.log(`Dynamic :slug routes: ${dynamicCount}`);
  console.log(`\u2713 Wrote ${urls.length} URLs to ${outPath}`);
}

// Only run the build step when invoked directly, not when imported by tests.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
