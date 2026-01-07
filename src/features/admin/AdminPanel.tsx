/**
 * AdminPanel component
 * Main admin interface for moderating pattern submissions
 */

import { useState, useEffect, useCallback } from 'react';

import { Button, Input, Modal } from '../../components/ui';
import { isSupabaseConfigured } from '../../config';
import { adminPatternService } from '../../services/pattern/AdminPatternService';
import { supabasePatternService } from '../../services/pattern/SupabasePatternService';
import type { DbPattern, PatternStatus } from '../../types';

type AdminTab = 'pending' | 'approved' | 'rejected';

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Panel state
  const [activeTab, setActiveTab] = useState<AdminTab>('pending');
  const [patterns, setPatterns] = useState<DbPattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<DbPattern | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Counts
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });

  // Check if already authenticated on mount
  useEffect(() => {
    setIsAuthenticated(adminPatternService.isAuthenticated());
  }, []);

  // Fetch patterns when tab changes or after auth
  useEffect(() => {
    if (isAuthenticated) {
      fetchPatterns(activeTab);
      refreshCounts();
    }
  }, [isAuthenticated, activeTab]);

  const fetchPatterns = async (status: PatternStatus) => {
    setLoading(true);
    const result = await adminPatternService.fetchPatternsByStatus(status);
    if (result.success) {
      setPatterns(result.data);
    }
    setLoading(false);
  };

  const refreshCounts = async () => {
    const result = await adminPatternService.getPatternCounts();
    if (result.success) {
      setCounts(result.data);
    }
  };

  const handleLogin = async () => {
    if (!password) return;

    setIsLoggingIn(true);
    setAuthError('');

    const result = await adminPatternService.authenticate(password);

    if (result.success && result.data) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      setAuthError(result.success ? 'Invalid password' : result.error.message);
    }

    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    adminPatternService.logout();
    setIsAuthenticated(false);
    setPatterns([]);
    onClose();
  };

  const handleApprove = useCallback(async (id: string) => {
    setActionLoading(id);
    const result = await adminPatternService.approvePattern(id);
    if (result.success) {
      setPatterns((prev) => prev.filter((p) => p.id !== id));
      refreshCounts();
    }
    setActionLoading(null);
  }, []);

  const handleReject = useCallback(async (id: string) => {
    setActionLoading(id);
    const result = await adminPatternService.rejectPattern(id);
    if (result.success) {
      setPatterns((prev) => prev.filter((p) => p.id !== id));
      refreshCounts();
    }
    setActionLoading(null);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this pattern?')) {
      return;
    }

    setActionLoading(id);
    const result = await adminPatternService.deletePattern(id);
    if (result.success) {
      setPatterns((prev) => prev.filter((p) => p.id !== id));
      setSelectedPattern(null);
      refreshCounts();
    }
    setActionLoading(null);
  }, []);

  // Get thumbnail URL for preview
  const getThumbnailUrl = (pattern: DbPattern) => {
    return supabasePatternService.getPatternThumbnailUrl(pattern);
  };

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return (
      <Modal isOpen title="Admin Panel" onClose={onClose}>
        <div className="text-center py-8">
          <p className="text-rose-400">Admin panel is not available. Supabase is not configured.</p>
        </div>
      </Modal>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <Modal isOpen title="Admin Login" onClose={onClose}>
        <div className="max-w-sm mx-auto py-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Admin Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter admin password"
                autoFocus
              />
            </div>

            {authError && <p className="text-sm text-rose-400">{authError}</p>}

            <Button
              variant="emerald"
              size="lg"
              onClick={handleLogin}
              disabled={!password || isLoggingIn}
              className="w-full"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Admin panel
  const footer = (
    <div className="flex justify-between w-full">
      <Button variant="danger" size="md" onClick={handleLogout}>
        Logout
      </Button>
      <Button variant="slate" size="md" onClick={onClose}>
        Close
      </Button>
    </div>
  );

  return (
    <Modal isOpen title="Admin Panel" onClose={onClose} footer={footer}>
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-900 p-1 rounded-lg">
        {(['pending', 'approved', 'rejected'] as AdminTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? tab === 'pending'
                  ? 'bg-amber-500/20 text-amber-400'
                  : tab === 'approved'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab}
            <span className="ml-2 text-xs opacity-60">({counts[tab]})</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : patterns.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No {activeTab} patterns.</div>
      ) : (
        <div className="space-y-3">
          {patterns.map((pattern) => {
            const thumbnailUrl = getThumbnailUrl(pattern);
            const isLoading = actionLoading === pattern.id;

            return (
              <div
                key={pattern.id}
                className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div
                    className="w-20 h-20 flex-shrink-0 rounded bg-gray-800 overflow-hidden"
                    style={{ backgroundColor: '#f5f5dc' }}
                  >
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={pattern.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{pattern.name}</h3>
                    <p className="text-sm text-gray-400">by {pattern.author}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted {new Date(pattern.created_at).toLocaleDateString()}
                    </p>
                    {pattern.submitter_email && (
                      <p className="text-xs text-gray-500">{pattern.submitter_email}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {activeTab === 'pending' && (
                      <>
                        <Button
                          variant="emerald"
                          size="sm"
                          onClick={() => handleApprove(pattern.id)}
                          disabled={isLoading}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(pattern.id)}
                          disabled={isLoading}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {activeTab === 'rejected' && (
                      <Button
                        variant="emerald"
                        size="sm"
                        onClick={() => handleApprove(pattern.id)}
                        disabled={isLoading}
                      >
                        Approve
                      </Button>
                    )}
                    <Button variant="slate" size="sm" onClick={() => setSelectedPattern(pattern)}>
                      Details
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(pattern.id)}
                      disabled={isLoading}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                {pattern.notes && (
                  <div className="mt-3 text-sm text-gray-400 bg-gray-800 rounded p-2">
                    {pattern.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pattern Detail Modal */}
      {selectedPattern && (
        <Modal isOpen title={selectedPattern.name} onClose={() => setSelectedPattern(null)}>
          <div className="space-y-4">
            {/* Preview */}
            <div
              className="aspect-square max-w-sm mx-auto rounded-lg overflow-hidden"
              style={{ backgroundColor: '#f5f5dc' }}
            >
              {getThumbnailUrl(selectedPattern) && (
                <img
                  src={getThumbnailUrl(selectedPattern) ?? ''}
                  alt={selectedPattern.name}
                  className="w-full h-full object-contain p-4"
                />
              )}
            </div>

            {/* Metadata */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Author</span>
                <span className="text-white">{selectedPattern.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">License</span>
                <span className="text-white">{selectedPattern.license}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span
                  className={
                    selectedPattern.status === 'approved'
                      ? 'text-emerald-400'
                      : selectedPattern.status === 'pending'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                  }
                >
                  {selectedPattern.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Slug</span>
                <span className="text-white font-mono text-xs">{selectedPattern.slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Views</span>
                <span className="text-white">{selectedPattern.view_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Downloads</span>
                <span className="text-white">{selectedPattern.download_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Submitted</span>
                <span className="text-white">
                  {new Date(selectedPattern.created_at).toLocaleString()}
                </span>
              </div>
              {selectedPattern.submitter_email && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="text-white">{selectedPattern.submitter_email}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {selectedPattern.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-1">Notes</h4>
                <p className="text-sm text-gray-400 bg-gray-900 rounded p-3">
                  {selectedPattern.notes}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </Modal>
  );
}

export default AdminPanel;
