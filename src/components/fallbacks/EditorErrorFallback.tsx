interface EditorErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
}

export function EditorErrorFallback({ error, onRetry }: EditorErrorFallbackProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center h-full bg-gray-900 text-gray-100 p-8"
    >
      <div className="text-rose-400 text-6xl mb-4" aria-hidden="true">
        ⚠
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Editor Error</h2>
      <p className="text-gray-400 text-center mb-4 max-w-md">
        Something went wrong while loading the editor. This might be due to invalid SVG content.
      </p>
      {error && (
        <pre className="text-xs text-rose-300 bg-gray-800 p-4 rounded mb-4 max-w-md overflow-auto">
          {error.message}
        </pre>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-300 text-gray-800 rounded hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Retry
        </button>
      )}
    </div>
  );
}
