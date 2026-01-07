import Editor from '@monaco-editor/react';
import { useEffect, useRef, useState, useCallback } from 'react';

import { Button } from '../../components/ui';
import { extractViewBox } from '../../lib/svg';
import { useAppStore } from '../../store';

export function CodeEditor() {
  const { svgContent, setSvgContent, setViewBox, setEditorMode, editorMode } = useAppStore(
    (state) => ({
      svgContent: state.svgContent,
      setSvgContent: state.setSvgContent,
      setViewBox: state.setViewBox,
      setEditorMode: state.setEditorMode,
      editorMode: state.editorMode,
    })
  );

  const [editorValue, setEditorValue] = useState(svgContent);
  const editorRef = useRef<unknown>(null);
  const isUserTypingRef = useRef(false);
  const lastSyncedValueRef = useRef(svgContent);

  // Sync editor value when svgContent changes from outside
  useEffect(() => {
    if (!isUserTypingRef.current && svgContent !== lastSyncedValueRef.current) {
      setEditorValue(svgContent);
      lastSyncedValueRef.current = svgContent;
    }
  }, [svgContent]);

  const handleEditorDidMount = (editor: unknown) => {
    editorRef.current = editor;
  };

  const updateStore = useCallback(
    (value: string) => {
      setSvgContent(value);
      lastSyncedValueRef.current = value;
      const vb = extractViewBox(value);
      if (vb) {
        setViewBox(vb);
      }
      setTimeout(() => {
        isUserTypingRef.current = false;
      }, 100);
    },
    [setSvgContent, setViewBox]
  );

  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      isUserTypingRef.current = true;
      updateStore(value);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      <div className="px-4 py-2 border-b border-gray-700 bg-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">SVG Editor</h2>
          <p className="text-sm text-gray-400">Edit your pattern tile SVG code</p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Editor mode selection">
          <Button
            variant={editorMode === 'code' ? 'primary' : 'ghost'}
            size="md"
            onClick={() => setEditorMode('code')}
            aria-pressed={editorMode === 'code'}
          >
            Code
          </Button>
          <Button
            variant={editorMode === 'graphical' ? 'primary' : 'ghost'}
            size="md"
            onClick={() => setEditorMode('graphical')}
            aria-pressed={editorMode === 'graphical'}
          >
            Graphical
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden" role="region" aria-label="Code editor">
        <Editor
          height="100%"
          defaultLanguage="xml"
          value={editorValue}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            accessibilitySupport: 'on',
          }}
        />
      </div>
    </div>
  );
}
