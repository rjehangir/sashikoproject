import type { ReactNode } from 'react';

export interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  leftWidth?: string;
}

export function SplitPane({ left, right, leftWidth = '50%' }: SplitPaneProps) {
  return (
    <div className="flex-1 flex overflow-hidden" role="main">
      <div
        className="flex flex-col border-r border-cream-300 dark:border-charcoal-700 overflow-hidden"
        style={{ width: leftWidth }}
      >
        {left}
      </div>
      <div className="flex-1 flex flex-col">{right}</div>
    </div>
  );
}
