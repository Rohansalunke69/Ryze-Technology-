/**
 * `MotionProvider` — supplies the reduced-motion flag to the component tree.
 *
 * Computes `reducedMotion` once (via {@link useReducedMotion}) at the root and
 * shares it through React context so descendants can read it without each
 * subscribing to the media query independently.
 *
 * Validates Requirements 1.8, 2.6, 3.5, 8.4, 11.2.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useReducedMotion } from './useReducedMotion';

/** Shape of the value exposed through the motion context. */
export interface MotionContextValue {
  /** Whether the user prefers reduced motion. */
  reducedMotion: boolean;
}

/**
 * Internal context handle. `undefined` default lets {@link useMotionContext}
 * detect usage outside of a provider and fail loudly.
 */
const MotionContext = createContext<MotionContextValue | undefined>(undefined);

/** Props for {@link MotionProvider}. */
export interface MotionProviderProps {
  children: ReactNode;
}

/**
 * Provider that computes the reduced-motion preference and shares it with all
 * descendants via context.
 */
export function MotionProvider({ children }: MotionProviderProps): JSX.Element {
  const reducedMotion = useReducedMotion();
  const value = useMemo<MotionContextValue>(
    () => ({ reducedMotion }),
    [reducedMotion],
  );

  return (
    <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
  );
}

/**
 * Read the full motion context.
 *
 * @throws Error when called outside of a {@link MotionProvider}.
 */
export function useMotionContext(): MotionContextValue {
  const context = useContext(MotionContext);
  if (context === undefined) {
    throw new Error('useMotionContext must be used within a MotionProvider');
  }
  return context;
}

/**
 * Convenience accessor for just the reduced-motion boolean from context.
 *
 * @throws Error when called outside of a {@link MotionProvider}.
 */
export function useReducedMotionContext(): boolean {
  return useMotionContext().reducedMotion;
}
