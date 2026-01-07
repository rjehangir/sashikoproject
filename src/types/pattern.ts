/**
 * Pattern domain types with Zod validation schemas
 * Patterns are the core data model for sashiko designs
 */

import { z } from 'zod';

/**
 * Pattern tile schema - the repeating unit
 */
export const PatternTileSchema = z.object({
  svg: z.string().min(1, 'SVG content is required'),
  viewBox: z
    .string()
    .regex(
      /^-?\d+(\.\d+)?\s+-?\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?$/,
      'ViewBox must be "minX minY width height"'
    ),
});

export type PatternTile = z.infer<typeof PatternTileSchema>;

/**
 * Stitch defaults schema
 */
export const StitchDefaultsSchema = z.object({
  stitchLengthMm: z.number().positive('Stitch length must be positive'),
  gapLengthMm: z.number().positive('Gap length must be positive'),
  strokeWidthMm: z.number().positive('Stroke width must be positive'),
  snapGridMm: z.number().positive('Snap grid must be positive'),
});

export type StitchDefaults = z.infer<typeof StitchDefaultsSchema>;

/**
 * Pattern V1 schema - full pattern definition
 */
export const PatternV1Schema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'ID must be kebab-case'),
  name: z.string().min(1, 'Name is required'),
  author: z.string().min(1, 'Author is required'),
  license: z.string().default('CC BY 4.0'),
  notes: z.string().optional(),
  createdAt: z.string().datetime({ offset: true }).or(z.string()),
  updatedAt: z.string().datetime({ offset: true }).or(z.string()),
  tile: PatternTileSchema,
  defaults: StitchDefaultsSchema,
});

export type PatternV1 = z.infer<typeof PatternV1Schema>;

/**
 * Pattern index entry schema (for library listing)
 */
export const PatternIndexEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  author: z.string(),
  license: z.string(),
});

export type PatternIndexEntry = z.infer<typeof PatternIndexEntrySchema>;

/**
 * Pattern index schema (patterns/index.json)
 */
export const PatternIndexSchema = z.object({
  patterns: z.array(PatternIndexEntrySchema),
});

export type PatternIndex = z.infer<typeof PatternIndexSchema>;

/**
 * Pattern metadata (subset for listings)
 */
export interface PatternMetadata {
  id: string;
  name: string;
  author: string;
  license: string;
  notes?: string;
}

/**
 * Validation result for patterns
 */
export interface PatternValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a pattern object
 */
export function validatePattern(data: unknown): PatternValidationResult {
  const result = PatternV1Schema.safeParse(data);

  if (result.success) {
    return { valid: true, errors: [], warnings: [] };
  }

  return {
    valid: false,
    errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
    warnings: [],
  };
}

/**
 * Create a new pattern with defaults
 */
export function createEmptyPattern(id: string, name: string): PatternV1 {
  const now = new Date().toISOString();
  return {
    id,
    name,
    author: '',
    license: 'CC BY 4.0',
    notes: '',
    createdAt: now,
    updatedAt: now,
    tile: {
      svg: '<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"></svg>',
      viewBox: '0 0 10 10',
    },
    defaults: {
      stitchLengthMm: 3,
      gapLengthMm: 1.5,
      strokeWidthMm: 0.6,
      snapGridMm: 1,
    },
  };
}
