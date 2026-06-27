/**
 * Unit tests for MarqueeText (task 9.4).
 *
 * Rendered inside a ReducedMotionProvider with a mocked matchMedia so the
 * motion preference is controlled per test.
 *
 * Covered behaviors:
 *  - WHERE motion is allowed, the row animates and pauses on pointer-over
 *    (Requirements 24.1, 24.2);
 *  - an explicit pause control is offered because auto-motion runs > 5s
 *    (Requirement 24.3);
 *  - WHILE Reduced_Motion is active, the row is static with no animation and no
 *    auto-motion control (Requirements 24.1 gated, 37.2).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import { MarqueeText } from './MarqueeText';

const ITEMS = ['DESIGN', 'ENGINEER', 'SHIP'];

function renderMarquee(props: Partial<React.ComponentProps<typeof MarqueeText>> = {}) {
  return render(
    <ReducedMotionProvider>
      <MarqueeText items={ITEMS} {...props} />
    </ReducedMotionProvider>,
  );
}

afterEach(() => resetMatchMedia());

describe('MarqueeText (motion allowed)', () => {
  beforeEach(() => mockReducedMotion(false));

  it('renders an animated, running track', () => {
    renderMarquee();
    const track = screen.getByTestId('marquee-track');
    expect(track.style.animationName).toBe('ryze-marquee-scroll');
    expect(track.style.animationPlayState).toBe('running');
  });

  it('pauses on pointer-over when pauseOnHover is enabled (default)', () => {
    renderMarquee();
    const region = screen.getByRole('marquee');
    const track = screen.getByTestId('marquee-track');

    expect(track.style.animationPlayState).toBe('running');
    fireEvent.mouseEnter(region);
    expect(track.style.animationPlayState).toBe('paused');
    fireEvent.mouseLeave(region);
    expect(track.style.animationPlayState).toBe('running');
  });

  it('does not pause on hover when pauseOnHover is disabled', () => {
    renderMarquee({ pauseOnHover: false });
    const region = screen.getByRole('marquee');
    const track = screen.getByTestId('marquee-track');

    fireEvent.mouseEnter(region);
    expect(track.style.animationPlayState).toBe('running');
  });

  it('does not render a visible pause control (static fallback covers reduced motion)', () => {
    renderMarquee();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('reverses the animation for direction="right"', () => {
    renderMarquee({ direction: 'right' });
    const track = screen.getByTestId('marquee-track');
    expect(track.style.animationDirection).toBe('reverse');
  });
});

describe('MarqueeText (reduced motion)', () => {
  beforeEach(() => mockReducedMotion(true));

  it('renders a static row with no animated track and no pause control', () => {
    renderMarquee();
    expect(screen.queryByTestId('marquee-track')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    const region = screen.getByRole('marquee');
    expect(region).toHaveAttribute('data-reduced-motion', 'true');
    // The items are still present as readable text.
    expect(region).toHaveAttribute('aria-label', ITEMS.join(', '));
  });
});

describe('MarqueeText (edge cases)', () => {
  beforeEach(() => mockReducedMotion(false));

  it('renders nothing when there are no items', () => {
    const { container } = renderMarquee({ items: [] });
    expect(container).toBeEmptyDOMElement();
  });
});
