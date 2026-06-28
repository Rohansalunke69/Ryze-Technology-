/**
 * CapabilityScene — original animated SVG illustrations of the studio at work.
 *
 * Each scene is a small "device doing something" loop that literally shows what
 * Ryze builds: a browser laying out a page, a phone assembling its UI, a
 * dashboard plotting data, and an automation pipeline moving packets between
 * services. The motion is pure CSS (classes defined in index.css) so it is
 * GPU-friendly and fully frozen under `prefers-reduced-motion` by the global
 * guard — the illustration stays legible as a static frame.
 *
 * All artwork is original vector work in the Ryze brand palette (paper screens,
 * ink frames, cobalt-blue content). Decorative, so the root SVG is aria-hidden
 * and the parent supplies the accessible label.
 */
export type CapabilityKind =
  | 'development'
  | 'design'
  | 'digital-marketing'
  | 'sales-strategy'
  | 'maintenance-support';

export interface CapabilitySceneProps {
  kind: CapabilityKind;
  className?: string;
}

const INK = '#0a0a08';
const PAPER = '#f3f1ea';
const BLUE = '#2156c9';
const BLUE_LT = '#5b93f0';
const LINE = '#cbc8bc';

/** A browser window that lays out its page on a loop. */
function WebsiteScene(): JSX.Element {
  return (
    <g>
      <rect x="40" y="34" width="240" height="150" rx="10" fill={PAPER} stroke={LINE} strokeWidth="2" />
      {/* top bar */}
      <rect x="40" y="34" width="240" height="22" rx="10" fill="#ffffff" stroke={LINE} strokeWidth="2" />
      <circle cx="56" cy="45" r="3" fill={BLUE} />
      <circle cx="68" cy="45" r="3" fill={LINE} />
      <circle cx="80" cy="45" r="3" fill={LINE} />
      {/* hero block */}
      <rect x="56" y="68" width="120" height="14" rx="3" fill={BLUE} className="scene-grow" style={{ animationDelay: '0s' }} />
      <rect x="56" y="90" width="200" height="8" rx="3" fill={LINE} className="scene-grow" style={{ animationDelay: '0.25s' }} />
      <rect x="56" y="104" width="170" height="8" rx="3" fill={LINE} className="scene-grow" style={{ animationDelay: '0.4s' }} />
      {/* cards */}
      <rect x="56" y="126" width="60" height="42" rx="6" fill="none" stroke={BLUE_LT} strokeWidth="2" className="scene-grow" style={{ animationDelay: '0.6s' }} />
      <rect x="126" y="126" width="60" height="42" rx="6" fill="none" stroke={BLUE_LT} strokeWidth="2" className="scene-grow" style={{ animationDelay: '0.75s' }} />
      <rect x="196" y="126" width="60" height="42" rx="6" fill="none" stroke={BLUE_LT} strokeWidth="2" className="scene-grow" style={{ animationDelay: '0.9s' }} />
      {/* caret */}
      <rect x="180" y="68" width="3" height="14" fill={INK} className="scene-blink" />
    </g>
  );
}

/** A phone that pops its UI into place on a loop. */
function MobileScene(): JSX.Element {
  return (
    <g>
      <rect x="120" y="24" width="80" height="160" rx="16" fill={PAPER} stroke={INK} strokeWidth="2.5" />
      <rect x="146" y="30" width="28" height="5" rx="2.5" fill={LINE} />
      {/* status / header */}
      <rect x="132" y="46" width="56" height="30" rx="6" fill={BLUE} className="scene-grow" style={{ animationDelay: '0s' }} />
      {/* list rows */}
      <rect x="132" y="84" width="56" height="10" rx="3" fill={LINE} className="scene-rise" style={{ animationDelay: '0.3s' }} />
      <rect x="132" y="100" width="56" height="10" rx="3" fill={LINE} className="scene-rise" style={{ animationDelay: '0.45s' }} />
      <rect x="132" y="116" width="56" height="10" rx="3" fill={LINE} className="scene-rise" style={{ animationDelay: '0.6s' }} />
      {/* button */}
      <rect x="132" y="150" width="56" height="20" rx="10" fill="none" stroke={BLUE_LT} strokeWidth="2" className="scene-grow" style={{ animationDelay: '0.8s' }} />
    </g>
  );
}

