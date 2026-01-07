import { useState } from 'react';

import { EditingTools, ColorSection, SizeSection, StitchSection, ExportSection } from './sections';

interface ToolsPanelProps {
  onShowLibrary: () => void;
}

export function ToolsPanel({ onShowLibrary }: ToolsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-800 border-t border-gray-700 flex flex-col flex-shrink-0">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="tools-panel-content"
        className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-750 text-left text-gray-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset"
      >
        <span className="font-semibold">Tools & Settings</span>
        <span
          className="text-gray-400 transition-transform duration-200"
          style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        >
          ▶
        </span>
      </button>
      {isExpanded && (
        <div
          id="tools-panel-content"
          className="p-4 space-y-4 max-h-96 overflow-y-auto"
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
