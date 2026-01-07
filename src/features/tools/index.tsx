import { useState } from 'react';

import { EditingTools, ColorSection, SizeSection, StitchSection, ExportSection } from './sections';

interface ToolsPanelProps {
  onShowLibrary: () => void;
}

export function ToolsPanel({ onShowLibrary }: ToolsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-cream-100 border-t border-cream-300 dark:bg-charcoal-800 dark:border-charcoal-700 flex flex-col flex-shrink-0">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="tools-panel-content"
        className="w-full px-4 py-2 bg-cream-100 hover:bg-cream-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-left text-charcoal-800 dark:text-cream-100 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-inset"
      >
        <span className="font-semibold">Tools & Settings</span>
        <span
          className="text-charcoal-400 dark:text-cream-500 transition-transform duration-200"
          style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        >
          ▶
        </span>
      </button>
      {isExpanded && (
        <div
          id="tools-panel-content"
          className="p-4 space-y-4 max-h-96 overflow-y-auto bg-cream-50 dark:bg-charcoal-900"
          role="region"
          aria-label="Tools and settings controls"
        >
          <EditingTools />
          <ColorSection />
          <SizeSection />
          <StitchSection />
          <ExportSection onShowLibrary={onShowLibrary} />
        </div>
      )}
    </div>
  );
}
