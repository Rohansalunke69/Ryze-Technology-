import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@hooks/useReducedMotion';

export interface StackSectionProps {
  /** Z-index for layering — higher = on top of previous sections. */
  zIndex: number;
  /** First layer (Hero) — no card chrome, no entrance animation. */
  isFirst?: boolean;
  /**
   * false → position:relative instead of sticky.
   * Use this for sections that have their own GSAP pin internally
   * (e.g. CapabilitiesShowcase) to avoid containing-block conflicts.
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
  const innerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner) return;

    gsap.registerPlugin(ScrollTrigger);

    const owned: ScrollTrigger[] = [];

    if (!isFirst) {
      // Start this section 60 px below its natural position.
      gsap.set(inner, { y: 60 });

      // Slide it up to y:0 as it enters the viewport (scrubbed).
      const slideIn = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top 92%',
        end: 'top top',
        scrub: 1.5,
        onUpdate(self) {
          gsap.set(inner, { y: (1 - self.progress) * 60 });
        },
      });
      owned.push(slideIn);

      // While this section enters, scale + fade the previous layer.
      const prev = wrapper.previousElementSibling as HTMLElement | null;
      const prevInner = prev?.querySelector<HTMLElement>('[data-stack-inner]');
      if (prevInner) {
        const dimPrev = ScrollTrigger.create({
          trigger: wrapper,
          start: 'top 92%',
          end: 'top top',
          scrub: 1.5,
          onUpdate(self) {
            gsap.set(prevInner, {
              scale: 1 - self.progress * 0.03,
              opacity: 1 - self.progress * 0.1,
            });
          },
        });
        owned.push(dimPrev);
      }
    }

    return () => {
      owned.forEach((t) => t.kill());
      gsap.set(inner, { clearProps: 'y,scale,opacity' });
    };
  }, [reducedMotion, isFirst]);

  const wrapperStyle: React.CSSProperties = {
    position: sticky ? 'sticky' : 'relative',
    top: sticky ? 0 : undefined,
    zIndex,
  };

  const innerStyle: React.CSSProperties = {
    transformOrigin: 'top center',
    ...(isFirst
      ? {}
      : {
          borderRadius: '20px 20px 0 0',
          // Depth shadow — visible between the card edge and the layer beneath.
          boxShadow:
            '0 -16px 60px rgba(0,0,0,0.65), 0 -1px 0 rgba(255,255,255,0.05)',
          overflow: 'hidden',
        }),
  };

  return (
    <div ref={wrapperRef} id={id} style={wrapperStyle}>
      <div
        ref={innerRef}
        data-stack-inner=""
        style={innerStyle}
      >
        {children}
      </div>
    </div>
  );
}

export default StackSection;
