/**
 * Pattern Utilities
 *
 * @deprecated This module is maintained for backward compatibility.
 * Use the new service layer instead:
 *
 *   import { patternService } from '../services';
 *   // or individual services:
 *   import { patternRepository, patternFactory } from '../services';
 */

import { patternService } from '../services';
import type { PatternV1, PatternIndex } from '../types';
import { PatternV1Schema, PatternIndexSchema } from '../types';

// Re-export schemas for backward compatibility
export { PatternV1Schema, PatternIndexSchema };

/**
 * @deprecated Use patternService.fetchIndex instead
 */
export async function loadPatternIndex(): Promise<PatternIndex> {
  const result = await patternService.fetchIndex();
  if (result.success) {
    return result.data;
  }
  console.error('Error loading pattern index:', result.error);
  return { patterns: [] };
}

/**
 * @deprecated Use patternService.fetchPattern instead
 */
export async function loadPattern(id: string): Promise<PatternV1 | null> {
  const result = await patternService.fetchPattern(id);
  if (result.success) {
    return result.data;
  }
  console.error(`Error loading pattern ${id}:`, result.error);
  return null;
}

/**
 * @deprecated Use patternService.toJson instead
 */
export function exportPattern(pattern: PatternV1): string {
  return patternService.toJson(pattern, true);
}

/**
 * @deprecated Use patternService.fromJson instead
 */
export function importPattern(jsonString: string): PatternV1 | null {
  const result = patternService.fromJson(jsonString);
  if (result.success) {
    return result.data;
  }
  console.error('Error importing pattern:', result.error);
  return null;
}

/**
 * @deprecated Use patternService.create instead
 */
export function createPatternFromSvg(
  svgContent: string,
  viewBox: string,
  defaults: {
    stitchLengthMm: number;
    gapLengthMm: number;
    strokeWidthMm: number;
    snapGridMm: number;
  },
  metadata: {
    id: string;
    name: string;
    author: string;
    license?: string;
    notes?: string;
  }
): PatternV1 {
  return patternService.create(
    svgContent,
    viewBox,
    {
      id: metadata.id,
      name: metadata.name,
      author: metadata.author,
      license: metadata.license || 'CC BY 4.0',
      notes: metadata.notes || '',
    },
    defaults
  );
}
