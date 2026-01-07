/**
 * Configuration barrel export
 * All constants and defaults should be imported from here
 */

// Constants
export * from './constants';

// Supabase
export {
  supabase,
  isSupabaseConfigured,
  getStoragePublicUrl,
  PATTERNS_BUCKET,
  PATTERN_IMAGES_BUCKET,
} from './supabase';

// Paper sizes
export {
  PAPER_SIZES,
  DEFAULT_PAPER_SIZE,
  DEFAULT_PAGE_MARGINS,
  getPaperDimensions,
  getAvailablePaperSizes,
} from './paper';
export type { PageMargins } from './paper';

// Default state creators
export {
  DEFAULT_SVG_CONTENT,
  DEFAULT_VIEW_BOX,
  createDefaultPatternState,
  createDefaultEditorState,
  createDefaultDisplayState,
  createDefaultSizeState,
  createDefaultStitchState,
} from './defaults';
