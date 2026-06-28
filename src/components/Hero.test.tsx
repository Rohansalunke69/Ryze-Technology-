/**
 * Unit tests for Hero (task 11.2).
 *
 * Verifies the capability-gating contract from Requirement 19:
 *  - the static HeroFallback is always rendered first (19.1);
 *  - under reduced motion the hero renders only the fallback and NEVER mounts
 *    a WebGL canvas/scene (19.2);
 *  - when the capability gate returns false the hero renders only the fallback
 *    (19.3, 19.4);
 *  - the composed content (headline, subtitle, CTA) renders in all cases.
 *
 * Task 11.4 extends this with the WebGL mount path: when motion is allowed, the
 * gate passes, and the hero is in view, the lazily-imported HeroWebGL mounts
 * and the fallback cross-fades out (19.5, 19.6); the mounted scene is handed
 * paused=false while in view and is never mounted while scrolled out of view,
 * pausing the loop (19.7); and the fallback stays mounted beneath the scene so
 * the hero can swap back to it on a lost WebGL context (42.4, structural).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { mockReducedMotion, resetMatchMedia } from '@/test/matchMedia';
import { canRenderWebGL } from '@lib/canRenderWebGL';
import { Hero } from './Hero';

vi.mock('@lib/canRenderWebGL', () => ({
  canRenderWebGL: vi.fn(() => false),
}));

const mockedCanRenderWebGL = vi.mocked(canRenderWebGL);

const { recordedWebGLProps } = vi.hoisted(() => ({
  recordedWebGLProps: [] as Array<{ paused: boolean }>,
}));

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

class MockIntersectionObserver {
  constructor(_callback: IntersectionObserverCallback) {}
  observe   = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

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
    unobserve   = vi.fn();
    disconnect  = vi.fn();
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
    renderHero(<Hero headline="Design. Develop. Grow." />);
    expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
  });

  it('renders headline and CTA content', () => {
    mockReducedMotion(false);
    renderHero(<Hero headline="Design. Develop. Grow." />);

    expect(screen.getByRole('heading', { level: 1, name: 'Design. Develop. Grow.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /get in touch/i })).toBeInTheDocument();
  });

  it('renders only the fallback under reduced motion and never mounts WebGL (Requirement 19.2)', () => {
    mockReducedMotion(true);
    mockedCanRenderWebGL.mockReturnValue(true);

    renderHero(<Hero headline="Design. Develop. Grow." />);

    expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-webgl')).not.toBeInTheDocument();
    expect(mockedCanRenderWebGL).not.toHaveBeenCalled();
  });

  it('renders only the fallback when the capability gate fails (Requirements 19.3, 19.4)', () => {
    mockReducedMotion(false);
    mockedCanRenderWebGL.mockReturnValue(false);

    renderHero(<Hero headline="Low capability hero" />);

    expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('hero-webgl')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Low capability hero' })).toBeInTheDocument();
  });
});

describe('Hero WebGL gating, cross-fade, pause, and resilience', () => {
  it('mounts the lazy HeroWebGL and cross-fades to it when motion is allowed, capable, and in view (Requirements 19.5, 19.6)', async () => {
    mockReducedMotion(false);
    mockedCanRenderWebGL.mockReturnValue(true);
    stubIntersectionObserver(true);

    renderHero(<Hero headline="Animated hero" />);

    const scene = await screen.findByTestId('hero-webgl-stub');
    expect(scene).toBeInTheDocument();

    const fallbackLayer = screen.getByTestId('hero-fallback').parentElement;
    const sceneLayer    = scene.parentElement;
    expect(fallbackLayer).not.toBeNull();
    expect(sceneLayer).not.toBeNull();
    expect(fallbackLayer?.style.opacity).toBe('0');
    expect(sceneLayer?.style.opacity).toBe('1');
  });

  it('hands the mounted scene paused=false while in view (Requirement 19.7)', async () => {
    mockReducedMotion(false);
    mockedCanRenderWebGL.mockReturnValue(true);
    stubIntersectionObserver(true);

    renderHero(<Hero headline="In view hero" />);

    await screen.findByTestId('hero-webgl-stub');

    expect(recordedWebGLProps.length).toBeGreaterThan(0);
    expect(recordedWebGLProps.at(-1)?.paused).toBe(false);
    expect(screen.getByTestId('hero-webgl-stub')).toHaveAttribute('data-paused', 'false');
  });

  it('never mounts the WebGL scene while the hero is scrolled out of view (Requirement 19.7)', () => {
    mockReducedMotion(false);
    mockedCanRenderWebGL.mockReturnValue(true);
    stubIntersectionObserver(false);

    renderHero(<Hero headline="Offscreen hero" />);

    expect(screen.queryByTestId('hero-webgl-stub')).not.toBeInTheDocument();
    expect(recordedWebGLProps).toHaveLength(0);
    expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
  });

  it('keeps the HeroFallback mounted beneath the scene so it can swap back on context loss (Requirement 42.4)', async () => {
    mockReducedMotion(false);
    mockedCanRenderWebGL.mockReturnValue(true);
    stubIntersectionObserver(true);

    renderHero(<Hero headline="Resilient hero" />);

    await screen.findByTestId('hero-webgl-stub');

    expect(screen.getByTestId('hero-fallback')).toBeInTheDocument();
  });
});
