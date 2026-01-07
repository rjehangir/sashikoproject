# Agent 3: Services Layer and Business Logic

## Mission

Extract all business logic from components and library files into a clean, testable services layer. Implement proper error handling with the Result pattern.

## Scope

You own these directories exclusively:
- `src/services/` - New service layer (create this)
- `src/lib/` - Existing library code (refactor, then deprecate)
- `src/utils/` - Shared utilities (new)

## Dependencies

- **Agent 1** - You depend on types from `src/types/`, especially the Result type
- Wait for Agent 1 to complete types before starting Task 3.2+

## Tasks

### Task 3.1: Create Service Architecture

Set up the service layer structure:

```
src/services/
  index.ts                    # Barrel export
  svg/
    index.ts                  # SvgService facade
    SvgParser.ts              # Parse SVG strings
    SvgTransformer.ts         # Mirror, rotate, snap
    SvgValidator.ts           # Validation and sanitization
    SvgSerializer.ts          # Convert back to string
  pdf/
    index.ts                  # PdfService facade
    PdfExporter.ts            # Main export logic
    PdfRenderer.ts            # Drawing primitives
    PathParser.ts             # SVG path command parsing
  pattern/
    index.ts                  # PatternService facade
    PatternRepository.ts      # Data access (fetch)
    PatternFactory.ts         # Create patterns from SVG
  storage/
    index.ts                  # StorageService facade
    LocalStorageAdapter.ts    # localStorage implementation
```

### Task 3.2: Create Utility Functions

**`src/utils/color.ts`:**
Extract `parseColor()` from `src/lib/pdf.ts` lines 236-256:
```typescript
export interface RGB {
  r: number;  // 0-1
  g: number;  // 0-1
  b: number;  // 0-1
}

export function parseHexColor(hex: string): RGB | null {
  const match = hex.match(/^#([0-9A-Fa-f]{6})$/);
  if (!match) return null;
  return {
    r: parseInt(match[1].slice(0, 2), 16) / 255,
    g: parseInt(match[1].slice(2, 4), 16) / 255,
    b: parseInt(match[1].slice(4, 6), 16) / 255,
  };
}

export function parseRgbColor(rgb: string): RGB | null {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return null;
  return {
    r: parseInt(match[1]) / 255,
    g: parseInt(match[2]) / 255,
    b: parseInt(match[3]) / 255,
  };
}

export function parseColor(color: string): RGB {
  return parseHexColor(color) ?? parseRgbColor(color) ?? { r: 1, g: 1, b: 1 };
}
```

**`src/utils/download.ts`:**
```typescript
export function downloadBlob(data: Uint8Array | string, filename: string, mimeType: string): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPdf(data: Uint8Array, filename: string): void {
  downloadBlob(data, filename, 'application/pdf');
}

export function downloadJson(data: string, filename: string): void {
  downloadBlob(data, filename, 'application/json');
}
```

**`src/utils/units.ts`:**
Keep unit conversion functions but import types from `src/types`:
```typescript
import type { Unit } from '../types';
import { MM_PER_INCH, POINTS_PER_INCH } from '../config/constants';

export function mmToInches(mm: number): number {
  return mm / MM_PER_INCH;
}

export function inchesToMm(inches: number): number {
  return inches * MM_PER_INCH;
}

export function mmToPoints(mm: number): number {
  return (mm * POINTS_PER_INCH) / MM_PER_INCH;
}

export function pointsToMm(points: number): number {
  return (points * MM_PER_INCH) / POINTS_PER_INCH;
}

export function convert(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  if (from === 'mm' && to === 'in') return mmToInches(value);
  if (from === 'in' && to === 'mm') return inchesToMm(value);
  return value;
}
```

### Task 3.3: Create SVG Services

