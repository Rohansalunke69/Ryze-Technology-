/**
 * Static-build verification (smoke test).
 *
 * Asserts that the production build emits ONLY static artifacts that can be
 * deployed without a server-side runtime: an entry `index.html` plus
 * content-hashed JS/CSS/asset files. This is the example/smoke counterpart to
 * the Lighthouse CI performance gate (see lighthouserc.json).
 *
 * The test is deliberately tolerant of a missing `dist/` directory: in a fresh
 * CI checkout the build may not have run yet, so rather than failing the whole
 * suite we skip with a clear message. Run `npm run build` first to exercise it.
 *
 * Covers Requirements: 14.3 (static, server-runtime-free build),
 * supporting 14.1 (React) and 14.2 (Tailwind) stack confirmation.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

// Vitest runs from the project root, so resolve dist relative to cwd. (The
// jsdom test environment does not expose a file-scheme import.meta.url.)
const distDir = join(process.cwd(), 'dist');
const assetsDir = join(distDir, 'assets');
const indexPath = join(distDir, 'index.html');

/** Vite emits assets as `name-<hash>.ext`; this matches the hashed suffix. */
const HASHED_ASSET = /-[A-Za-z0-9_-]{8,}\.(js|css)$/;

/** Server-runtime entrypoints that must NEVER appear in a static build. */
const SERVER_RUNTIME_FILES = [
  'server.js',
  'server.mjs',
  'app.js',
  'index.cjs',
  'main.js',
  'package.json',
  'node_modules',
];

const distMissing = !existsSync(distDir);

describe('static-build artifacts', () => {
  it.skipIf(distMissing)(
    'emits dist/index.html as the static entry document (Req 14.3)',
    () => {
      expect(existsSync(indexPath)).toBe(true);

      const html = readFileSync(indexPath, 'utf8');
      // The entry HTML references a hashed module script: proof of a static,
      // pre-bundled SPA rather than server-rendered markup.
      expect(html).toMatch(/<script[^>]+type="module"[^>]+src="[^"]*assets\//);
    },
  );

  it.skipIf(distMissing)(
    'emits content-hashed JS assets (static bundle, no server runtime) (Req 14.3)',
    () => {
      expect(existsSync(assetsDir)).toBe(true);

      const files = readdirSync(assetsDir);
      const hashedJs = files.filter((f) => f.endsWith('.js') && HASHED_ASSET.test(f));

      // A static Vite build always ships at least one hashed JS chunk.
      expect(hashedJs.length).toBeGreaterThan(0);
    },
  );

  it.skipIf(distMissing)(
    'does not emit any server-runtime entrypoints into dist/ (Req 14.3)',
    () => {
      const topLevel = readdirSync(distDir);
      const offenders = topLevel.filter((name) =>
        SERVER_RUNTIME_FILES.includes(name),
      );
      expect(offenders).toEqual([]);
    },
  );

  if (distMissing) {
    it('skips static-artifact checks because dist/ is absent (run `npm run build`)', () => {
      // Informational placeholder so the skip reason is visible in test output.
      expect(distMissing).toBe(true);
    });
  }
});
