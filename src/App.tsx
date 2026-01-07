import { useState, useEffect, useCallback } from 'react';

import { ErrorBoundary } from './components/ErrorBoundary';
import PatternLibraryModal from './components/PatternLibraryModal';
import PreviewPane from './components/PreviewPane';
import { SubmitPatternModal } from './components/SubmitPatternModal';
import { EditorErrorFallback, PreviewErrorFallback } from './components/fallbacks';
import { Header, SplitPane } from './components/layout';
import { AdminPanel } from './features/admin';
import { EditorPane } from './features/editor';
import { ToolsPanel } from './features/tools';

const GITHUB_URL = 'https://github.com/YOUR_USERNAME/sashiko';

function App() {
  const [showLibrary, setShowLibrary] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Keyboard shortcut for admin panel (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdmin(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenLibrary = useCallback(() => setShowLibrary(true), []);
  const handleCloseLibrary = useCallback(() => setShowLibrary(false), []);

  const handleOpenSubmit = useCallback(() => setShowSubmit(true), []);
  const handleCloseSubmit = useCallback(() => setShowSubmit(false), []);

  const handleOpenAdmin = useCallback(() => setShowAdmin(true), []);
  const handleCloseAdmin = useCallback(() => setShowAdmin(false), []);

  const leftPanel = (
    <>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ErrorBoundary fallback={<EditorErrorFallback />}>
          <EditorPane />
        </ErrorBoundary>
      </div>
      <div className="flex-shrink-0 overflow-auto">
        <ToolsPanel onShowLibrary={handleOpenLibrary} />
      </div>
    </>
  );

  const rightPanel = (
    <ErrorBoundary fallback={<PreviewErrorFallback />}>
      <PreviewPane />
    </ErrorBoundary>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <Header
        title="The Sashiko Project"
        githubUrl={GITHUB_URL}
        onOpenLibrary={handleOpenLibrary}
        onOpenSubmit={handleOpenSubmit}
        onOpenAdmin={handleOpenAdmin}
      />
      <SplitPane left={leftPanel} right={rightPanel} leftWidth="50%" />

      {/* Modals */}
      {showLibrary && <PatternLibraryModal onClose={handleCloseLibrary} />}
      {showSubmit && <SubmitPatternModal onClose={handleCloseSubmit} />}
      {showAdmin && <AdminPanel onClose={handleCloseAdmin} />}
    </div>
  );
}

export default App;
