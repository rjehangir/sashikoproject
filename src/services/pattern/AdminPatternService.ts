/**
 * Admin Pattern Service
 * Handles administrative operations for pattern moderation
 */

import { supabase, isSupabaseConfigured, PATTERNS_BUCKET } from '../../config';
import type { AsyncResult, DbPattern, PatternStatus } from '../../types';
import { ok, err } from '../../types';

/**
 * Admin authentication state
 */
interface AdminSession {
  authenticated: boolean;
  authenticatedAt: number;
}

/**
 * Session timeout in milliseconds (1 hour)
 */
const SESSION_TIMEOUT = 60 * 60 * 1000;

/**
 * Admin Pattern Service - handles moderation and admin operations
 */
export class AdminPatternService {
  private static instance: AdminPatternService;
  private session: AdminSession = { authenticated: false, authenticatedAt: 0 };

  /**
   * Get singleton instance
   */
  static getInstance(): AdminPatternService {
    if (!AdminPatternService.instance) {
      AdminPatternService.instance = new AdminPatternService();
    }
    return AdminPatternService.instance;
  }

  /**
   * Check if the service is available
   */
  isAvailable(): boolean {
    return isSupabaseConfigured();
  }

  /**
   * Check if admin is currently authenticated
   */
  isAuthenticated(): boolean {
    if (!this.session.authenticated) {
      return false;
    }
    // Check if session has expired
    if (Date.now() - this.session.authenticatedAt > SESSION_TIMEOUT) {
      this.session = { authenticated: false, authenticatedAt: 0 };
      return false;
    }
    return true;
  }

  /**
   * Authenticate admin with password
   * Uses bcrypt comparison via Supabase Edge Function or simple hash comparison
   */
  async authenticate(password: string): AsyncResult<boolean> {
    if (!supabase) {
      return err(new Error('Supabase not configured'));
    }

    try {
      // For simple implementation, we'll use a hash stored in admin_config
      // In production, you'd want to use a proper auth system or Edge Function
      const { data, error } = await supabase
        .from('admin_config')
        .select('value')
        .eq('key', 'admin_password_hash')
        .single();

      if (error) {
        // If no admin config exists, use a fallback for development
        if (error.code === 'PGRST116') {
          console.warn('No admin password configured in database');
          return err(new Error('Admin not configured'));
        }
        return err(new Error(`Authentication failed: ${error.message}`));
      }

      // Simple comparison - in production, use bcrypt via Edge Function
      // For now, we'll do a simple base64 encoded comparison
      const storedHash = (data as { value: string }).value;
      const inputHash = globalThis.btoa(password);

      if (storedHash === inputHash) {
        this.session = { authenticated: true, authenticatedAt: Date.now() };
        return ok(true);
      }

      return ok(false);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Authentication failed'));
    }
  }

  /**
   * Logout admin
   */
  logout(): void {
    this.session = { authenticated: false, authenticatedAt: 0 };
  }

