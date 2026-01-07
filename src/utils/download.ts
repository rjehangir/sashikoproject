/**
 * Download utilities
 * Handles file downloads in the browser
 */

/**
 * Download a blob or data as a file
 */
export function downloadBlob(data: Uint8Array | string, filename: string, mimeType: string): void {
  const blobData = typeof data === 'string' ? data : new Uint8Array(data);
  const blob = new Blob([blobData], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Download a PDF file
 */
export function downloadPdf(data: Uint8Array, filename: string): void {
  if (!filename.endsWith('.pdf')) {
    filename = `${filename}.pdf`;
  }
  downloadBlob(data, filename, 'application/pdf');
}

/**
 * Download a JSON file
 */
export function downloadJson(data: string, filename: string): void {
  if (!filename.endsWith('.json')) {
    filename = `${filename}.json`;
  }
  downloadBlob(data, filename, 'application/json');
}

/**
 * Download an SVG file
 */
export function downloadSvg(data: string, filename: string): void {
  if (!filename.endsWith('.svg')) {
    filename = `${filename}.svg`;
  }
  downloadBlob(data, filename, 'image/svg+xml');
}

/**
 * Create a filename from a pattern name (sanitized)
 */
export function createFilename(name: string, extension: string): string {
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const base = sanitized || 'pattern';
  return extension.startsWith('.') ? `${base}${extension}` : `${base}.${extension}`;
}
