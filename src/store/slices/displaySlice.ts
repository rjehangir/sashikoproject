/**
 * Display slice - manages visual rendering settings
 * Handles colors, grid, and preview settings
 */

import type { StateCreator } from 'zustand';

import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_THREAD_COLOR,
  DEFAULT_PREVIEW_DPI,
} from '../../config/constants';
import type { PreviewScaleMode } from '../../types';

/**
 * Display state shape
 */
export interface DisplayStateData {
  backgroundColor: string;
  threadColor: string;
  showGrid: boolean;
  previewDpi: number;
  previewScaleMode: PreviewScaleMode;
}

/**
 * Display actions
 */
export interface DisplayActions {
  setBackgroundColor: (color: string) => void;
  setThreadColor: (color: string) => void;
  setShowGrid: (show: boolean) => void;
  toggleGrid: () => void;
  setPreviewDpi: (dpi: number) => void;
  setPreviewScaleMode: (mode: PreviewScaleMode) => void;
  resetDisplaySettings: () => void;
}

/**
 * Combined display slice type
 */
export type DisplaySlice = DisplayStateData & DisplayActions;

/**
 * Initial display state
 */
const initialDisplayState: DisplayStateData = {
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  threadColor: DEFAULT_THREAD_COLOR,
  showGrid: false,
  previewDpi: DEFAULT_PREVIEW_DPI,
  previewScaleMode: 'fit',
};

/**
 * Create the display slice
 */
export const createDisplaySlice: StateCreator<DisplaySlice, [], [], DisplaySlice> = (set) => ({
  ...initialDisplayState,

  setBackgroundColor: (color) => set({ backgroundColor: color }),

  setThreadColor: (color) => set({ threadColor: color }),

  setShowGrid: (show) => set({ showGrid: show }),

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  setPreviewDpi: (dpi) => set({ previewDpi: dpi }),

  setPreviewScaleMode: (mode) => set({ previewScaleMode: mode }),

  resetDisplaySettings: () => set(initialDisplayState),
});
