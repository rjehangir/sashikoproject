/**
 * Pattern Migration Script
 * Migrates patterns from /public/patterns/*.json to Supabase
 *
 * Usage:
 *   npx ts-node scripts/migrate-patterns.ts
 *
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables
 *   - Supabase database schema already applied
 *   - Storage bucket 'patterns' created
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const PATTERNS_DIR = path.join(__dirname, '..', 'public', 'patterns');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

interface PatternV1 {
  id: string;
  name: string;
  author: string;
  license: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  tile: {
    svg: string;
    viewBox: string;
  };
  defaults: {
    stitchLengthMm: number;
    gapLengthMm: number;
    strokeWidthMm: number;
    snapGridMm: number;
  };
}

interface PatternIndex {
  patterns: Array<{
    id: string;
    name: string;
    author: string;
    license: string;
  }>;
}

async function main() {
  console.log('🧵 Sashiko Pattern Migration Tool\n');

  // Validate environment
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('   SUPABASE_URL - Your Supabase project URL');
    console.error('   SUPABASE_SERVICE_KEY - Your Supabase service role key');
    console.error('\nSet these before running the migration.');
    process.exit(1);
  }

  // Initialize Supabase client with service role key
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // Load pattern index
  const indexPath = path.join(PATTERNS_DIR, 'index.json');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Pattern index not found:', indexPath);
    process.exit(1);
  }

  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  const index: PatternIndex = JSON.parse(indexContent);
  console.log(`📋 Found ${index.patterns.length} patterns in index\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const entry of index.patterns) {
    const patternPath = path.join(PATTERNS_DIR, `${entry.id}.json`);

    if (!fs.existsSync(patternPath)) {
      console.warn(`⚠️  Pattern file not found: ${entry.id}.json`);
      errorCount++;
      continue;
    }

    try {
      // Load pattern
      const patternContent = fs.readFileSync(patternPath, 'utf-8');
      const pattern: PatternV1 = JSON.parse(patternContent);

      console.log(`📦 Migrating: ${pattern.name} (${pattern.id})`);

      // Check if pattern already exists
      const { data: existing } = await supabase
        .from('patterns')
        .select('id')
        .eq('slug', pattern.id)
        .single();

      if (existing) {
        console.log(`   ⏭️  Already exists, skipping`);
        continue;
      }

      // Upload SVG to storage
      const svgPath = `approved/${pattern.id}.svg`;
      const svgContent = pattern.tile.svg;

      const { error: uploadError } = await supabase.storage
        .from('patterns')
        .upload(svgPath, svgContent, {
          contentType: 'image/svg+xml',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // Insert pattern record
      const { error: insertError } = await supabase.from('patterns').insert({
        slug: pattern.id,
        name: pattern.name,
        author: pattern.author,
        license: pattern.license,
        notes: pattern.notes ?? null,
        svg_url: svgPath,
        tile_viewbox: pattern.tile.viewBox,
        stitch_defaults: pattern.defaults,
        status: 'approved',
        approved_at: new Date().toISOString(),
        view_count: 0,
        download_count: 0,
      });

      if (insertError) {
        // Clean up uploaded SVG on failure
        await supabase.storage.from('patterns').remove([svgPath]);
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      console.log(`   ✅ Success`);
      successCount++;
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      errorCount++;
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📦 Total: ${index.patterns.length}`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
