/**
 * Editor slice - manages editor UI state
 * Handles editor mode, selection, and tool state
 */

import type { StateCreator } from 'zustand';

import type { EditorMode, Tool } from '../../types';

/**
 * Editor state shape
 */
export interface EditorStateData {
  editorMode: EditorMode;
  activeTool: Tool;
  selectedElementId: string | null;
  isDrawing: boolean;
  snapToGrid: boolean;
  /** Number of grid squares visible outside the viewBox boundary */
  gridPadding: number;
  /** Grid columns (width in units) */
  gridCols: number;
  /** Grid rows (height in units) */
  gridRows: number;
  /** Whether the settings panel is expanded */
  settingsExpanded: boolean;
}

/**
 * Editor actions
 */
export interface EditorActions {
  setEditorMode: (mode: EditorMode) => void;
  setActiveTool: (tool: Tool) => void;
  setSelectedElementId: (id: string | null) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridPadding: (padding: number) => void;
  setGridCols: (cols: number) => void;
  setGridRows: (rows: number) => void;
  setSettingsExpanded: (expanded: boolean) => void;
  clearSelection: () => void;
}

/**
 * Combined editor slice type
 */
export type EditorSlice = EditorStateData & EditorActions;

/**
 * Initial editor state
 */
const initialEditorState: EditorStateData = {
  editorMode: 'graphical',
  activeTool: 'select',
  selectedElementId: null,
  isDrawing: false,
  snapToGrid: true,
  gridPadding: 2,
  gridCols: 10,
  gridRows: 10,
  settingsExpanded: false,
};

/**
 * Create the editor slice
 */
export const createEditorSlice: StateCreator<EditorSlice, [], [], EditorSlice> = (set) => ({
  ...initialEditorState,

  setEditorMode: (mode) =>
    set({
      editorMode: mode,
      // Clear selection when switching modes
      selectedElementId: null,
      isDrawing: false,
    }),

  setActiveTool: (tool) =>
    set({
      activeTool: tool,
      // Clear drawing state when switching tools
      isDrawing: false,
    }),

  setSelectedElementId: (id) => set({ selectedElementId: id }),

  setIsDrawing: (isDrawing) => set({ isDrawing }),

  setSnapToGrid: (snap) => set({ snapToGrid: snap }),

  setGridPadding: (padding) => set({ gridPadding: Math.max(0, Math.min(10, padding)) }),

  setGridCols: (cols) => set({ gridCols: Math.max(1, Math.min(50, cols)) }),

  setGridRows: (rows) => set({ gridRows: Math.max(1, Math.min(50, rows)) }),

  setSettingsExpanded: (expanded) => set({ settingsExpanded: expanded }),

  clearSelection: () =>
    set({
      selectedElementId: null,
      isDrawing: false,
    }),
});
