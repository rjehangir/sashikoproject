import { Checkbox, Button, Select } from '../../../components/ui';
import { useAppStore } from '../../../store';
import type { Tool } from '../../../types';

interface EditorHeaderProps {
  snapToGrid: boolean;
  onSnapChange: (value: boolean) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onGridDimensionsChange?: (cols: number, rows: number) => void;
}

export function EditorHeader({
  snapToGrid,
  onSnapChange,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onGridDimensionsChange,
}: EditorHeaderProps) {
  const {
    editorMode,
    setEditorMode,
    activeTool,
    setActiveTool,
    gridPadding,
    setGridPadding,
    gridCols,
    setGridCols,
    gridRows,
    setGridRows,
    settingsExpanded,
    setSettingsExpanded,
  } = useAppStore((state) => ({
    editorMode: state.editorMode,
    setEditorMode: state.setEditorMode,
    activeTool: state.activeTool,
    setActiveTool: state.setActiveTool,
    gridPadding: state.gridPadding,
    setGridPadding: state.setGridPadding,
    gridCols: state.gridCols,
    setGridCols: state.setGridCols,
    gridRows: state.gridRows,
    setGridRows: state.setGridRows,
    settingsExpanded: state.settingsExpanded,
    setSettingsExpanded: state.setSettingsExpanded,
  }));

  const toolOptions: { value: Tool; label: string }[] = [
    { value: 'select', label: 'Select' },
    { value: 'draw', label: 'Draw' },
  ];

  const handleColsChange = (newCols: number) => {
    setGridCols(newCols);
    onGridDimensionsChange?.(newCols, gridRows);
  };

  const handleRowsChange = (newRows: number) => {
    setGridRows(newRows);
    onGridDimensionsChange?.(gridCols, newRows);
  };

  const gridSizeOptions = Array.from({ length: 20 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

  const paddingOptions = Array.from({ length: 11 }, (_, i) => ({
    value: String(i),
    label: String(i),
  }));

  return (
    <div className="border-b border-gray-700 bg-gray-800">
      {/* Main toolbar row */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Graphical Editor</h2>
          <p className="text-sm text-gray-400">
            {activeTool === 'select'
              ? 'Click a line to select, drag handles to edit.'
              : 'Click and drag to draw lines.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Tool Mode Selection */}
          <div className="flex gap-1" role="group" aria-label="Drawing tools">
            {toolOptions.map((tool) => (
              <Button
                key={tool.value}
                variant={activeTool === tool.value ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveTool(tool.value)}
                aria-pressed={activeTool === tool.value}
              >
                {tool.label}
              </Button>
            ))}
          </div>

          {/* Undo/Redo Buttons */}
          <div className="flex gap-1" role="group" aria-label="History">
            <Button
              variant="secondary"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo (Ctrl+Z)"
              title="Undo (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo (Ctrl+Shift+Z)"
              title="Redo (Ctrl+Shift+Z)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
                />
              </svg>
            </Button>
          </div>

          <Checkbox
            label="Snap to Grid"
            checked={snapToGrid}
            onChange={(e) => onSnapChange(e.target.checked)}
          />

          {/* Settings Toggle */}
          <Button
            variant={settingsExpanded ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSettingsExpanded(!settingsExpanded)}
            aria-expanded={settingsExpanded}
            aria-label="Grid settings"
            title="Grid settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Button>

          <div className="flex gap-2" role="group" aria-label="Editor mode selection">
            <Button
              variant={editorMode === 'code' ? 'secondary' : 'ghost'}
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
      </div>

      {/* Collapsible settings panel */}
      {settingsExpanded && (
        <div className="px-4 py-3 bg-gray-900 border-t border-gray-700 flex items-center gap-6">
          <span className="text-sm font-medium text-gray-300">Grid Settings:</span>

          <div className="flex items-center gap-2">
            <Select
              label="Columns"
              value={String(gridCols)}
              onChange={(e) => handleColsChange(parseInt(e.target.value, 10))}
              options={gridSizeOptions}
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              label="Rows"
              value={String(gridRows)}
              onChange={(e) => handleRowsChange(parseInt(e.target.value, 10))}
              options={gridSizeOptions}
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              label="Padding"
              value={String(gridPadding)}
              onChange={(e) => setGridPadding(parseInt(e.target.value, 10))}
              options={paddingOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
}
