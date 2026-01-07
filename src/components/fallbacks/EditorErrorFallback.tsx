interface EditorErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
}

export function EditorErrorFallback({ error, onRetry }: EditorErrorFallbackProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center h-full bg-cream-50 text-charcoal-900 dark:bg-charcoal-900 dark:text-cream-100 p-8"
    >
      <div
        className="text-terracotta-500 dark:text-terracotta-300 text-6xl mb-4"
        aria-hidden="true"
      >
        ⚠
      </div>
      <h2 className="text-xl font-semibold text-charcoal-900 dark:text-cream-50 mb-2">
        Editor Error
      </h2>
      <p className="text-charcoal-600 dark:text-cream-300 text-center mb-4 max-w-md">
        Something went wrong while loading the editor. This might be due to invalid SVG content.
      </p>
      {error && (
        <pre className="text-xs text-terracotta-600 dark:text-terracotta-300 bg-cream-200 dark:bg-charcoal-800 p-4 rounded mb-4 max-w-md overflow-auto">
          {error.message}
        </pre>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-indigo-700 text-cream-50 rounded hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
        >
          Retry
        </button>
      )}
    </div>
  );
}
