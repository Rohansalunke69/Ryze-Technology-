import { describe, expect, it, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { render, screen, within } from '@testing-library/react';
import { MotionProvider } from '@hooks';
import { services } from '@content/services';
import type { Service, ServiceCategory } from '@apptypes';
import { ServiceCard, KNOWN_ICON_NAMES } from './ServiceCard';
import { ServicesSection } from './ServicesSection';

/**
 * Helper: install a matchMedia stub that reports a fixed reduced-motion
 * preference. `useReducedMotion` reads `prefers-reduced-motion: reduce`.
 */
function stubMatchMedia(prefersReducedMotion: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion')
        ? prefersReducedMotion
        : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

const CATEGORIES: ServiceCategory[] = [
  'Websites & Web Apps',
  'Mobile Apps',
  'Desktop Applications',
  'Business Systems & Automation',
];

beforeEach(() => {
  stubMatchMedia(false);
});

describe('ServiceCard - property: renders all required fields', () => {
  // Feature: ryze-portfolio-website, Property 7: rendered Service_Card contains an icon, the category title, and the single-sentence description
  // Validates: Requirements 3.3
  it('always renders an icon, the category title, and the description', () => {
    // A "word" is a run of non-whitespace characters. Building the
    // description from words joined by single spaces guarantees the generated
    // string already equals its whitespace-normalized form, so that
    // `getByText` (which trims and collapses whitespace) can match it exactly.
    const wordArb = fc
      .string({ minLength: 1, maxLength: 12 })
      .map((s) => s.replace(/\s/g, ''))
      .filter((s) => s.length > 0);

    const serviceArb: fc.Arbitrary<Service> = fc.record({
      category: fc.constantFrom(...CATEGORIES),
      iconName: fc.constantFrom(...KNOWN_ICON_NAMES),
      // A non-empty, single-sentence description with no leading/trailing or
      // collapsible internal whitespace.
      description: fc
        .array(wordArb, { minLength: 1, maxLength: 12 })
        .map((words) => words.join(' ')),
    });

    fc.assert(
      fc.property(serviceArb, (service) => {
        const { container, unmount } = render(
          <MotionProvider>
            <ServiceCard service={service} />
          </MotionProvider>,
        );

        const card = within(container).getByTestId('service-card');

        // An icon element (lucide renders an <svg>).
        expect(card.querySelector('svg')).not.toBeNull();
        // The category title.
        expect(within(card).getByText(service.category)).toBeInTheDocument();
        // The single-sentence description.
        expect(within(card).getByText(service.description)).toBeInTheDocument();

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});

describe('ServicesSection - structure', () => {
  it('renders exactly four service cards (Req 3.1)', () => {
    render(
      <MotionProvider>
        <ServicesSection />
      </MotionProvider>,
    );

    expect(screen.getAllByTestId('service-card')).toHaveLength(4);
  });

  it('includes one card for each of the four named categories (Req 3.2)', () => {
    render(
      <MotionProvider>
        <ServicesSection />
      </MotionProvider>,
    );

    for (const category of CATEGORIES) {
      expect(screen.getByText(category)).toBeInTheDocument();
    }
    // Content authored exactly the four categories, no duplicates/extras.
    expect(services.map((s) => s.category).sort()).toEqual(
      [...CATEGORIES].sort(),
    );
  });

  it('lays out cards with responsive 1/2/4 column grid classes (Req 9.2-9.4)', () => {
    const { container } = render(
      <MotionProvider>
        <ServicesSection />
      </MotionProvider>,
    );

    const grid = container.querySelector('#services > div');
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('tablet:grid-cols-2');
    expect(grid?.className).toContain('desktop:grid-cols-4');
  });
});

describe('ServiceCard - reduced-motion hover state (Req 3.5)', () => {
  it('uses a non-motion hover (border/color change, no transform) when reduced motion is on', () => {
    stubMatchMedia(true);

    render(
      <MotionProvider>
        <ServiceCard service={services[0]} />
      </MotionProvider>,
    );

    const card = screen.getByTestId('service-card');
    expect(card.dataset.reducedMotion).toBe('true');
    // Has a hover color/border change.
    expect(card.className).toContain('hover:border-accent');
    // No transform-based hover under reduced motion.
    expect(card.className).not.toContain('hover:-translate-y');
  });

  it('uses a transform-based hover when reduced motion is off (Req 3.4)', () => {
    stubMatchMedia(false);

    render(
      <MotionProvider>
        <ServiceCard service={services[0]} />
      </MotionProvider>,
    );

    const card = screen.getByTestId('service-card');
    expect(card.dataset.reducedMotion).toBe('false');
    expect(card.className).toContain('hover:-translate-y-1');
    expect(card.className).toContain('duration-300');
  });
});
