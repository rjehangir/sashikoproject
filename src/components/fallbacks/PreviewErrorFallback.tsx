interface PreviewErrorFallbackProps {
  error?: Error;
}

export function PreviewErrorFallback({ error }: PreviewErrorFallbackProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center h-full bg-gray-900 text-gray-100 p-8"
    >
      <div className="text-rose-400 text-6xl mb-4" aria-hidden="true">
        ⚠
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Preview Error</h2>
      <p className="text-gray-400 text-center mb-4 max-w-md">
        Unable to render the pattern preview. Please check your SVG content for errors.
      </p>
      {error && (
        <pre className="text-xs text-rose-300 bg-gray-800 p-4 rounded max-w-md overflow-auto">
          {error.message}
        </pre>
      )}
    </div>
  );
}
