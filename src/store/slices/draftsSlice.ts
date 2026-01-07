/**
 * Drafts slice - manages locally saved pattern drafts
 * Drafts are stored in localStorage and persist across sessions
 */

import type { StateCreator } from 'zustand';

import { localStorageAdapter } from '../../services/storage/LocalStorageAdapter';

/**
 * Draft pattern - a locally saved work-in-progress
 */
export interface DraftPattern {
  id: string;
  name: string;
  author: string;
  license: string;
  notes: string;
  svgContent: string;
  viewBox: string;
  savedAt: string;
}

/**
 * Drafts state shape
 */
export interface DraftsStateData {
  drafts: DraftPattern[];
  lastSavedState: {
    svgContent: string;
    patternName: string;
  } | null;
}

/**
 * Drafts actions
 */
export interface DraftsActions {
  loadDrafts: () => void;
  saveDraft: (draft: Omit<DraftPattern, 'id' | 'savedAt'>) => string;
  updateDraft: (id: string, draft: Partial<Omit<DraftPattern, 'id' | 'savedAt'>>) => void;
  deleteDraft: (id: string) => void;
  clearAllDrafts: () => void;
  setLastSavedState: (state: DraftsStateData['lastSavedState']) => void;
  isDirty: (currentSvg: string, currentName: string) => boolean;
}

/**
 * Combined drafts slice type
 */
export type DraftsSlice = DraftsStateData & DraftsActions;

/**
 * Storage key for drafts
 */
const DRAFTS_STORAGE_KEY = 'drafts';

/**
 * Generate a unique draft ID
 */
function generateDraftId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Initial drafts state
 */
const initialDraftsState: DraftsStateData = {
  drafts: [],
  lastSavedState: null,
};

/**
 * Create the drafts slice
 */
export const createDraftsSlice: StateCreator<DraftsSlice, [], [], DraftsSlice> = (set, get) => ({
  ...initialDraftsState,

  loadDrafts: () => {
    const result = localStorageAdapter.get<DraftPattern[]>(DRAFTS_STORAGE_KEY);
    if (result.success && result.data) {
      set({ drafts: result.data });
    }
  },

  saveDraft: (draft) => {
    const id = generateDraftId();
    const newDraft: DraftPattern = {
      ...draft,
      id,
      savedAt: new Date().toISOString(),
    };

    const drafts = [...get().drafts, newDraft];
    set({ drafts });

    // Persist to localStorage
    localStorageAdapter.set(DRAFTS_STORAGE_KEY, drafts);

    return id;
  },

  updateDraft: (id, updates) => {
    const drafts = get().drafts.map((draft) =>
      draft.id === id ? { ...draft, ...updates, savedAt: new Date().toISOString() } : draft
    );
    set({ drafts });
    localStorageAdapter.set(DRAFTS_STORAGE_KEY, drafts);
  },

  deleteDraft: (id) => {
    const drafts = get().drafts.filter((draft) => draft.id !== id);
    set({ drafts });
    localStorageAdapter.set(DRAFTS_STORAGE_KEY, drafts);
  },

  clearAllDrafts: () => {
    set({ drafts: [] });
    localStorageAdapter.remove(DRAFTS_STORAGE_KEY);
  },

  setLastSavedState: (state) => {
    set({ lastSavedState: state });
  },

  isDirty: (currentSvg, currentName) => {
    const { lastSavedState } = get();
    if (!lastSavedState) {
      // If no saved state, consider dirty if there's meaningful content
      return currentSvg.includes('<path') || currentSvg.includes('<line');
    }
    return currentSvg !== lastSavedState.svgContent || currentName !== lastSavedState.patternName;
  },
});
