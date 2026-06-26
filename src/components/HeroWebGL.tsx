/**
 * HeroWebGL — the real lazily-imported animated hero scene (task 11.3).
 *
 * This module is the WebGL signature of "Engineered Permanence": a field of a
 * few thousand points that begins as chaotic noise and organizes itself into a
 * stable, ordered lattice over time. It is the heavy, optional counterpart to
 * {@link HeroFallback}; {@link Hero} cross-fades to it once it is ready.
 *
 * CRITICAL CHUNKING DISCIPLINE (Requirements 39.1, 5.4): `three`,
 * `@react-three/fiber`, and `@react-three/drei` are imported HERE AND ONLY
 * HERE. {@link Hero} mounts this module exclusively through
 * `React.lazy(() => import('./HeroWebGL'))`, so the WebGL stack is split into
 * its own chunk and never lands in the entry bundle. Never import three /
 * react-three from Hero, HeroFallback, or anything reachable from the entry
 * graph — doing so makes the bundle-budget guard (`npm run budget`) fail.
 *
 * Behavior implemented here:
 *   - Caps device-pixel-ratio at 2 (`dpr={[1, 2]}`) for fill-rate sanity on
 *     high-density displays (Rendering & Performance).
 *   - Pauses the render loop when the `paused` prop is set (Hero passes
 *     `paused` when the hero scrolls offscreen) OR when the browser tab is
 *     hidden, via `frameloop` plus a `useFrame` early-return guard
 *     (Requirement 19.7).
 *   - Survives GPU context loss: on `webglcontextlost` it prevents the default
 *     (so the browser will try to restore), pauses, and disposes; it makes a
 *     SINGLE re-init attempt by remounting the canvas, and if the context is
 *     lost again it gives up and renders nothing so Hero keeps the fallback
 *     (Requirement 42.4).
 *   - Calls `onReady` once the scene has been created / first frame rendered so
 *     Hero can begin its cross-fade (Requirement 19.5/19.6).
 *
 * _Requirements: 19.5, 19.7, 42.4, 39.1, 5.4_
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface HeroWebGLProps {
  /** When true the scene's render loop is paused (offscreen / tab hidden). */
  paused: boolean;
  /** Invoked once the scene is created so Hero can begin the cross-fade. */
  onReady?: () => void;
}

/** Number of lattice cells per axis; total points = LATTICE_SIDE³. */
const LATTICE_SIDE = 16;
/** Total animated points (4096 — a "few thousand", cheap for a points cloud). */
const POINT_COUNT = LATTICE_SIDE * LATTICE_SIDE * LATTICE_SIDE;
/** Half-extent of the ordered lattice in world units. */
const LATTICE_HALF = 2.2;
/** Radius of the initial chaotic scatter shell. */
const SCATTER_RADIUS = 7;
/** Seconds for the noise→lattice organization to complete. */
const ORGANIZE_DURATION = 7;

/** easeInOutQuint — slow start, slow settle; matches the "permanence" feel. */
function easeInOutQuint(t: number): number {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

/**
 * The animated points field. Owns a single BufferGeometry whose position
 * attribute is lerped every frame from a chaotic scatter toward an ordered
 * lattice. Created imperatively (rather than via JSX children) so the geometry
 * and material lifetimes are explicit and disposed on unmount.
 */
function PointField({
  paused,
  hidden,
}: {
  paused: boolean;
  hidden: boolean;
}): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);

  // Precompute the chaotic start, ordered target, and the live position buffer.
  const { geometry, material, start, target, positions } = useMemo(() => {
    const start = new Float32Array(POINT_COUNT * 3);
    const target = new Float32Array(POINT_COUNT * 3);
    const positions = new Float32Array(POINT_COUNT * 3);

    let i = 0;
    for (let x = 0; x < LATTICE_SIDE; x += 1) {
      for (let y = 0; y < LATTICE_SIDE; y += 1) {
        for (let z = 0; z < LATTICE_SIDE; z += 1) {
          const o = i * 3;

          // Ordered lattice target: evenly spaced grid centered on the origin.
          const step = (LATTICE_HALF * 2) / (LATTICE_SIDE - 1);
          target[o] = -LATTICE_HALF + x * step;
          target[o + 1] = -LATTICE_HALF + y * step;
          target[o + 2] = -LATTICE_HALF + z * step;

          // Chaotic start: random point on a jittered sphere shell.
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = SCATTER_RADIUS * (0.6 + Math.random() * 0.4);
          start[o] = r * Math.sin(phi) * Math.cos(theta);
          start[o + 1] = r * Math.sin(phi) * Math.sin(theta);
          start[o + 2] = r * Math.cos(phi);

          // Seed the live buffer at the scattered position.
          positions[o] = start[o] as number;
          positions[o + 1] = start[o + 1] as number;
          positions[o + 2] = start[o + 2] as number;

          i += 1;
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      // Pulse cyan from the design token palette.
      color: new THREE.Color('#22d3ee'),
      size: 0.035,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry, material, start, target, positions };
  }, []);

  // Dispose GPU resources when the field unmounts (or is remounted on re-init).
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state, delta) => {
    // Respect the pause signals (Requirement 19.7). frameloop already stops the
    // loop, but guard here too so a trailing frame can't advance the animation.
    if (paused || hidden) return;

    elapsedRef.current += delta;
    const progress = Math.min(elapsedRef.current / ORGANIZE_DURATION, 1);
    const eased = easeInOutQuint(progress);

    // Residual turbulence that fades out as the lattice locks in, so the field
    // keeps shimmering early and goes still once "engineered".
    const turbulence = (1 - eased) * 0.6;
    const t = state.clock.elapsedTime;

    const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let p = 0; p < POINT_COUNT; p += 1) {
      const o = p * 3;
      const sx = start[o] as number;
      const sy = start[o + 1] as number;
      const sz = start[o + 2] as number;
      const tx = target[o] as number;
      const ty = target[o + 1] as number;
      const tz = target[o + 2] as number;

      const wobble = turbulence * Math.sin(t * 1.5 + p);
      positions[o] = sx + (tx - sx) * eased + wobble;
      positions[o + 1] = sy + (ty - sy) * eased + wobble * 0.8;
      positions[o + 2] = sz + (tz - sz) * eased + wobble * 0.6;
    }
    attr.needsUpdate = true;

    // Subtle continuous rotation plus a gentle pointer parallax.
    const group = groupRef.current;
    if (group) {
      group.rotation.y += delta * 0.08;
      const targetRotX = state.pointer.y * 0.18;
      const targetRotZ = state.pointer.x * 0.12;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.05;
      group.rotation.z += (targetRotZ - group.rotation.z) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry} material={material} />
    </group>
  );
}

