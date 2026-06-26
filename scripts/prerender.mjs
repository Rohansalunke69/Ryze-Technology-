#!/usr/bin/env node
// @ts-check
/**
 * Post-build prerender step (task 16.1).
 *
 * Produces a per-route static HTML snapshot under `dist/<route>/index.html` for
 * every public static route and every dynamic `:slug` route, so crawlers (and
 * static hosts that map clean URLs to folder `index.html`) always resolve a
 * valid document that boots the SPA and renders the correct content
 * client-side.
 *
 * Requirements: 40.x (crawlable routes), 41.1 (static, hostable build output).
 *
 * ── Chosen strategy & its limitations ───────────────────────────────────────
 * Full server-side rendering (react-dom/server + StaticRouter + HelmetProvider)
 * is NOT viable from a plain Node `.mjs` post-build script here:
 *   - every page is a `React.lazy` chunk whose source is TS/JSX (no compiled,
 *     importable server bundle is emitted by the SPA `vite build`), and
 *   - many components touch browser-only APIs at module/render time (matchMedia,
 *     IntersectionObserver, WebGL/Three, Lenis), which would throw under SSR.
 * Standing up a second SSR bundle + heavy global shims is disproportionate for
 * a static-content marketing site whose SEO is already handled per route by
 * `SEOHead` (react-helmet-async) once the SPA hydrates.
 *
 * Therefore this step DEGRADES — as the task explicitly permits — to writing
 * per-route copies of the built SPA shell (`dist/index.html`). Each copy is the
 * fully hashed, asset-linked entry document, so the route loads and the client
 * router + SEOHead render the right page and `<title>`/meta on the client.
 *
 * The step is RESILIENT by construction: if writing any single route fails it
 * logs a concise warning and continues; it never fails the build. It is also
 * idempotent — re-running overwrites the same per-route files deterministically.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  STATIC_ROUTES,
  DYNAMIC_ROUTE_GROUPS,
  extractSlugs,
} from './generate-sitemap.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const distDir = join(projectRoot, 'dist');
const dataDir = join(projectRoot, 'src', 'data');
const shellPath = join(distDir, 'index.html');

/**
 * Resolve every route path that should get a static snapshot. The root `/`
 * already maps to `dist/index.html`, so it is skipped here. noIndex routes
 * (the 404) are excluded.
 *
 * @returns {string[]} route paths like "/portfolio/orange-city-grocers"
 */
function collectRoutePaths() {
  /** @type {string[]} */
  const paths = [];

  for (const route of STATIC_ROUTES) {
    if (route.noIndex) continue;
    if (route.path === '/') continue; // already dist/index.html
    paths.push(route.path);
  }

  for (const group of DYNAMIC_ROUTE_GROUPS) {
    const source = readFileSync(join(dataDir, group.file), 'utf8');
    for (const slug of extractSlugs(source)) {
      paths.push(`${group.prefix}/${slug}`);
    }
  }

  return paths;
}

/**
 * Write a snapshot for a single route. Returns whether the SPA-shell fallback
 * was used (always true under the current strategy) so the caller can report.
 *
 * @param {string} routePath
 * @param {string} shellHtml
 * @returns {{ ok: boolean, fellBack: boolean, error?: string }}
 */
function writeRouteSnapshot(routePath, shellHtml) {
  try {
    // SSR attempt would go here; it is intentionally skipped (see header).
    // Fall back to the SPA shell so the route always resolves and hydrates.
    const targetDir = join(distDir, routePath.replace(/^\//, ''));
    mkdirSync(targetDir, { recursive: true });
    writeFileSync(join(targetDir, 'index.html'), shellHtml, 'utf8');
    return { ok: true, fellBack: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, fellBack: true, error: message };
  }
}

function main() {
  console.log('Prerender step (Requirements 40.x, 41.1)');
  console.log('----------------------------------------');

  if (!existsSync(shellPath)) {
    console.error(
      `\u2717 No build output at "${shellPath}". Run \`npm run build\` first.`,
    );
    process.exit(1);
  }

  const shellHtml = readFileSync(shellPath, 'utf8');
  const routePaths = collectRoutePaths();

  let written = 0;
  let failed = 0;
  /** @type {string[]} */
  const fellBack = [];

  for (const routePath of routePaths) {
    const result = writeRouteSnapshot(routePath, shellHtml);
    if (result.ok) {
      written += 1;
      if (result.fellBack) fellBack.push(routePath);
    } else {
      failed += 1;
      console.warn(`  \u26a0 ${routePath}: ${result.error} — skipped`);
    }
  }

  console.log(`Routes processed: ${routePaths.length}`);
  console.log(`Snapshots written: ${written}`);
  if (fellBack.length > 0) {
    console.log(
      `SPA-shell fallback used for all ${fellBack.length} routes ` +
        '(SSR intentionally not attempted — see script header).',
    );
  }
  if (failed > 0) {
    console.log(`\u26a0 ${failed} route(s) could not be written (see warnings).`);
  }
  console.log('\u2713 Prerender complete (build was not failed).');
}

main();
