/**
 * Editor state types
 * Defines types for the pattern editor UI state
 */

/** Editor mode - code vs graphical editing */
export type EditorMode = 'code' | 'graphical';

/** Available editing tools in graphical mode */
export type Tool = 'select' | 'draw' | 'pan';

/** Editor state for managing UI */
export interface EditorState {
  /** Current editor mode */
  mode: EditorMode;
  /** Active tool in graphical mode */
  activeTool: Tool;
  /** Currently selected line/element ID */
  selectedElementId: string | null;
  /** Whether user is currently drawing */
  isDrawing: boolean;
  /** Whether to snap to grid */
  snapToGrid: boolean;
}

/** Drawing state during line creation */
export interface DrawingState {
  /** Starting point of the line */
  startPoint: { x: number; y: number } | null;
  /** Current cursor position */
  currentPoint: { x: number; y: number } | null;
}

/** Pan/zoom state for the viewport */
export interface ViewportState {
  /** Current pan offset */
  panOffset: { x: number; y: number };
  /** Current zoom level (1 = 100%) */
  zoom: number;
}

/** Undo/redo history entry */
export interface HistoryEntry {
  /** Timestamp of the change */
  timestamp: number;
  /** SVG content at this point */
  svgContent: string;
  /** ViewBox at this point */
  viewBox: string;
}

/** History state for undo/redo */
export interface HistoryState {
  /** Past states for undo */
  past: HistoryEntry[];
  /** Future states for redo */
  future: HistoryEntry[];
  /** Maximum history length */
  maxLength: number;
}
