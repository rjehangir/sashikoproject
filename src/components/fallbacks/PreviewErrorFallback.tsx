interface PreviewErrorFallbackProps {
  error?: Error;
}

export function PreviewErrorFallback({ error }: PreviewErrorFallbackProps) {
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
        Preview Error
      </h2>
      <p className="text-charcoal-600 dark:text-cream-300 text-center mb-4 max-w-md">
        Unable to render the pattern preview. Please check your SVG content for errors.
      </p>
      {error && (
        <pre className="text-xs text-terracotta-600 dark:text-terracotta-300 bg-cream-200 dark:bg-charcoal-800 p-4 rounded max-w-md overflow-auto">
          {error.message}
        </pre>
      )}
    </div>
  );
}
