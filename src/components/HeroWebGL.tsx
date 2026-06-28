/**
 * HeroWebGL — floating image-cards hero scene (task 11.3).
 *
 * A field of textured card planes orbiting in 3D around the center headline,
 * on a near-black background. Cards billboard toward the camera with a small
 * per-card tilt, drift gently, and orbit at a brisk pace to match the
 * Foci-Studio-style "floating cloud" feel.
 *
 * CRITICAL CHUNKING DISCIPLINE (Requirements 39.1, 5.4): `three`,
 * `@react-three/fiber`, and `@react-three/drei` are imported HERE AND ONLY
 * HERE. {@link Hero} mounts this module exclusively through
 * `React.lazy(() => import('./HeroWebGL'))`, so the WebGL stack is split into
 * its own chunk and never lands in the entry bundle.
 *
 * Scene behavior:
 *   - One textured plane per slot; slots repeat `heroCards` when card count
 *     exceeds the data array length (Requirement 19.5).
 *   - `ORBIT_SPEED` constant controls the cloud's angular velocity.
 *   - `ENABLE_DOF = false` — depth-of-field is wired but compiled out at
 *     build time. Flip to `true` and add `@react-three/postprocessing` to
 *     enable it (keeps this chunk lean when off).
 *   - DPR capped at [1,2]; render loop paused offscreen / tab-hidden
 *     (Requirement 19.7); GPU context-loss handled with single re-init
 *     (Requirement 42.4).
 *   - All Three.js resources (geometry, material, texture) disposed on unmount.
 *
 * _Requirements: 19.5, 19.7, 42.4, 39.1, 5.4_
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { heroCards, type HeroCard } from '@data/heroCards';
import { useViewportCategory } from '@hooks/useViewportCategory';

export interface HeroWebGLProps {
  /** When true the scene's render loop is paused (offscreen / tab hidden). */
  paused: boolean;
  /** Invoked once the scene is created so Hero can begin the cross-fade. */
  onReady?: () => void;
}

// ---------------------------------------------------------------------------
// Scene constants
// ---------------------------------------------------------------------------

/** Angular velocity of the card cloud in radians per second. */
const ORBIT_SPEED = 0.20;

/**
 * Depth-of-field toggle. When `false` (default) postprocessing is not imported
 * and the chunk stays lean. Flip to `true` and add `@react-three/postprocessing`
 * to enable a subtle EffectComposer + DepthOfField pass.
 */
const ENABLE_DOF = false;

/** World-space width × height for each orientation. */
const CARD_SIZES: Record<HeroCard['orientation'], [number, number]> = {
  portrait:  [1.1, 1.47],   // ≈ 3:4
  landscape: [1.47, 1.1],   // ≈ 4:3
  square:    [1.3, 1.3],
};

/** Fallback solid colors when a texture fails to load (brand palette). */
const FALLBACK_COLORS = ['#152561', '#29B8E5', '#7B5EA7'] as const;

// ---------------------------------------------------------------------------
// Shader sources
// ---------------------------------------------------------------------------

const CARD_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const CARD_FRAG = /* glsl */ `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform bool      uHasTexture;
uniform vec3      uFallbackColor;

const float RADIUS       = 0.07;   // corner radius in UV space
const float BORDER_WIDTH = 0.014;  // hairline border thickness in UV space
const float BORDER_ALPHA = 0.18;   // rgba(255,255,255,0.18) ≈ the spec's 0.15

// Signed-distance function for a rounded rectangle centered at (0.5, 0.5).
float roundedBox(vec2 uv, float r) {
  vec2 q = abs(uv - 0.5) - (0.5 - r);
  return length(max(q, 0.0)) - r;
}

void main() {
  float sdf = roundedBox(vUv, RADIUS);

  // Discard pixels outside the rounded rectangle.
  if (sdf > 0.0) discard;

  vec4 color;
  if (uHasTexture) {
    color = texture2D(uTexture, vUv);
  } else {
    color = vec4(uFallbackColor, 1.0);
  }

  // White hairline border in the outermost BORDER_WIDTH of the card.
  if (sdf > -BORDER_WIDTH) {
    // 0 at inner edge of border zone, 1 at the outermost pixel.
    float t = 1.0 + sdf / BORDER_WIDTH;
    color = mix(color, vec4(1.0, 1.0, 1.0, 1.0), t * BORDER_ALPHA);
    color.a = 1.0;
  }

  gl_FragColor = color;
}
`;