**`src/services/svg/SvgParser.ts`:**
```typescript
import type { Result } from '../../types';

export interface ParsedSvg {
  document: Document;
  svgElement: SVGSVGElement;
  viewBox: ViewBox | null;
}

export class SvgParser {
  private parser = new DOMParser();
  private serializer = new XMLSerializer();
  
  parse(svgString: string): Result<ParsedSvg> {
    try {
      const doc = this.parser.parseFromString(svgString, 'image/svg+xml');
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        return { success: false, error: new Error('Invalid SVG syntax') };
      }
      
      const svg = doc.querySelector('svg');
      if (!svg) {
        return { success: false, error: new Error('No SVG element found') };
      }
      
      const viewBoxAttr = svg.getAttribute('viewBox');
      const viewBox = viewBoxAttr ? this.parseViewBox(viewBoxAttr) : null;
      
      return {
        success: true,
        data: { document: doc, svgElement: svg as SVGSVGElement, viewBox },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error('Parse failed') };
    }
  }
  
  serialize(doc: Document): string {
    return this.serializer.serializeToString(doc);
  }
  
  parseViewBox(viewBoxString: string): ViewBox | null {
    const match = viewBoxString.match(
      /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/
    );
    if (!match) return null;
    return {
      minX: parseFloat(match[1]),
      minY: parseFloat(match[2]),
      width: parseFloat(match[3]),
      height: parseFloat(match[4]),
    };
  }
}
```

**`src/services/svg/SvgValidator.ts`:**
Refactor from `src/lib/svg.ts` lines 23-76:
```typescript
import DOMPurify from 'dompurify';
import type { Result } from '../../types';

const ALLOWED_TAGS = ['svg', 'g', 'path', 'line', 'polyline', 'polygon', 'circle', 'rect'];
const ALLOWED_ATTRIBUTES = [
  'd', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points', 'cx', 'cy', 'r',
  'width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width',
  'transform', 'opacity', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray',
  'xmlns',
];

export interface ValidationError {
  type: 'syntax' | 'disallowed_tag' | 'disallowed_attribute' | 'event_handler';
  message: string;
  element?: string;
  attribute?: string;
}

export class SvgValidator {
  sanitize(svgString: string): string {
    return DOMPurify.sanitize(svgString, {
      ALLOWED_TAGS,
      ALLOWED_ATTR: ALLOWED_ATTRIBUTES,
      KEEP_CONTENT: true,
    });
  }
  
  validate(svgString: string): Result<void, ValidationError> {
    // ... validation logic from svg.ts
  }
}
```

**`src/services/svg/SvgTransformer.ts`:**
Refactor from `src/lib/svg.ts` lines 133-291:
```typescript
import { SvgParser } from './SvgParser';
import type { Result, ViewBox } from '../../types';

export class SvgTransformer {
  private parser = new SvgParser();
  
  mirrorHorizontal(svgString: string, viewBox: ViewBox): Result<string> {
    const parsed = this.parser.parse(svgString);
    if (!parsed.success) return parsed;
    
    const { document: doc, svgElement: svg } = parsed.data;
    const elements = svg.querySelectorAll('path, line, polyline, polygon, circle, rect, g');
    
    elements.forEach((el) => {
      const transform = el.getAttribute('transform') || '';
      const newTransform = `scale(-1, 1) translate(${-viewBox.width}, 0) ${transform}`.trim();
      el.setAttribute('transform', newTransform);
    });
    
    return { success: true, data: this.parser.serialize(doc) };
  }
  
  mirrorVertical(svgString: string, viewBox: ViewBox): Result<string> { ... }
  rotate90(svgString: string, viewBox: ViewBox): Result<string> { ... }
  snapToGrid(svgString: string, viewBox: ViewBox, gridSize: number): Result<string> { ... }
}
```

