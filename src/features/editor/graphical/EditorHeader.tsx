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

  // Tool icons for select and draw modes
  const toolIcons: Record<Tool, { icon: React.ReactNode; label: string }> = {
    select: {
      label: 'Select (V)',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 13l6 6" />
        </svg>
      ),
    },
    draw: {
      label: 'Draw (D)',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      ),
    },
    pan: {
      label: 'Pan',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
          />
        </svg>
      ),
    },
  };

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
    <div className="border-b border-cream-200 bg-cream-100 dark:border-charcoal-700 dark:bg-charcoal-800">
      {/* Main toolbar row */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-900 dark:text-cream-50">
            Graphical Editor
          </h2>
          <p className="text-sm text-charcoal-500 dark:text-cream-400">
            {activeTool === 'select'
              ? 'Click a line to select, drag handles to edit.'
              : 'Click and drag to draw lines.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Tool Mode Selection */}
          <div className="flex gap-1" role="group" aria-label="Drawing tools">
            <Button
              variant={activeTool === 'select' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTool('select')}
              aria-pressed={activeTool === 'select'}
              aria-label={toolIcons.select.label}
              title={toolIcons.select.label}
            >
              {toolIcons.select.icon}
            </Button>
            <Button
              variant={activeTool === 'draw' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTool('draw')}
              aria-pressed={activeTool === 'draw'}
              aria-label={toolIcons.draw.label}
              title={toolIcons.draw.label}
            >
              {toolIcons.draw.icon}
            </Button>
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
        <div className="px-4 py-3 bg-cream-50 border-t border-cream-200 dark:bg-charcoal-900 dark:border-charcoal-700 flex items-center gap-6">
          <span className="text-sm font-medium text-charcoal-700 dark:text-cream-200">
            Grid Settings:
          </span>

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
