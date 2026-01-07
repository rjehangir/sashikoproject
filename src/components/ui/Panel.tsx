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
        className="w-full flex items-center justify-between text-sm font-semibold text-charcoal-700 dark:text-cream-200 mb-2 hover:text-charcoal-900 dark:hover:text-cream-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded"
      >
        <span>{title}</span>
        <span
          className="text-charcoal-400 dark:text-cream-500 transition-transform duration-200"
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
