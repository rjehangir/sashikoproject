-- ============================================================================
-- SASHIKO PATTERN DATABASE SCHEMA
-- Run this in your Supabase SQL Editor to set up the database
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Patterns table
CREATE TABLE IF NOT EXISTS patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  name TEXT NOT NULL CHECK (length(name) > 0),
  author TEXT NOT NULL CHECK (length(author) > 0),
  license TEXT DEFAULT 'CC BY 4.0',
  notes TEXT,
  svg_url TEXT NOT NULL,
  tile_viewbox TEXT NOT NULL,
  stitch_defaults JSONB NOT NULL DEFAULT '{
    "stitchLengthMm": 3,
    "gapLengthMm": 1.5,
    "strokeWidthMm": 0.6,
    "snapGridMm": 1
  }',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  download_count INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  submitter_email TEXT
);

-- Pattern images table (for future use)
CREATE TABLE IF NOT EXISTS pattern_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_id UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  credit TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin config table (for storing admin password hash)
CREATE TABLE IF NOT EXISTS admin_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for fetching approved patterns sorted by popularity
CREATE INDEX IF NOT EXISTS idx_patterns_approved_popular 
  ON patterns (status, download_count DESC) 
  WHERE status = 'approved';

-- Index for fetching approved patterns sorted by date
CREATE INDEX IF NOT EXISTS idx_patterns_approved_recent 
  ON patterns (status, created_at DESC) 
  WHERE status = 'approved';

-- Index for fetching approved patterns sorted by name
CREATE INDEX IF NOT EXISTS idx_patterns_approved_name 
  ON patterns (status, name) 
  WHERE status = 'approved';

-- Index for pattern images by pattern
CREATE INDEX IF NOT EXISTS idx_pattern_images_pattern 
  ON pattern_images (pattern_id, display_order);

-- Full-text search index on name and author
CREATE INDEX IF NOT EXISTS idx_patterns_search 
  ON patterns USING gin(to_tsvector('english', name || ' ' || author));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patterns_updated_at
  BEFORE UPDATE ON patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on tables
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- Patterns: Anyone can read approved patterns
CREATE POLICY "Anyone can view approved patterns" ON patterns
  FOR SELECT
  USING (status = 'approved');

-- Patterns: Anyone can submit new patterns (as pending)
CREATE POLICY "Anyone can submit patterns" ON patterns
  FOR INSERT
  WITH CHECK (status = 'pending');

-- Patterns: Anonymous can increment view/download counts
CREATE POLICY "Anyone can increment counts" ON patterns
  FOR UPDATE
  USING (status = 'approved')
  WITH CHECK (
    -- Only allow incrementing view_count or download_count
    view_count >= (SELECT view_count FROM patterns WHERE id = patterns.id) AND
    download_count >= (SELECT download_count FROM patterns WHERE id = patterns.id)
  );

-- Pattern images: Anyone can view images for approved patterns
CREATE POLICY "Anyone can view pattern images" ON pattern_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patterns 
      WHERE patterns.id = pattern_images.pattern_id 
      AND patterns.status = 'approved'
    )
  );

-- Admin config: Only service role can access
CREATE POLICY "Service role only for admin_config" ON admin_config
  FOR ALL
  USING (false);

-- ============================================================================
-- STORAGE BUCKETS
-- Run these in the Supabase Dashboard > Storage
-- ============================================================================

-- Create patterns bucket (for SVG files)
-- Settings: Public bucket, 1MB max file size, allowed MIME types: image/svg+xml

-- Create pattern-images bucket (for example images)
-- Settings: Public bucket, 5MB max file size, allowed MIME types: image/*

-- ============================================================================
-- INITIAL ADMIN SETUP
-- Replace 'your-secure-password-hash' with a bcrypt hash of your admin password
-- You can generate one at https://bcrypt-generator.com/
-- ============================================================================

-- INSERT INTO admin_config (key, value) VALUES ('admin_password_hash', 'your-bcrypt-hash-here');

