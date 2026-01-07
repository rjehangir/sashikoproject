/**
 * Pattern Factory Service
 * Creates and transforms pattern objects
 */

import type { PatternV1, StitchDefaults, PatternMetadata, Result } from '../../types';
import { ok, err, PatternV1Schema } from '../../types';

/**
 * Defaults for new patterns
 */
export const DEFAULT_STITCH_DEFAULTS: StitchDefaults = {
  stitchLengthMm: 3,
  gapLengthMm: 1.5,
  strokeWidthMm: 0.6,
  snapGridMm: 1,
};

/**
 * Default viewBox for new patterns
 */
export const DEFAULT_VIEWBOX = '0 0 10 10';

/**
 * Empty SVG template
 */
export const EMPTY_SVG = '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"></svg>';

/**
 * Pattern Factory - creates and transforms patterns
 */
export class PatternFactory {
  /**
   * Create a new pattern from SVG content
   */
  create(
    svgContent: string,
    viewBox: string,
    metadata: PatternMetadata,
    defaults: Partial<StitchDefaults> = {}
  ): PatternV1 {
    const now = new Date().toISOString();

    return {
      id: metadata.id,
      name: metadata.name,
      author: metadata.author,
      license: metadata.license || 'CC BY 4.0',
      notes: metadata.notes || '',
      createdAt: now,
      updatedAt: now,
      tile: {
        svg: svgContent,
        viewBox,
      },
      defaults: {
        ...DEFAULT_STITCH_DEFAULTS,
        ...defaults,
      },
    };
  }

  /**
   * Create an empty pattern with default values
   */
  createEmpty(id: string, name: string, author: string = ''): PatternV1 {
    return this.create(EMPTY_SVG, DEFAULT_VIEWBOX, { id, name, author, license: 'CC BY 4.0' });
  }

  /**
   * Clone a pattern with a new ID
   */
  clone(pattern: PatternV1, newId: string, newName?: string): PatternV1 {
    const now = new Date().toISOString();

    return {
      ...pattern,
      id: newId,
      name: newName ?? `${pattern.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Update pattern metadata
   */
  updateMetadata(pattern: PatternV1, metadata: Partial<PatternMetadata>): PatternV1 {
    return {
      ...pattern,
      ...metadata,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Update pattern tile
   */
  updateTile(pattern: PatternV1, svgContent: string, viewBox?: string): PatternV1 {
    return {
      ...pattern,
      tile: {
        svg: svgContent,
        viewBox: viewBox ?? pattern.tile.viewBox,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Update pattern defaults
   */
  updateDefaults(pattern: PatternV1, defaults: Partial<StitchDefaults>): PatternV1 {
    return {
      ...pattern,
      defaults: {
        ...pattern.defaults,
        ...defaults,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Parse a pattern from JSON string
   */
  fromJson(jsonString: string): Result<PatternV1> {
    try {
      const data = JSON.parse(jsonString);
      const parsed = PatternV1Schema.safeParse(data);

      if (!parsed.success) {
        const errors = parsed.error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join('; ');
        return err(new Error(`Invalid pattern: ${errors}`));
      }

      return ok(parsed.data);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to parse pattern JSON'));
    }
  }

  /**
   * Serialize a pattern to JSON string
   */
  toJson(pattern: PatternV1, pretty: boolean = true): string {
    return JSON.stringify(pattern, null, pretty ? 2 : 0);
  }

  /**
   * Validate a pattern object
   */
  validate(pattern: unknown): Result<PatternV1> {
    const parsed = PatternV1Schema.safeParse(pattern);

    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      return err(new Error(`Invalid pattern: ${errors}`));
    }

    return ok(parsed.data);
  }

  /**
   * Extract metadata from a pattern
   */
  extractMetadata(pattern: PatternV1): PatternMetadata {
    return {
      id: pattern.id,
      name: pattern.name,
      author: pattern.author,
      license: pattern.license,
      notes: pattern.notes ?? '',
    };
  }

  /**
   * Create a pattern ID from a name
   */
  createIdFromName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

// Singleton instance
export const patternFactory = new PatternFactory();