**`src/services/svg/index.ts`:**
```typescript
import { SvgParser } from './SvgParser';
import { SvgValidator } from './SvgValidator';
import { SvgTransformer } from './SvgTransformer';
import type { Result, ViewBox, ThreadStyleOptions } from '../../types';

export class SvgService {
  private parser = new SvgParser();
  private validator = new SvgValidator();
  private transformer = new SvgTransformer();
  
  parse(svgString: string) {
    return this.parser.parse(svgString);
  }
  
  validate(svgString: string) {
    return this.validator.validate(svgString);
  }
  
  sanitize(svgString: string) {
    return this.validator.sanitize(svgString);
  }
  
  extractViewBox(svgString: string): ViewBox | null {
    const result = this.parser.parse(svgString);
    return result.success ? result.data.viewBox : null;
  }
  
  mirrorHorizontal(svgString: string, viewBox: ViewBox) {
    return this.transformer.mirrorHorizontal(svgString, viewBox);
  }
  
  mirrorVertical(svgString: string, viewBox: ViewBox) {
    return this.transformer.mirrorVertical(svgString, viewBox);
  }
  
  rotate90(svgString: string, viewBox: ViewBox) {
    return this.transformer.rotate90(svgString, viewBox);
  }
  
  snapToGrid(svgString: string, viewBox: ViewBox, gridSize: number) {
    return this.transformer.snapToGrid(svgString, viewBox, gridSize);
  }
  
  applyThreadStyle(svgString: string, options: ThreadStyleOptions): Result<string> {
    // Refactored from svg.ts applyThreadStyle
  }
}

// Singleton instance for convenience
export const svgService = new SvgService();
```

### Task 3.4: Create PDF Services

**`src/services/pdf/PathParser.ts`:**
Extract from `src/lib/pdf.ts` lines 484-531:
```typescript
export interface PathCommand {
  type: 'M' | 'L' | 'H' | 'V' | 'Z' | 'C' | 'S' | 'Q' | 'T' | 'A';
  x?: number;
  y?: number;
  // Add control points for curves
}

export class PathParser {
  parse(d: string): PathCommand[] {
    const commands: PathCommand[] = [];
    // ... extracted logic
    return commands;
  }
}
```

**`src/services/pdf/PdfRenderer.ts`:**
Extract `drawSvgTile` from `src/lib/pdf.ts` lines 258-482:
```typescript
import { PDFPage, rgb } from 'pdf-lib';
import { SvgParser } from '../svg/SvgParser';
import { PathParser } from './PathParser';
import { parseColor } from '../../utils/color';
import { mmToPoints } from '../../utils/units';

export interface TileRenderOptions {
  viewBoxWidth: number;
  viewBoxHeight: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  strokeColor: RGB;
  strokeWidthPt: number;
  dashLengthPt: number;
  gapLengthPt: number;
}

export class PdfRenderer {
  private svgParser = new SvgParser();
  private pathParser = new PathParser();
  
  async drawTile(page: PDFPage, svgContent: string, options: TileRenderOptions): Promise<void> {
    const parsed = this.svgParser.parse(svgContent);
    if (!parsed.success) return;
    
    const elements = parsed.data.svgElement.querySelectorAll('path, line, polyline, polygon, circle, rect');
    
    for (const element of elements) {
      await this.drawElement(page, element, options);
    }
  }
  
  private async drawElement(page: PDFPage, element: Element, options: TileRenderOptions): Promise<void> {
    const tagName = element.tagName.toLowerCase();
    
    switch (tagName) {
      case 'line':
        this.drawLine(page, element, options);
        break;
      case 'rect':
        this.drawRect(page, element, options);
        break;
      case 'polyline':
      case 'polygon':
        this.drawPolyline(page, element, options, tagName === 'polygon');
        break;
      case 'path':
        this.drawPath(page, element, options);
        break;
    }
  }
  
  private drawLine(page: PDFPage, element: Element, options: TileRenderOptions): void {
    // ... extracted line drawing logic
  }
  
  // ... other draw methods
}
```

