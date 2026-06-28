import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@hooks/useReducedMotion';

export interface StackSectionProps {
  zIndex: number;
  /** First section (Hero) — no card chrome, no pull-up entrance. */
  isFirst?: boolean;
  /**
   * Brief overlap pin (pinSpacing: false).
   *
   * Pins THIS section at the top while the NEXT one slides over it, then
   * releases immediately — no extra scroll space added.  Use for Hero and
   * Problems so they behave like "lingering panels" during the incoming
   * transition, then scroll away naturally once the next panel is in place.
   */
  overlap?: boolean;
  /**
   * Storytelling pin (pinSpacing: true).
   *
   * Pins this section at the top for its own height worth of scroll, then
   * releases with a correctly-sized spacer so every section that follows
   * (Team, Testimonials, CTA) is fully reachable.  Use only for Philosophy.
   */
  pinned?: boolean;
  children: ReactNode;
  id?: string;
}

export function StackSection({
  zIndex,
  isFirst   = false,
  overlap   = false,
  pinned    = false,
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

    /* ── Entrance animation (every section except the first) ──────────── */
    if (!isFirst) {
      gsap.set(inner, { y: 40 });

      const lift = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top bottom',
        end: 'top top',
        scrub: 1.5,
        onUpdate(self) {
          gsap.set(inner, { y: (1 - self.progress) * 40 });
        },
        // Clear after slide-in so that any internal GSAP pin's position:fixed
        // children are never trapped inside a transform stacking context.
        onLeave()     { gsap.set(inner, { clearProps: 'transform' }); },
        onEnterBack() { gsap.set(inner, { y: 40 }); },
      });
      owned.push(lift);

      // Dim the previous panel while this one rises over it.
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

    /* ── Overlap pin — Hero / Problems ─────────────────────────────────── */
    //
    //  pinSpacing: false → no extra scroll space.  The pin holds this section
    //  at the top for exactly its own natural height of scroll.  During that
    //  window the NEXT section scrolls up from below (it's already in the DOM
    //  below this one), creating the stacked-panel overlap.  When the pin
    //  releases this section is at the viewport top and the next is also at the
    //  top — both at the same y — then normal scroll takes over and this
    //  section scrolls off the top as the next one continues down.
    //
    if (overlap) {
      const pin = ScrollTrigger.create({
        trigger:      wrapper,
        start:        'top top',
        end:          'bottom top',
        pin:          true,
        pinSpacing:   false,
        anticipatePin: 1,
      });
      owned.push(pin);
    }

    /* ── Storytelling pin — Philosophy ─────────────────────────────────── */
    //
    //  pinSpacing: true → GSAP inserts a correctly-sized spacer after this
    //  section so Team / Testimonials / CTA remain reachable.  Pin holds for
    //  the section's own height, then releases completely.  The blue panel
    //  then scrolls away and the next section becomes visible.
    //
    if (pinned) {
      const pin = ScrollTrigger.create({
        trigger:      wrapper,
        start:        'top top',
        end:          'bottom top',
        pin:          true,
        pinSpacing:   true,
        anticipatePin: 1,
      });
      owned.push(pin);
    }

    return () => {
      owned.forEach((t) => t.kill());
      gsap.set(inner, { clearProps: 'all' });
    };
  }, [reducedMotion, isFirst, overlap, pinned]);

  return (
    <div
      ref={wrapperRef}
      id={id}
      style={{
        position: 'relative',
        zIndex,
        // Matches the page background so wrapper corners never expose
        // lower-z layers through the inner's border-radius transparency.
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
