/**
 * brandArt — deterministic, on-brand generative artwork (no external assets).
 *
 * The content data references project/team/blog imagery that is not shipped, so
 * rather than leave empty media boxes we synthesize an original, license-clean
 * SVG composition for each item. Output is a `data:image/svg+xml` URI that can
 * be dropped straight into a `background-image` or an `<img src>`.
 *
 * The composition is deterministic in its `seed` (typically an entity slug), so
 * a given project always renders the same artwork across cards and detail pages
 * — it reads as real, consistent art direction, not noise. The palette is the
 * Ryze brand: paper base, cobalt→azure blue gradient, near-black ink accents.
 *
 * Everything here is pure (seed → string), so it is trivially unit-testable and
 * has no runtime/DOM dependencies.
 */

/** Ryze brand palette (kept in sync with the design tokens in index.css). */
const PAPER = '#f3f1ea';
const INK = '#0a0a08';
const BLUE_DEEP = '#2156c9';
const BLUE_MID = '#3a6fe0';
const BLUE_LIGHT = '#5b93f0';

/** Deterministic 32-bit string hash (FNV-1a style). */
function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Small deterministic PRNG (mulberry32) seeded from the hash. */
function rng(seedNum: number): () => number {
  let a = seedNum;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface BrandArtOptions {
  /** Output width in px (viewBox units). Default 1200. */
  width?: number;
  /** Output height in px (viewBox units). Default 800. */
  height?: number;
}

/**
 * Build the raw SVG markup for the brand artwork at `seed`. Exported for tests;
 * most callers want {@link brandArtDataUri}.
 */
export function brandArtSvg(seed: string, options: BrandArtOptions = {}): string {
  const w = options.width ?? 1200;
  const h = options.height ?? 800;
  const r = rng(hash(seed));

  // Seeded composition parameters.
  const angle = Math.floor(r() * 360);
  const variant = Math.floor(r() * 3); // 0 chevron · 1 arcs · 2 stack
  const bx = 20 + r() * 60; // blob center x %
  const by = 20 + r() * 60; // blob center y %
  const stops = [BLUE_DEEP, BLUE_MID, BLUE_LIGHT];
  const a = stops[Math.floor(r() * stops.length)] ?? BLUE_DEEP;
  const b = stops[Math.floor(r() * stops.length)] ?? BLUE_MID;

  // Foreground motif chosen by variant — all stroked in paper at low opacity so
  // they read as engineered linework over the gradient field.
  let motif = '';
  if (variant === 0) {
    // Oversized "R" chevron mark, bleeding off the right edge.
    const ox = w * 0.46;
    const oy = h * 0.12;
    const s = h * 0.76;
    motif =
      `<g transform="translate(${ox} ${oy})" fill="none" stroke="${PAPER}" ` +
      `stroke-width="${Math.round(s * 0.12)}" stroke-linejoin="round" opacity="0.22">` +
      `<path d="M0 0 V${s} M0 0 H${s * 0.55} a${s * 0.28} ${s * 0.28} 0 0 1 0 ${s * 0.56} H0" />` +
      `<path d="M${s * 0.2} ${s * 0.56} L${s * 0.85} ${s}" />` +
      `</g>`;
  } else if (variant === 1) {
    // Concentric arcs radiating from a corner.
    const cx = r() > 0.5 ? w : 0;
    const cy = r() > 0.5 ? 0 : h;
    let arcs = '';
    for (let i = 1; i <= 7; i += 1) {
      arcs += `<circle cx="${cx}" cy="${cy}" r="${i * (w * 0.11)}" />`;
    }
    motif =
      `<g fill="none" stroke="${PAPER}" stroke-width="2.5" opacity="0.18">${arcs}</g>`;
  } else {
    // Stacked offset bars — an "engineered" rhythm.
    let bars = '';
    for (let i = 0; i < 6; i += 1) {
      const y = (h / 6) * i + 8;
      const bw = w * (0.3 + r() * 0.5);
      const x = r() * (w - bw);
      bars += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${bw.toFixed(0)}" height="${(h / 6 - 18).toFixed(0)}" rx="6" />`;
    }
    motif = `<g fill="${PAPER}" opacity="0.10">${bars}</g>`;
  }

  // Fine blueprint grid + a single accent node for the "engineered" detail.
  const nodeX = (bx * w) / 100;
  const nodeY = (by * h) / 100;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs>` +
    `<linearGradient id="g" gradientTransform="rotate(${angle} 0.5 0.5)">` +
    `<stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>` +
    `</linearGradient>` +
    `<radialGradient id="b" cx="${bx}%" cy="${by}%" r="60%">` +
    `<stop offset="0" stop-color="${BLUE_LIGHT}" stop-opacity="0.55"/>` +
    `<stop offset="1" stop-color="${a}" stop-opacity="0"/>` +
    `</radialGradient>` +
    `<pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">` +
    `<path d="M48 0 H0 V48" fill="none" stroke="${PAPER}" stroke-width="1" opacity="0.10"/>` +
    `</pattern>` +
    `</defs>` +
    `<rect width="${w}" height="${h}" fill="${a}"/>` +
    `<rect width="${w}" height="${h}" fill="url(#g)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#b)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#grid)"/>` +
    motif +
    `<circle cx="${nodeX.toFixed(0)}" cy="${nodeY.toFixed(0)}" r="7" fill="${PAPER}"/>` +
    `<circle cx="${nodeX.toFixed(0)}" cy="${nodeY.toFixed(0)}" r="16" fill="none" stroke="${PAPER}" stroke-width="2" opacity="0.6"/>` +
    `<rect width="${w}" height="${h}" fill="${INK}" opacity="0.04"/>` +
    `</svg>`
  );
}

/** Brand artwork for `seed` as a ready-to-use `data:image/svg+xml` URI. */
export function brandArtDataUri(seed: string, options: BrandArtOptions = {}): string {
  return `data:image/svg+xml,${encodeURIComponent(brandArtSvg(seed, options))}`;
}
