/**
 * Unit tests for static content invariants.
 *
 * These assert the structural guarantees the design relies on: counts,
 * named category/differentiator sets, footer section coverage, authored
 * team-story word count, and the SEO description length bounds.
 *
 * Covers Requirements: 2.1, 3.1, 3.2, 4.1, 4.2, 5.1, 5.3, 7.2, 7.3, 15.2
 */

import { describe, it, expect } from 'vitest';

import { caseStudies } from './portfolio';
import { services } from './services';
import { differentiators } from './differentiators';
import { teamContent } from './team';
import { footerContent } from './contact';
import { siteMetadata } from './site';

/** Count words by splitting on runs of whitespace, ignoring empties. */
function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

describe('content invariants', () => {
  it('authors at least two case studies (Req 2.1)', () => {
    expect(caseStudies.length).toBeGreaterThanOrEqual(2);
  });

  it('authors exactly four services with the named categories (Req 3.1, 3.2)', () => {
    expect(services.length).toBe(4);

    const categories = new Set(services.map((s) => s.category));
    expect(categories).toEqual(
      new Set([
        'Websites & Web Apps',
        'Mobile Apps',
        'Desktop Applications',
        'Business Systems & Automation',
      ]),
    );
  });

  it('authors exactly four differentiators with the named titles (Req 4.1, 4.2)', () => {
    expect(differentiators.length).toBe(4);

    const titles = new Set(differentiators.map((d) => d.title));
    expect(titles).toEqual(
      new Set([
        'Complete ownership',
        'Full-stack expertise',
        'Long-term partnership',
        'Transparent process',
      ]),
    );
  });

  it('authors exactly four team members (Req 5.1)', () => {
    expect(teamContent.members.length).toBe(4);
  });

  it('keeps the authored team story between 30 and 120 words when present (Req 5.3)', () => {
    if (teamContent.story !== undefined) {
      const count = wordCount(teamContent.story);
      expect(count).toBeGreaterThanOrEqual(30);
      expect(count).toBeLessThanOrEqual(120);
    }
  });

  it('covers all six section anchors in the footer nav links (Req 7.2)', () => {
    const anchors = new Set(footerContent.navLinks.map((link) => link.id));
    expect(anchors).toEqual(
      new Set(['hero', 'portfolio', 'services', 'differentiators', 'team', 'contact']),
    );
  });

  it('provides at least one external contact in the footer (Req 7.3)', () => {
    expect(footerContent.externalContacts.length).toBeGreaterThanOrEqual(1);
  });

  it('keeps the SEO description within the 50–160 character bounds (Req 15.2)', () => {
    expect(siteMetadata.description.length).toBeGreaterThanOrEqual(50);
    expect(siteMetadata.description.length).toBeLessThanOrEqual(160);
  });
});
