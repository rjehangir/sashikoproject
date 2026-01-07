# Agent 1: Core Architecture and Type System

## Mission

Establish the foundational type system and refactor the monolithic Zustand store into domain-specific slices. Your work forms the foundation that other agents depend on.

## Scope

You own these directories exclusively:
- `src/types/` - All TypeScript type definitions
- `src/store/` - State management
- `src/config/` - Constants and configuration
- `tsconfig.json` - TypeScript configuration

## Dependencies

- **None** - You are the foundation. Other agents depend on your types.

## Tasks

### Task 1.1: Enable Strict TypeScript Configuration

Update `tsconfig.json` to enable strict mode:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Task 1.2: Consolidate Type System

Create a unified type system in `src/types/index.ts` that consolidates and improves all types:

1. **Move types from** `src/types/app.ts` and `src/types/pattern.ts`
2. **Remove duplicate** `Unit` type from `src/lib/units.ts` (import from types instead)
3. **Add Result type** for error handling:

```typescript
// src/types/result.ts
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;
```

4. **Create domain-specific types**:

```typescript
// src/types/editor.ts
export type EditorMode = 'code' | 'graphical';
export type Tool = 'select' | 'draw' | 'pan';

export interface EditorState {
  mode: EditorMode;
  activeTool: Tool;
  selectedLineId: string | null;
  isDrawing: boolean;
  snapToGrid: boolean;
}
```

5. **Create proper ViewBox type**:

```typescript
// src/types/svg.ts
export interface ViewBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export function parseViewBox(viewBoxString: string): ViewBox | null;
export function formatViewBox(viewBox: ViewBox): string;
```

**Files to create:**
- `src/types/index.ts` - Main export barrel
- `src/types/result.ts` - Result/Either types
- `src/types/pattern.ts` - Pattern domain types (keep Zod schemas)
- `src/types/editor.ts` - Editor state types
- `src/types/display.ts` - Display/preview types
- `src/types/svg.ts` - SVG-related types
- `src/types/units.ts` - Unit and measurement types

### Task 1.3: Create Constants and Configuration

Create `src/config/` directory with:

**`src/config/constants.ts`:**
```typescript
// Measurement constants
export const MM_PER_INCH = 25.4;
export const POINTS_PER_INCH = 72;

// Default values
export const DEFAULT_TILE_SIZE_MM = 10;
export const DEFAULT_STITCH_LENGTH_MM = 3;
export const DEFAULT_GAP_LENGTH_MM = 1.5;
export const DEFAULT_STROKE_WIDTH_MM = 0.6;
export const DEFAULT_SNAP_GRID_MM = 1;
export const DEFAULT_ROWS = 4;
export const DEFAULT_COLS = 4;

// Colors
export const DEFAULT_BACKGROUND_COLOR = '#1a1a1a';
export const DEFAULT_THREAD_COLOR = '#ffffff';

// Preview
export const DEFAULT_PREVIEW_DPI = 96;
```

**`src/config/paper.ts`:**
```typescript
export interface PaperDimensions {
  width: number;  // mm
  height: number; // mm
}

export const PAPER_SIZES: Record<string, PaperDimensions> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
} as const;

export type PaperSize = keyof typeof PAPER_SIZES;
```

**`src/config/defaults.ts`:**
```typescript
import type { PatternState, EditorState, DisplayState } from '../types';
import * as constants from './constants';

export const DEFAULT_SVG_CONTENT = `<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
  <line x1="2" y1="2.4" x2="8" y2="2.4" stroke="white" stroke-width="0.6"/>
  <line x1="8" y1="2.4" x2="5" y2="7.6" stroke="white" stroke-width="0.6"/>
  <line x1="5" y1="7.6" x2="2" y2="2.4" stroke="white" stroke-width="0.6"/>
</svg>`;

export const DEFAULT_VIEW_BOX = '0 0 10 10';

export const createDefaultPatternState = (): PatternState => ({ ... });
export const createDefaultEditorState = (): EditorState => ({ ... });
export const createDefaultDisplayState = (): DisplayState => ({ ... });
```

### Task 1.4: Split Store into Domain Slices

Refactor `src/store/useAppStore.ts` (currently 101 lines, 30+ fields) into slices:

**Directory structure:**
```
src/store/
  index.ts              # Combined store export
  slices/
    patternSlice.ts     # Pattern data (id, name, author, svg, viewBox)
    editorSlice.ts      # Editor state (mode, selection)
    displaySlice.ts     # Display settings (colors, grid, preview)
    sizeSlice.ts        # Size settings (tile, rows, cols, offset)
    stitchSlice.ts      # Stitch defaults (length, gap, width)
  middleware/
    persist.ts          # localStorage persistence
    logger.ts           # Development logging
  types.ts              # Store-specific types
```

