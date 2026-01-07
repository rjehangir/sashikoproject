/**
 * Pattern Service Facade
 * Unified interface for pattern operations
 */

import type {
  Result,
  AsyncResult,
  PatternV1,
  PatternIndex,
  PatternMetadata,
  StitchDefaults,
} from '../../types';

import { patternFactory } from './PatternFactory';
import { patternRepository } from './PatternRepository';

// Re-export services and types
export { PatternRepository, patternRepository } from './PatternRepository';
export type { RepositoryConfig } from './PatternRepository';
export {
  PatternFactory,
  patternFactory,
  DEFAULT_STITCH_DEFAULTS,
  DEFAULT_VIEWBOX,
  EMPTY_SVG,
} from './PatternFactory';

// Supabase services
export { SupabasePatternService, supabasePatternService } from './SupabasePatternService';
export type { PaginatedPatterns } from './SupabasePatternService';
export { AdminPatternService, adminPatternService } from './AdminPatternService';

/**
 * Pattern Service - facade for all pattern operations
 */
export class PatternService {
  private repository = patternRepository;
  private factory = patternFactory;

  // ============================================================================
  // REPOSITORY OPERATIONS
  // ============================================================================

  /**
   * Fetch pattern index
   */
  async fetchIndex(): AsyncResult<PatternIndex> {
    return this.repository.fetchIndex();
  }

  /**
   * Fetch a pattern by ID
   */
  async fetchPattern(id: string): AsyncResult<PatternV1> {
    return this.repository.fetchPattern(id);
  }

  /**
   * Fetch multiple patterns
   */
  async fetchPatterns(ids: string[]): AsyncResult<Map<string, PatternV1>> {
    return this.repository.fetchPatterns(ids);
  }

  /**
   * Check if pattern exists
   */
  async exists(id: string): Promise<boolean> {
    return this.repository.exists(id);
  }

  // ============================================================================
  // FACTORY OPERATIONS
  // ============================================================================

  /**
   * Create a new pattern
   */
  create(
    svgContent: string,
    viewBox: string,
    metadata: PatternMetadata,
    defaults?: Partial<StitchDefaults>
  ): PatternV1 {
    return this.factory.create(svgContent, viewBox, metadata, defaults);
  }

  /**
   * Create an empty pattern
   */
  createEmpty(id: string, name: string, author?: string): PatternV1 {
    return this.factory.createEmpty(id, name, author);
  }

  /**
   * Clone a pattern
   */
  clone(pattern: PatternV1, newId: string, newName?: string): PatternV1 {
    return this.factory.clone(pattern, newId, newName);
  }

  /**
   * Update pattern metadata
   */
  updateMetadata(pattern: PatternV1, metadata: Partial<PatternMetadata>): PatternV1 {
    return this.factory.updateMetadata(pattern, metadata);
  }

  /**
   * Update pattern tile
   */
  updateTile(pattern: PatternV1, svgContent: string, viewBox?: string): PatternV1 {
    return this.factory.updateTile(pattern, svgContent, viewBox);
  }

  /**
   * Update pattern defaults
   */
  updateDefaults(pattern: PatternV1, defaults: Partial<StitchDefaults>): PatternV1 {
    return this.factory.updateDefaults(pattern, defaults);
  }

  // ============================================================================
  // SERIALIZATION
  // ============================================================================

  /**
   * Parse pattern from JSON
   */
  fromJson(jsonString: string): Result<PatternV1> {
    return this.factory.fromJson(jsonString);
  }

  /**
   * Serialize pattern to JSON
   */
  toJson(pattern: PatternV1, pretty?: boolean): string {
    return this.factory.toJson(pattern, pretty);
  }

  /**
   * Validate a pattern object
   */
  validate(pattern: unknown): Result<PatternV1> {
    return this.factory.validate(pattern);
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Extract metadata from pattern
   */
  extractMetadata(pattern: PatternV1): PatternMetadata {
    return this.factory.extractMetadata(pattern);
  }

  /**
   * Create ID from name
   */
  createIdFromName(name: string): string {
    return this.factory.createIdFromName(name);
  }
}

// Singleton instance
export const patternService = new PatternService();
