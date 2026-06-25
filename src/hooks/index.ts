/**
 * Barrel export for the shared React hooks of the Ryze Portfolio Website.
 *
 * Import from `@hooks` (the configured path alias) anywhere in the app:
 *   import { useReducedMotion, MotionProvider } from '@hooks';
 */

export { useReducedMotion } from './useReducedMotion';
export {
  MotionProvider,
  useMotionContext,
  useReducedMotionContext,
} from './MotionProvider';
export type { MotionContextValue, MotionProviderProps } from './MotionProvider';
export { useViewportCategory } from './useViewportCategory';
export { useSectionEntrance } from './useSectionEntrance';
export { smoothScrollToSection } from './smoothScrollToSection';
