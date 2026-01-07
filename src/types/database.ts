/**
 * Database Types for Supabase
 * Defines the schema for patterns stored in the database
 */

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Pattern approval status
 */
export type PatternStatus = 'pending' | 'approved' | 'rejected';

export const PatternStatusSchema = z.enum(['pending', 'approved', 'rejected']);

// ============================================================================
// DATABASE ROW TYPES
// ============================================================================

/**
 * Database pattern row schema (matches Supabase table)
 */
export const DbPatternSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case'),
  name: z.string().min(1),
  author: z.string().min(1),
  license: z.string().default('CC BY 4.0'),
  notes: z.string().nullable(),
  svg_url: z.string(),
  tile_viewbox: z.string(),
  stitch_defaults: z.object({
    stitchLengthMm: z.number().positive(),
    gapLengthMm: z.number().positive(),
    strokeWidthMm: z.number().positive(),
    snapGridMm: z.number().positive(),
  }),
  status: PatternStatusSchema,
  view_count: z.number().int().nonnegative().default(0),
  download_count: z.number().int().nonnegative().default(0),
  created_at: z.string(),
  updated_at: z.string(),
  approved_at: z.string().nullable(),
  submitter_email: z.string().email().nullable(),
});

export type DbPattern = z.infer<typeof DbPatternSchema>;

/**
 * Pattern insert data (for new submissions)
 */
export const DbPatternInsertSchema = DbPatternSchema.omit({
  id: true,
  view_count: true,
  download_count: true,
  created_at: true,
  updated_at: true,
  approved_at: true,
}).extend({
  status: PatternStatusSchema.default('pending'),
});

export type DbPatternInsert = z.infer<typeof DbPatternInsertSchema>;

/**
 * Pattern update data
 */
export const DbPatternUpdateSchema = DbPatternSchema.partial().omit({
  id: true,
  created_at: true,
});

export type DbPatternUpdate = z.infer<typeof DbPatternUpdateSchema>;

/**
 * Database pattern image row schema (for future use)
 */
export const DbPatternImageSchema = z.object({
  id: z.string().uuid(),
  pattern_id: z.string().uuid(),
  image_url: z.string(),
  caption: z.string().nullable(),
  credit: z.string().nullable(),
  display_order: z.number().int().nonnegative().default(0),
  created_at: z.string(),
});

export type DbPatternImage = z.infer<typeof DbPatternImageSchema>;

// ============================================================================
// JOINED TYPES
// ============================================================================

/**
 * Pattern with its associated images
 */
export interface PatternWithImages extends DbPattern {
  images: DbPatternImage[];
}

// ============================================================================
// QUERY OPTIONS
// ============================================================================

/**
 * Sort options for pattern queries
 */
export type PatternSortBy = 'popular' | 'recent' | 'name';

/**
 * Options for fetching patterns
 */
export interface FetchPatternsOptions {
  sortBy?: PatternSortBy;
  limit?: number;
  offset?: number;
  searchQuery?: string | undefined;
}

// ============================================================================
// SUPABASE DATABASE TYPE
// ============================================================================

/**
 * Stitch defaults JSON structure
 */
interface StitchDefaultsJson {
  stitchLengthMm: number;
  gapLengthMm: number;
  strokeWidthMm: number;
  snapGridMm: number;
}

/**
 * Supabase database schema type
 * Used for typed client queries
 */
export interface Database {
  public: {
    Tables: {
      patterns: {
        Row: {
          id: string;
          slug: string;
          name: string;
          author: string;
          license: string;
          notes: string | null;
          svg_url: string;
          tile_viewbox: string;
          stitch_defaults: StitchDefaultsJson;
          status: 'pending' | 'approved' | 'rejected';
          view_count: number;
          download_count: number;
          created_at: string;
          updated_at: string;
          approved_at: string | null;
          submitter_email: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          author: string;
          license?: string;
          notes?: string | null;
          svg_url: string;
          tile_viewbox: string;
          stitch_defaults?: StitchDefaultsJson;
          status?: 'pending' | 'approved' | 'rejected';
          view_count?: number;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
          approved_at?: string | null;
          submitter_email?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          author?: string;
          license?: string;
          notes?: string | null;
          svg_url?: string;
          tile_viewbox?: string;
          stitch_defaults?: StitchDefaultsJson;
          status?: 'pending' | 'approved' | 'rejected';
          view_count?: number;
          download_count?: number;
          updated_at?: string;
          approved_at?: string | null;
          submitter_email?: string | null;
        };
        Relationships: [];
      };
      pattern_images: {
        Row: {
          id: string;
          pattern_id: string;
          image_url: string;
          caption: string | null;
          credit: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          pattern_id: string;
          image_url: string;
          caption?: string | null;
          credit?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          pattern_id?: string;
          image_url?: string;
          caption?: string | null;
          credit?: string | null;
          display_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'pattern_images_pattern_id_fkey';
            columns: ['pattern_id'];
            referencedRelation: 'patterns';
            referencedColumns: ['id'];
          },
        ];
      };
      admin_config: {
        Row: {
          id: string;
          key: string;
          value: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
        };
        Update: {
          key?: string;
          value?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

/**
 * Convert a database pattern to the app's PatternV1 format
 */
export function dbPatternToPatternV1(
  dbPattern: DbPattern,
  svgContent: string
): import('./pattern').PatternV1 {
  return {
    id: dbPattern.slug,
    name: dbPattern.name,
    author: dbPattern.author,
    license: dbPattern.license,
    notes: dbPattern.notes ?? undefined,
    createdAt: dbPattern.created_at,
    updatedAt: dbPattern.updated_at,
    tile: {
      svg: svgContent,
      viewBox: dbPattern.tile_viewbox,
    },
    defaults: dbPattern.stitch_defaults,
  };
}

/**
 * Convert a PatternV1 to database insert format
 */
export function patternV1ToDbInsert(
  pattern: import('./pattern').PatternV1,
  svgUrl: string,
  submitterEmail?: string
): DbPatternInsert {
  return {
    slug: pattern.id,
    name: pattern.name,
    author: pattern.author,
    license: pattern.license,
    notes: pattern.notes ?? null,
    svg_url: svgUrl,
    tile_viewbox: pattern.tile.viewBox,
    stitch_defaults: pattern.defaults,
    status: 'pending',
    submitter_email: submitterEmail ?? null,
  };
}
