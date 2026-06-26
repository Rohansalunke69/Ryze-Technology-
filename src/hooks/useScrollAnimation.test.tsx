/**
 * Tests for the useScrollAnimation hook.
 *
 * GSAP is mocked so we can assert the contract without a real animation engine:
 * `setup` runs inside a scoped `gsap.context`, receives the `reducedMotion`
 * flag, and the context is reverted on unmount (Requirement 20.4).
 *
 * Framework: Vitest + @testing-library/react.
 * Requirements: 20.4
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { ReducedMotionContext } from '@providers/ReducedMotionProvider';

const mocks = vi.hoisted(() => {
  const revert = vi.fn();
  const context = vi.fn((fn: () => void, _scope?: unknown) => {
    fn();
    return { revert };
  });
  const registerPlugin = vi.fn();
  return { revert, context, registerPlugin };
});

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: mocks.registerPlugin,
    context: mocks.context,
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { __isScrollTrigger: true } }));

import { useScrollAnimation } from './useScrollAnimation';

/** Wrap the hook in a reduced-motion context with the given preference. */
function makeWrapper(reducedMotion: boolean) {
  return function Wrapper({ children }: { children: ReactNode }): JSX.Element {
    return (
      <ReducedMotionContext.Provider value={reducedMotion}>
        {children}
      </ReducedMotionContext.Provider>
    );
  };
}

describe('useScrollAnimation', () => {
  beforeEach(() => {
    mocks.revert.mockClear();
    mocks.context.mockClear();
  });

  it('registers the ScrollTrigger plugin lazily when first used', () => {
    const element = document.createElement('div');
    renderHook(
      () => {
        const ref = useScrollAnimation(() => {});
        if (ref.current === null) {
          // @ts-expect-error -- test wiring of the ref
          ref.current = element;
        }
        return ref;
      },
      { wrapper: makeWrapper(false) },
    );
    expect(mocks.registerPlugin).toHaveBeenCalled();
  });

  it('runs setup inside a scoped gsap.context with the reducedMotion flag', () => {
    const element = document.createElement('div');
    const setup = vi.fn();

    renderHook(
      () => {
        const ref = useScrollAnimation(setup);
        if (ref.current === null) {
          // @ts-expect-error -- test wiring of the ref
          ref.current = element;
        }
        return ref;
      },
      { wrapper: makeWrapper(false) },
    );

    expect(mocks.context).toHaveBeenCalledTimes(1);
    // Scoped to the element.
    expect(mocks.context.mock.calls[0]?.[1]).toBe(element);
    expect(setup).toHaveBeenCalledTimes(1);

    const ctxArg = setup.mock.calls[0]?.[0] as { el: HTMLElement; reducedMotion: boolean };
    expect(ctxArg.el).toBe(element);
    expect(ctxArg.reducedMotion).toBe(false);
  });

  it('passes reducedMotion=true through to setup when the preference is set', () => {
    const element = document.createElement('div');
    const setup = vi.fn();

    renderHook(
      () => {
        const ref = useScrollAnimation(setup);
        if (ref.current === null) {
          // @ts-expect-error -- test wiring of the ref
          ref.current = element;
        }
        return ref;
      },
      { wrapper: makeWrapper(true) },
    );

    const ctxArg = setup.mock.calls[0]?.[0] as { reducedMotion: boolean };
    expect(ctxArg.reducedMotion).toBe(true);
  });

  it('reverts the context on unmount so all animations are killed', () => {
    const element = document.createElement('div');

    const { unmount } = renderHook(
      () => {
        const ref = useScrollAnimation(() => {});
        if (ref.current === null) {
          // @ts-expect-error -- test wiring of the ref
          ref.current = element;
        }
        return ref;
      },
      { wrapper: makeWrapper(false) },
    );

    expect(mocks.revert).not.toHaveBeenCalled();
    unmount();
    expect(mocks.revert).toHaveBeenCalledTimes(1);
  });

  it('does not create a context when no element is attached', () => {
    renderHook(() => useScrollAnimation(() => {}), { wrapper: makeWrapper(false) });
    expect(mocks.context).not.toHaveBeenCalled();
  });
});
