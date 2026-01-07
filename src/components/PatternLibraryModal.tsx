/**
 * PatternLibraryModal component
 * Browse and select patterns from the Supabase database
 * Includes search, sorting, pagination, and local drafts
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

import { isSupabaseConfigured } from '../config';
import { useDirtyCheck } from '../hooks';
import { loadPatternIndex, loadPattern as loadPatternFile } from '../lib/patterns';
import { supabasePatternService } from '../services/pattern/SupabasePatternService';
import { useAppStore } from '../store';
import type { DbPattern, PatternIndex, PatternSortBy } from '../types';

import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { Modal, Button, Input, Select, PatternCard } from './ui';

interface PatternLibraryModalProps {
  onClose: () => void;
}

type TabType = 'library' | 'drafts';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'name', label: 'Alphabetical' },
];

export default function PatternLibraryModal({ onClose }: PatternLibraryModalProps) {
  // State
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [patterns, setPatterns] = useState<DbPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<PatternSortBy>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingPatternId, setLoadingPatternId] = useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingPattern, setPendingPattern] = useState<DbPattern | null>(null);

  // Fallback state for static patterns (when Supabase isn't configured)
  const [staticIndex, setStaticIndex] = useState<PatternIndex | null>(null);

  // Store
  const loadPattern = useAppStore((state) => state.loadPattern);
  const drafts = useAppStore((state) => state.drafts);
  const loadDrafts = useAppStore((state) => state.loadDrafts);
  const saveDraft = useAppStore((state) => state.saveDraft);
  const deleteDraft = useAppStore((state) => state.deleteDraft);
  const svgContent = useAppStore((state) => state.svgContent);
  const patternName = useAppStore((state) => state.patternName);
  const patternAuthor = useAppStore((state) => state.patternAuthor);
  const patternLicense = useAppStore((state) => state.patternLicense);
  const patternNotes = useAppStore((state) => state.patternNotes);
  const viewBox = useAppStore((state) => state.viewBox);

  // Hooks
  const { isDirty, resetDirtyTracking } = useDirtyCheck();

  // Check if Supabase is configured
  const useSupabase = useMemo(() => isSupabaseConfigured(), []);

  // Load drafts on mount
  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  // Fetch patterns
  useEffect(() => {
    const fetchPatterns = async () => {
      setLoading(true);
      setError(null);

      if (useSupabase) {
        const result = await supabasePatternService.fetchApprovedPatterns({
          sortBy,
          searchQuery: searchQuery || undefined,
          limit: 50,
        });

        if (result.success) {
          setPatterns(result.data.patterns);
        } else {
          setError(result.error.message);
        }
      } else {
        // Fallback to static patterns
        try {
          const index = await loadPatternIndex();
          setStaticIndex(index);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load patterns');
        }
      }

      setLoading(false);
    };

    fetchPatterns();
  }, [useSupabase, sortBy, searchQuery]);

  // Load pattern from Supabase
  const loadSupabasePattern = useCallback(
    async (pattern: DbPattern) => {
      setLoadingPatternId(pattern.id);

      // Increment view count (fire and forget)
      supabasePatternService.incrementViewCount(pattern.id);

      const result = await supabasePatternService.fetchPatternWithSvg(pattern.slug);

      if (result.success) {
        loadPattern(result.data);
        supabasePatternService.incrementDownloadCount(pattern.id);
        resetDirtyTracking();
        onClose();
      } else {
        setError(`Failed to load pattern: ${result.error.message}`);
      }

      setLoadingPatternId(null);
    },
    [loadPattern, resetDirtyTracking, onClose]
  );

  // Handle pattern selection
  const handleSelectPattern = useCallback(
    async (pattern: DbPattern) => {
      // Check for unsaved changes
      if (isDirty) {
        setPendingPattern(pattern);
        setShowUnsavedDialog(true);
        return;
      }

      await loadSupabasePattern(pattern);
    },
    [isDirty, loadSupabasePattern]
  );

  // Handle loading static pattern (fallback)
  const handleLoadStaticPattern = async (id: string) => {
    if (isDirty) {
      // For static patterns, we'll just warn and continue
      // Could implement full unsaved changes flow here too
    }

    setLoadingPatternId(id);

    try {
      const pattern = await loadPatternFile(id);
      if (pattern) {
        loadPattern(pattern);
        resetDirtyTracking();
        onClose();
      } else {
        setError('Failed to load pattern');
      }
    } catch {
      setError('Failed to load pattern');
    }

    setLoadingPatternId(null);
  };

  // Handle draft selection
  const handleSelectDraft = useCallback(
    (draft: (typeof drafts)[0]) => {
      loadPattern({
        id: draft.id,
        name: draft.name,
        author: draft.author,
        license: draft.license,
        notes: draft.notes,
        createdAt: draft.savedAt,
        updatedAt: draft.savedAt,
        tile: {
          svg: draft.svgContent,
          viewBox: draft.viewBox,
        },
        defaults: {
          stitchLengthMm: 3,
          gapLengthMm: 1.5,
          strokeWidthMm: 0.6,
          snapGridMm: 1,
        },
      });
      resetDirtyTracking();
      onClose();
    },
    [loadPattern, resetDirtyTracking, onClose]
  );

  // Handle save to drafts
  const handleSaveDraft = useCallback(() => {
    saveDraft({
      name: patternName,
      author: patternAuthor,
      license: patternLicense,
      notes: patternNotes,
      svgContent,
      viewBox,
    });

    // Continue loading the pending pattern
    if (pendingPattern) {
      loadSupabasePattern(pendingPattern);
      setPendingPattern(null);
    }
  }, [
    saveDraft,
    patternName,
    patternAuthor,
    patternLicense,
    patternNotes,
    svgContent,
    viewBox,
    pendingPattern,
    loadSupabasePattern,
  ]);

  // Handle discard changes
  const handleDiscardChanges = useCallback(() => {
    if (pendingPattern) {
      loadSupabasePattern(pendingPattern);
      setPendingPattern(null);
    }
  }, [pendingPattern, loadSupabasePattern]);

  // Filter patterns by search (client-side for instant feedback)
  const filteredPatterns = useMemo(() => {
    if (!searchQuery.trim()) return patterns;
    const query = searchQuery.toLowerCase();
    return patterns.filter(
      (p) => p.name.toLowerCase().includes(query) || p.author.toLowerCase().includes(query)
    );
  }, [patterns, searchQuery]);

  // Sorted and filtered drafts
  const sortedDrafts = useMemo(() => {
    return [...drafts].sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
  }, [drafts]);

  const footer = (
    <div className="flex justify-between w-full">
      <div className="text-sm text-charcoal-500 dark:text-cream-400">
        {useSupabase
          ? `${filteredPatterns.length} patterns available`
          : `${staticIndex?.patterns.length ?? 0} patterns available`}
      </div>
      <Button variant="secondary" size="lg" onClick={onClose}>
        Close
      </Button>
    </div>
  );

  return (
    <>
      <Modal isOpen title="Pattern Library" onClose={onClose} footer={footer}>
        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-cream-200 dark:bg-charcoal-900 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'library'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400'
                : 'text-charcoal-500 hover:text-charcoal-900 hover:bg-cream-100 dark:text-cream-400 dark:hover:text-cream-50 dark:hover:bg-charcoal-800'
            }`}
          >
            Library
            {useSupabase && (
              <span className="ml-2 text-xs opacity-60">({filteredPatterns.length})</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'drafts'
                ? 'bg-sage-100 text-sage-600 dark:bg-sage-900/50 dark:text-sage-400'
                : 'text-charcoal-500 hover:text-charcoal-900 hover:bg-cream-100 dark:text-cream-400 dark:hover:text-cream-50 dark:hover:bg-charcoal-800'
            }`}
          >
            My Drafts
            {drafts.length > 0 && (
              <span className="ml-2 text-xs opacity-60">({drafts.length})</span>
            )}
          </button>
        </div>

        {/* Library Tab */}
        {activeTab === 'library' && (
          <>
            {/* Search and Sort Controls */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search patterns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search patterns"
                />
              </div>
              {useSupabase && (
                <div className="w-40">
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as PatternSortBy)}
                    options={SORT_OPTIONS}
                    aria-label="Sort patterns"
                  />
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-terracotta-100 dark:bg-terracotta-900/30 border border-terracotta-300 dark:border-terracotta-500/30 rounded-lg p-4 text-terracotta-600 dark:text-terracotta-300 text-center">
                {error}
              </div>
            )}

            {/* Pattern Grid (Supabase) */}
            {!loading && !error && useSupabase && (
              <div className="grid grid-cols-3 gap-4">
                {filteredPatterns.length === 0 ? (
                  <div className="col-span-3 text-center py-8 text-charcoal-500 dark:text-cream-400">
                    No patterns found matching your search.
                  </div>
                ) : (
                  filteredPatterns.map((pattern) => (
                    <PatternCard
                      key={pattern.id}
                      pattern={pattern}
                      onSelect={handleSelectPattern}
                      isLoading={loadingPatternId === pattern.id}
                    />
                  ))
                )}
              </div>
            )}

            {/* Pattern List (Static Fallback) */}
            {!loading && !error && !useSupabase && staticIndex && (
              <div className="space-y-2">
                {staticIndex.patterns.length === 0 ? (
                  <p className="text-center text-charcoal-500 dark:text-cream-400">
                    No patterns available yet.
                  </p>
                ) : (
                  staticIndex.patterns
                    .filter(
                      (p) =>
                        !searchQuery ||
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.author.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((pattern) => (
                      <button
                        key={pattern.id}
                        onClick={() => handleLoadStaticPattern(pattern.id)}
                        disabled={loadingPatternId === pattern.id}
                        className="w-full text-left border border-cream-300 dark:border-charcoal-700 rounded p-4 hover:bg-cream-100 dark:hover:bg-charcoal-700 cursor-pointer bg-cream-50 dark:bg-charcoal-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50"
                      >
                        <h3 className="font-semibold text-charcoal-900 dark:text-cream-50">
                          {pattern.name}
                        </h3>
                        <p className="text-sm text-charcoal-500 dark:text-cream-400">
                          by {pattern.author}
                        </p>
                        <p className="text-xs text-charcoal-400 dark:text-cream-500 mt-1">
                          License: {pattern.license}
                        </p>
                      </button>
                    ))
                )}
              </div>
            )}
          </>
        )}

        {/* Drafts Tab */}
        {activeTab === 'drafts' && (
          <div className="space-y-3">
            {sortedDrafts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-charcoal-400 dark:text-cream-500 mb-2">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <p className="text-charcoal-500 dark:text-cream-400">No drafts saved yet.</p>
                <p className="text-sm text-charcoal-400 dark:text-cream-500 mt-1">
                  Your work will be saved here when you choose to save a draft.
                </p>
              </div>
            ) : (
              sortedDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-cream-100 dark:bg-charcoal-900 border border-cream-300 dark:border-charcoal-700 rounded-lg p-4 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-charcoal-900 dark:text-cream-50 truncate">
                        {draft.name}
                      </h3>
                      <p className="text-sm text-charcoal-500 dark:text-cream-400 truncate">
                        by {draft.author || 'Unknown'}
                      </p>
                      <p className="text-xs text-charcoal-400 dark:text-cream-500 mt-1">
                        Saved{' '}
                        {new Date(draft.savedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button variant="success" size="sm" onClick={() => handleSelectDraft(draft)}>
                        Load
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteDraft(draft.id)}
                        aria-label="Delete draft"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onClose={() => {
          setShowUnsavedDialog(false);
          setPendingPattern(null);
        }}
        onDiscard={handleDiscardChanges}
        onSaveDraft={handleSaveDraft}
      />
    </>
  );
}
