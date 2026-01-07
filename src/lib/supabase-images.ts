/**
 * Utility functions for interacting with Supabase Storage for pattern images.
 * Used for uploading and retrieving user-submitted gallery images.
 */

import { createClient } from '@supabase/supabase-js';

// These should be set in environment variables
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

const BUCKET_NAME = 'pattern-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  patternId: string;
  submittedBy: string;
  submittedAt: string;
}

/**
 * Upload an image to the pattern gallery
 */
export async function uploadGalleryImage(
  file: File,
  patternId: string,
  submitterName: string
): Promise<UploadResult> {
  const client = getSupabase();
  
  if (!client) {
    return { success: false, error: 'Supabase not configured' };
  }

  // Validate file
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: 'Invalid file type. Please use JPEG, PNG, or WebP.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'File too large. Maximum size is 5MB.' };
  }

  try {
    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${patternId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Upload to storage
    const { data, error } = await client.storage
      .from(BUCKET_NAME)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = client.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    // Insert record in gallery_submissions table
    // Note: This will work once the table is set up in Supabase
    await client.from('gallery_submissions').insert([{
      pattern_id: patternId,
      image_path: data.path,
      submitted_by: submitterName,
      status: 'pending', // Requires moderation
    }] as never[]);

    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return { success: false, error: message };
  }
}

/**
 * Get approved gallery images for a pattern
 */
export async function getGalleryImages(patternId: string): Promise<GalleryImage[]> {
  const client = getSupabase();
  
  if (!client) {
    return [];
  }

  try {
    const { data, error } = await client
      .from('gallery_submissions')
      .select('*')
      .eq('pattern_id', patternId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((item: {
      id: string;
      image_path: string;
      pattern_id: string;
      submitted_by: string;
      created_at: string;
    }) => {
      const { data: urlData } = client.storage
        .from(BUCKET_NAME)
        .getPublicUrl(item.image_path);

      return {
        id: item.id,
        url: urlData.publicUrl,
        thumbnailUrl: urlData.publicUrl, // Could generate actual thumbnails
        patternId: item.pattern_id,
        submittedBy: item.submitted_by,
        submittedAt: item.created_at,
      };
    });
  } catch {
    return [];
  }
}