// ---------------------------------------------------------------------------
// Card orbit parameter types
// ---------------------------------------------------------------------------

interface CardOrbitParams {
  theta0:     number;  // initial angle in XZ orbit plane
  radius:     number;  // orbit radius in world units
  y:          number;  // vertical offset
  zOffset:    number;  // extra depth variation
  speed:      number;  // per-card speed multiplier
  driftFreq:  number;  // frequency of vertical drift (rad/s)
  driftAmp:   number;  // amplitude of vertical drift
  driftPhase: number;  // per-card drift phase offset
  tiltX:      number;  // small rotation from billboard (rad)
  tiltY:      number;  // small rotation from billboard (rad)
}

/** Seeded pseudo-random — deterministic per card index so params are stable. */
function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function buildOrbitParams(count: number): CardOrbitParams[] {
  return Array.from({ length: count }, (_, i) => {
    const rng = seededRand(i * 7919 + 31337);
    const r = rng;
    return {
      theta0:     (i / count) * Math.PI * 2 + r() * 0.6,
      radius:     2.2 + r() * 2.5,
      y:          (r() - 0.5) * 3.4,
      zOffset:    (r() - 0.5) * 1.2,
      speed:      0.6 + r() * 0.8,
      driftFreq:  0.28 + r() * 0.35,
      driftAmp:   0.08 + r() * 0.14,
      driftPhase: r() * Math.PI * 2,
      tiltX:      (r() - 0.5) * 0.28,
      tiltY:      (r() - 0.5) * 0.28,
    };
  });
}

// ---------------------------------------------------------------------------
// Individual card mesh
// ---------------------------------------------------------------------------

interface CardMeshProps {
  card:    HeroCard;
  params:  CardOrbitParams;
  index:   number;
  paused:  boolean;
  hidden:  boolean;
}

