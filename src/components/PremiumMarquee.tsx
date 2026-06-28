import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '@hooks/useReducedMotion';

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

  useEffect(() => {
    if (reducedMotion) return;
    const skewer = skewerRef.current;
    if (!skewer) return;

    let lastY = window.scrollY;
    let rafId: number;

    const tick = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;

      // Map scroll delta → skewX; clamp so it never looks broken.
      const target = gsap.utils.clamp(-14, 14, delta * 0.55);

      gsap.to(skewer, {
        skewX: target,
        duration: 0.85,
        ease: 'power3.out',
        overwrite: 'auto',
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [reducedMotion]);

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
