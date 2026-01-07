/**
 * Pattern slice - manages pattern data
 * Handles the core pattern content (id, name, author, SVG, viewBox)
 */

import type { StateCreator } from 'zustand';

import { DEFAULT_SVG_CONTENT, DEFAULT_VIEW_BOX } from '../../config/defaults';
import type { PatternV1 } from '../../types';

/**
 * Pattern state shape
 */
export interface PatternState {
  patternId: string | null;
  patternName: string;
  patternAuthor: string;
  patternLicense: string;
  patternNotes: string;
  svgContent: string;
  viewBox: string;
}

/**
 * Pattern actions
 */
export interface PatternActions {
  setSvgContent: (content: string) => void;
  setViewBox: (viewBox: string) => void;
  setPatternName: (name: string) => void;
  setPatternAuthor: (author: string) => void;
  setPatternLicense: (license: string) => void;
  setPatternNotes: (notes: string) => void;
  loadPattern: (pattern: PatternV1) => void;
  resetPattern: () => void;
}

/**
 * Combined pattern slice type
 */
export type PatternSlice = PatternState & PatternActions;

/**
 * Initial pattern state
 */
const initialPatternState: PatternState = {
  patternId: null,
  patternName: 'Untitled Pattern',
  patternAuthor: '',
  patternLicense: 'CC BY 4.0',
  patternNotes: '',
  svgContent: DEFAULT_SVG_CONTENT,
  viewBox: DEFAULT_VIEW_BOX,
};

/**
 * Create the pattern slice
 */
export const createPatternSlice: StateCreator<PatternSlice, [], [], PatternSlice> = (set) => ({
  ...initialPatternState,

  setSvgContent: (content) => set({ svgContent: content }),

  setViewBox: (viewBox) => set({ viewBox }),

  setPatternName: (name) => set({ patternName: name }),

  setPatternAuthor: (author) => set({ patternAuthor: author }),

  setPatternLicense: (license) => set({ patternLicense: license }),

  setPatternNotes: (notes) => set({ patternNotes: notes }),

  loadPattern: (pattern) =>
    set({
      patternId: pattern.id,
      patternName: pattern.name,
      patternAuthor: pattern.author,
      patternLicense: pattern.license,
      patternNotes: pattern.notes ?? '',
      svgContent: pattern.tile.svg,
      viewBox: pattern.tile.viewBox,
    }),

  resetPattern: () => set(initialPatternState),
});