**`src/services/pdf/PdfExporter.ts`:**
Simplified main export function:
```typescript
import { PDFDocument, rgb } from 'pdf-lib';
import { PdfRenderer } from './PdfRenderer';
import type { PatternExportOptions } from '../../types';

export class PdfExporter {
  private renderer = new PdfRenderer();
  
  async export(options: PatternExportOptions): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = this.createPage(pdfDoc, options);
    
    await this.drawBackground(page, options);
    await this.drawTiles(page, options);
    await this.drawCalibrationSquare(page, options);
    await this.drawCropMarks(page, options);
    await this.drawSettingsSummary(page, options);
    
    return pdfDoc.save();
  }
  
  private createPage(doc: PDFDocument, options: PatternExportOptions) { ... }
  private async drawBackground(page: PDFPage, options: PatternExportOptions) { ... }
  private async drawTiles(page: PDFPage, options: PatternExportOptions) { ... }
  private async drawCalibrationSquare(page: PDFPage, options: PatternExportOptions) { ... }
  private async drawCropMarks(page: PDFPage, options: PatternExportOptions) { ... }
  private async drawSettingsSummary(page: PDFPage, options: PatternExportOptions) { ... }
}
```

**`src/services/pdf/index.ts`:**
```typescript
import { PdfExporter } from './PdfExporter';
import type { PatternExportOptions } from '../../types';

export class PdfService {
  private exporter = new PdfExporter();
  
  async exportPattern(options: PatternExportOptions): Promise<Uint8Array> {
    return this.exporter.export(options);
  }
}

export const pdfService = new PdfService();

// Convenience function for backward compatibility
export async function exportToPdf(options: PatternExportOptions): Promise<Uint8Array> {
  return pdfService.exportPattern(options);
}
```

### Task 3.5: Create Pattern Services

**`src/services/pattern/PatternRepository.ts`:**
```typescript
import type { PatternV1, PatternIndex, Result, AsyncResult } from '../../types';
import { PatternV1Schema, PatternIndexSchema } from '../../types/pattern';

export class PatternRepository {
  private baseUrl: string;
  
  constructor(baseUrl = '/patterns') {
    this.baseUrl = baseUrl;
  }
  
  async fetchIndex(): AsyncResult<PatternIndex> {
    try {
      const response = await fetch(`${this.baseUrl}/index.json`);
      if (!response.ok) {
        return { success: false, error: new Error(`HTTP ${response.status}`) };
      }
      const data = await response.json();
      const parsed = PatternIndexSchema.safeParse(data);
      if (!parsed.success) {
        return { success: false, error: new Error('Invalid pattern index format') };
      }
      return { success: true, data: parsed.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error('Fetch failed') };
    }
  }
  
  async fetchPattern(id: string): AsyncResult<PatternV1> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}.json`);
      if (!response.ok) {
        return { success: false, error: new Error(`HTTP ${response.status}`) };
      }
      const data = await response.json();
      const parsed = PatternV1Schema.safeParse(data);
      if (!parsed.success) {
        return { success: false, error: new Error('Invalid pattern format') };
      }
      return { success: true, data: parsed.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error('Fetch failed') };
    }
  }
}
```

**`src/services/pattern/PatternFactory.ts`:**
```typescript
import type { PatternV1, PatternDefaults, PatternMetadata } from '../../types';

export class PatternFactory {
  create(
    svgContent: string,
    viewBox: string,
    defaults: PatternDefaults,
    metadata: PatternMetadata
  ): PatternV1 {
    const now = new Date().toISOString();
    return {
      id: metadata.id,
      name: metadata.name,
      author: metadata.author,
      license: metadata.license || 'CC BY 4.0',
      notes: metadata.notes || '',
      createdAt: now,
      updatedAt: now,
      tile: { svg: svgContent, viewBox },
      defaults,
    };
  }
}
```

### Task 3.6: Create Storage Service

**`src/services/storage/LocalStorageAdapter.ts`:**
```typescript
import type { Result } from '../../types';

export class LocalStorageAdapter {
  private prefix: string;
  
  constructor(prefix = 'sashiko') {
    this.prefix = prefix;
  }
  
