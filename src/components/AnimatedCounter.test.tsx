/**
 * Unit tests for AnimatedCounter (task 9.3).
 *
 * Rendered inside a ReducedMotionProvider with mocked `matchMedia`. A stub
 * `IntersectionObserver` reports the element as in view so the counter has the
 * chance to run. The key assertions:
 *  - under reduced motion the counter shows its final value immediately, with
 *    the configured decimals/prefix/suffix (Req 37.2, 21.2);
 *  - prefix and suffix wrap the rendered number.
 *
 * Framework: Vitest + @testing-library/react.
 * Requirements: 21.1, 21.2, 21.3, 37.2
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';

import { AnimatedCounter } from './AnimatedCounter';

/** Minimal IntersectionObserver stub that immediately reports intersection. */
class ImmediateIntersectionObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(target: Element): void {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function renderCounter(ui: React.ReactElement) {
  return render(<ReducedMotionProvider>{ui}</ReducedMotionProvider>);
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', ImmediateIntersectionObserver);
});

afterEach(() => {
  resetMatchMedia();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('AnimatedCounter', () => {
  it('shows the final value immediately under reduced motion (Req 37.2, 21.2)', () => {
    mockReducedMotion(true);
    renderCounter(<AnimatedCounter value={212} />);
    expect(screen.getByText('212')).toBeInTheDocument();
  });

  it('renders the configured decimals, prefix, and suffix', () => {
    mockReducedMotion(true);
    renderCounter(
      <AnimatedCounter value={98.5} decimals={1} prefix="+" suffix="%" />,
    );
    expect(screen.getByText('+98.5%')).toBeInTheDocument();
  });

  it('preserves trailing zeros for the configured precision', () => {
    mockReducedMotion(true);
    renderCounter(<AnimatedCounter value={5} decimals={2} suffix="k" />);
    expect(screen.getByText('5.00k')).toBeInTheDocument();
  });

  it('lands exactly on the target value (Req 21.2)', () => {
    mockReducedMotion(true);
    renderCounter(<AnimatedCounter value={1000} prefix="$" />);
    expect(screen.getByText('$1000')).toBeInTheDocument();
  });
});
