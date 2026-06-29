#!/usr/bin/env node
// @ts-check
/**
 * Cover-art generator — branded editorial SVG covers for blog posts and case
 * studies (no external/stock imagery, license-clean, deterministic).
 *
 * Why: the content data references cover/hero/gallery imagery that was never
 * shipped, so `/blog`, `/portfolio`, and the detail pages rendered empty/broken
 * media boxes. Rather than buy stock, we synthesize original, on-brand SVG
 * covers in the Ryze art direction (paper base, cobalt→azure gradient, blueprint
 * grid, engineered linework) and typeset the real title onto each one so every
 * card reads as a designed editorial cover.
 *
 * Output:
 *   public/images/blog/<slug>.svg
 *   public/images/case-studies/<file>.svg   (hero + gallery-N)
 *
 * The composition is deterministic in its seed (the slug/filename), so a given
 * post always renders the same artwork across cards and detail pages.
 *
 * Run:  node scripts/generate-cover-art.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const publicDir = join(projectRoot, 'public');

/* ── Brand palette (kept in sync with src/lib/brandArt.ts & index.css) ─────── */
const PAPER = '#f3f1ea';
const INK = '#0a0a08';
const BLUE_DEEP = '#2156c9';
const BLUE_MID = '#3a6fe0';
const BLUE_LIGHT = '#5b93f0';

const DISPLAY_FONT =
  "'Space Grotesk','Segoe UI',system-ui,-apple-system,sans-serif";
const MONO_FONT = "'JetBrains Mono','SFMono-Regular',Menlo,monospace";

/* ── Deterministic hash + PRNG (mulberry32), mirrors brandArt.ts ───────────── */
/** @param {string} seed */
function hash(seed) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
/** @param {number} seedNum */
function rng(seedNum) {
  let a = seedNum;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Escape text for safe embedding in SVG markup. */
function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Greedy word-wrap a string into at most `maxLines` lines of roughly
 * `maxChars` characters. Returns the lines (last line gets an ellipsis if the
 * text overflows).
 * @param {string} text @param {number} maxChars @param {number} maxLines
 */
function wrap(text, maxChars, maxLines) {
  const words = text.split(/\s+/);
  /** @type {string[]} */
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line.length === 0 ? word : `${line} ${word}`;
    if (candidate.length > maxChars && line.length > 0) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = candidate;
    }
  }
  if (lines.length < maxLines) {
    lines.push(line);
  } else {
    // Ran out of lines — append remaining words to the final line + ellipsis.
    const used = lines.join(' ').split(/\s+/).length;
    const rest = words.slice(used).join(' ');
    let last = lines[maxLines - 1] ?? '';
    if (rest.length > 0) last = `${last} ${rest}`;
    if (last.length > maxChars) last = `${last.slice(0, maxChars - 1).trimEnd()}…`;
    lines[maxLines - 1] = last;
  }
  return lines.filter((l) => l.length > 0);
}

/**
 * Foreground motif keyed by a theme name, stroked/filled in paper at low
 * opacity so it reads as engineered linework over the gradient field.
 * @param {string} theme @param {() => number} r @param {number} w @param {number} h
 */
