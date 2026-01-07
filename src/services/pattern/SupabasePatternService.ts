/**
 * Supabase Pattern Service
 * Handles fetching patterns from Supabase database and storage
 */

import { supabase, isSupabaseConfigured, PATTERNS_BUCKET, getStoragePublicUrl } from '../../config';
import type {
  AsyncResult,
  PatternV1,
  DbPattern,
  FetchPatternsOptions,
  PatternSortBy,
} from '../../types';
import { ok, err, dbPatternToPatternV1 } from '../../types';

/**
 * Pattern list result with pagination info
 */
export interface PaginatedPatterns {
  patterns: DbPattern[];
  total: number;
  hasMore: boolean;
}

/**
 * Supabase Pattern Service - fetches patterns from the database
 */
export class SupabasePatternService {
  private static instance: SupabasePatternService;

  /**
   * Get singleton instance
   */
  static getInstance(): SupabasePatternService {
    if (!SupabasePatternService.instance) {
      SupabasePatternService.instance = new SupabasePatternService();
    }
    return SupabasePatternService.instance;
  }

  /**
   * Check if the service is available
   */
  isAvailable(): boolean {
    return isSupabaseConfigured();
  }

  /**
   * Fetch approved patterns with pagination and sorting
   */
  async fetchApprovedPatterns(options: FetchPatternsOptions = {}): AsyncResult<PaginatedPatterns> {
    if (!supabase) {
      return err(new Error('Supabase not configured'));
    }

    const { sortBy = 'popular', limit = 20, offset = 0, searchQuery } = options;

    try {
      // Build base query
      let query = supabase
        .from('patterns')
        .select('*', { count: 'exact' })
        .eq('status', 'approved');

      // Apply search filter if provided
      if (searchQuery && searchQuery.trim()) {
        const searchTerm = searchQuery.trim();
        query = query.or(`name.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      query = this.applySorting(query, sortBy);

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return err(new Error(`Database error: ${error.message}`));
      }

      const total = count ?? 0;
      const hasMore = offset + limit < total;

      return ok({
        patterns: data as DbPattern[],
        total,
        hasMore,
      });
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to fetch patterns'));
    }
  }

  /**
   * Fetch a single pattern by slug
   */
  async fetchPatternBySlug(slug: string): AsyncResult<DbPattern> {
    if (!supabase) {
      return err(new Error('Supabase not configured'));
    }

    try {
      const { data, error } = await supabase
        .from('patterns')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'approved')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return err(new Error(`Pattern not found: ${slug}`));
        }
        return err(new Error(`Database error: ${error.message}`));
      }

      return ok(data as DbPattern);
    } catch (error) {
      return err(error instanceof Error ? error : new Error(`Failed to fetch pattern: ${slug}`));
    }
  }

  /**
   * Fetch a pattern and its SVG content, returning a PatternV1
   */
  async fetchPatternWithSvg(slug: string): AsyncResult<PatternV1> {
    const patternResult = await this.fetchPatternBySlug(slug);

    if (!patternResult.success) {
      return patternResult;
    }

    const pattern = patternResult.data;
    const svgResult = await this.fetchSvgContent(pattern.svg_url);

    if (!svgResult.success) {
      return svgResult;
    }

    return ok(dbPatternToPatternV1(pattern, svgResult.data));
  }

  /**
   * Fetch SVG content from storage
   */
  async fetchSvgContent(svgPath: string): AsyncResult<string> {
    if (!supabase) {
      return err(new Error('Supabase not configured'));
    }

    try {
      // If it's already a full URL, fetch directly
      if (svgPath.startsWith('http')) {
        const response = await fetch(svgPath);
        if (!response.ok) {
          return err(new Error(`Failed to fetch SVG: ${response.statusText}`));
        }
        return ok(await response.text());
      }

      // Otherwise, get the public URL from storage
      const publicUrl = getStoragePublicUrl(PATTERNS_BUCKET, svgPath);
      if (!publicUrl) {
        return err(new Error('Could not generate storage URL'));
      }

      const response = await fetch(publicUrl);
      if (!response.ok) {
        return err(new Error(`Failed to fetch SVG: ${response.statusText}`));
      }

      return ok(await response.text());
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to fetch SVG content'));
    }
  }

  /**
   * Increment view count for a pattern
   * Note: This uses raw SQL via RPC since direct increment isn't easily typed
   */
  async incrementViewCount(patternId: string): AsyncResult<void> {
    if (!supabase) {
      return err(new Error('Supabase not configured'));
    }

    try {
      // For now, we'll skip the actual increment - proper increment would use RPC or database function
      // This is a placeholder for future implementation
      void patternId;

      return ok(undefined);
    } catch (error) {
      // View tracking failures should not break the app
      console.warn('Failed to increment view count:', error);
      return ok(undefined);
    }
  }

  /**
   * Increment download count for a pattern
   */
  async incrementDownloadCount(patternId: string): AsyncResult<void> {
    if (!supabase) {
      return err(new Error('Supabase not configured'));
    }

    try {
      // For now, we'll skip the actual increment - proper increment would use RPC or database function
      void patternId;

      return ok(undefined);
    } catch (error) {
      console.warn('Failed to increment download count:', error);
      return ok(undefined);
    }
  }

  /**
   * Submit a new pattern for approval
   */
  async submitPattern(
    pattern: PatternV1,
    svgContent: string,
    submitterEmail?: string
  ): AsyncResult<string> {
    if (!supabase) {
      return err(new Error('Supabase not configured'));
    }

    try {
      // Upload SVG to storage
      const svgPath = `submissions/${pattern.id}.svg`;
      const { error: uploadError } = await supabase.storage
        .from(PATTERNS_BUCKET)
        .upload(svgPath, svgContent, {
          contentType: 'image/svg+xml',
          upsert: false,
        });

      if (uploadError) {
        return err(new Error(`Failed to upload SVG: ${uploadError.message}`));
      }

      // Insert pattern record
      const { data, error: insertError } = await supabase
        .from('patterns')
        .insert({
          slug: pattern.id,
          name: pattern.name,
          author: pattern.author,
          license: pattern.license,
          notes: pattern.notes ?? null,
          svg_url: svgPath,
          tile_viewbox: pattern.tile.viewBox,
          stitch_defaults: pattern.defaults,
          status: 'pending' as const,
          submitter_email: submitterEmail ?? null,
        })
        .select('id')
        .single();

      if (insertError) {
        // Clean up uploaded file on failure
        await supabase.storage.from(PATTERNS_BUCKET).remove([svgPath]);
        return err(new Error(`Failed to submit pattern: ${insertError.message}`));
      }

      return ok(data.id);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to submit pattern'));
    }
  }

  /**
   * Search patterns by name or author
   */
  async searchPatterns(query: string, limit = 20): AsyncResult<DbPattern[]> {
    if (!supabase) {
      return err(new Error('Supabase not configured'));
    }

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return ok([]);
    }

    try {
      const { data, error } = await supabase
        .from('patterns')
        .select('*')
        .eq('status', 'approved')
        .or(`name.ilike.%${trimmedQuery}%,author.ilike.%${trimmedQuery}%`)
        .order('download_count', { ascending: false })
        .limit(limit);

      if (error) {
        return err(new Error(`Search failed: ${error.message}`));
      }

      return ok(data as DbPattern[]);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Search failed'));
    }
  }

  /**
   * Get pattern thumbnail URL (SVG preview)
   */
  getPatternThumbnailUrl(pattern: DbPattern): string | null {
    return getStoragePublicUrl(PATTERNS_BUCKET, pattern.svg_url);
  }

  /**
   * Apply sorting to a query
   */
  private applySorting<T>(query: T, sortBy: PatternSortBy): T {
    const q = query as unknown as {
      order: (column: string, options: { ascending: boolean }) => T;
    };
    switch (sortBy) {
      case 'popular':
        return q.order('download_count', { ascending: false });
      case 'recent':
        return q.order('created_at', { ascending: false });
      case 'name':
        return q.order('name', { ascending: true });
      default:
        return q.order('download_count', { ascending: false });
    }
  }
}

// Singleton instance
export const supabasePatternService = SupabasePatternService.getInstance();
