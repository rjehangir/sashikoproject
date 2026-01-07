/**
 * Combined Zustand store
 * Combines all slices with persistence and devtools middleware
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { persistConfig } from './middleware/persist';
import {
  createPatternSlice,
  createEditorSlice,
  createDisplaySlice,
  createSizeSlice,
  createStitchSlice,
  createDraftsSlice,
  createLibrarySlice,
  type PatternSlice,
  type EditorSlice,
  type DisplaySlice,
  type SizeSlice,
  type StitchSlice,
  type DraftsSlice,
  type LibrarySlice,
} from './slices';

// ============================================================================
// COMBINED STORE TYPE
// ============================================================================

/**
 * Combined application store type
 */
export type AppStore = PatternSlice &
  EditorSlice &
  DisplaySlice &
  SizeSlice &
  StitchSlice &
  DraftsSlice &
  LibrarySlice;

// ============================================================================
// STORE CREATION
// ============================================================================

/**
 * Main application store
 * Combines all slices with devtools and persistence
 */
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (...a) => ({
        ...createPatternSlice(...a),
        ...createEditorSlice(...a),
        ...createDisplaySlice(...a),
        ...createSizeSlice(...a),
        ...createStitchSlice(...a),
        ...createDraftsSlice(...a),
        ...createLibrarySlice(...a),
      }),
      persistConfig
    ),
    {
      name: 'SashikoStore',
      enabled: import.meta.env.DEV,
    }
  )
);

// ============================================================================
// SELECTOR HOOKS
// ============================================================================

/**
 * Pattern-related state selector
 */
export const usePatternState = () =>
  useAppStore((state) => ({
    patternId: state.patternId,
    patternName: state.patternName,
    patternAuthor: state.patternAuthor,
    patternLicense: state.patternLicense,
    patternNotes: state.patternNotes,
    svgContent: state.svgContent,
    viewBox: state.viewBox,
    setSvgContent: state.setSvgContent,
    setViewBox: state.setViewBox,
    setPatternName: state.setPatternName,
    setPatternAuthor: state.setPatternAuthor,
    setPatternLicense: state.setPatternLicense,
    setPatternNotes: state.setPatternNotes,
    loadPattern: state.loadPattern,
    resetPattern: state.resetPattern,
  }));

/**
 * Editor-related state selector
 */
export const useEditorState = () =>
  useAppStore((state) => ({
    editorMode: state.editorMode,
    activeTool: state.activeTool,
    selectedElementId: state.selectedElementId,
    isDrawing: state.isDrawing,
    snapToGrid: state.snapToGrid,
    setEditorMode: state.setEditorMode,
    setActiveTool: state.setActiveTool,
    setSelectedElementId: state.setSelectedElementId,
    setIsDrawing: state.setIsDrawing,
    setSnapToGrid: state.setSnapToGrid,
    clearSelection: state.clearSelection,
  }));

/**
 * Display-related state selector
 */
export const useDisplayState = () =>
  useAppStore((state) => ({
    backgroundColor: state.backgroundColor,
    threadColor: state.threadColor,
    showGrid: state.showGrid,
    previewDpi: state.previewDpi,
    previewScaleMode: state.previewScaleMode,
    setBackgroundColor: state.setBackgroundColor,
    setThreadColor: state.setThreadColor,
    setShowGrid: state.setShowGrid,
    toggleGrid: state.toggleGrid,
    setPreviewDpi: state.setPreviewDpi,
    setPreviewScaleMode: state.setPreviewScaleMode,
    resetDisplaySettings: state.resetDisplaySettings,
  }));

/**
 * Size-related state selector
 */
export const useSizeState = () =>
  useAppStore((state) => ({
    unit: state.unit,
    sizeMode: state.sizeMode,
    tileSizeMm: state.tileSizeMm,
    rows: state.rows,
    cols: state.cols,
    rowOffset: state.rowOffset,
    finalSizeMm: state.finalSizeMm,
    setUnit: state.setUnit,
    setSizeMode: state.setSizeMode,
    setTileSizeMm: state.setTileSizeMm,
    setRows: state.setRows,
    setCols: state.setCols,
    setRowOffset: state.setRowOffset,
    setFinalSizeMm: state.setFinalSizeMm,
    resetSizeSettings: state.resetSizeSettings,
  }));

/**
 * Stitch-related state selector
 */
export const useStitchState = () =>
  useAppStore((state) => ({
    stitchLengthMm: state.stitchLengthMm,
    gapLengthMm: state.gapLengthMm,
    strokeWidthMm: state.strokeWidthMm,
    snapGridMm: state.snapGridMm,
    setStitchLengthMm: state.setStitchLengthMm,
    setGapLengthMm: state.setGapLengthMm,
    setStrokeWidthMm: state.setStrokeWidthMm,
    setSnapGridMm: state.setSnapGridMm,
    loadStitchDefaults: state.loadStitchDefaults,
    resetStitchSettings: state.resetStitchSettings,
  }));

/**
 * Drafts-related state selector
 */
export const useDraftsState = () =>
  useAppStore((state) => ({
    drafts: state.drafts,
    lastSavedState: state.lastSavedState,
    loadDrafts: state.loadDrafts,
    saveDraft: state.saveDraft,
    updateDraft: state.updateDraft,
    deleteDraft: state.deleteDraft,
    clearAllDrafts: state.clearAllDrafts,
    setLastSavedState: state.setLastSavedState,
    isDirty: state.isDirty,
  }));

/**
 * Library-related state selector
 */
export const useLibraryState = () =>
  useAppStore((state) => ({
    patterns: state.patterns,
    loading: state.loading,
    error: state.error,
    sortBy: state.sortBy,
    searchQuery: state.searchQuery,
    currentPage: state.currentPage,
    totalPatterns: state.totalPatterns,
    hasMore: state.hasMore,
    patternsPerPage: state.patternsPerPage,
    fetchPatterns: state.fetchPatterns,
    fetchMorePatterns: state.fetchMorePatterns,
    setSortBy: state.setSortBy,
    setSearchQuery: state.setSearchQuery,
    resetLibrary: state.resetLibrary,
  }));

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Export slice types for external use
export type { PatternSlice, PatternState, PatternActions } from './slices/patternSlice';

export type { EditorSlice, EditorStateData, EditorActions } from './slices/editorSlice';

export type { DisplaySlice, DisplayStateData, DisplayActions } from './slices/displaySlice';

export type { SizeSlice, SizeStateData, SizeActions } from './slices/sizeSlice';

export type { StitchSlice, StitchStateData, StitchActions } from './slices/stitchSlice';

export type {
  DraftsSlice,
  DraftsStateData,
  DraftsActions,
  DraftPattern,
} from './slices/draftsSlice';

export type { LibrarySlice, LibraryStateData, LibraryActions } from './slices/librarySlice';

// Export store types
export type { PersistedFields } from './middleware/persist';