function motifFor(theme, r, w, h) {
  if (theme === 'arcs') {
    const cx = r() > 0.5 ? w : 0;
    const cy = r() > 0.5 ? 0 : h;
    let arcs = '';
    for (let i = 1; i <= 8; i += 1) {
      arcs += `<circle cx="${cx}" cy="${cy}" r="${(i * (w * 0.1)).toFixed(0)}"/>`;
    }
    return `<g fill="none" stroke="${PAPER}" stroke-width="2.5" opacity="0.16">${arcs}</g>`;
  }
  if (theme === 'bars') {
    let bars = '';
    for (let i = 0; i < 6; i += 1) {
      const y = (h / 6) * i + 8;
      const bw = w * (0.3 + r() * 0.5);
      const x = r() * (w - bw);
      bars += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${bw.toFixed(0)}" height="${(h / 6 - 18).toFixed(0)}" rx="6"/>`;
    }
    return `<g fill="${PAPER}" opacity="0.09">${bars}</g>`;
  }
  if (theme === 'grid') {
    let cells = '';
    const cols = 6;
    const rows = 4;
    const cw = w / cols;
    const ch = h / rows;
    for (let gy = 0; gy < rows; gy += 1) {
      for (let gx = 0; gx < cols; gx += 1) {
        if (r() > 0.62) {
          cells += `<rect x="${(gx * cw + 10).toFixed(0)}" y="${(gy * ch + 10).toFixed(0)}" width="${(cw - 20).toFixed(0)}" height="${(ch - 20).toFixed(0)}" rx="10"/>`;
        }
      }
    }
    return `<g fill="${PAPER}" opacity="0.08">${cells}</g>`;
  }
  if (theme === 'nodes') {
    // Connected-node network — "systems / automation".
    const pts = [];
    for (let i = 0; i < 7; i += 1) pts.push([r() * w, r() * h]);
    let edges = '';
    for (let i = 0; i < pts.length; i += 1) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      edges += `<line x1="${x1.toFixed(0)}" y1="${y1.toFixed(0)}" x2="${x2.toFixed(0)}" y2="${y2.toFixed(0)}"/>`;
    }
    const dots = pts
      .map(([x, y]) => `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="9"/>`)
      .join('');
    return (
      `<g stroke="${PAPER}" stroke-width="2" opacity="0.16" fill="none">${edges}</g>` +
      `<g fill="${PAPER}" opacity="0.22">${dots}</g>`
    );
  }
  // 'chevron' — oversized "R" mark bleeding off the right edge.
  const s = h * 0.78;
  const ox = w * 0.5;
  const oy = h * 0.11;
  return (
    `<g transform="translate(${ox} ${oy})" fill="none" stroke="${PAPER}" ` +
    `stroke-width="${Math.round(s * 0.12)}" stroke-linejoin="round" opacity="0.2">` +
    `<path d="M0 0 V${s} M0 0 H${(s * 0.55).toFixed(0)} a${(s * 0.28).toFixed(0)} ${(s * 0.28).toFixed(0)} 0 0 1 0 ${(s * 0.56).toFixed(0)} H0"/>` +
    `<path d="M${(s * 0.2).toFixed(0)} ${(s * 0.56).toFixed(0)} L${(s * 0.85).toFixed(0)} ${s.toFixed(0)}"/>` +
    `</g>`
  );
}

/**
 * Build a full editorial cover SVG.
 * @param {object} o
 * @param {string} o.seed   deterministic seed (slug/filename)
 * @param {string} o.eyebrow small mono label, uppercased
 * @param {string} o.title   headline typeset on the cover
 * @param {string} o.theme   motif theme
 * @param {number} [o.width]
 * @param {number} [o.height]
 */
function coverSvg({ seed, eyebrow, title, theme, width = 1200, height = 675 }) {
  const w = width;
  const h = height;
  const r = rng(hash(seed));
  const angle = Math.floor(r() * 360);
  const stops = [BLUE_DEEP, BLUE_MID, BLUE_LIGHT];
  const a = stops[Math.floor(r() * stops.length)] ?? BLUE_DEEP;
  const b = stops[Math.floor(r() * stops.length)] ?? BLUE_MID;

  const motif = motifFor(theme, r, w, h);

  // Title block, anchored bottom-left within a generous margin.
  const margin = Math.round(w * 0.06);
  const titleSize = title.length > 48 ? 58 : title.length > 30 ? 70 : 84;
  const lines = wrap(title, title.length > 48 ? 26 : 22, 3);
  const lineH = Math.round(titleSize * 1.1);
  const blockBottom = h - margin;
  const firstY = blockBottom - (lines.length - 1) * lineH;
  const titleSpans = lines
    .map(
      (line, i) =>
        `<tspan x="${margin}" y="${(firstY + i * lineH).toFixed(0)}">${esc(line)}</tspan>`,
    )
    .join('');

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">` +
    `<defs>` +
    `<linearGradient id="g" gradientTransform="rotate(${angle} 0.5 0.5)">` +
    `<stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>` +
    `</linearGradient>` +
    `<radialGradient id="halo" cx="78%" cy="22%" r="60%">` +
    `<stop offset="0" stop-color="${BLUE_LIGHT}" stop-opacity="0.55"/>` +
    `<stop offset="1" stop-color="${a}" stop-opacity="0"/>` +
    `</radialGradient>` +
    `<linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0.45" stop-color="${INK}" stop-opacity="0"/>` +
    `<stop offset="1" stop-color="${INK}" stop-opacity="0.55"/>` +
    `</linearGradient>` +
    `<pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">` +
    `<path d="M48 0 H0 V48" fill="none" stroke="${PAPER}" stroke-width="1" opacity="0.09"/>` +
    `</pattern>` +
    `</defs>` +
    `<rect width="${w}" height="${h}" fill="${a}"/>` +
    `<rect width="${w}" height="${h}" fill="url(#g)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#halo)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#grid)"/>` +
    motif +
    `<rect width="${w}" height="${h}" fill="url(#scrim)"/>` +
    // Top meta row: Ryze wordmark (left) + eyebrow (right).
    `<text x="${margin}" y="${margin + 8}" font-family="${MONO_FONT}" font-size="22" letter-spacing="3" fill="${PAPER}" opacity="0.9">RYZE TECHNOLOGY</text>` +
    `<text x="${w - margin}" y="${margin + 8}" text-anchor="end" font-family="${MONO_FONT}" font-size="20" letter-spacing="4" fill="${PAPER}" opacity="0.7">${esc(eyebrow.toUpperCase())}</text>` +
    // Accent rule above the title.
    `<rect x="${margin}" y="${(firstY - titleSize - 28).toFixed(0)}" width="64" height="5" rx="2.5" fill="${PAPER}"/>` +
    // Title.
    `<text font-family="${DISPLAY_FONT}" font-size="${titleSize}" font-weight="700" fill="${PAPER}" letter-spacing="-1">${titleSpans}</text>` +
    `</svg>\n`
  );
}

