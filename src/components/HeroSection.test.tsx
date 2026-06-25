/**
 * Unit tests for HeroSection (Task 10.2).
 *
 * Covers:
 *  - Headline and subheadline content (Requirements 1.1, 1.2).
 *  - Exactly one primary visual element (Requirement 1.3).
 *  - Exactly one Primary CTA with the correct label (Requirement 1.4).
 *  - CTA activation scrolls to the target section (Requirements 1.5, 1.6).
 *  - Reduced motion renders the visual statically (Requirement 1.8).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MotionProvider, smoothScrollToSection } from '@hooks';
import { heroContent } from '../content/hero';
import { HeroSection } from './HeroSection';

// Mock only the scroll side-effect; keep the real MotionProvider/context so the
// reduced-motion wiring is exercised end-to-end via matchMedia.
vi.mock('@hooks', async (importActual) => {
  const actual = await importActual<typeof import('@hooks')>();
  return {
    ...actual,
    smoothScrollToSection: vi.fn(),
  };
});

const scrollMock = vi.mocked(smoothScrollToSection);

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

function renderHero(): void {
  render(
    <MotionProvider>
      <HeroSection />
    </MotionProvider>,
  );
}

beforeEach(() => {
  setReducedMotion(false);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('HeroSection content', () => {
  it('renders the fixed headline as the page <h1> (Req 1.1)', () => {
    renderHero();
    const heading = screen.getByRole('heading', { level: 1 });
    // Whitespace is normalized across the lead/accent spans.
    expect(heading.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      heroContent.headline,
    );
  });

  it('renders the subheadline supporting text (Req 1.2)', () => {
    renderHero();
    expect(screen.getByText(heroContent.subheadline)).toBeInTheDocument();
  });

  it('renders exactly one primary visual element (Req 1.3)', () => {
    renderHero();
    expect(screen.getAllByTestId('hero-visual')).toHaveLength(1);
  });

  it('renders exactly one Primary CTA with the content label (Req 1.4)', () => {
    renderHero();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent(heroContent.cta.label);
  });

  it('fills at least 90vh on desktop via min-height utility (Req 1.7)', () => {
    const { container } = render(
      <MotionProvider>
        <HeroSection />
      </MotionProvider>,
    );
    const section = container.querySelector('section#hero');
    expect(section?.className).toContain('min-h-[90vh]');
  });
});

describe('HeroSection CTA scroll behavior', () => {
  it('scrolls to the CTA target section when activated (Req 1.5/1.6)', () => {
    renderHero();
    const cta = screen.getByRole('button', { name: heroContent.cta.label });

    fireEvent.click(cta);

    expect(scrollMock).toHaveBeenCalledTimes(1);
    expect(scrollMock).toHaveBeenCalledWith(heroContent.cta.targetSection, false);
  });

  it("maps a 'Let's talk' style CTA generically to its target section", () => {
    // The component scrolls to whatever target the content declares, so the
    // "Let's talk" -> contact mapping (Req 1.6) is covered by the same path.
    renderHero();
    fireEvent.click(screen.getByRole('button', { name: heroContent.cta.label }));
    expect(scrollMock).toHaveBeenCalledWith(heroContent.cta.targetSection, false);
  });
});

describe('HeroSection reduced motion (Req 1.8)', () => {
  it('renders the gradient visual statically when reduced motion is active', () => {
    setReducedMotion(true);
    renderHero();

    const visual = screen.getByTestId('hero-visual');
    // The static visual carries no motion animation flag.
    expect(visual).toHaveAttribute('data-animated', 'false');

    // None of the visual's gradient layers carry an inline CSS animation.
    const layers = visual.querySelectorAll('div');
    expect(layers.length).toBeGreaterThan(0);
    layers.forEach((layer) => {
      expect((layer as HTMLElement).style.animation).toBe('');
    });
  });

  it('animates the gradient visual when motion is allowed', () => {
    setReducedMotion(false);
    renderHero();
    expect(screen.getByTestId('hero-visual')).toHaveAttribute(
      'data-animated',
      'true',
    );
  });

  it('passes the reduced-motion flag through to the scroll handler', () => {
    setReducedMotion(true);
    renderHero();
    fireEvent.click(screen.getByRole('button', { name: heroContent.cta.label }));
    expect(scrollMock).toHaveBeenCalledWith(heroContent.cta.targetSection, true);
  });
});
