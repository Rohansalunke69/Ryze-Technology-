/**
 * Unit tests for AnimationWrapper (task 9.2).
 *
 * Verifies the reveal contract that is observable in jsdom:
 *  - under reduced motion the children render immediately in their final
 *    visible state with no IntersectionObserver gating (Requirements 37.2, 25.1);
 *  - with motion allowed the children are present and the wrapper is rendered
 *    so the scroll-reveal can play (Requirement 25.1).
 *
 * AnimationWrapper reads the motion preference via `useReducedMotion`, so every
 * render is wrapped in a `ReducedMotionProvider` with mocked `matchMedia`, and
 * `IntersectionObserver` is stubbed because jsdom does not implement it.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import { AnimationWrapper } from './AnimationWrapper';

/** Shared spy so tests can assert whether an element was ever observed. */
const observeSpy = vi.fn();

/** Minimal IntersectionObserver stub — never reports intersection. */
class MockIntersectionObserver {
  constructor(_callback: IntersectionObserverCallback) {}
  observe = observeSpy;
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

beforeEach(() => {
  observeSpy.mockClear();
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  resetMatchMedia();
  vi.unstubAllGlobals();
});

function renderWrapper(ui: React.ReactNode) {
  return render(<ReducedMotionProvider>{ui}</ReducedMotionProvider>);
}

describe('AnimationWrapper', () => {
  it('renders children immediately in their final state under reduced motion', () => {
    mockReducedMotion(true);
    renderWrapper(
      <AnimationWrapper>
        <p>Revealed content</p>
      </AnimationWrapper>,
    );

    // Content is present synchronously, with no IntersectionObserver gating.
    expect(screen.getByText('Revealed content')).toBeInTheDocument();
    expect(observeSpy).not.toHaveBeenCalled();
  });

  it('renders children when motion is allowed', () => {
    mockReducedMotion(false);
    renderWrapper(
      <AnimationWrapper variant="clip">
        <p>Animated content</p>
      </AnimationWrapper>,
    );

    expect(screen.getByText('Animated content')).toBeInTheDocument();
  });

  it('renders each direct child when stagger is set', () => {
    mockReducedMotion(false);
    renderWrapper(
      <AnimationWrapper stagger={0.1}>
        <span>One</span>
        <span>Two</span>
        <span>Three</span>
      </AnimationWrapper>,
    );

    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByText('Three')).toBeInTheDocument();
  });
});
