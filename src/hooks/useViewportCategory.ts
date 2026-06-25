/**
 * `useViewportCategory` — reactive viewport classification.
 *
 * Tracks `window.innerWidth` through a resize listener and delegates the actual
 * classification to the pure {@link selectViewportCategory} logic so the
 * mapping stays testable in isolation. Drives column counts and navigation
 * presentation. Degrades gracefully when `window` is unavailable (SSR).
 *
 * Validates Requirements 9.2, 9.3, 9.4 (via the delegated pure logic).
 */

import { useEffect, useState } from 'react';
import type { ViewportCategory } from '@apptypes';
import { selectViewportCategory } from '../logic/viewport';

/** Read the current viewport width, defaulting to `0` when no window exists. */
function getCurrentWidth(): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  return window.innerWidth;
}

/**
 * React hook returning the current {@link ViewportCategory}.
 *
 * @returns `'mobile' | 'tablet' | 'desktop'` based on the live viewport width.
 */
export function useViewportCategory(): ViewportCategory {
  const [category, setCategory] = useState<ViewportCategory>(() =>
    selectViewportCategory(getCurrentWidth()),
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = (): void => {
      setCategory(selectViewportCategory(window.innerWidth));
    };

    // Sync once on mount in case the width changed before this effect ran.
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return category;
}
