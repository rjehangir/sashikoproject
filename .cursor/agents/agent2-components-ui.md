# Agent 2: Component Architecture and UI System

## Mission

Decompose large monolithic components into smaller, composable units. Create a reusable UI component library. Add accessibility features and error boundaries.

## Scope

You own these directories exclusively:
- `src/components/` - All React components
- `src/features/` - Feature-specific components (new)
- `src/hooks/` - Custom React hooks (new)

You will modify:
- `src/App.tsx` - Extract header, simplify structure

## Dependencies

- **Agent 1** - You depend on types from `src/types/` and store from `src/store/`
- Wait for Agent 1 to complete the type system before starting Task 2.3+

## Tasks

### Task 2.1: Delete Unused Code

**Immediate action:** Delete `src/components/Controls.tsx` (465 lines)

This file is a duplicate of `ToolsPanel.tsx` and is not imported anywhere. Verify by searching for imports:
```bash
grep -r "Controls" src/
```

### Task 2.2: Create UI Component Library

Create primitive, reusable UI components in `src/components/ui/`:

**`src/components/ui/Button.tsx`:**
```typescript
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-300 text-gray-800 hover:bg-blue-400',
        secondary: 'bg-gray-700 text-gray-300 hover:bg-gray-600',
        danger: 'bg-rose-300 text-gray-800 hover:bg-rose-400',
        ghost: 'hover:bg-gray-700 text-gray-300',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
```

**Create these UI components:**
- `src/components/ui/Button.tsx` - Button with variants
- `src/components/ui/Input.tsx` - Text/number input with label
- `src/components/ui/Select.tsx` - Dropdown select
- `src/components/ui/Checkbox.tsx` - Checkbox with label
- `src/components/ui/ColorPicker.tsx` - Color input wrapper
- `src/components/ui/Slider.tsx` - Range slider with value display
- `src/components/ui/Modal.tsx` - Modal dialog with portal
- `src/components/ui/Panel.tsx` - Collapsible panel
- `src/components/ui/index.ts` - Barrel export

**Accessibility requirements for all components:**
- Proper `aria-label` or `aria-labelledby`
- Keyboard navigation support
- Focus visible states
- Proper `role` attributes where needed

### Task 2.3: Create Layout Components

Extract layout from `App.tsx`:

**`src/components/layout/Header.tsx`:**
```typescript
interface HeaderProps {
  title: string;
  githubUrl?: string;
}

export function Header({ title, githubUrl }: HeaderProps) {
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Papyrus, fantasy' }}>
        {title}
      </h1>
      {githubUrl && <GitHubLink url={githubUrl} />}
    </header>
  );
}
```

**`src/components/layout/SplitPane.tsx`:**
```typescript
interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth?: string; // e.g., '50%', '400px'
}

export function SplitPane({ left, right, leftWidth = '50%' }: SplitPaneProps) {
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex flex-col border-r border-gray-700 overflow-hidden" style={{ width: leftWidth }}>
        {left}
      </div>
      <div className="flex-1 flex flex-col">
        {right}
      </div>
    </div>
  );
}
```

### Task 2.4: Extract Custom Hooks

Create hooks to extract logic from components:

**`src/hooks/useViewBox.ts`:**
```typescript
import { useMemo } from 'react';

interface ViewBoxDimensions {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export function useViewBox(viewBoxString: string): ViewBoxDimensions | null {
  return useMemo(() => {
    const match = viewBoxString.match(
      /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/
    );
    if (!match) return null;
    return {
      minX: parseFloat(match[1]),
      minY: parseFloat(match[2]),
      width: parseFloat(match[3]),
      height: parseFloat(match[4]),
    };
  }, [viewBoxString]);
}
```

