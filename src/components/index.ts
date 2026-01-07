/**
 * Components - Reusable UI components
 */

// UI primitives
export * from './ui';

// Layout components
export * from './layout';

// Error handling
export { ErrorBoundary, ErrorResetButton } from './ErrorBoundary';
export * from './fallbacks';

// Legacy components (to be migrated to features/)
export { default as PreviewPane } from './PreviewPane';
export { default as PatternLibraryModal } from './PatternLibraryModal';

// Dialogs
export { UnsavedChangesDialog } from './UnsavedChangesDialog';
export { SubmitPatternModal } from './SubmitPatternModal';
