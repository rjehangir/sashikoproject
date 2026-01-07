import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode | ((error: Error) => ReactNode);
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component that catches JavaScript errors in child components
 * and displays a fallback UI instead of crashing the entire app.
 */
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
      return typeof fallback === 'function' ? fallback(this.state.error!) : fallback;
    }
    return this.props.children;
  }
}

/**
 * A simple reset button component for error fallbacks
 */
export function ErrorResetButton({ onReset }: { onReset: () => void }) {
  return (
    <button
      onClick={onReset}
      className="px-4 py-2 bg-blue-300 text-gray-800 rounded hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      Try Again
    </button>
  );
}
