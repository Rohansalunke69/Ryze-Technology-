/**
 * WebGL capability gate for the homepage hero.
 *
 * `canRenderWebGL` is the single decision point that the {@link Hero} uses to
 * decide whether the heavy, lazily-imported R3F scene may mount at all. It is
 * intentionally conservative: it returns `false` whenever the environment is
 * unknown, the platform cannot create a real WebGL2 context, the device looks
 * underpowered, or the user has signalled a desire to save data. When it
 * returns `false` the hero renders only the static fallback (the designed
 * path), so getting this wrong is never a hard failure — at worst we skip the
 * spectacle on a capable device, never crash a weak one.
 *
 * The function is side-effect-light and safe to call during SSR/prerender: it
 * first guards on the presence of `document`/`window` and returns `false`
 * (fallback) when they are absent, so it never throws on the server.
 *
 * Decision order (any failing check short-circuits to `false`):
 *   1. SSR / no DOM            -> false
 *   2. No WebGL2 context       -> false  (Requirement 19.3)
 *   3. cores < minCores        -> false  (Requirement 19.4)
 *   4. deviceMemory < min      -> false  (Requirement 19.4; absence is OK)
 *   5. Save-Data enabled       -> false  (Requirement 19.4)
 *   otherwise                  -> true
 *
 * _Requirements: 19.3, 19.4_
 */

/** Options for tuning the capability thresholds. */
export interface CanRenderWebGLOptions {
  /**
   * Minimum logical CPU cores (`navigator.hardwareConcurrency`) required.
   * Defaults to 4. Devices reporting fewer cores fall back.
   */
  minCores?: number;
  /**
   * Minimum device memory in gigabytes (`navigator.deviceMemory`) required.
   * Defaults to 4. The hint is non-standard and frequently absent; a missing
   * value is treated as acceptable and never causes a fallback on its own.
   */
  minMemoryGB?: number;
}

/** Default lower bound on logical CPU cores. */
const DEFAULT_MIN_CORES = 4;
/** Default lower bound on reported device memory, in gigabytes. */
const DEFAULT_MIN_MEMORY_GB = 4;

/**
 * Attempt to create a throwaway WebGL2 context to verify real GPU support.
 *
 * Some environments expose the `WebGL2RenderingContext` constructor but still
 * fail to produce a context (blocklisted drivers, headless, lost GPU), so we
 * probe an actual off-DOM canvas rather than trusting feature detection. The
 * whole probe is wrapped in try/catch because `getContext` can throw in hostile
 * environments. The canvas is never attached to the document, so it is GC'd.
 *
 * @returns `true` only when a non-null WebGL2 context was obtained.
 */
function hasWebGL2Context(): boolean {
  try {
    const canvas = document.createElement('canvas');
    // `getContext` may be undefined on a stubbed element; guard before calling.
    if (typeof canvas.getContext !== 'function') {
      return false;
    }
    const gl = canvas.getContext('webgl2');
    return gl != null;
  } catch {
    // Any throw (security error, out-of-memory, stubbed throw) means "no".
    return false;
  }
}

/**
 * Decide whether the animated WebGL hero may be rendered in this environment.
 *
 * @param opts - Optional capability thresholds. See {@link CanRenderWebGLOptions}.
 * @returns `true` when the environment can and should render WebGL; `false`
 *   when the caller must use the static fallback. Never throws.
 */
export function canRenderWebGL(opts?: CanRenderWebGLOptions): boolean {
  // 1. SSR / non-browser: no DOM means no canvas — render the fallback.
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  const minCores = opts?.minCores ?? DEFAULT_MIN_CORES;
  const minMemoryGB = opts?.minMemoryGB ?? DEFAULT_MIN_MEMORY_GB;

  // 2. A real WebGL2 context must be obtainable (Requirement 19.3).
  if (!hasWebGL2Context()) {
    return false;
  }

  // `navigator` is read defensively; treat a missing navigator as not gating
  // so behaviour stays predictable in minimal test environments.
  const nav: Navigator | undefined =
    typeof navigator === 'undefined' ? undefined : navigator;

  // 3. CPU cores below threshold -> fallback (Requirement 19.4). When the hint
  //    is absent we do not fail solely on its absence.
  const cores = nav?.hardwareConcurrency;
  if (typeof cores === 'number' && cores < minCores) {
    return false;
  }

  // 4. Device memory below threshold -> fallback (Requirement 19.4). The
  //    `deviceMemory` hint is non-standard; its absence is acceptable and must
  //    not, on its own, cause a fallback.
  const deviceMemory = (nav as { deviceMemory?: number } | undefined)
    ?.deviceMemory;
  if (typeof deviceMemory === 'number' && deviceMemory < minMemoryGB) {
    return false;
  }

  // 5. Honour the Save-Data hint: if the user asked to conserve data, skip the
  //    expensive scene (Requirement 19.4).
  const saveData = (
    nav as { connection?: { saveData?: boolean } } | undefined
  )?.connection?.saveData;
  if (saveData === true) {
    return false;
  }

  return true;
}
