/**
 * Supabase Client Configuration
 * Initializes and exports the Supabase client for database and storage operations
 */

import { createClient } from '@supabase/supabase-js';

import type { Database } from '../types/database';

/**
 * Supabase configuration from environment variables
 */
const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined;

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Create Supabase client
 * Returns null if environment variables are not set
 */
function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
    );
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // No user auth needed for pattern browsing
    },
  });
}

/**
 * Supabase client instance
 * May be null if not configured - check with isSupabaseConfigured()
 */
export const supabase = createSupabaseClient();

/**
 * Storage bucket name for pattern SVG files
 */
export const PATTERNS_BUCKET = 'patterns';

/**
 * Storage bucket name for pattern example images
 */
export const PATTERN_IMAGES_BUCKET = 'pattern-images';

/**
 * Get public URL for a file in storage
 */
export function getStoragePublicUrl(bucket: string, path: string): string | null {
  if (!supabase) return null;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
