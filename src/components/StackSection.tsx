import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@hooks/useReducedMotion';

export interface StackSectionProps {
  zIndex: number;
  isFirst?: boolean;
  /**
   * false = position:relative. Use for sections that own an internal
   * GSAP pin (e.g. CapabilitiesShowcase) to avoid stacking-context
   * conflicts with position:fixed children.
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
  const innerRef   = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const wrapper = wrapperRef.current;
    const inner   = innerRef.current;
    if (!wrapper || !inner) return;

    gsap.registerPlugin(ScrollTrigger);
    const owned: ScrollTrigger[] = [];

    if (!isFirst) {
      // Small pull-up: inner rises 40 px above its natural position as the card
      // enters. The wrapper itself scrolls naturally — no large translateY.
      gsap.set(inner, { y: 40 });

      const lift = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top bottom',
        end: 'top top',
        scrub: 1.5,
        onUpdate(self) {
          gsap.set(inner, { y: (1 - self.progress) * 40 });
        },
        // Clear the transform once the section is fully in.
        // Prevents a lingering translateY from creating a stacking context
        // that traps position:fixed descendants (e.g. CapabilitiesShowcase pin).
        onLeave() { gsap.set(inner, { clearProps: 'transform' }); },
        onEnterBack() { gsap.set(inner, { y: 40 }); },
      });
      owned.push(lift);

      // Subtly dim/scale the previous layer as this card slides over it.
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
          onEnterBack() { gsap.set(prevInner, { scale: 1, opacity: 1 }); },
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
        // Matches the page base so the wrapper fills transparent corner gaps
        // left by the inner's border-radius without exposing lower-z layers.
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
                // Solid page-background fill — the incoming panel must fully
                // hide all content underneath it once it has covered the section.
                background: 'var(--ink-900)',
                borderRadius: '20px 20px 0 0',
                // Safe: inner is not sticky, so overflow:hidden won't break
                // sticky ancestors, and position:fixed descendants won't be
                // trapped unless GSAP also adds a transform (cleared in onLeave).
                overflow: 'hidden',
                // Subtle top shadow for depth without being harsh on light theme.
                boxShadow:
                  '0 -12px 48px rgba(0,0,0,0.07), 0 -1px 0 rgba(0,0,0,0.06)',
              }),
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default StackSection;
