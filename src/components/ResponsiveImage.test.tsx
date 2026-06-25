import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { fireEvent, render, screen } from '@testing-library/react';
import type { CaseStudyImage } from '@apptypes';
import { ResponsiveImage } from './ResponsiveImage';

/**
 * Generator for an arbitrary responsive image model. Source paths, dimensions,
 * and alt text are all varied; alt is always a defined (possibly empty) string,
 * matching the required `alt` attribute contract.
 */
const imageArb: fc.Arbitrary<CaseStudyImage> = fc.record({
  avifSrc: fc.webUrl(),
  webpSrc: fc.webUrl(),
  fallbackSrc: fc.webUrl(),
  width: fc.integer({ min: 1, max: 4000 }),
  height: fc.integer({ min: 1, max: 4000 }),
  alt: fc.string(),
});

describe('ResponsiveImage - property: next-gen formats + fallback + alt', () => {
  // Feature: ryze-portfolio-website, Property 9: rendered <picture> contains an AVIF source, a WebP source, and a fallback <img> with a defined alt attribute
  // Validates: Requirements 12.5, 13.3
  it('always renders a <picture> with AVIF + WebP sources and a fallback <img> carrying a defined alt', () => {
    fc.assert(
      fc.property(imageArb, (image) => {
        const { container, unmount } = render(<ResponsiveImage image={image} />);

        const picture = container.querySelector('picture');
        expect(picture).not.toBeNull();

        const avif = container.querySelector('source[type="image/avif"]');
        const webp = container.querySelector('source[type="image/webp"]');
        expect(avif).not.toBeNull();
        expect(webp).not.toBeNull();
        expect(avif?.getAttribute('srcset')).toBe(image.avifSrc);
        expect(webp?.getAttribute('srcset')).toBe(image.webpSrc);

        const img = container.querySelector('img');
        expect(img).not.toBeNull();
        expect(img?.getAttribute('src')).toBe(image.fallbackSrc);
        // alt must be a defined attribute (even when empty).
        expect(img?.hasAttribute('alt')).toBe(true);
        expect(img?.getAttribute('alt')).toBe(image.alt);
        // Explicit dimensions prevent layout shift.
        expect(img?.getAttribute('width')).toBe(String(image.width));
        expect(img?.getAttribute('height')).toBe(String(image.height));

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});

const sampleImage: CaseStudyImage = {
  avifSrc: 'https://cdn.example.com/photo.avif',
  webpSrc: 'https://cdn.example.com/photo.webp',
  fallbackSrc: 'https://cdn.example.com/photo.jpg',
  width: 320,
  height: 240,
  alt: 'A portrait of a team member',
};

describe('ResponsiveImage - fallback chain', () => {
  it('lazy-loads and decodes async by default (below-the-fold)', () => {
    const { container } = render(<ResponsiveImage image={sampleImage} />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('lazy');
    expect(img?.getAttribute('decoding')).toBe('async');
  });

  it('loads eagerly with high fetch priority when priority is set (hero)', () => {
    const { container } = render(<ResponsiveImage image={sampleImage} priority />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('loading')).toBe('eager');
    expect(img?.getAttribute('fetchpriority')).toBe('high');
  });

  it('swaps to the initials placeholder when the photo fails to load (Req 5.5)', () => {
    const { container } = render(
      <ResponsiveImage image={sampleImage} initials="JD" />,
    );

    const img = container.querySelector('img');
    expect(img).not.toBeNull();

    fireEvent.error(img as HTMLImageElement);

    // The primary picture is gone; the initials placeholder is shown.
    expect(container.querySelector('picture')).toBeNull();
    const placeholder = screen.getByTestId('responsive-image-initials');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveTextContent('JD');
    // Placeholder still exposes the alt text to assistive tech.
    expect(placeholder).toHaveAttribute('aria-label', sampleImage.alt);
  });

  it('reserves layout space when both photo and placeholder fail (Req 5.6)', () => {
    const { container } = render(
      <ResponsiveImage image={sampleImage} initials="JD" />,
    );

    // First failure: photo -> initials placeholder.
    fireEvent.error(container.querySelector('img') as HTMLImageElement);
    expect(screen.getByTestId('responsive-image-initials')).toBeInTheDocument();

    // Second failure: the placeholder graphic itself fails -> reserved space.
    fireEvent.error(screen.getByTestId('responsive-image-initials-graphic'));

    expect(screen.queryByTestId('responsive-image-initials')).toBeNull();
    const reserved = screen.getByTestId('responsive-image-reserved');
    expect(reserved).toBeInTheDocument();
    // No visual element is shown, but the aspect-ratio space is preserved.
    expect(reserved).toBeEmptyDOMElement();
    expect(reserved.style.aspectRatio).toBe(
      `${sampleImage.width} / ${sampleImage.height}`,
    );
  });
});
