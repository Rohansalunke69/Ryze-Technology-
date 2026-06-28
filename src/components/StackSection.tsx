import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@hooks/useReducedMotion';

export interface StackSectionProps {
  zIndex: number;
  /** First section (Hero) — no card chrome, no entrance animation. */
  isFirst?: boolean;
  /**
   * Add a GSAP pin to this section so it holds while the user reads it,
   * then releases with pinSpacing:true so all following sections remain
   * fully reachable. Use ONLY for storytelling panels (e.g. Philosophy).
   */
  pinned?: boolean;
  children: ReactNode;
  id?: string;
}

export function StackSection({
  zIndex,
  isFirst = false,
  pinned = false,
  children,
  id,
}: StackSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef   = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const wrapper = wrapperRef.current;
    const inner   = innerRef.current;
    if (!wrapper || !inner) return;

    gsap.registerPlugin(ScrollTrigger);
    const owned: ScrollTrigger[] = [];

    /* ── Entrance animations (all sections except first) ────────────── */
    if (!isFirst) {
      // Small pull-up so the card feels like it lifts into place.
      gsap.set(inner, { y: 40 });

      const lift = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top bottom',
        end: 'top top',
        scrub: 1.5,
        onUpdate(self) {
          gsap.set(inner, { y: (1 - self.progress) * 40 });
        },
        // Clear transform after slide-in so position:fixed children
        // (e.g. an internal GSAP pin) are never trapped in a stacking context.
        onLeave()     { gsap.set(inner, { clearProps: 'transform' }); },
        onEnterBack() { gsap.set(inner, { y: 40 }); },
      });
      owned.push(lift);

      // While this section rises, dim the layer directly beneath it.
      const prev      = wrapper.previousElementSibling as HTMLElement | null;
      const prevInner = prev?.querySelector<HTMLElement>('[data-stack-inner]');
      if (prevInner) {
        const dim = ScrollTrigger.create({
          trigger: wrapper,
          start: 'top bottom',
          end: 'top top',
          scrub: 1.5,
          onUpdate(self) {
            gsap.set(prevInner, {
              scale:   1 - self.progress * 0.02,   // 1 → 0.98
              opacity: 1 - self.progress * 0.05,   // 1 → 0.95
            });
          },
          onLeave()     { gsap.set(prevInner, { scale: 0.98, opacity: 0.95 }); },
          onEnterBack() { gsap.set(prevInner, { scale: 1,    opacity: 1    }); },
        });
        owned.push(dim);
      }
    }

    /* ── Optional GSAP pin (storytelling sections only) ─────────────── */
    if (pinned) {
      // Pin the section while the user reads it; release with pinSpacing:true
      // so every section that follows is reachable by normal scrolling.
      const pin = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: 'bottom top',   // holds for exactly the section's own height
        pin: true,
        pinSpacing: true,    // adds spacer → following sections stay visible
        anticipatePin: 1,
      });
      owned.push(pin);
    }

    return () => {
      owned.forEach((t) => t.kill());
      gsap.set(inner, { clearProps: 'all' });
    };
  }, [reducedMotion, isFirst, pinned]);

  return (
    /*
     * position:relative (NOT sticky) — sticky on all sections is what caused
     * Philosophy to permanently cover Team / Testimonials / CTA. Relative +
     * z-index is enough: when two panels overlap during a scroll transition,
     * the higher-z one is visually on top; once the transition ends, each
     * section scrolls past naturally.
     */
    <div
      ref={wrapperRef}
      id={id}
      style={{
        position: 'relative',
        zIndex,
        // Opaque fill so the wrapper corners never expose layers beneath.
        background: isFirst ? 'transparent' : 'var(--ink-900)',
      }}
    >
      <div
        ref={innerRef}
        data-stack-inner=""
        style={{
          transformOrigin: 'top center',
          ...(isFirst
            ? {}
            : {
                background:   'var(--ink-900)',
                borderRadius: '20px 20px 0 0',
                overflow:     'hidden',
                boxShadow:    '0 -12px 48px rgba(0,0,0,0.07), 0 -1px 0 rgba(0,0,0,0.06)',
              }),
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default StackSection;
