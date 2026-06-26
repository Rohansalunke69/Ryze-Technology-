/**
 * Tests for the breadcrumb trail builder.
 *
 * Includes the named property-based test (Property 37) plus example-based unit
 * tests covering label mapping (Requirement 3.4) and the root edge case.
 *
 * Framework: Vitest + fast-check (global numRuns >= 100, seeded in test setup).
 * Requirements: 3.2, 3.3, 3.4
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { buildBreadcrumbTrail } from './breadcrumb';

/** A URL-safe path segment (no slashes, non-empty). */
const segmentArb = fc.stringMatching(/^[a-z0-9][a-z0-9-]*$/, {
  size: 'small',
});

/**
 * An array of url-safe segments. May be empty (root path) so the edge case is
 * exercised by the property too.
 */
const segmentsArb = fc.array(segmentArb, { minLength: 0, maxLength: 8 });

describe('buildBreadcrumbTrail (property)', () => {
  // Feature: ryze-technology-website, Property 37: breadcrumb trail consistency
  // Validates: Requirements 3.2, 3.3
  it('starts at Home, preserves path order, only the last item omits path, and counts segments + 1', () => {
    fc.assert(
      fc.property(segmentsArb, fc.dictionary(segmentArb, fc.string()), (segments, labelMap) => {
        const pathname = `/${segments.join('/')}`;
        const trail = buildBreadcrumbTrail(pathname, labelMap);

        // Count: meaningful segments + 1 (Home). (Requirement 3.2)
        expect(trail).toHaveLength(segments.length + 1);

        // Starts at Home. (Requirement 3.2)
        // Generated label-map keys never include the root key '/', so Home
        // keeps its default label here.
        expect(trail[0].label).toBe('Home');

        // Only the last item omits `path`; all others have one. (Requirement 3.3)
        trail.forEach((item, index) => {
          if (index === trail.length - 1) {
            expect(item.path).toBeUndefined();
          } else {
            expect(item.path).toBeDefined();
          }
        });

        // Segments appear in path order: each non-Home, non-last item's
        // cumulative path matches the join of segments up to that index.
        // (Requirement 3.2)
        for (let i = 1; i < trail.length - 1; i++) {
          const expectedPath = `/${segments.slice(0, i).join('/')}`;
          expect(trail[i].path).toBe(expectedPath);
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe('buildBreadcrumbTrail (examples)', () => {
  it('returns a single current-page Home item for the root path', () => {
    // Edge case: '/' has no meaningful segments, so the trail is just [Home],
    // and Home (being last) omits its path.
    expect(buildBreadcrumbTrail('/', {})).toEqual([{ label: 'Home' }]);
    expect(buildBreadcrumbTrail('', {})).toEqual([{ label: 'Home' }]);
  });

  it('builds cumulative paths for intermediate segments and drops the last path', () => {
    const trail = buildBreadcrumbTrail('/portfolio/acme-redesign', {});
    expect(trail).toEqual([
      { label: 'Home', path: '/' },
      { label: 'Portfolio', path: '/portfolio' },
      { label: 'Acme Redesign' },
    ]);
  });

  it('maps segments to human-readable labels via the label map (Requirement 3.4)', () => {
    const trail = buildBreadcrumbTrail('/services/business-systems', {
      services: 'Our Services',
      'business-systems': 'Business Systems',
    });
    expect(trail).toEqual([
      { label: 'Home', path: '/' },
      { label: 'Our Services', path: '/services' },
      { label: 'Business Systems' },
    ]);
  });

  it('resolves labels by cumulative path with priority over the bare segment', () => {
    const trail = buildBreadcrumbTrail('/blog/slug', {
      slug: 'Generic Slug',
      '/blog/slug': 'Specific Post Title',
    });
    expect(trail[trail.length - 1]).toEqual({ label: 'Specific Post Title' });
  });

  it('overrides the Home label via the root key', () => {
    const trail = buildBreadcrumbTrail('/about', { '/': 'Start' });
    expect(trail[0]).toEqual({ label: 'Start', path: '/' });
  });

  it('ignores empty segments from duplicate/leading/trailing slashes', () => {
    const trail = buildBreadcrumbTrail('//portfolio///acme//', {});
    expect(trail).toEqual([
      { label: 'Home', path: '/' },
      { label: 'Portfolio', path: '/portfolio' },
      { label: 'Acme' },
    ]);
  });

  it('humanizes multi-word kebab segments to Title Case', () => {
    const trail = buildBreadcrumbTrail('/case-studies', {});
    expect(trail[trail.length - 1]).toEqual({ label: 'Case Studies' });
  });
});
