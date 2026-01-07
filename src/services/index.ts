/**
 * Services Layer Barrel Export
 *
 * This module provides a clean, enterprise-level service architecture for
 * the Sashiko Pattern Tool. All business logic is encapsulated here.
 *
 * Usage:
 *   import { svgService, pdfService, patternService, storageService } from '@/services';
 */

// ============================================================================
// SVG SERVICE
// ============================================================================

export {
  // Service facade
  SvgService,
  svgService,
  // Individual services
  SvgParser,
  svgParser,
  SvgValidator,
  svgValidator,
  SvgTransformer,
  svgTransformer,
  SvgSerializer,
  svgSerializer,
  // Constants
  ALLOWED_TAGS,
  ALLOWED_ATTRIBUTES,
} from './svg';

export type {
  ParsedSvg,
  ValidationError,
  ValidationResult,
  ValidationErrorType,
  ThreadStyleOptions,
  SerializeOptions,
} from './svg';

// ============================================================================
// PDF SERVICE
// ============================================================================

export {
  // Service facade
  PdfService,
  pdfService,
  // Individual services
  PdfExporter,
  pdfExporter,
  PdfRenderer,
  pdfRenderer,
  PathParser,
  pathParser,
  // Convenience function
  exportToPdf,
} from './pdf';

export type { PatternExportOptions, TileRenderOptions, PathCommand, PathCommandType } from './pdf';

// ============================================================================
// PATTERN SERVICE
// ============================================================================

export {
  // Service facade
  PatternService,
  patternService,
  // Individual services
  PatternRepository,
  patternRepository,
  PatternFactory,
  patternFactory,
  // Constants
  DEFAULT_STITCH_DEFAULTS,
  DEFAULT_VIEWBOX,
  EMPTY_SVG,
} from './pattern';

export type { RepositoryConfig } from './pattern';

// ============================================================================
// STORAGE SERVICE
// ============================================================================

export {
  // Service facade
  StorageService,
  storageService,
  // Individual services
  LocalStorageAdapter,
  localStorageAdapter,
  // Constants
  STORAGE_KEYS,
} from './storage';

export type {
  StorageError,
  StorageErrorType,
  PersistedEditorState,
  UserPreferences,
  RecentPatternEntry,
} from './storage';

// ============================================================================
// GITHUB SERVICE
// ============================================================================

export { fetchGitHubStats, formatCount } from './github';

export type { GitHubStats } from './github';
