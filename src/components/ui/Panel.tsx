import { useState, type ReactNode } from 'react';

export interface PanelProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export function Panel({ title, children, defaultExpanded = true, className }: PanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between text-sm font-semibold text-gray-300 mb-2 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
      >
        <span>{title}</span>
        <span
          className="text-gray-500 transition-transform duration-200"
          style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        >
          ▶
        </span>
      </button>
      {isExpanded && <div className="space-y-2">{children}</div>}
    </div>
  );
}
