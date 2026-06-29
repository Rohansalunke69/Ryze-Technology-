/**
 * Unit tests for SEOHead (task 7.7).
 *
 * react-helmet-async writes tags into `document.head` on the client. The tests
 * render SEOHead inside a `<HelmetProvider>` and assert against `document.head`
 * (after the async commit settles via `waitFor`).
 *
 * Covered behaviors:
 *  - title is composed from the site title template (Requirement 40.1);
 *  - title collapses to the default title when meta.title is the site name;
 *  - the description is normalized and present (Requirement 40.2);
 *  - canonical link is emitted (Requirement 40.1);
 *  - og:image is emitted, defaulting to the site OG image (Requirement 40.1);
 *  - noIndex emits `robots: noindex,follow` (Requirements 18.3, 40.5).
 */
import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import type { SEOMeta } from '@app-types';
import { siteMetadata } from '@data/siteMetadata';
import { SEOHead } from './SEOHead';

const baseMeta: SEOMeta = {
  title: 'Services',
  description: 'We design and engineer durable software systems.',
  canonical: 'https://ryze-technology.pages.dev/services',
};

function renderSEO(meta: SEOMeta, jsonLd?: object): void {
  render(
    <HelmetProvider>
      {jsonLd ? <SEOHead meta={meta} jsonLd={jsonLd} /> : <SEOHead meta={meta} />}
    </HelmetProvider>,
  );
}

function metaContent(selector: string): string | null {
  return document.head.querySelector(selector)?.getAttribute('content') ?? null;
}

describe('SEOHead', () => {
  it('composes the document title from the site title template', async () => {
    renderSEO(baseMeta);
    await waitFor(() => {
      expect(document.title).toBe('Services — Ryze Technology');
    });
    expect(document.title).toContain('Ryze Technology');
  });

  it('falls back to the default title when meta.title is the site name', async () => {
    renderSEO({ ...baseMeta, title: siteMetadata.siteName });
    await waitFor(() => {
      expect(document.title).toBe(siteMetadata.defaultTitle);
    });
  });

  it('emits a normalized, present meta description', async () => {
    const longDescription = `${'word '.repeat(60)}end`;
    renderSEO({ ...baseMeta, description: longDescription });

    await waitFor(() => {
      expect(metaContent('meta[name="description"]')).not.toBeNull();
    });
    const description = metaContent('meta[name="description"]');
    expect(description).toBeTruthy();
    expect(description!.length).toBeLessThanOrEqual(160);
  });

  it('emits a canonical link', async () => {
    renderSEO(baseMeta);
    await waitFor(() => {
      const canonical = document.head.querySelector('link[rel="canonical"]');
      expect(canonical?.getAttribute('href')).toBe('https://ryze-technology.pages.dev/services');
    });
  });

  it('emits og:image, defaulting to the site OG image', async () => {
    renderSEO(baseMeta);
    await waitFor(() => {
      expect(metaContent('meta[property="og:image"]')).toBe(siteMetadata.defaultOgImage.src);
    });
  });

  it('uses the provided ogImage src when given', async () => {
    renderSEO({
      ...baseMeta,
      ogImage: { src: '/images/og/services.jpg', width: 1200, height: 630, alt: 'Services' },
    });
    await waitFor(() => {
      expect(metaContent('meta[property="og:image"]')).toBe('/images/og/services.jpg');
    });
  });

  it('emits robots noindex,follow when noIndex is set', async () => {
    renderSEO({ ...baseMeta, noIndex: true });
    await waitFor(() => {
      expect(metaContent('meta[name="robots"]')).toBe('noindex,follow');
    });
  });

  it('does not emit a robots tag when noIndex is absent', async () => {
    renderSEO(baseMeta);
    await waitFor(() => {
      expect(document.head.querySelector('meta[name="description"]')).not.toBeNull();
    });
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it('injects a JSON-LD script when jsonLd is provided', async () => {
    const jsonLd = { '@context': 'https://schema.org', '@type': 'Organization' };
    renderSEO(baseMeta, jsonLd);
    await waitFor(() => {
      const script = document.head.querySelector('script[type="application/ld+json"]');
      expect(script?.textContent).toContain('Organization');
    });
  });
});
