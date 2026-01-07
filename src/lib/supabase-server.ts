/**
 * Server-side Supabase utilities for Astro SSG pages
 * Used to fetch patterns at build time for the marketing site
 */

import { createClient } from '@supabase/supabase-js';

import type { Database } from '../types/database';

/**
 * Pattern data as returned from Supabase for marketing pages
 */
export interface MarketingPattern {
  id: string;
  slug: string;
  name: string;
  author: string;
  license: string;
  notes: string | null;
  svg_url: string;
  tile_viewbox: string;
  view_count: number;
  download_count: number;
  created_at: string;
}

/**
 * Create a Supabase client for server-side use
 * Returns null if environment variables are not configured
 */
export function createServerSupabase() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('Supabase not configured for server-side use');
    return null;
  }

  return createClient<Database>(url, key);
}

/**
 * Check if Supabase is configured for server-side use
 */
export function isServerSupabaseConfigured(): boolean {
  return Boolean(import.meta.env.PUBLIC_SUPABASE_URL && import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Fetch all approved patterns for the marketing site
 * Returns patterns sorted by download count (popularity)
 */
export async function fetchApprovedPatterns(): Promise<MarketingPattern[]> {
  const supabase = createServerSupabase();

  if (!supabase) {
    console.warn('Cannot fetch patterns: Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('patterns')
      .select(
        'id, slug, name, author, license, notes, svg_url, tile_viewbox, view_count, download_count, created_at'
      )
      .eq('status', 'approved')
      .order('download_count', { ascending: false });

    if (error) {
      console.error('Error fetching patterns:', error.message);
      return [];
    }

    return (data as MarketingPattern[]) || [];
  } catch (err) {
    console.error('Failed to fetch patterns:', err);
    return [];
  }
}

/**
 * Fetch a single pattern by slug
 */
export async function fetchPatternBySlug(slug: string): Promise<MarketingPattern | null> {
  const supabase = createServerSupabase();

  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('patterns')
      .select(
        'id, slug, name, author, license, notes, svg_url, tile_viewbox, view_count, download_count, created_at'
      )
      .eq('slug', slug)
      .eq('status', 'approved')
      .single();

    if (error) {
      console.error(`Error fetching pattern ${slug}:`, error.message);
      return null;
    }

    return data as MarketingPattern;
  } catch (err) {
    console.error(`Failed to fetch pattern ${slug}:`, err);
    return null;
  }
}

/**
 * Fetch SVG content from Supabase storage
 */
export async function fetchPatternSvg(svgUrl: string): Promise<string | null> {
  const supabase = createServerSupabase();

  if (!supabase) {
    return null;
  }

  try {
    // Get the public URL for the SVG
    const { data } = supabase.storage.from('patterns').getPublicUrl(svgUrl);

    if (!data.publicUrl) {
      return null;
    }

    // Fetch the SVG content
    const response = await fetch(data.publicUrl);
    if (!response.ok) {
      console.error(`Failed to fetch SVG: ${response.statusText}`);
      return null;
    }

    return await response.text();
  } catch (err) {
    console.error('Failed to fetch SVG content:', err);
    return null;
  }
}

/**
 * Get all pattern slugs for static path generation
 */
export async function getAllPatternSlugs(): Promise<string[]> {
  const supabase = createServerSupabase();

  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase.from('patterns').select('slug').eq('status', 'approved');

    if (error) {
      console.error('Error fetching pattern slugs:', error.message);
      return [];
    }

    return (data || []).map((p) => p.slug);
  } catch (err) {
    console.error('Failed to fetch pattern slugs:', err);
    return [];
  }
}
