/**
 * UI slice - manages UI preferences like theme
 * Handles theme switching with system preference detection
 */

import type { StateCreator } from 'zustand';

export type Theme = 'light' | 'dark';

/**
 * UI state shape
 */
export interface UiStateData {
  theme: Theme;
}

/**
 * UI actions
 */
export interface UiActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

/**
 * Combined UI slice type
 */
export type UiSlice = UiStateData & UiActions;

/**
 * Get initial theme from localStorage or system preference
 */
function getInitialTheme(): Theme {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('sashiko-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    // Fall back to system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'dark'; // Default to dark for design tool
}

/**
 * Apply theme to document
 */
function applyTheme(theme: Theme): void {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem('sashiko-theme', theme);
  }
}

/**
 * Initial UI state
 */
const initialUiState: UiStateData = {
  theme: 'dark',
};

/**
 * Create the UI slice
 */
export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set, get) => ({
  ...initialUiState,

  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    set({ theme: newTheme });
  },

  initTheme: () => {
    const theme = getInitialTheme();
    applyTheme(theme);
    set({ theme });
  },
});