**Example slice pattern:**
```typescript
// src/store/slices/patternSlice.ts
import { StateCreator } from 'zustand';
import type { PatternV1 } from '../../types';
import { DEFAULT_SVG_CONTENT, DEFAULT_VIEW_BOX } from '../../config/defaults';

export interface PatternSlice {
  // State
  patternId: string | null;
  patternName: string;
  patternAuthor: string;
  patternLicense: string;
  patternNotes: string;
  svgContent: string;
  viewBox: string;
  
  // Actions
  setSvgContent: (content: string) => void;
  setViewBox: (viewBox: string) => void;
  loadPattern: (pattern: PatternV1) => void;
  resetPattern: () => void;
}

export const createPatternSlice: StateCreator<
  PatternSlice,
  [],
  [],
  PatternSlice
> = (set) => ({
  patternId: null,
  patternName: 'Untitled Pattern',
  patternAuthor: '',
  patternLicense: 'CC BY 4.0',
  patternNotes: '',
  svgContent: DEFAULT_SVG_CONTENT,
  viewBox: DEFAULT_VIEW_BOX,
  
  setSvgContent: (content) => set({ svgContent: content }),
  setViewBox: (viewBox) => set({ viewBox }),
  loadPattern: (pattern) => set({
    patternId: pattern.id,
    patternName: pattern.name,
    patternAuthor: pattern.author,
    patternLicense: pattern.license,
    patternNotes: pattern.notes || '',
    svgContent: pattern.tile.svg,
    viewBox: pattern.tile.viewBox,
  }),
  resetPattern: () => set({
    patternId: null,
    patternName: 'Untitled Pattern',
    patternAuthor: '',
    patternLicense: 'CC BY 4.0',
    patternNotes: '',
    svgContent: DEFAULT_SVG_CONTENT,
    viewBox: DEFAULT_VIEW_BOX,
  }),
});
```

**Combined store:**
```typescript
// src/store/index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createPatternSlice, PatternSlice } from './slices/patternSlice';
import { createEditorSlice, EditorSlice } from './slices/editorSlice';
import { createDisplaySlice, DisplaySlice } from './slices/displaySlice';
import { createSizeSlice, SizeSlice } from './slices/sizeSlice';
import { createStitchSlice, StitchSlice } from './slices/stitchSlice';

export type AppStore = PatternSlice & EditorSlice & DisplaySlice & SizeSlice & StitchSlice;

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createPatternSlice(...args),
        ...createEditorSlice(...args),
        ...createDisplaySlice(...args),
        ...createSizeSlice(...args),
        ...createStitchSlice(...args),
      }),
      {
        name: 'sashiko-store',
        partialize: (state) => ({
          // Only persist pattern and settings, not transient editor state
          patternId: state.patternId,
          patternName: state.patternName,
          svgContent: state.svgContent,
          viewBox: state.viewBox,
          backgroundColor: state.backgroundColor,
          threadColor: state.threadColor,
        }),
      }
    )
  )
);

// Selector hooks for better performance
export const usePatternStore = () => useAppStore((state) => ({
  patternId: state.patternId,
  patternName: state.patternName,
  svgContent: state.svgContent,
  viewBox: state.viewBox,
  setSvgContent: state.setSvgContent,
  setViewBox: state.setViewBox,
  loadPattern: state.loadPattern,
  resetPattern: state.resetPattern,
}));
```

### Task 1.5: Update Imports Across Codebase

After creating the new type system, update imports in existing files:
- Replace `import type { Unit } from '../lib/units'` with `import type { Unit } from '../types'`
- Replace direct constant usage with imports from `src/config/constants.ts`

## Deliverables Checklist

- [ ] `tsconfig.json` updated with strict settings
- [ ] `src/types/index.ts` - barrel export
- [ ] `src/types/result.ts` - Result type
- [ ] `src/types/pattern.ts` - Pattern types with Zod
- [ ] `src/types/editor.ts` - Editor types
- [ ] `src/types/display.ts` - Display types
- [ ] `src/types/svg.ts` - SVG types
- [ ] `src/types/units.ts` - Unit types
- [ ] `src/config/constants.ts` - Magic numbers extracted
- [ ] `src/config/paper.ts` - Paper sizes
- [ ] `src/config/defaults.ts` - Default values
- [ ] `src/store/index.ts` - Combined store
- [ ] `src/store/slices/patternSlice.ts`
- [ ] `src/store/slices/editorSlice.ts`
- [ ] `src/store/slices/displaySlice.ts`
- [ ] `src/store/slices/sizeSlice.ts`
- [ ] `src/store/slices/stitchSlice.ts`
- [ ] All existing files updated to use new imports
- [ ] No TypeScript errors with strict mode

## Report Requirements

After completing all tasks, create a report at `.cursor/agents/agent1-report.md` containing:

1. **Summary** - What was accomplished
2. **Files Created** - List all new files with brief descriptions
3. **Files Modified** - List all modified files with change summaries
4. **Breaking Changes** - Any changes that affect other agents
5. **Type Exports** - List of all exported types other agents should use
6. **Known Issues** - Any remaining TypeScript errors or concerns
7. **Recommendations** - Suggestions for other agents