  /**
   * Fetch patterns by status for moderation
   */
  async fetchPatternsByStatus(status: PatternStatus): AsyncResult<DbPattern[]> {
    if (!this.isAuthenticated()) {
      return err(new Error('Not authenticated'));
    }

    if (!supabase) {
      return err(new Error('Supabase not configured'));
    }

    try {
      // Use service role for admin operations
      const { data, error } = await supabase
        .from('patterns')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        return err(new Error(`Failed to fetch patterns: ${error.message}`));
      }

      return ok(data as DbPattern[]);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to fetch patterns'));
    }
  }

  /**
   * Fetch pending patterns for moderation queue
   */
  async fetchPendingPatterns(): AsyncResult<DbPattern[]> {
    return this.fetchPatternsByStatus('pending');
  }

  /**
   * Fetch all patterns (for admin view)
   */
  async fetchAllPatterns(): AsyncResult<DbPattern[]> {
    if (!this.isAuthenticated()) {
      return err(new Error('Not authenticated'));
    }

    if (!supabase) {
      return err(new Error('Supabase not configured'));
    }

    try {
      const { data, error } = await supabase
        .from('patterns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return err(new Error(`Failed to fetch patterns: ${error.message}`));
      }

      return ok(data as DbPattern[]);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to fetch patterns'));
    }
  }

  /**
   * Approve a pattern
   */
  async approvePattern(patternId: string): AsyncResult<void> {
    if (!this.isAuthenticated()) {
      return err(new Error('Not authenticated'));
    }

    if (!supabase) {
      return err(new Error('Supabase not configured'));
    }

    try {
      const { error } = await supabase
        .from('patterns')
        .update({
          status: 'approved' as const,
          approved_at: new Date().toISOString(),
        })
        .eq('id', patternId);

      if (error) {
        return err(new Error(`Failed to approve pattern: ${error.message}`));
      }

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to approve pattern'));
    }
  }

  /**
   * Reject a pattern
   */
  async rejectPattern(patternId: string, _reason?: string): AsyncResult<void> {
    if (!this.isAuthenticated()) {
      return err(new Error('Not authenticated'));
    }

    if (!supabase) {
      return err(new Error('Supabase not configured'));
    }

    try {
      const { error } = await supabase
        .from('patterns')
        .update({
          status: 'rejected' as const,
        })
        .eq('id', patternId);

      if (error) {
        return err(new Error(`Failed to reject pattern: ${error.message}`));
      }

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to reject pattern'));
    }
  }

  /**
   * Delete a pattern and its associated files
   */
  async deletePattern(patternId: string): AsyncResult<void> {
    if (!this.isAuthenticated()) {
      return err(new Error('Not authenticated'));
    }

    if (!supabase) {
      return err(new Error('Supabase not configured'));
    }

    try {
      // First, get the pattern to find the SVG path
      const { data: pattern, error: fetchError } = await supabase
        .from('patterns')
        .select('svg_url')
        .eq('id', patternId)
        .single();

      if (fetchError) {
        return err(new Error(`Pattern not found: ${fetchError.message}`));
      }

      const patternData = pattern as { svg_url: string } | null;

      // Delete the SVG file from storage
      if (patternData?.svg_url) {
        const { error: storageError } = await supabase.storage
          .from(PATTERNS_BUCKET)
          .remove([patternData.svg_url]);

        if (storageError) {
          console.warn('Failed to delete SVG file:', storageError.message);
          // Continue with database deletion even if storage fails
        }
      }

      // Delete pattern images from storage (if any)
      const { data: images } = await supabase
        .from('pattern_images')
        .select('image_url')
        .eq('pattern_id', patternId);

      if (images && images.length > 0) {
        const imagePaths = (images as { image_url: string }[]).map((img) => img.image_url);
        await supabase.storage.from('pattern-images').remove(imagePaths);
      }

      // Delete the pattern record (cascade will handle pattern_images)
      const { error: deleteError } = await supabase.from('patterns').delete().eq('id', patternId);

      if (deleteError) {
        return err(new Error(`Failed to delete pattern: ${deleteError.message}`));
      }

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to delete pattern'));
    }
  }

  /**
   * Update pattern metadata
   */
  async updatePattern(
    patternId: string,
    updates: {
      name?: string;
      author?: string;
      license?: string;
      notes?: string;
    }
  ): AsyncResult<void> {
    if (!this.isAuthenticated()) {
      return err(new Error('Not authenticated'));
    }

    if (!supabase) {
      return err(new Error('Supabase not configured'));
    }

    try {
      const { error } = await supabase
        .from('patterns')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', patternId);

      if (error) {
        return err(new Error(`Failed to update pattern: ${error.message}`));
      }

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to update pattern'));
    }
  }

  /**
   * Get pattern counts by status
   */
  async getPatternCounts(): AsyncResult<Record<PatternStatus, number>> {
    if (!this.isAuthenticated()) {
      return err(new Error('Not authenticated'));
    }

    if (!supabase) {
      return err(new Error('Supabase not configured'));
    }

    try {
      const statuses: PatternStatus[] = ['pending', 'approved', 'rejected'];
      const counts: Record<PatternStatus, number> = {
        pending: 0,
        approved: 0,
        rejected: 0,
      };

      for (const status of statuses) {
        const { count, error } = await supabase
          .from('patterns')
          .select('*', { count: 'exact', head: true })
          .eq('status', status);

        if (error) {
          console.warn(`Failed to count ${status} patterns:`, error.message);
          continue;
        }

        counts[status] = count ?? 0;
      }

      return ok(counts);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to get pattern counts'));
    }
  }
}

// Singleton instance
export const adminPatternService = AdminPatternService.getInstance();
