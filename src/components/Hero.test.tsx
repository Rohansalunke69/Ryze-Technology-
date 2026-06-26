/**
 * Unit tests for Hero (task 11.2).
 *
 * Verifies the capability-gating contract from Requirement 19:
 *  - the static HeroFallback is always rendered first (19.1);
 *  - under reduced motion the hero renders only the fallback and NEVER mounts
 *    a WebGL canvas/scene (19.2);
 *  - when the capability gate returns false the hero renders only the fallback
 *    (19.3, 19.4);
 *  - the composed content (eyebrow, headline, CTA) renders in all cases.
 *
 * Task 11.4 extends this with the WebGL mount path: when motion is allowed, the
 * gate passes, and the hero is in view, the lazily-imported Hero_WebGL mounts
 * and the fallback cross-fades out (19.5, 19.6); the mounted scene is handed
 * paused=false while in view and is never mounted while scrolled out of view,
 * pausing the loop (19.7); and the fallback stays mounted beneath the scene so
 * the hero can swap back to it on a lost WebGL context (42.4, structural).
 *
 * Hero reads the motion preference via `useReducedMotion`, so renders are
 * wrapped in a `ReducedMotionProvider` with mocked `matchMedia`.
 * `canRenderWebGL` is mocked to drive the gate deterministically, and
 * `IntersectionObserver` is stubbed because jsdom does not implement it
 * (`useInView` falls back to `inView === true` when the API is absent, which is
 * the "in view" condition we want for the mount path).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import { canRenderWebGL } from '@lib/canRenderWebGL';
import { Hero } from './Hero';

// Mock the capability gate so we can drive the WebGL decision deterministically.
vi.mock('@lib/canRenderWebGL', () => ({
  canRenderWebGL: vi.fn(() => false),
}));

const mockedCanRenderWebGL = vi.mocked(canRenderWebGL);

/**
 * Records the props every mounted HeroWebGL stub received, so tests can assert
 * the pause-offscreen wiring (Requirement 19.7) without loading the real scene.
 */
const { recordedWebGLProps } = vi.hoisted(() => ({
  recordedWebGLProps: [] as Array<{ paused: boolean }>,
}));

// Replace the lazily-imported animated scene with a controllable, dependency-
// free stub. This keeps `three` / `@react-three/fiber` out of jsdom entirely
// while still letting `React.lazy(() => import('./HeroWebGL'))` resolve, mount,
// and trigger the cross-fade machinery (Requirements 19.5, 19.6). The stub
// records the `paused` prop it is handed (Requirement 19.7).
vi.mock('./HeroWebGL', () => ({
  default: ({ paused }: { paused: boolean }) => {
    recordedWebGLProps.push({ paused });
    return (
      <div
        data-testid="hero-webgl-stub"
        data-paused={paused ? 'true' : 'false'}
      />
    );
  },
}));

