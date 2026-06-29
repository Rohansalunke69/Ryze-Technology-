/**
 * Tests for HeroWebGL floating-cards scene and heroCards data (task 11.3).
 *
 * Two concerns covered here:
 *   1. heroCards data contract — the array has the right shape, count, and
 *      filenames so the scene can build card slots correctly.
 *   2. HeroWebGL mount — the Canvas carries `aria-hidden="true"` and
 *      `data-testid="hero-webgl"`.
 *
 * Three.js + @react-three/fiber are fully mocked — no WebGL context needed.
 * Mocks are declared at module scope (before any import of the SUT) so Vitest's
 * hoisting resolves them first.
 */
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { heroCards } from '@data/heroCards';

// ---------------------------------------------------------------------------
// Module mocks (hoisted before SUT import)
// ---------------------------------------------------------------------------

vi.mock('@react-three/fiber', () => ({
  Canvas: ({
    children,
    'data-testid': testId,
    'aria-hidden': ariaHidden,
  }: {
    children?: React.ReactNode;
    'data-testid'?: string;
    'aria-hidden'?: 'true' | 'false';
    [key: string]: unknown;
  }) => (
    <div data-testid={testId} aria-hidden={ariaHidden}>
      {children}
    </div>
  ),
  useFrame: vi.fn(),
  useThree: vi.fn((selector?: (s: object) => unknown) => {
    const state = {
      gl: {
        domElement: {
          addEventListener:    vi.fn(),
          removeEventListener: vi.fn(),
        },
      },
      camera: { position: { x: 0, y: 0, z: 9 } },
    };
    return typeof selector === 'function' ? selector(state) : state;
  }),
}));

vi.mock('three', () => {
  const disposeFn = vi.fn();

  class TextureLoaderMock {
    load(_src: string, onLoad: (t: object) => void) {
      const tex = { colorSpace: '', dispose: disposeFn };
      onLoad(tex);
      return tex;
    }
  }

  class PlaneGeometryMock {
    dispose = vi.fn();
    setAttribute = vi.fn();
  }

  class ShaderMaterialMock {
    uniforms = {
      uTexture:       { value: null },
      uHasTexture:    { value: false },
      uFallbackColor: { value: {} },
    };
    dispose     = vi.fn();
    needsUpdate = false;
    transparent = false;
    depthWrite  = false;
    side        = 0;
  }

  class MeshBasicMaterialMock {
    dispose    = vi.fn();
    color      = {};
    transparent = false;
    opacity     = 1;
    depthWrite  = false;
  }

  class ColorMock {
    r = 0; g = 0; b = 0;
  }

  return {
    TextureLoader:     TextureLoaderMock,
    PlaneGeometry:     PlaneGeometryMock,
    ShaderMaterial:    ShaderMaterialMock,
    MeshBasicMaterial: MeshBasicMaterialMock,
    Color:             ColorMock,
    SRGBColorSpace:    'srgb',
    DoubleSide:        2,
    Group:             class GroupMock {},
    Vector3:           class Vector3Mock { distanceTo = vi.fn(() => 5); },
  };
});

vi.mock('@hooks/useViewportCategory', () => ({
  useViewportCategory: vi.fn(() => 'desktop'),
}));

// Import SUT after mocks are registered.
import { HeroWebGL } from './HeroWebGL';

afterEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// heroCards data contract
// ---------------------------------------------------------------------------

describe('heroCards data', () => {
  it('exports exactly 9 entries', () => {
    expect(heroCards).toHaveLength(9);
  });

  it('every card has a non-empty src, alt, and valid orientation', () => {
    const validOrientations = new Set(['portrait', 'landscape', 'square']);
    for (const card of heroCards) {
      expect(card.src.length).toBeGreaterThan(0);
      expect(card.alt.length).toBeGreaterThan(0);
      expect(validOrientations.has(card.orientation)).toBe(true);
    }
  });

  it('all src paths start with /images/hero/', () => {
    for (const card of heroCards) {
      expect(card.src).toMatch(/^\/images\/hero\//);
    }
  });

  it('contains all 9 expected image files', () => {
    const filenames = heroCards.map((c) => c.src.split('/').pop());
    expect(filenames).toContain('search-ai.jpg');
    expect(filenames).toContain('strategic-ads.webp');
    expect(filenames).toContain('social-marketing.jpg');
    expect(filenames).toContain('dev-design.jpg');
    expect(filenames).toContain('editorial-tech.jpg');
    expect(filenames).toContain('brand-glowup.jpg');
    expect(filenames).toContain('developers.jpg');
    expect(filenames).toContain('social-collage.jpg');
    expect(filenames).toContain('stopwatch-collab.png');
  });

  it('heroCards drives slot repeat — 14 desktop slots cycle the 9-card array', () => {
    const DESKTOP_COUNT = 14;
    const slots = Array.from(
      { length: DESKTOP_COUNT },
      (_, i) => heroCards[i % heroCards.length],
    );
    expect(slots).toHaveLength(DESKTOP_COUNT);
    // First 9 slots match the data array in order.
    heroCards.forEach((card, i) => {
      expect(slots[i]).toBe(card);
    });
    // Remaining 5 slots repeat from the start.
    for (let i = 0; i < DESKTOP_COUNT - heroCards.length; i++) {
      expect(slots[heroCards.length + i]).toBe(heroCards[i]);
    }
  });
});

// ---------------------------------------------------------------------------
// HeroWebGL mount
// ---------------------------------------------------------------------------

describe('HeroWebGL', () => {
  it('renders a Canvas element with aria-hidden="true" and data-testid="hero-webgl"', () => {
    render(<HeroWebGL paused={false} />);

    const canvas = screen.getByTestId('hero-webgl');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
  });

  it('mounts without crashing when paused=true', () => {
    const { container } = render(<HeroWebGL paused={true} />);
    expect(container.firstChild).not.toBeNull();
  });
});
