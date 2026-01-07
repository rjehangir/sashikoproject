/**
 * Script to generate SEO-optimized PNG images from SVG patterns at build time.
 * These images are used for Open Graph meta tags and Google Images search results.
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

interface PatternTile {
  svg: string;
  viewBox: string;
  size: { width: number; height: number };
}

interface Pattern {
  id: string;
  name: string;
  author: string;
  tile?: PatternTile;
}

const SIZES = {
  thumbnail: { width: 300, height: 300 },
  preview: { width: 600, height: 600 },
  og: { width: 1200, height: 630 }, // Open Graph standard size
} as const;

const PATTERNS_DIR = path.join(process.cwd(), 'public', 'patterns');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'patterns');

async function generatePatternImage(
  pattern: Pattern,
  size: { width: number; height: number },
  suffix: string
): Promise<void> {
  if (!pattern.tile?.svg) {
    console.log(`  Skipping ${pattern.id}: no SVG tile`);
    return;
  }

  const viewBox = pattern.tile.viewBox || '0 0 100 100';
  
  // Create a complete SVG with proper dimensions and styling
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="${size.width}" 
     height="${size.height}" 
     viewBox="${viewBox}"
     style="background-color: #fcf9f3;">
  <defs>
    <style>
      path, line, polyline, polygon, circle, rect {
        stroke: #334e68;
        stroke-width: 1;
        fill: none;
      }
    </style>
  </defs>
  <rect width="100%" height="100%" fill="#fcf9f3"/>
  <g transform="translate(10, 10)">
    ${pattern.tile.svg.replace(/<svg[^>]*>|<\/svg>/gi, '')}
  </g>
</svg>`;

  const outputPath = path.join(OUTPUT_DIR, `${pattern.id}-${suffix}.png`);
  
  try {
    await sharp(Buffer.from(svgContent))
      .png({ quality: 90 })
      .toFile(outputPath);
    
    console.log(`  Generated: ${pattern.id}-${suffix}.png`);
  } catch (error) {
    console.error(`  Error generating ${pattern.id}-${suffix}.png:`, error);
  }
}

async function main() {
  console.log('🎨 Generating pattern images...\n');

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Read pattern index
  const indexPath = path.join(PATTERNS_DIR, 'index.json');
  if (!fs.existsSync(indexPath)) {
    console.error('Error: patterns/index.json not found');
    process.exit(1);
  }

  const patternIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  const patterns: Array<{ id: string }> = patternIndex.patterns || [];

  console.log(`Found ${patterns.length} patterns\n`);

  for (const patternRef of patterns) {
    const patternPath = path.join(PATTERNS_DIR, `${patternRef.id}.json`);
    
    if (!fs.existsSync(patternPath)) {
      console.log(`Skipping ${patternRef.id}: file not found`);
      continue;
    }

    const pattern: Pattern = JSON.parse(fs.readFileSync(patternPath, 'utf-8'));
    console.log(`Processing: ${pattern.name}`);

    // Generate all size variants
    await generatePatternImage(pattern, SIZES.thumbnail, 'thumb');
    await generatePatternImage(pattern, SIZES.preview, 'preview');
    await generatePatternImage(pattern, SIZES.og, 'og');
    
    console.log('');
  }

  console.log('✅ Pattern image generation complete!');
}

main().catch(console.error);
