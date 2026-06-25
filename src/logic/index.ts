/**
 * Barrel export for the pure logic layer of the Ryze Portfolio Website.
 *
 * Import from `@logic` (the configured path alias) anywhere in the app:
 *   import { selectViewportCategory, selectColumnCount } from '@logic';
 */

export {
  selectViewportCategory,
  selectColumnCount,
  resolveViewportPrecedence,
} from './viewport';
