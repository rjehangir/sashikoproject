/**
 * UnsavedChangesDialog component
 * Prompts user to save or discard changes before loading a new pattern
 */

import { useCallback } from 'react';

import { useAppStore } from '../store';

import { Modal, Button } from './ui';

export interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onSaveDraft: () => void;
}

export function UnsavedChangesDialog({
  isOpen,
  onClose,
  onDiscard,
  onSaveDraft,
}: UnsavedChangesDialogProps) {
  const patternName = useAppStore((state) => state.patternName);

  const handleSave = useCallback(() => {
    onSaveDraft();
    onClose();
  }, [onSaveDraft, onClose]);

  const handleDiscard = useCallback(() => {
    onDiscard();
    onClose();
  }, [onDiscard, onClose]);

  const footer = (
    <div className="flex gap-3 w-full justify-end">
      <Button variant="secondary" size="md" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="danger" size="md" onClick={handleDiscard}>
        Discard
      </Button>
      <Button variant="success" size="md" onClick={handleSave}>
        Save to Drafts
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unsaved Changes" footer={footer}>
      <div className="space-y-4">
        <p className="text-charcoal-700 dark:text-cream-200">
          You have unsaved changes to{' '}
          <span className="font-semibold text-charcoal-900 dark:text-cream-50">
            &quot;{patternName}&quot;
          </span>
          .
        </p>
        <p className="text-charcoal-500 dark:text-cream-400 text-sm">
          Would you like to save your work to your local drafts before continuing? You can access
          your drafts from the Pattern Library at any time.
        </p>
        <div className="bg-cream-100 dark:bg-charcoal-900 rounded-lg p-4 border border-cream-300 dark:border-charcoal-700">
          <h4 className="text-sm font-medium text-charcoal-700 dark:text-cream-200 mb-2">
            Your options:
          </h4>
          <ul className="text-sm text-charcoal-500 dark:text-cream-400 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-sage-600 dark:text-sage-400">Save to Drafts</span>
              <span>- Keep your work in local browser storage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-terracotta-500 dark:text-terracotta-400">Discard</span>
              <span>- Lose your changes permanently</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-charcoal-400 dark:text-cream-500">Cancel</span>
              <span>- Go back and keep editing</span>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

export default UnsavedChangesDialog;