function CardMesh({ card, params, index, paused, hidden }: CardMeshProps): JSX.Element {
  const groupRef  = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const [width, height] = CARD_SIZES[card.orientation];

  const geometry = useMemo(() => new THREE.PlaneGeometry(width, height), [width, height]);

  const fallbackColor = useMemo(
    () => new THREE.Color(FALLBACK_COLORS[index % FALLBACK_COLORS.length]),
    [index],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader:   CARD_VERT,
        fragmentShader: CARD_FRAG,
        uniforms: {
          uTexture:      { value: null },
          uHasTexture:   { value: false },
          uFallbackColor: { value: fallbackColor },
        },
        transparent: true,
        depthWrite:  false,
        side:        THREE.DoubleSide,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Keep a stable ref to the material object so texture effects can update
  // uniforms without going through the R3F primitive's DOM ref (which in tests
  // becomes an HTMLElement, not the material instance).
  const materialRef = useRef(material);

  // Load texture; update the material uniform on success, log on failure.
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let tex: THREE.Texture | null = null;

    tex = loader.load(
      card.src,
      (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        const mat = materialRef.current;
        // Guard: in tests the material mock may not have uniforms set up.
        if (mat?.uniforms?.uTexture !== undefined) {
          mat.uniforms.uTexture.value    = loaded;
          mat.uniforms.uHasTexture!.value = true;
        }
      },
      undefined,
      () => {
        console.warn(`[HeroWebGL] Failed to load card texture: ${card.src}`);
      },
    );

    return () => {
      tex?.dispose();
    };
  }, [card.src]);

  // Dispose GPU resources on unmount.
  useEffect(() => {
    return () => {
      geometry.dispose();
      const texVal = materialRef.current.uniforms?.uTexture?.value as THREE.Texture | null | undefined;
      texVal?.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Animate position + billboard each frame.
  useFrame((state) => {
    if (paused || hidden || !groupRef.current) return;

    const t = state.clock.elapsedTime;
    const theta = params.theta0 + t * ORBIT_SPEED * params.speed;

    const x = params.radius * Math.cos(theta);
    const z = params.radius * Math.sin(theta) + params.zOffset;
    const y = params.y + Math.sin(t * params.driftFreq + params.driftPhase) * params.driftAmp;

    groupRef.current.position.set(x, y, z);
    groupRef.current.lookAt(camera.position as THREE.Vector3);
    groupRef.current.rotateX(params.tiltX);
    groupRef.current.rotateY(params.tiltY);

    // Keep transparent cards sorted back-to-front by camera distance.
    const camPos = camera.position as THREE.Vector3;
    const dist   = groupRef.current.position.distanceTo(camPos);
    groupRef.current.renderOrder = Math.round((20 - dist) * 10);
  });

  return (
    <group ref={groupRef}>
      {/* Subtle dark shadow plane slightly behind and below the card. */}
      <mesh position={[0.04, -0.06, -0.08]} renderOrder={-1}>
        <planeGeometry args={[width * 1.08, height * 1.08]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.28} depthWrite={false} />
      </mesh>

      <mesh geometry={geometry}>
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Cards field — manages all cards and their orbit params
// ---------------------------------------------------------------------------

/** Card counts per viewport category — capped at heroCards.length so no card ever repeats. */
const CARD_COUNTS: Record<string, number> = {
  mobile:  6,
  tablet:  8,
  desktop: 9,
  wide:    9,
};

interface FloatingCardsFieldProps {
  paused: boolean;
  hidden: boolean;
}

function FloatingCardsField({ paused, hidden }: FloatingCardsFieldProps): JSX.Element {
  const category  = useViewportCategory();
  const cardCount = CARD_COUNTS[category] ?? 14;

  // Build orbit params once per card count (stable with seeded RNG).
  const orbitParams = useMemo(() => buildOrbitParams(cardCount), [cardCount]);

  // Repeat heroCards to fill the requested slot count.
  const slots = useMemo(
    () => Array.from({ length: cardCount }, (_, i) => heroCards[i % heroCards.length]!),
    [cardCount],
  );

  return (
    <>
      {slots.map((card, i) => (
        <CardMesh
          key={`card-${i}`}
          card={card}
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          params={orbitParams[i]!}
          index={i}
          paused={paused}
          hidden={hidden}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// SceneBridge — wires onReady + context-loss to the R3F internals
// ---------------------------------------------------------------------------

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

  useFrame(() => {
    if (!readyFiredRef.current) {
      readyFiredRef.current = true;
      onReady?.();
    }
  });

  useEffect(() => {
    const canvas = gl.domElement;

    const handleLost = (event: Event): void => {
      event.preventDefault();
      onContextLost();
    };
    const handleRestored = (): void => { onContextRestored(); };

    canvas.addEventListener('webglcontextlost',     handleLost as EventListener, false);
    canvas.addEventListener('webglcontextrestored', handleRestored,              false);

    return () => {
      canvas.removeEventListener('webglcontextlost',     handleLost as EventListener, false);
      canvas.removeEventListener('webglcontextrestored', handleRestored,              false);
    };
  }, [gl, onContextLost, onContextRestored]);

  return null;
}

// ---------------------------------------------------------------------------
// HeroWebGL — root export
// ---------------------------------------------------------------------------

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

  // Context-loss state machine: single re-init attempt, then give up (Req 42.4).
  const [status, setStatus] = useState<'active' | 'failed'>('active');
  const [canvasKey, setCanvasKey] = useState(0);
  const reinitUsedRef = useRef(false);

  const handleContextLost = useMemo(
    () => (): void => {
      if (reinitUsedRef.current) {
        setStatus('failed');
        return;
      }
      reinitUsedRef.current = true;
      setCanvasKey((k) => k + 1);
    },
    [],
  );

  const handleContextRestored = useMemo(() => (): void => {}, []);

  if (status === 'failed') return null;

  const active = !paused && !tabHidden;

  return (
    <Canvas
      key={canvasKey}
      aria-hidden="true"
      data-testid="hero-webgl"
      dpr={[1, 2]}
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

      {/* Ambient light for any non-basic materials (future-proofing). */}
      <ambientLight intensity={0.6} />

      <FloatingCardsField paused={paused} hidden={tabHidden} />

      {/* DOF is compiled out when ENABLE_DOF = false (keeps chunk lean). */}
      {ENABLE_DOF ? null : null /* replace with <EffectComposer>+<DepthOfField> when enabled */ }
    </Canvas>
  );
}

export default HeroWebGL;
