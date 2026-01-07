/**
 * Type system barrel export
 * All types should be imported from this file
 */

// Result types for error handling
export type { Result, AsyncResult } from './result';
export { ok, err, unwrap, map, mapError } from './result';

// Unit and measurement types
export type {
  Unit,
  SizeMode,
  PaperSize,
  Dimensions,
  PaperDimensions,
  SizeConfig,
  StitchConfig,
} from './units';

// SVG types
export type {
  ViewBox,
  AllowedSvgElement,
  SvgLine,
  SvgPath,
  SvgCircle,
  SvgRect,
  SvgElement,
} from './svg';
export { parseViewBox, formatViewBox, createDefaultViewBox } from './svg';

// Editor types
export type {
  EditorMode,
  Tool,
  EditorState,
  DrawingState,
  ViewportState,
  HistoryEntry,
  HistoryState,
} from './editor';

// Display types
export type {
  PreviewScaleMode,
  DisplayState,
  ColorConfig,
  GridConfig,
  ExportFormat,
  ExportConfig,
} from './display';

// Pattern types (with Zod schemas)
export {
  PatternTileSchema,
  StitchDefaultsSchema,
  PatternV1Schema,
  PatternIndexEntrySchema,
  PatternIndexSchema,
  validatePattern,
  createEmptyPattern,
} from './pattern';

export type {
  PatternTile,
  StitchDefaults,
  PatternV1,
  PatternIndexEntry,
  PatternIndex,
  PatternMetadata,
  PatternValidationResult,
} from './pattern';

// Re-export legacy AppState type for backwards compatibility during migration
// TODO: Remove this after all components are migrated to use slices
export type { AppState } from './app';

// Database types (Supabase)
export {
  PatternStatusSchema,
  DbPatternSchema,
  DbPatternInsertSchema,
  DbPatternUpdateSchema,
  DbPatternImageSchema,
  dbPatternToPatternV1,
  patternV1ToDbInsert,
} from './database';

export type {
  PatternStatus,
  DbPattern,
  DbPatternInsert,
  DbPatternUpdate,
  DbPatternImage,
  PatternWithImages,
  PatternSortBy,
  FetchPatternsOptions,
  Database,
} from './database';
