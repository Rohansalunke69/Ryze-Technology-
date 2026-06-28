import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@hooks/useReducedMotion';

export interface StackSectionProps {
  zIndex: number;
  isFirst?: boolean;
  /**
   * false = position:relative instead of sticky.
   * Use for sections that own a GSAP pin internally (e.g. CapabilitiesShowcase)
   * so the inner never carries a CSS transform that would trap position:fixed children.
   */
  sticky?: boolean;
  children: ReactNode;
  id?: string;
}

export function StackSection({
  zIndex,
  isFirst = false,
  sticky = true,
  children,
  id,
}: StackSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef  = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const wrapper = wrapperRef.current;
    const inner   = innerRef.current;
    if (!wrapper || !inner) return;

    gsap.registerPlugin(ScrollTrigger);
    const owned: ScrollTrigger[] = [];

    if (!isFirst) {
      // Subtle pull-up: inner starts 40 px below natural position and rises to 0.
      // The *wrapper* already rises naturally due to scroll — this small offset
      // adds a premium "lift" without creating a dark gap above the card.
      gsap.set(inner, { y: 40 });

      const lift = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top bottom',
        end: 'top top',
        scrub: 1.5,
        onUpdate(self) {
          gsap.set(inner, { y: (1 - self.progress) * 40 });
        },
        // Clear transform once fully in so internal GSAP pins (e.g. Capabilities)
        // are never trapped inside a stacking context created by translateY.
        onLeave() {
          gsap.set(inner, { clearProps: 'transform' });
        },
        onEnterBack() {
          gsap.set(inner, { y: 40 });
        },
      });
      owned.push(lift);

      // Dim the previous layer as this one rises over it.
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
          onLeave() {
            gsap.set(prevInner, { scale: 0.98, opacity: 0.95 });
          },
          onEnterBack() {
            gsap.set(prevInner, { scale: 1, opacity: 1 });
          },
        });
        owned.push(dim);
      }
    }

    return () => {
      owned.forEach((t) => t.kill());
      gsap.set(inner, { clearProps: 'all' });
    };
  }, [reducedMotion, isFirst]);

  return (
    <div
      ref={wrapperRef}
      id={id}
      style={{
        position: sticky ? 'sticky' : 'relative',
        top: sticky ? 0 : undefined,
        zIndex,
        // Opaque wrapper background is essential: it fills the gap between the
        // wrapper edge and the rounded inner corners, preventing lower-z sections
        // from bleeding through the transparent corner areas.
        background: '#060607',
      }}
    >
      <div
        ref={innerRef}
        data-stack-inner=""
        style={{
          transformOrigin: 'top center',
          // Every panel must be fully opaque — the incoming section must completely
          // hide everything beneath it once it has covered the viewport.
          background: '#060607',
          ...(isFirst
            ? {}
            : {
                borderRadius: '20px 20px 0 0',
                // overflow:hidden clips section content to the rounded card shape.
                // Safe here because inner is NOT sticky (only wrapper is).
                overflow: 'hidden',
                boxShadow:
                  '0 -20px 80px rgba(0,0,0,0.95), 0 -1px 0 rgba(255,255,255,0.07)',
              }),
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default StackSection;
