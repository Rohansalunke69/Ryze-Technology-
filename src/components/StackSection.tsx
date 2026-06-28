import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@hooks/useReducedMotion';

export interface StackSectionProps {
  zIndex: number;
  /** First section (Hero) — no card chrome, no pull-up entrance. */
  isFirst?: boolean;
  /**
   * Brief overlap pin (pinSpacing: false).
   * Pins this section while the next one slides over it, then releases.
   * No extra scroll space is added — next section slides in naturally.
   * Use on Hero (independent, needs no cross-section coordination).
   */
  overlap?: boolean;
  /**
   * Override the card's base background colour.
   * Defaults to 'var(--ink-900)'.  Set to 'transparent' when the section
   * inside provides its own full-bleed background (e.g. Philosophy's blue).
   */
  cardBackground?: string;
  children: ReactNode;
  id?: string;
}

/**
 * Panel layer in the stacked-section system.
 *
 * Forwards its outer wrapper ref so the parent (HomePage) can target it
 * for cross-section GSAP ScrollTrigger pins (e.g. the Problems ↔ Philosophy
 * co-pin that keeps Problems visible above the blue Philosophy panel).
 */
export const StackSection = forwardRef<HTMLDivElement, StackSectionProps>(
  function StackSection(
    { zIndex, isFirst = false, overlap = false, children, id },
    ref,
  ) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const innerRef   = useRef<HTMLDivElement>(null);
    const reducedMotion = useReducedMotion();

    // Expose the wrapper DOM node to the parent through the forwarded ref.
    useImperativeHandle(ref, () => wrapperRef.current!, []);

    useEffect(() => {
      if (reducedMotion) return;
      const wrapper = wrapperRef.current;
      const inner   = innerRef.current;
      if (!wrapper || !inner) return;

      gsap.registerPlugin(ScrollTrigger);
      const owned: ScrollTrigger[] = [];

      /* ── Pull-up entrance (all sections except Hero) ──────────────── */
      if (!isFirst) {
        gsap.set(inner, { y: 40 });

        const lift = ScrollTrigger.create({
          trigger: wrapper,
          start: 'top bottom',
          end: 'top top',
          scrub: 1.5,
          invalidateOnRefresh: true,
          onUpdate(self) {
            gsap.set(inner, { y: (1 - self.progress) * 40 });
          },
          onLeave()     { gsap.set(inner, { clearProps: 'transform' }); },
          onEnterBack() { gsap.set(inner, { y: 40 }); },
        });
        owned.push(lift);

        // Dim / slightly scale the section directly below as this one rises.
        const prev      = wrapper.previousElementSibling as HTMLElement | null;
        const prevInner = prev?.querySelector<HTMLElement>('[data-stack-inner]');
        if (prevInner) {
          const dim = ScrollTrigger.create({
            trigger: wrapper,
            start: 'top bottom',
            end: 'top top',
            scrub: 1.5,
            invalidateOnRefresh: true,
            onUpdate(self) {
              gsap.set(prevInner, {
                scale:   1 - self.progress * 0.02,
                opacity: 1 - self.progress * 0.05,
              });
            },
            onLeave()     { gsap.set(prevInner, { scale: 0.98, opacity: 0.95 }); },
            onEnterBack() { gsap.set(prevInner, { scale: 1, opacity: 1 }); },
          });
          owned.push(dim);
        }
      }

      /* ── Overlap pin — Hero only ─────────────────────────────────── */
      // pinSpacing: false → no extra scroll space added; the next section
      // is already in the DOM directly below and slides up naturally during
      // the pin window.
      if (overlap) {
        const pin = ScrollTrigger.create({
          trigger:       wrapper,
          start:         'top top',
          end:           'bottom top',
          pin:           true,
          pinSpacing:    false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
        owned.push(pin);
      }

      return () => {
        owned.forEach((t) => t.kill());
        gsap.set(inner, { clearProps: 'all' });
      };
    }, [reducedMotion, isFirst, overlap]);

    return (
      <div
        ref={wrapperRef}
        id={id}
        style={{
          position: 'relative',
          zIndex,
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
                  borderRadius: '24px 24px 0 0',
                  overflow:     'hidden',
                  boxShadow:    '0 -20px 60px rgba(0,0,0,0.12)',
                }),
          }}
        >
          {children}
        </div>
      </div>
    );
  },
);

export default StackSection;
