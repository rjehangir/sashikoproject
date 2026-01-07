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
import { useAppStore } from './store';

const GITHUB_URL = 'https://github.com/YOUR_USERNAME/sashiko';

function App() {
  const [showLibrary, setShowLibrary] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Store state and actions
  const resetPattern = useAppStore((s) => s.resetPattern);
  const saveDraft = useAppStore((s) => s.saveDraft);
  const svgContent = useAppStore((s) => s.svgContent);
  const patternName = useAppStore((s) => s.patternName);
  const patternAuthor = useAppStore((s) => s.patternAuthor);
  const patternLicense = useAppStore((s) => s.patternLicense);
  const patternNotes = useAppStore((s) => s.patternNotes);
  const viewBox = useAppStore((s) => s.viewBox);

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

  const handleNewDesign = useCallback(() => {
    const hasContent = svgContent.includes('<path') || svgContent.includes('<line');
    if (hasContent) {
      const confirmed = window.confirm(
        'Start a new design? Any unsaved changes will be lost.\n\nTip: Use "Save Draft" to save your work first.'
      );
      if (!confirmed) return;
    }
    resetPattern();
  }, [svgContent, resetPattern]);

  const handleSaveDraft = useCallback(() => {
    saveDraft({
      name: patternName,
      author: patternAuthor,
      license: patternLicense,
      notes: patternNotes,
      svgContent,
      viewBox,
    });
    window.alert(`Draft "${patternName}" saved! Find it in Library > My Drafts.`);
  }, [saveDraft, patternName, patternAuthor, patternLicense, patternNotes, svgContent, viewBox]);

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
        onNewDesign={handleNewDesign}
        onSaveDraft={handleSaveDraft}
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
