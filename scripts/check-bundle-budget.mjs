#!/usr/bin/env node
// @ts-check
/**
 * Bundle-budget guardrail.
 *
 * Validates the production build against the performance budget defined in the
 * Ryze Technology website spec:
 *   - Requirement 39.1: the initial route JavaScript bundle SHALL stay at or
 *     below 180 KB gzip, and the entry chunk SHALL NOT include `three` or
 *     `@react-three/fiber`.
 *   - Requirement 5.4: heavy dependencies are split below the route boundary
 *     (i.e. the WebGL stack must never land in the entry chunk).
 *
 * Usage:
 *   node scripts/check-bundle-budget.mjs
 *
 * Run this AFTER `vite build` has emitted `dist/`. The convenience script
 * `npm run verify` chains the build and this check together.
 *
 * Exit codes:
 *   0  budget satisfied
 *   1  budget violated, or run before a build produced `dist/`
 */

import { gzipSync } from 'node:zlib';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const distDir = join(projectRoot, 'dist');
const indexHtmlPath = join(distDir, 'index.html');

/** Initial route JS budget, in bytes (gzipped). */
const BUDGET_GZIP_BYTES = 180 * 1024;

/**
 * Tokens that, if present in the entry chunk's source text, indicate that the
 * heavy WebGL stack (three / @react-three/fiber) was bundled into the entry
 * chunk instead of being split below the route boundary.
 *
 * Heuristic rationale: after minification, three.js retains its `THREE.`
 * namespace references and react-three-fiber retains `react-three` strings in
 * module identifiers / dev warnings. A correctly split build keeps these out of
 * the entry chunk entirely, so finding any of them in the entry chunk is a
 * reliable signal that the split regressed. This is a text-scan heuristic, not
 * a full module-graph analysis; it is intentionally conservative and cheap.
 */
const FORBIDDEN_ENTRY_TOKENS = ['THREE.', 'react-three', '@react-three/fiber'];

/** @param {number} bytes */
function formatKB(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function fail(message) {
  console.error(`\n\u2717 Bundle budget check FAILED\n  ${message}\n`);
  process.exit(1);
}

function main() {
  console.log('Bundle budget check (Requirements 39.1, 5.4)');
  console.log('--------------------------------------------');

  // Tolerate a missing build: explain clearly and exit non-zero so CI catches
  // the "ran before build" mistake.
  if (!existsSync(distDir) || !existsSync(indexHtmlPath)) {
    fail(
      `No production build found at "${distDir}".\n  ` +
        'Run `npm run build` first, or use `npm run verify` to build then check.',
    );
  }

  const html = readFileSync(indexHtmlPath, 'utf8');

  // Identify the entry chunk: the JS referenced by a <script type="module"> in
  // the built index.html. Vite emits exactly one such entry module script.
  const moduleScriptRegex =
    /<script[^>]*type=["']module["'][^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  /** @type {string[]} */
  const moduleSrcs = [];
  let match;
  while ((match = moduleScriptRegex.exec(html)) !== null) {
    moduleSrcs.push(match[1]);
  }

  // Only consider local JS assets (ignore any absolute/CDN URLs).
  const entrySrcs = moduleSrcs.filter(
    (src) => !/^https?:\/\//i.test(src) && /\.(?:js|mjs)$/i.test(src),
  );

  if (entrySrcs.length === 0) {
    fail(
      'Could not find an entry module <script type="module" src="..."> in dist/index.html.\n  ' +
        'The build output may be malformed.',
    );
  }

  let totalGzip = 0;
  let anyViolation = false;
  const reports = [];

  for (const src of entrySrcs) {
    // src is typically "/assets/index-XXXX.js"; resolve relative to dist.
    const relative = src.replace(/^\//, '');
    const filePath = join(distDir, relative);

    if (!existsSync(filePath)) {
      fail(`Entry chunk referenced in index.html not found on disk: ${filePath}`);
    }

    const contents = readFileSync(filePath);
    const gzipBytes = gzipSync(contents).length;
    totalGzip += gzipBytes;

    const text = contents.toString('utf8');
    const foundTokens = FORBIDDEN_ENTRY_TOKENS.filter((token) =>
      text.includes(token),
    );

    reports.push({
      src,
      rawBytes: contents.length,
      gzipBytes,
      foundTokens,
    });

    if (foundTokens.length > 0) {
      anyViolation = true;
    }
  }

  console.log(`Entry chunk(s): ${entrySrcs.length}`);
  for (const r of reports) {
    console.log(
      `  ${r.src}\n    raw: ${formatKB(r.rawBytes)}  gzip: ${formatKB(
        r.gzipBytes,
      )}${r.foundTokens.length ? `  \u2717 forbidden: ${r.foundTokens.join(', ')}` : ''}`,
    );
  }
  console.log(
    `\nInitial route JS (gzip): ${formatKB(totalGzip)} / ${formatKB(
      BUDGET_GZIP_BYTES,
    )} budget`,
  );

  const messages = [];

  if (totalGzip > BUDGET_GZIP_BYTES) {
    messages.push(
      `Initial route JS is ${formatKB(totalGzip)} gzip, exceeding the ${formatKB(
        BUDGET_GZIP_BYTES,
      )} budget (Requirement 39.1).`,
    );
  }

  if (anyViolation) {
    const offenders = reports
      .filter((r) => r.foundTokens.length > 0)
      .map((r) => `${r.src} (${r.foundTokens.join(', ')})`)
      .join('; ');
    messages.push(
      `Heavy WebGL dependency markers found in the entry chunk: ${offenders}. ` +
        'three / @react-three/fiber must be split below the route boundary ' +
        '(Requirements 39.1, 5.4).',
    );
  }

  if (messages.length > 0) {
    fail(messages.join('\n  '));
  }

  console.log('\n\u2713 Bundle budget check PASSED');
  console.log(
    `  Initial route JS ${formatKB(totalGzip)} gzip is within the ${formatKB(
      BUDGET_GZIP_BYTES,
    )} budget and the entry chunk is free of three / @react-three/fiber.\n`,
  );
  process.exit(0);
}

main();
