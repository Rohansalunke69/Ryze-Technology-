/**
 * Tests for the Featured Work / Portfolio section.
 *
 *  - Task 11.2: property test for CaseStudyCard rendering (Property 6).
 *  - Task 11.3: edge-case tests for empty-portfolio placeholders (Req 2.3) and
 *    the reduced-motion detail reveal without scale/motion transitions (Req 2.6).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import type { CaseStudy, CaseStudyImage, CaseStudyMetric } from '@apptypes';
import { MotionProvider } from '@hooks';
import { CaseStudyCard } from './CaseStudyCard';
import { PortfolioSection } from './PortfolioSection';

/**
 * Install a `matchMedia` stub. `reduceMotion` controls whether the
 * `prefers-reduced-motion: reduce` query reports a match.
 */
function setReducedMotion(reduceMotion: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduceMotion : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

beforeEach(() => {
  setReducedMotion(false);
});

afterEach(() => {
  vi.clearAllMocks();
});

// --- Generators --------------------------------------------------------------

const metricArb: fc.Arbitrary<CaseStudyMetric> = fc.record({
  label: fc.string({ minLength: 1 }),
  value: fc.string({ minLength: 1 }),
});

const imageArb: fc.Arbitrary<CaseStudyImage> = fc.record({
  avifSrc: fc.webUrl(),
  webpSrc: fc.webUrl(),
  fallbackSrc: fc.webUrl(),
  width: fc.integer({ min: 1, max: 4000 }),
  height: fc.integer({ min: 1, max: 4000 }),
  alt: fc.string(),
});

const caseStudyArb: fc.Arbitrary<CaseStudy> = fc.record({
  id: fc.string({ minLength: 1 }),
  projectName: fc.string({ minLength: 1 }),
  industry: fc.string({ minLength: 1 }),
  metrics: fc.array(metricArb, { minLength: 1, maxLength: 5 }),
  preview: imageArb,
  // Exercise both internal routes and external absolute URLs (Req 2.5).
  detailUrl: fc.oneof(
    fc.webUrl(),
    fc.string({ minLength: 1 }).map((s) => `/work/${encodeURIComponent(s)}`),
  ),
});

// --- Property 6 --------------------------------------------------------------

describe('CaseStudyCard - property: required fields + activation target', () => {
  // Feature: ryze-portfolio-website, Property 6: rendered Case_Study_Card contains project name, industry, >= 1 metric, preview image with defined alt, and an activation target whose href equals detailUrl
  // Validates: Requirements 2.2, 2.5
  it('renders name, industry, >= 1 metric, an alt-bearing image, and links to detailUrl', () => {
    fc.assert(
      fc.property(caseStudyArb, (caseStudy) => {
        const { container, unmount } = render(
          <MotionProvider>
            <CaseStudyCard caseStudy={caseStudy} />
          </MotionProvider>,
        );

        const text = container.textContent ?? '';

        // Project name and industry are present (Req 2.2).
        expect(text).toContain(caseStudy.projectName);
        expect(text).toContain(caseStudy.industry);

        // At least one key metric is present (Req 2.2).
        const firstMetric = caseStudy.metrics[0];
        expect(text).toContain(firstMetric.value);
        expect(text).toContain(firstMetric.label);

        // A preview image with a defined alt attribute (Req 2.2).
        const img = container.querySelector('img');
        expect(img).not.toBeNull();
        expect(img?.hasAttribute('alt')).toBe(true);
        expect(img?.getAttribute('alt')).toBe(caseStudy.preview.alt);

        // An activation target whose href equals detailUrl (Req 2.5).
        const link = container.querySelector(
          '[data-testid="case-study-link"]',
        );
        expect(link).not.toBeNull();
        expect(link?.getAttribute('href')).toBe(caseStudy.detailUrl);

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});

// --- Sample data for example/edge-case tests ---------------------------------

const sampleCaseStudy: CaseStudy = {
  id: 'sample',
  projectName: 'Sample Project',
  industry: 'SaaS',
  metrics: [
    { label: 'Conversion uplift', value: '+38%' },
    { label: 'Load time', value: '0.8s' },
  ],
  preview: {
    avifSrc: 'https://cdn.example.com/p.avif',
    webpSrc: 'https://cdn.example.com/p.webp',
    fallbackSrc: 'https://cdn.example.com/p.jpg',
    width: 1280,
    height: 800,
    alt: 'Sample project preview',
  },
  detailUrl: '/work/sample',
};

// --- Task 11.3: edge cases ---------------------------------------------------

describe('PortfolioSection - empty portfolio placeholders (Req 2.3)', () => {
  it('renders at least two placeholder cards and no project cards when empty', () => {
    render(
      <MotionProvider>
        <PortfolioSection items={[]} />
      </MotionProvider>,
    );

    const placeholders = screen.getAllByTestId('case-study-card-placeholder');
    expect(placeholders.length).toBeGreaterThanOrEqual(2);

    // No project content cards are rendered in the empty state.
    expect(screen.queryAllByTestId('case-study-card')).toHaveLength(0);
  });

  it('still renders the section heading in the empty state', () => {
    render(
      <MotionProvider>
        <PortfolioSection items={[]} />
      </MotionProvider>,
    );
    expect(
      screen.getByRole('heading', { name: 'Featured Work' }),
    ).toBeInTheDocument();
  });
});

describe('CaseStudyCard - reduced-motion detail reveal (Req 2.6)', () => {
  it('reveals details without a scale or motion transition class', () => {
    setReducedMotion(true);
    render(
      <MotionProvider>
        <CaseStudyCard caseStudy={sampleCaseStudy} />
      </MotionProvider>,
    );

    const link = screen.getByTestId('case-study-link');
    // No scale or motion-based transition on the activation target.
    expect(link.className).not.toContain('scale-[1.03]');
    expect(link.className).not.toContain('transition-transform');

    // The additional details are revealed (final visual state), not hidden.
    const details = screen.getByTestId('case-study-details');
    expect(details.className).toContain('opacity-100');
    expect(details.className).not.toContain('opacity-0');
  });

  it('applies a scale transition when motion is allowed (Req 2.4)', () => {
    setReducedMotion(false);
    render(
      <MotionProvider>
        <CaseStudyCard caseStudy={sampleCaseStudy} />
      </MotionProvider>,
    );

    const link = screen.getByTestId('case-study-link');
    expect(link.className).toContain('scale-[1.03]');
    expect(link.className).toContain('transition-transform');

    // Details start hidden and reveal on hover/focus.
    const details = screen.getByTestId('case-study-details');
    expect(details.className).toContain('opacity-0');
    expect(details.className).toContain('group-hover:opacity-100');
  });
});

describe('CaseStudyCard - external vs internal activation (Req 2.5)', () => {
  it('opens external destinations in a new tab with rel noopener', () => {
    const external: CaseStudy = {
      ...sampleCaseStudy,
      detailUrl: 'https://live.example.com/project',
    };
    render(
      <MotionProvider>
        <CaseStudyCard caseStudy={external} />
      </MotionProvider>,
    );

    const link = screen.getByTestId('case-study-link');
    expect(link).toHaveAttribute('href', 'https://live.example.com/project');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('uses a plain anchor for internal routes', () => {
    render(
      <MotionProvider>
        <CaseStudyCard caseStudy={sampleCaseStudy} />
      </MotionProvider>,
    );

    const link = screen.getByTestId('case-study-link');
    expect(link).toHaveAttribute('href', '/work/sample');
    expect(link).not.toHaveAttribute('target');
  });
});