/** Minimal IntersectionObserver stub — never reports intersection. */
class MockIntersectionObserver {
  constructor(_callback: IntersectionObserverCallback) {}
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

/**
 * Install a controllable `IntersectionObserver` stub. When `intersecting` is
 * `true` the observer reports the target as in view as soon as it is observed,
 * which (via `useInView`) flips the hero's `inView` to `true` and satisfies the
 * final mount gate (Requirement 19.5). When `false` it never intersects, so the
 * hero stays "scrolled out of view" and the scene is never mounted
 * (Requirement 19.7).
 */
function stubIntersectionObserver(intersecting: boolean): void {
  class ControllableIntersectionObserver {
    private readonly callback: IntersectionObserverCallback;
    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
    }
    observe = (element: Element): void => {
      if (intersecting) {
        this.callback(
          [{ isIntersecting: true, target: element } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      }
    };
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
  }
  vi.stubGlobal('IntersectionObserver', ControllableIntersectionObserver);
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  mockedCanRenderWebGL.mockReturnValue(false);
});

afterEach(() => {
  resetMatchMedia();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  recordedWebGLProps.length = 0;
});

function renderHero(ui: React.ReactNode) {
  return render(<ReducedMotionProvider>{ui}</ReducedMotionProvider>);
}

describe('Hero', () => {
  it('renders the static HeroFallback (Requirement 19.1)', () => {
    mockReducedMotion(false);
    renderHero(<Hero headline="Build products that work forever" />);

    expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
  });

  it('renders headline, eyebrow, and CTA content', () => {
    mockReducedMotion(false);
    renderHero(
      <Hero
        headline="Build products that work forever"
        eyebrow="Ryze Technology"
      />,
    );

    // Headline is exposed as a single accessible name via SplitText's aria-label.
    expect(
      screen.getByLabelText('Build products that work forever'),
    ).toBeInTheDocument();
    // Eyebrow text.
    expect(screen.getByText('Ryze Technology')).toBeInTheDocument();
    // Primary CTA.
    expect(
      screen.getByRole('link', { name: 'Start a project' }),
    ).toBeInTheDocument();
  });

  it('renders only the fallback under reduced motion and never mounts WebGL (Requirement 19.2)', () => {
    mockReducedMotion(true);
    // Even if the gate would pass, reduced motion must suppress WebGL.
    mockedCanRenderWebGL.mockReturnValue(true);

    renderHero(<Hero headline="Reduced motion hero" eyebrow="Ryze" />);

    expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-webgl')).not.toBeInTheDocument();
    // The capability gate should never even be consulted under reduced motion.
    expect(mockedCanRenderWebGL).not.toHaveBeenCalled();
  });

  it('renders only the fallback when the capability gate fails (Requirements 19.3, 19.4)', () => {
    mockReducedMotion(false);
    mockedCanRenderWebGL.mockReturnValue(false);

    renderHero(<Hero headline="Low capability hero" eyebrow="Ryze" />);

    expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-webgl')).not.toBeInTheDocument();
    // Content still renders.
    expect(screen.getByLabelText('Low capability hero')).toBeInTheDocument();
  });
});

describe('Hero WebGL gating, cross-fade, pause, and resilience', () => {
  it('mounts the lazy Hero_WebGL and cross-fades to it when motion is allowed, capable, and in view (Requirements 19.5, 19.6)', async () => {
    mockReducedMotion(false);
    mockedCanRenderWebGL.mockReturnValue(true);
    // Hero is scrolled into view → the final mount gate passes.
    stubIntersectionObserver(true);

    renderHero(<Hero headline="Animated hero" eyebrow="Ryze" />);

    // The lazily-imported scene stub resolves and mounts (Requirement 19.5).
    const scene = await screen.findByTestId('hero-webgl-stub');
    expect(scene).toBeInTheDocument();

    // Cross-fade (Requirement 19.6): once the scene is ready the fallback layer
    // fades out (opacity 0) and the scene layer fades in (opacity 1). The
    // fallback element itself stays in the DOM beneath the scene.
    const fallbackLayer = screen.getByTestId('hero-fallback').parentElement;
    const sceneLayer = scene.parentElement;
    expect(fallbackLayer).not.toBeNull();
    expect(sceneLayer).not.toBeNull();
    expect(fallbackLayer?.style.opacity).toBe('0');
    expect(sceneLayer?.style.opacity).toBe('1');
  });

  it('hands the mounted scene paused=false while in view (Requirement 19.7)', async () => {
    mockReducedMotion(false);
    mockedCanRenderWebGL.mockReturnValue(true);
    stubIntersectionObserver(true);

    renderHero(<Hero headline="In view hero" eyebrow="Ryze" />);

    await screen.findByTestId('hero-webgl-stub');

    // While the hero is in view the render loop runs (paused=false).
    expect(recordedWebGLProps.length).toBeGreaterThan(0);
    expect(recordedWebGLProps.at(-1)?.paused).toBe(false);
    expect(screen.getByTestId('hero-webgl-stub')).toHaveAttribute(
      'data-paused',
      'false',
    );
  });

  it('never mounts the WebGL scene while the hero is scrolled out of view (Requirement 19.7)', () => {
    mockReducedMotion(false);
    mockedCanRenderWebGL.mockReturnValue(true);
    // Out of view → observer never intersects, so the mount gate stays closed.
    stubIntersectionObserver(false);

    renderHero(<Hero headline="Offscreen hero" eyebrow="Ryze" />);

    // The loop is "paused" by virtue of the scene not being mounted at all,
    // and only the static fallback is painted.
    expect(screen.queryByTestId('hero-webgl-stub')).not.toBeInTheDocument();
    expect(recordedWebGLProps).toHaveLength(0);
    expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
  });

  it('keeps the Hero_Fallback mounted beneath the scene so it can swap back on context loss (Requirement 42.4)', async () => {
    mockReducedMotion(false);
    mockedCanRenderWebGL.mockReturnValue(true);
    stubIntersectionObserver(true);

    renderHero(<Hero headline="Resilient hero" eyebrow="Ryze" />);

    await screen.findByTestId('hero-webgl-stub');

    // Even after the animated scene mounts, the static fallback remains in the
    // DOM. Requirement 42.4's recovery path (pause + dispose + swap back to the
    // fallback on a lost/restored context) is owned by Hero_WebGL's own context
    // handlers; structurally the Hero guarantees the fallback is always present
    // to swap to, which this asserts.
    expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
  });
});
