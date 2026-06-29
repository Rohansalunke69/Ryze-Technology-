import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '@hooks/useReducedMotion';
import { useLenis } from '@hooks/useLenis';

const ITEMS = [
  'MAINTENANCE & SUPPORT',
  'WEB',
  'MOBILE',
  'SYSTEMS',
  'DIGITAL MARKETING',
  'AUTOMATION',
  'DESIGN',
];

const LABEL = ITEMS.join(' • ');

function Strip({ hidden }: { hidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center"
      aria-hidden={hidden || undefined}
    >
      {ITEMS.map((item, i) => (
        <span key={i} className="inline-flex items-center">
          <span className="whitespace-nowrap font-mono text-[0.64rem] font-medium uppercase tracking-[0.28em] text-white/55">
            {item}
          </span>
          <span
            aria-hidden="true"
            className="mx-8 select-none text-[0.55rem] text-white/20"
          >
            •
          </span>
        </span>
      ))}
    </div>
  );
}

export function PremiumMarquee() {
  const skewerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { lenis } = useLenis();

  useEffect(() => {
    if (reducedMotion) return undefined;
    const skewer = skewerRef.current;
    if (!skewer) return undefined;

    // A single eased setter — no per-frame tween spawning, no standalone RAF.
    const setSkew = gsap.quickTo(skewer, 'skewX', {
      duration: 0.5,
      ease: 'power3.out',
    });
    const clamp = gsap.utils.clamp(-12, 12);

    // Preferred path: drive skew from Lenis scroll velocity. Lenis is advanced
    // by the app's single GSAP ticker, and keeps emitting until it settles to
    // rest (velocity → 0), so the skew eases back to 0 on its own.
    if (lenis) {
      const onScroll = (): void => setSkew(clamp(lenis.velocity * 0.08));
      lenis.on('scroll', onScroll);
      return () => {
        lenis.off('scroll', onScroll);
      };
    }

    // Native-scroll fallback (reduced motion is already handled above; this is
    // the Lenis-init-failed case): update only on scroll events — no always-on
    // RAF — and settle back to 0 shortly after scrolling stops.
    let lastY = window.scrollY;
    let lastT = performance.now();
    let resetId: ReturnType<typeof setTimeout>;
    const onScroll = (): void => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = Math.max(now - lastT, 1);
      const vel = ((y - lastY) / dt) * 16; // ≈ px per frame
      lastY = y;
      lastT = now;
      setSkew(clamp(vel * 0.5));
      clearTimeout(resetId);
      resetId = setTimeout(() => setSkew(0), 120);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(resetId);
    };
  }, [lenis, reducedMotion]);

  if (reducedMotion) {
    return (
      <div
        className="overflow-hidden border-y border-white/[0.06] bg-[#060607] py-3"
        aria-label={LABEL}
      >
        <div className="flex">
          <Strip />
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden border-y border-white/[0.06] bg-[#060607] py-3"
      style={{ perspective: '650px' }}
      aria-label={LABEL}
      role="marquee"
    >
      {/* Left + right edge fades */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(to right, #060607 0%, transparent 9%, transparent 91%, #060607 100%)',
        }}
      />

      {/* Skew layer — GSAP writes skewX transform here */}
      <div ref={skewerRef} className="flex" style={{ willChange: 'transform' }}>
        {/* Scroll track — CSS animation owns translateX independently */}
        <div
          className="flex"
          style={{ animation: 'ryze-pm-loop 22s linear infinite' }}
        >
          <Strip />
          <Strip hidden />
        </div>
      </div>

      <style>{`
        @keyframes ryze-pm-loop {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export default PremiumMarquee;