/** A desktop dashboard that plots a chart on a loop. */
function DesktopScene(): JSX.Element {
  return (
    <g>
      <rect x="34" y="40" width="252" height="130" rx="8" fill={PAPER} stroke={LINE} strokeWidth="2" />
      <rect x="34" y="40" width="64" height="130" rx="8" fill="#ffffff" stroke={LINE} strokeWidth="2" />
      <rect x="46" y="56" width="40" height="7" rx="3" fill={BLUE} />
      <rect x="46" y="70" width="40" height="6" rx="3" fill={LINE} />
      <rect x="46" y="82" width="40" height="6" rx="3" fill={LINE} />
      {/* chart bars */}
      <rect x="118" y="96" width="20" height="56" rx="3" fill={BLUE} className="scene-rise" style={{ animationDelay: '0s' }} />
      <rect x="148" y="96" width="20" height="56" rx="3" fill={BLUE_LT} className="scene-rise" style={{ animationDelay: '0.2s' }} />
      <rect x="178" y="96" width="20" height="56" rx="3" fill={BLUE} className="scene-rise" style={{ animationDelay: '0.4s' }} />
      <rect x="208" y="96" width="20" height="56" rx="3" fill={BLUE_LT} className="scene-rise" style={{ animationDelay: '0.6s' }} />
      <rect x="238" y="96" width="20" height="56" rx="3" fill={BLUE} className="scene-rise" style={{ animationDelay: '0.8s' }} />
      {/* trend line */}
      <path d="M118 92 L158 80 L198 86 L238 64" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" style={{ ['--dash' as string]: 170 }} className="scene-draw" />
      <rect x="118" y="62" width="40" height="7" rx="3" fill={INK} />
    </g>
  );
}

/** An automation pipeline moving packets between services on a loop. */
function SystemsScene(): JSX.Element {
  return (
    <g>
      {/* nodes */}
      <rect x="40" y="86" width="48" height="36" rx="8" fill="#ffffff" stroke={INK} strokeWidth="2" />
      <rect x="136" y="44" width="48" height="36" rx="8" fill="#ffffff" stroke={INK} strokeWidth="2" />
      <rect x="136" y="128" width="48" height="36" rx="8" fill="#ffffff" stroke={INK} strokeWidth="2" />
      <rect x="232" y="86" width="48" height="36" rx="8" fill={BLUE} />
      {/* connectors */}
      <path id="pipe-a" d="M88 104 C112 104 112 62 136 62" fill="none" stroke={LINE} strokeWidth="2" />
      <path id="pipe-b" d="M88 104 C112 104 112 146 136 146" fill="none" stroke={LINE} strokeWidth="2" />
      <path d="M184 62 C208 62 208 104 232 104" fill="none" stroke={LINE} strokeWidth="2" />
      <path d="M184 146 C208 146 208 104 232 104" fill="none" stroke={LINE} strokeWidth="2" />
      {/* gears in the destination node */}
      <g transform="translate(256 104)">
        <circle r="9" fill="none" stroke={PAPER} strokeWidth="2" className="scene-spin" />
        <circle r="3.5" fill={PAPER} />
      </g>
      {/* traveling packets */}
      <circle r="4" fill={BLUE} className="scene-packet" style={{ offsetPath: "path('M88 104 C112 104 112 62 136 62')" } as React.CSSProperties} />
      <circle r="4" fill={BLUE_LT} className="scene-packet" style={{ offsetPath: "path('M88 104 C112 104 112 146 136 146')", animationDelay: '0.8s' } as React.CSSProperties} />
      <circle r="4" fill={BLUE} className="scene-packet" style={{ offsetPath: "path('M184 62 C208 62 208 104 232 104')", animationDelay: '1.2s' } as React.CSSProperties} />
    </g>
  );
}

const SCENES: Record<CapabilityKind, () => JSX.Element> = {
  'development': WebsiteScene,
  'design': MobileScene,
  'digital-marketing': DesktopScene,
  'sales-strategy': SystemsScene,
  'maintenance-support': SystemsScene,
};

export function CapabilityScene({ kind, className }: CapabilitySceneProps): JSX.Element {
  const Scene = SCENES[kind];
  return (
    <svg
      viewBox="0 0 320 208"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      className={['scene-float block h-full w-full', className ?? ''].filter(Boolean).join(' ')}
      role="presentation"
    >
      <Scene />
    </svg>
  );
}

export default CapabilityScene;
