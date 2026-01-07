/**
 * Admin slice - manages admin authentication and moderation state
 */

import type { StateCreator } from 'zustand';

import { adminPatternService } from '../../services/pattern/AdminPatternService';
import type { DbPattern, PatternStatus } from '../../types';

/**
 * Admin state shape
 */
export interface AdminStateData {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authError: string | null;
  pendingPatterns: DbPattern[];
  approvedPatterns: DbPattern[];
  rejectedPatterns: DbPattern[];
  selectedPattern: DbPattern | null;
  isLoadingPatterns: boolean;
  patternCounts: Record<PatternStatus, number>;
}

/**
 * Admin actions
 */
export interface AdminActions {
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  fetchPatternsByStatus: (status: PatternStatus) => Promise<void>;
  fetchAllPatterns: () => Promise<void>;
  approvePattern: (id: string) => Promise<boolean>;
  rejectPattern: (id: string, reason?: string) => Promise<boolean>;
  deletePattern: (id: string) => Promise<boolean>;
  selectPattern: (pattern: DbPattern | null) => void;
  refreshPatternCounts: () => Promise<void>;
}

/**
 * Combined admin slice type
 */
export type AdminSlice = AdminStateData & AdminActions;

/**
 * Initial admin state
 */
const initialAdminState: AdminStateData = {
  isAuthenticated: false,
  isAuthenticating: false,
  authError: null,
  pendingPatterns: [],
  approvedPatterns: [],
  rejectedPatterns: [],
  selectedPattern: null,
  isLoadingPatterns: false,
  patternCounts: {
    pending: 0,
    approved: 0,
    rejected: 0,
  },
};

/**
 * Create the admin slice
 */
export const createAdminSlice: StateCreator<AdminSlice, [], [], AdminSlice> = (set, get) => ({
  ...initialAdminState,

  login: async (password) => {
    set({ isAuthenticating: true, authError: null });

    const result = await adminPatternService.authenticate(password);

    if (result.success && result.data) {
      set({ isAuthenticated: true, isAuthenticating: false });
      // Fetch initial data
      get().refreshPatternCounts();
      get().fetchPatternsByStatus('pending');
      return true;
    }

    set({
      isAuthenticated: false,
      isAuthenticating: false,
      authError: result.success ? 'Invalid password' : result.error.message,
    });
    return false;
  },

  logout: () => {
    adminPatternService.logout();
    set(initialAdminState);
  },

  fetchPatternsByStatus: async (status) => {
    set({ isLoadingPatterns: true });

    const result = await adminPatternService.fetchPatternsByStatus(status);

    if (result.success) {
      const updateKey = `${status}Patterns` as keyof Pick<
        AdminStateData,
        'pendingPatterns' | 'approvedPatterns' | 'rejectedPatterns'
      >;
      set({ [updateKey]: result.data, isLoadingPatterns: false });
    } else {
      set({ isLoadingPatterns: false });
    }
  },

  fetchAllPatterns: async () => {
    set({ isLoadingPatterns: true });

    const result = await adminPatternService.fetchAllPatterns();

    if (result.success) {
      const patterns = result.data;
      set({
        pendingPatterns: patterns.filter((p) => p.status === 'pending'),
        approvedPatterns: patterns.filter((p) => p.status === 'approved'),
        rejectedPatterns: patterns.filter((p) => p.status === 'rejected'),
        isLoadingPatterns: false,
      });
    } else {
      set({ isLoadingPatterns: false });
    }
  },

  approvePattern: async (id) => {
    const result = await adminPatternService.approvePattern(id);

    if (result.success) {
      // Move pattern from pending to approved
      const { pendingPatterns, approvedPatterns } = get();
      const pattern = pendingPatterns.find((p) => p.id === id);

      if (pattern) {
        set({
          pendingPatterns: pendingPatterns.filter((p) => p.id !== id),
          approvedPatterns: [{ ...pattern, status: 'approved' }, ...approvedPatterns],
        });
      }

      get().refreshPatternCounts();
      return true;
    }

    return false;
  },

  rejectPattern: async (id, reason) => {
    const result = await adminPatternService.rejectPattern(id, reason);

    if (result.success) {
      // Move pattern from pending to rejected
      const { pendingPatterns, rejectedPatterns } = get();
      const pattern = pendingPatterns.find((p) => p.id === id);

      if (pattern) {
        set({
          pendingPatterns: pendingPatterns.filter((p) => p.id !== id),
          rejectedPatterns: [{ ...pattern, status: 'rejected' }, ...rejectedPatterns],
        });
      }

      get().refreshPatternCounts();
      return true;
    }

    return false;
  },

  deletePattern: async (id) => {
    const result = await adminPatternService.deletePattern(id);

    if (result.success) {
      // Remove pattern from all lists
      set({
        pendingPatterns: get().pendingPatterns.filter((p) => p.id !== id),
        approvedPatterns: get().approvedPatterns.filter((p) => p.id !== id),
        rejectedPatterns: get().rejectedPatterns.filter((p) => p.id !== id),
        selectedPattern: get().selectedPattern?.id === id ? null : get().selectedPattern,
      });

      get().refreshPatternCounts();
      return true;
    }

    return false;
  },

  selectPattern: (pattern) => {
    set({ selectedPattern: pattern });
  },

  refreshPatternCounts: async () => {
    const result = await adminPatternService.getPatternCounts();

    if (result.success) {
      set({ patternCounts: result.data });
    }
  },
});
