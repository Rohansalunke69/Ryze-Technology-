/**
 * Tests for the WCAG contrast helpers and the design's documented token pairings.
 *
 * Two layers:
 *  1. Pure-math unit tests for {@link contrastRatio} / {@link relativeLuminance}
 *     against known anchors (black/white = 21:1, identical = 1:1, symmetry).
 *  2. Token contrast assertions: the design's colour pairings must meet WCAG AA
 *     (Requirement 36.2). The hex values are read from the single source of
 *     truth — the `:root` custom properties in `src/index.css` — so the test
 *     fails if a token drifts. We also guard that `tailwind.config.ts` mirrors
 *     those same tokens via `var(--token)` references.
 *
 * Framework: Vitest.
 * Requirements: 36.2
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, it, expect } from 'vitest';

import { contrastRatio, relativeLuminance, hexToRgb } from './contrast';

/** Read a source file from the repo root (vitest runs with cwd = repo root). */
function readRepoFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

/**
 * Extract the hex value of a `--token: #rrggbb;` declaration from the `:root`
 * block of a CSS file. Throws if the token is missing so a renamed/removed
 * token fails loudly rather than silently skipping the contrast check.
 */
function readCssTokenHex(css: string, token: string): string {
  const pattern = new RegExp(`--${token}:\\s*(#[0-9a-fA-F]{3,6})`);
  const match = pattern.exec(css);
  if (match === null || match[1] === undefined) {
    throw new Error(`Token --${token} not found in source CSS`);
  }
  return match[1];
}

// WCAG AA thresholds — the true accessibility bar (not the design's generous
// headroom). Normal-size text requires >= 4.5:1; large text / UI components
// require >= 3.0:1.
const AA_NORMAL_TEXT = 4.5;
const AA_LARGE_TEXT = 3.0;

describe('contrast math (unit)', () => {
  it('rates pure black against pure white at 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('rates a colour against itself at 1:1', () => {
    expect(contrastRatio('#22d3ee', '#22d3ee')).toBeCloseTo(1, 10);
    expect(contrastRatio('#070a12', '#070a12')).toBeCloseTo(1, 10);
  });

  it('is symmetric in its arguments', () => {
    const a = '#070a12';
    const b = '#e8eef7';
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 12);
  });

  it('computes relative luminance at the anchors (black = 0, white = 1)', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 10);
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 10);
  });

  it('parses #rrggbb, bare, and 3-digit shorthand hex equivalently', () => {
    expect(hexToRgb('#00aaff')).toEqual({ r: 0, g: 170, b: 255 });
    expect(hexToRgb('00aaff')).toEqual({ r: 0, g: 170, b: 255 });
    expect(hexToRgb('#0af')).toEqual({ r: 0, g: 170, b: 255 });
  });

  it('rejects malformed hex strings', () => {
    expect(() => hexToRgb('#xyz')).toThrow();
    expect(() => hexToRgb('#12')).toThrow();
    expect(() => hexToRgb('nope')).toThrow();
  });
});

describe('design token contrast pairings (Requirement 36.2)', () => {
  const css = readRepoFile('src/index.css');
  const tailwind = readRepoFile('tailwind.config.ts');

  const ink900 = readCssTokenHex(css, 'ink-900');
  const mist100 = readCssTokenHex(css, 'mist-100');
  const mist300 = readCssTokenHex(css, 'mist-300');
  const pulse500 = readCssTokenHex(css, 'pulse-500');

  it('reads the documented token hexes from the source of truth', () => {
    // Drift guard: these are the values authored in src/index.css. If a token
    // changes, this assertion flags it so the contrast bar is re-verified.
    expect(ink900).toBe('#F9FAFB');
    expect(mist100).toBe('#111827');
    expect(mist300).toBe('#6B7280');
    expect(pulse500).toBe('#1E40AF');
  });

  it('mirrors the same tokens in tailwind.config.ts via var() references', () => {
    expect(tailwind).toContain('var(--ink-900)');
    expect(tailwind).toContain('var(--mist-100)');
    expect(tailwind).toContain('var(--mist-300)');
    expect(tailwind).toContain('var(--pulse-500)');
  });

  it('primary text --mist-100 on --ink-900 meets AA for normal text (design ~15:1)', () => {
    const ratio = contrastRatio(mist100, ink900);
    expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    // Design claims ~15:1 — assert it stays in that generous band.
    expect(ratio).toBeGreaterThanOrEqual(7);
  });

  it('body text --mist-300 on --ink-900 meets AA for normal text (design ~7:1)', () => {
    const ratio = contrastRatio(mist300, ink900);
    expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  it('accent --pulse-500 on --ink-900 meets AA for normal text (design ~9:1)', () => {
    const ratio = contrastRatio(pulse500, ink900);
    // Cyan accent is used for text/icons, so hold it to the normal-text bar.
    expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    // And at minimum it must clear the large-text / UI-component bar.
    expect(ratio).toBeGreaterThanOrEqual(AA_LARGE_TEXT);
  });
});