**`src/hooks/useExportPdf.ts`:**
Extract PDF export logic from `ToolsPanel.tsx` lines 71-105:
```typescript
import { useCallback, useState } from 'react';
import { useAppStore } from '../store';
import { exportToPdf } from '../services/pdf';

export function useExportPdf() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const state = useAppStore();
  
  const exportPdf = useCallback(async () => {
    setIsExporting(true);
    setError(null);
    try {
      const pdfBytes = await exportToPdf({ ... });
      downloadBlob(pdfBytes, `${state.patternId || 'pattern'}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Export failed'));
    } finally {
      setIsExporting(false);
    }
  }, [state]);
  
  return { exportPdf, isExporting, error };
}
```

**`src/hooks/useFileImport.ts`:**
Extract file import logic from `ToolsPanel.tsx` lines 134-177:
```typescript
export function useFileImport() {
  const importJson = useCallback(() => { ... }, []);
  const importSvg = useCallback(() => { ... }, []);
  return { importJson, importSvg };
}
```

**`src/hooks/useSvgTransform.ts`:**
Extract SVG transformation logic:
```typescript
export function useSvgTransform() {
  const { svgContent, viewBox, setSvgContent, snapGridMm } = useAppStore();
  
  const mirrorH = useCallback(() => {
    setSvgContent(mirrorHorizontal(svgContent, viewBox));
  }, [svgContent, viewBox, setSvgContent]);
  
  const mirrorV = useCallback(() => { ... }, [...]);
  const rotate90 = useCallback(() => { ... }, [...]);
  const snapToGrid = useCallback(() => { ... }, [...]);
  
  return { mirrorH, mirrorV, rotate90, snapToGrid };
}
```

**`src/hooks/useDrawing.ts`:**
Extract drawing logic from `GraphicalEditor.tsx` (lines 84-198):
```typescript
export function useDrawing(canvasRef: RefObject<SVGSVGElement>) {
  const [lines, setLines] = useState<Line[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<PartialLine | null>(null);
  
  // ... extracted mouse handlers
  
  return {
    lines,
    isDrawing,
    currentLine,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
```

### Task 2.5: Decompose Feature Components

Restructure large components:

**`src/features/editor/` structure:**
```
editor/
  index.tsx              # EditorPane (simplified orchestrator)
  CodeEditor.tsx         # Monaco wrapper (extract from EditorPane)
  graphical/
    index.tsx            # GraphicalEditor (simplified)
    Canvas.tsx           # SVG canvas element
    GridOverlay.tsx      # Grid lines rendering
    LineRenderer.tsx     # Existing lines + handles
    DrawingLine.tsx      # Line being drawn
```

**Simplified `EditorPane.tsx`:**
```typescript
export function EditorPane() {
  const { editorMode } = useAppStore();
  
  return (
    <ErrorBoundary fallback={<EditorErrorFallback />}>
      <div className="flex flex-col h-full">
        <EditorHeader />
        {editorMode === 'graphical' ? <GraphicalEditor /> : <CodeEditor />}
      </div>
    </ErrorBoundary>
  );
}
```

**`src/features/tools/` structure:**
```
tools/
  index.tsx              # ToolsPanel (simplified)
  sections/
    EditingTools.tsx     # Mirror, rotate, snap buttons
    ColorSection.tsx     # Background, thread colors
    SizeSection.tsx      # Units, tile size, rows/cols
    StitchSection.tsx    # Stitch, gap, width settings
    ExportSection.tsx    # Export/import buttons
```

**Each section should be <50 lines:**
```typescript
// src/features/tools/sections/ColorSection.tsx
export function ColorSection() {
  const { backgroundColor, threadColor, showGrid, setBackgroundColor, setThreadColor, setShowGrid } = useAppStore();
  
  return (
    <Panel title="Colors">
      <ColorPicker label="Background" value={backgroundColor} onChange={setBackgroundColor} />
      <ColorPicker label="Thread" value={threadColor} onChange={setThreadColor} />
      <Checkbox label="Show Grid" checked={showGrid} onChange={setShowGrid} />
    </Panel>
  );
}
```

### Task 2.6: Add Error Boundaries

Create error boundary component:

**`src/components/ErrorBoundary.tsx`:**
```typescript
import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode | ((error: Error) => ReactNode);
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      return typeof fallback === 'function' 
        ? fallback(this.state.error!) 
        : fallback;
    }
    return this.props.children;
  }
}
```

**Create fallback components:**
- `src/components/fallbacks/EditorErrorFallback.tsx`
- `src/components/fallbacks/PreviewErrorFallback.tsx`

### Task 2.7: Accessibility Audit and Fixes

Add accessibility to existing components:

**GraphicalEditor accessibility:**
```typescript
<svg
  ref={canvasRef}
  role="application"
  aria-label="Pattern drawing canvas"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  // ... existing props
>
```

**Modal accessibility:**
```typescript
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  onKeyDown={(e) => e.key === 'Escape' && onClose()}
>
  <h2 id="modal-title">Pattern Library</h2>
  {/* Focus trap implementation */}
</div>
```

**Button accessibility:**
- All buttons must have accessible names
- Icon-only buttons need `aria-label`

## Deliverables Checklist

- [ ] `src/components/Controls.tsx` deleted
- [ ] `src/components/ui/Button.tsx`
- [ ] `src/components/ui/Input.tsx`
- [ ] `src/components/ui/Select.tsx`
- [ ] `src/components/ui/Checkbox.tsx`
- [ ] `src/components/ui/ColorPicker.tsx`
- [ ] `src/components/ui/Modal.tsx`
- [ ] `src/components/ui/Panel.tsx`
- [ ] `src/components/ui/index.ts`
- [ ] `src/components/layout/Header.tsx`
- [ ] `src/components/layout/SplitPane.tsx`
- [ ] `src/components/ErrorBoundary.tsx`
- [ ] `src/hooks/useViewBox.ts`
- [ ] `src/hooks/useExportPdf.ts`
- [ ] `src/hooks/useFileImport.ts`
- [ ] `src/hooks/useSvgTransform.ts`
- [ ] `src/hooks/useDrawing.ts`
- [ ] `src/features/editor/` restructured
- [ ] `src/features/tools/` restructured
- [ ] `src/App.tsx` simplified
- [ ] All components have proper ARIA attributes
- [ ] No component exceeds 150 lines

## Report Requirements

After completing all tasks, create a report at `.cursor/agents/agent2-report.md` containing:

1. **Summary** - What was accomplished
2. **Files Created** - List all new files with line counts
3. **Files Modified** - List all modified files with change summaries
4. **Files Deleted** - List deleted files
5. **Component Inventory** - Table of all components with props interface
6. **Hook Inventory** - Table of all hooks with return types
7. **Accessibility Improvements** - List of a11y changes made
8. **Known Issues** - Any components that still need work
9. **Recommendations** - Suggestions for Agent 4's tests




