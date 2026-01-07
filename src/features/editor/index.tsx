import { ErrorBoundary } from '../../components/ErrorBoundary';
import { EditorErrorFallback } from '../../components/fallbacks';
import { useAppStore } from '../../store';

import { CodeEditor } from './CodeEditor';
import { GraphicalEditor } from './graphical';

/**
 * EditorPane - Orchestrates the editor experience
 * Wraps both code and graphical editors with error boundary
 */
export function EditorPane() {
  const editorMode = useAppStore((state) => state.editorMode);

  return (
    <ErrorBoundary fallback={<EditorErrorFallback />}>
      <div className="h-full">
        {editorMode === 'graphical' ? <GraphicalEditor /> : <CodeEditor />}
      </div>
    </ErrorBoundary>
  );
}

// Re-export components for direct access if needed
export { CodeEditor } from './CodeEditor';
export { GraphicalEditor } from './graphical';
