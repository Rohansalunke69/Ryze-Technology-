/**
 * Unit tests for the WebGL capability gate.
 *
 * These are example-based tests (not property-based): per the design, WebGL
 * support detection is environment-driven I/O, so it is validated by simulating
 * specific browser conditions rather than across a generated input space.
 *
 * We mock the relevant browser surfaces — `navigator.hardwareConcurrency`,
 * `navigator.deviceMemory`, `navigator.connection`, and
 * `HTMLCanvasElement.prototype.getContext` — to drive each branch of the gate.
 *
 * Framework: Vitest.
 * Requirements: 19.3, 19.4
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { canRenderWebGL } from './canRenderWebGL';

/** A minimal stand-in for a WebGL2 context; identity is all the gate checks. */
const fakeGl = {} as WebGL2RenderingContext;

/**
 * Install a `getContext` mock on the canvas prototype.
 *
 * @param result - what `getContext('webgl2')` should return (`fakeGl` or null).
 */
function mockGetContext(result: WebGL2RenderingContext | null): void {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    ((contextId: string) =>
      contextId === 'webgl2' ? result : null) as typeof HTMLCanvasElement.prototype.getContext,
  );
}

/**
 * Override a property on `navigator` for the duration of a test. jsdom's
 * navigator properties are configurable getters, so we redefine them and rely
 * on `vi.unstubAllGlobals`/manual restore via `afterEach`.
 */
function setNavigatorProp(prop: string, value: unknown): void {
  Object.defineProperty(navigator, prop, {
    value,
    configurable: true,
    writable: true,
  });
}

describe('canRenderWebGL', () => {
  beforeEach(() => {
    // A capable baseline: WebGL2 present, 8 cores, 8 GB, no save-data.
    mockGetContext(fakeGl);
    setNavigatorProp('hardwareConcurrency', 8);
    setNavigatorProp('deviceMemory', 8);
    setNavigatorProp('connection', { saveData: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when WebGL2 is available and capability is good', () => {
    expect(canRenderWebGL()).toBe(true);
  });

  it('returns false when a WebGL2 context cannot be created (Req 19.3)', () => {
    mockGetContext(null);
    expect(canRenderWebGL()).toBe(false);
  });

  it('returns false when getContext throws (defensive)', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      throw new Error('context creation blocked');
    });
    expect(canRenderWebGL()).toBe(false);
  });

  it('returns false when cores are below the threshold (Req 19.4)', () => {
    setNavigatorProp('hardwareConcurrency', 2);
    expect(canRenderWebGL()).toBe(false);
  });

  it('returns false when reported memory is below the threshold (Req 19.4)', () => {
    setNavigatorProp('deviceMemory', 2);
    expect(canRenderWebGL()).toBe(false);
  });

  it('returns false when Save-Data is enabled (Req 19.4)', () => {
    setNavigatorProp('connection', { saveData: true });
    expect(canRenderWebGL()).toBe(false);
  });

  it('does not fall back solely because deviceMemory is absent', () => {
    setNavigatorProp('deviceMemory', undefined);
    expect(canRenderWebGL()).toBe(true);
  });

  it('respects custom thresholds via opts', () => {
    setNavigatorProp('hardwareConcurrency', 6);
    expect(canRenderWebGL({ minCores: 8 })).toBe(false);
    expect(canRenderWebGL({ minCores: 4 })).toBe(true);
  });
});
