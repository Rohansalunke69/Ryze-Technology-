/**
 * Unit tests for Hero.
 *
 * Verifies that:
 *  - the static HeroFallback is rendered;
 *  - the composed content (eyebrow, headline, CTA) renders.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import { Hero } from './Hero';

afterEach(() => {
  resetMatchMedia();
});

function renderHero(ui: React.ReactNode) {
  return render(<ReducedMotionProvider>{ui}</ReducedMotionProvider>);
}

describe('Hero', () => {
  it('renders the static HeroFallback', () => {
    mockReducedMotion(false);
    renderHero(<Hero headline="Build products that work forever" />);

    expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
  });

  it('renders headline and CTA content', () => {
    mockReducedMotion(false);
    renderHero(
      <Hero
        headline="Build products that work forever"
      />,
    );

    // Headline is exposed as a single accessible name via SplitText's aria-label.
    expect(
      screen.getByLabelText('Build products that work forever'),
    ).toBeInTheDocument();
    // Primary CTA.
    expect(
      screen.getByRole('link', { name: 'Start a project' }),
    ).toBeInTheDocument();
  });
});
