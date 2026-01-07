/**
 * Library slice - manages the pattern library state
 * Handles fetching, sorting, and searching patterns from Supabase
 */

import type { StateCreator } from 'zustand';

import { supabasePatternService } from '../../services/pattern/SupabasePatternService';
import type { DbPattern, PatternSortBy } from '../../types';

/**
 * Library state shape
 */
export interface LibraryStateData {
  patterns: DbPattern[];
  loading: boolean;
  error: string | null;
  sortBy: PatternSortBy;
  searchQuery: string;
  currentPage: number;
  totalPatterns: number;
  hasMore: boolean;
  patternsPerPage: number;
}

/**
 * Library actions
 */
export interface LibraryActions {
  fetchPatterns: (reset?: boolean) => Promise<void>;
  fetchMorePatterns: () => Promise<void>;
  setSortBy: (sortBy: PatternSortBy) => void;
  setSearchQuery: (query: string) => void;
  resetLibrary: () => void;
}

/**
 * Combined library slice type
 */
export type LibrarySlice = LibraryStateData & LibraryActions;

/**
 * Default patterns per page
 */
const DEFAULT_PATTERNS_PER_PAGE = 12;

/**
 * Initial library state
 */
const initialLibraryState: LibraryStateData = {
  patterns: [],
  loading: false,
  error: null,
  sortBy: 'popular',
  searchQuery: '',
  currentPage: 0,
  totalPatterns: 0,
  hasMore: false,
  patternsPerPage: DEFAULT_PATTERNS_PER_PAGE,
};

/**
 * Create the library slice
 */
export const createLibrarySlice: StateCreator<LibrarySlice, [], [], LibrarySlice> = (set, get) => ({
  ...initialLibraryState,

  fetchPatterns: async (reset = true) => {
    const { sortBy, searchQuery, patternsPerPage } = get();

    set({
      loading: true,
      error: null,
      ...(reset ? { patterns: [], currentPage: 0 } : {}),
    });

    const result = await supabasePatternService.fetchApprovedPatterns({
      sortBy,
      searchQuery: searchQuery || undefined,
      limit: patternsPerPage,
      offset: 0,
    });

    if (result.success) {
      set({
        patterns: result.data.patterns,
        totalPatterns: result.data.total,
        hasMore: result.data.hasMore,
        currentPage: 0,
        loading: false,
      });
    } else {
      set({
        error: result.error.message,
        loading: false,
      });
    }
  },

  fetchMorePatterns: async () => {
    const { sortBy, searchQuery, patternsPerPage, currentPage, patterns, hasMore } = get();

    if (!hasMore) return;

    set({ loading: true, error: null });

    const nextPage = currentPage + 1;
    const offset = nextPage * patternsPerPage;

    const result = await supabasePatternService.fetchApprovedPatterns({
      sortBy,
      searchQuery: searchQuery || undefined,
      limit: patternsPerPage,
      offset,
    });

    if (result.success) {
      set({
        patterns: [...patterns, ...result.data.patterns],
        hasMore: result.data.hasMore,
        currentPage: nextPage,
        loading: false,
      });
    } else {
      set({
        error: result.error.message,
        loading: false,
      });
    }
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
    // Trigger refetch when sort changes
    get().fetchPatterns();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    // Debounce is handled at the component level
  },

  resetLibrary: () => {
    set(initialLibraryState);
  },
});