  private key(name: string): string {
    return `${this.prefix}:${name}`;
  }
  
  get<T>(name: string): Result<T | null> {
    try {
      const raw = localStorage.getItem(this.key(name));
      if (!raw) return { success: true, data: null };
      return { success: true, data: JSON.parse(raw) as T };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error('Read failed') };
    }
  }
  
  set<T>(name: string, value: T): Result<void> {
    try {
      localStorage.setItem(this.key(name), JSON.stringify(value));
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error('Write failed') };
    }
  }
  
  remove(name: string): Result<void> {
    try {
      localStorage.removeItem(this.key(name));
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error('Remove failed') };
    }
  }
}
```

**`src/services/storage/index.ts`:**
```typescript
import { LocalStorageAdapter } from './LocalStorageAdapter';
import type { PatternV1 } from '../../types';

export class StorageService {
  private adapter = new LocalStorageAdapter();
  
  saveCurrentPattern(pattern: Partial<PatternV1>): void {
    this.adapter.set('currentPattern', pattern);
  }
  
  loadCurrentPattern(): Partial<PatternV1> | null {
    const result = this.adapter.get<Partial<PatternV1>>('currentPattern');
    return result.success ? result.data : null;
  }
  
  saveEditorState(state: Record<string, unknown>): void {
    this.adapter.set('editorState', state);
  }
  
  loadEditorState(): Record<string, unknown> | null {
    const result = this.adapter.get<Record<string, unknown>>('editorState');
    return result.success ? result.data : null;
  }
}

export const storageService = new StorageService();
```

### Task 3.7: Update Lib Files for Backward Compatibility

Keep `src/lib/` files but have them delegate to services:

**`src/lib/svg.ts`:**
```typescript
// DEPRECATED: Use src/services/svg instead
// This file is maintained for backward compatibility

import { svgService } from '../services/svg';
import type { ViewBox } from '../types';

/** @deprecated Use svgService.sanitize instead */
export function sanitizeSvg(svgString: string): string {
  return svgService.sanitize(svgString);
}

/** @deprecated Use svgService.extractViewBox instead */
export function extractViewBox(svgString: string): string | null {
  const viewBox = svgService.extractViewBox(svgString);
  return viewBox ? `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}` : null;
}

// ... other deprecated wrappers
```

## Deliverables Checklist

- [ ] `src/utils/color.ts`
- [ ] `src/utils/download.ts`
- [ ] `src/utils/units.ts`
- [ ] `src/services/svg/SvgParser.ts`
- [ ] `src/services/svg/SvgValidator.ts`
- [ ] `src/services/svg/SvgTransformer.ts`
- [ ] `src/services/svg/index.ts`
- [ ] `src/services/pdf/PathParser.ts`
- [ ] `src/services/pdf/PdfRenderer.ts`
- [ ] `src/services/pdf/PdfExporter.ts`
- [ ] `src/services/pdf/index.ts`
- [ ] `src/services/pattern/PatternRepository.ts`
- [ ] `src/services/pattern/PatternFactory.ts`
- [ ] `src/services/pattern/index.ts`
- [ ] `src/services/storage/LocalStorageAdapter.ts`
- [ ] `src/services/storage/index.ts`
- [ ] `src/services/index.ts` - barrel export
- [ ] `src/lib/*.ts` files updated with deprecation wrappers
- [ ] All services use Result pattern for error handling
- [ ] No direct DOM manipulation outside of service layer

## Report Requirements

After completing all tasks, create a report at `.cursor/agents/agent3-report.md` containing:

1. **Summary** - What was accomplished
2. **Files Created** - List all new files with brief descriptions
3. **Files Modified** - List all modified files with change summaries
4. **API Reference** - Document public API for each service
5. **Error Handling** - Document error types and how they're handled
6. **Migration Guide** - How to migrate from old lib functions to new services
7. **Known Limitations** - Any SVG features not fully supported
8. **Test Coverage Needs** - List of functions that need unit tests (for Agent 4)