/**
 * Bridges into the R3F render state to (a) fire `onReady` after the first
 * committed frame and (b) wire GPU context-loss / restore handling onto the
 * actual canvas element (Requirement 42.4).
 */
function SceneBridge({
  onReady,
  onContextLost,
  onContextRestored,
}: {
  onReady?: () => void;
  onContextLost: () => void;
  onContextRestored: () => void;
}): null {
  const gl = useThree((s) => s.gl);
  const readyFiredRef = useRef(false);

  // Fire onReady exactly once, after the first frame has actually rendered.
  useFrame(() => {
    if (!readyFiredRef.current) {
      readyFiredRef.current = true;
      onReady?.();
    }
  });

  useEffect(() => {
    const canvas = gl.domElement;

    const handleLost = (event: Event): void => {
      // Prevent the default so the browser will attempt to restore the context
      // and fire `webglcontextrestored` rather than killing it permanently.
      event.preventDefault();
      onContextLost();
    };
    const handleRestored = (): void => {
      onContextRestored();
    };

    canvas.addEventListener('webglcontextlost', handleLost as EventListener, false);
    canvas.addEventListener('webglcontextrestored', handleRestored, false);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleLost as EventListener, false);
      canvas.removeEventListener('webglcontextrestored', handleRestored, false);
    };
  }, [gl, onContextLost, onContextRestored]);

  return null;
}

export function HeroWebGL({ paused, onReady }: HeroWebGLProps): JSX.Element | null {
  // Pause when the tab is hidden (Requirement 19.7).
  const [tabHidden, setTabHidden] = useState(
    typeof document !== 'undefined' ? document.hidden : false,
  );
  useEffect(() => {
    const onVisibility = (): void => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Context-loss state machine: 'active' → (lost) → remount once → 'failed'.
  const [status, setStatus] = useState<'active' | 'failed'>('active');
  const [canvasKey, setCanvasKey] = useState(0);
  const reinitUsedRef = useRef(false);
  const lostRef = useRef(false);

  const handleContextLost = useMemo(
    () => (): void => {
      lostRef.current = true;
      if (reinitUsedRef.current) {
        // Already spent our single re-init attempt — give up so Hero keeps the
        // fallback (Requirement 42.4).
        setStatus('failed');
        return;
      }
      // Spend the single re-init attempt by remounting the Canvas, which builds
      // a fresh GL context and scene.
      reinitUsedRef.current = true;
      setCanvasKey((k) => k + 1);
    },
    [],
  );

  const handleContextRestored = useMemo(
    () => (): void => {
      lostRef.current = false;
    },
    [],
  );

  if (status === 'failed') {
    // Render nothing; Hero keeps showing the static fallback.
    return null;
  }

  const active = !paused && !tabHidden;

  return (
    <Canvas
      key={canvasKey}
      aria-hidden="true"
      data-testid="hero-webgl"
      // Cap DPR at 2 to bound fill rate on high-density displays.
      dpr={[1, 2]}
      // Pause the loop entirely when offscreen / hidden (Requirement 19.7).
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 9], fov: 55 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      <SceneBridge
        {...(onReady ? { onReady } : {})}
        onContextLost={handleContextLost}
        onContextRestored={handleContextRestored}
      />
      <PointField paused={paused} hidden={tabHidden} />
    </Canvas>
  );
}

export default HeroWebGL;