/** Write a file, creating parent dirs as needed. */
function emit(relPath, contents) {
  const out = join(publicDir, relPath);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, contents, 'utf8');
  return relPath;
}

/* ── Blog posts (slug, title, category) ────────────────────────────────────── */
const BLOG = [
  ['engineering-for-99-8-uptime', 'Engineering for 99.8% Uptime Without Heroics', 'engineering'],
  ['the-real-cost-of-technical-debt', 'The Real Cost of Technical Debt', 'process'],
  ['designing-apis-that-last', 'Designing APIs That Last', 'engineering'],
  ['devops-automation-that-pays-off', 'DevOps Automation That Actually Pays Off', 'engineering'],
  ['monitoring-that-actually-matters', 'Monitoring That Actually Matters', 'engineering'],
  ['scaling-without-the-rewrite', 'Scaling Without the Big Rewrite', 'process'],
  ['a-design-system-that-scales', 'A Design System That Scales With the Team', 'design'],
  ['building-products-that-work-forever', 'What We Mean by "Products That Work Forever"', 'company'],
];

/** Map a blog category to a motif theme. */
const CATEGORY_THEME = {
  engineering: 'arcs',
  process: 'bars',
  design: 'grid',
  company: 'chevron',
};

/* ── Case studies (slug, title, gallery count) ─────────────────────────────── */
const CASE_STUDIES = [
  ['orange-city-grocers', 'A storefront that turned aisle browsers into loyal subscribers', 4],
  ['mednudge-care-companion', 'A care companion app that keeps patients on track between visits', 3],
  ['vidarbha-logistics-hub', 'An operations hub that replaced spreadsheets for a regional fleet', 4],
  ['aurora-finance-dashboard', 'A finance dashboard that turns raw ledgers into decisions', 2],
  ['trailhead-booking-platform', 'A booking platform that filled off-season weekends', 2],
  ['fieldwise-inspection-app', 'A field inspection app that works miles from a signal', 2],
  ['lumen-learning-app', 'A learning app that made daily practice a habit', 2],
  ['cobalt-ops-automation', 'An automation layer that gave a back office its nights back', 2],
];

const CASE_THEMES = ['arcs', 'nodes', 'grid', 'bars', 'chevron'];

const written = [];

// Blog covers (16:9).
for (const [slug, title, category] of BLOG) {
  const theme = CATEGORY_THEME[category] ?? 'arcs';
  const svg = coverSvg({ seed: slug, eyebrow: category, title, theme });
  written.push(emit(`images/blog/${slug}.svg`, svg));
}

// Case-study hero (16:9) + gallery covers (4:3-ish, lighter labels).
for (const [slug, title, galleryCount] of CASE_STUDIES) {
  const heroTheme = CASE_THEMES[hash(slug) % CASE_THEMES.length];
  written.push(
    emit(
      `images/case-studies/${slug}-hero.svg`,
      coverSvg({ seed: `${slug}-hero`, eyebrow: 'Case study', title, theme: heroTheme }),
    ),
  );
  for (let i = 1; i <= galleryCount; i += 1) {
    const gTheme = CASE_THEMES[(hash(`${slug}${i}`)) % CASE_THEMES.length];
    written.push(
      emit(
        `images/case-studies/${slug}-gallery-${i}.svg`,
        coverSvg({
          seed: `${slug}-g${i}`,
          eyebrow: `View ${String(i).padStart(2, '0')}`,
          title,
          theme: gTheme,
          width: 1200,
          height: 900,
        }),
      ),
    );
  }
}

console.log('Cover-art generator');
console.log('-------------------');
console.log(`Wrote ${written.length} SVG covers under public/images/`);
for (const p of written) console.log(`  + ${p}`);
