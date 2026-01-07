/**
 * SubmitPatternModal component
 * Form for users to submit their patterns for review
 */

import { useState, useCallback } from 'react';

import { isSupabaseConfigured } from '../config';
import { supabasePatternService } from '../services/pattern/SupabasePatternService';
import { useAppStore } from '../store';

import { Modal, Button, Input, Select } from './ui';

interface SubmitPatternModalProps {
  onClose: () => void;
}

const LICENSE_OPTIONS = [
  { value: 'CC BY 4.0', label: 'CC BY 4.0 (Attribution)' },
  { value: 'CC BY-SA 4.0', label: 'CC BY-SA 4.0 (Attribution-ShareAlike)' },
  { value: 'CC BY-NC 4.0', label: 'CC BY-NC 4.0 (Attribution-NonCommercial)' },
  { value: 'CC0', label: 'CC0 (Public Domain)' },
];

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export function SubmitPatternModal({ onClose }: SubmitPatternModalProps) {
  // Get current pattern state from store
  const svgContent = useAppStore((state) => state.svgContent);
  const viewBox = useAppStore((state) => state.viewBox);
  const currentName = useAppStore((state) => state.patternName);
  const currentAuthor = useAppStore((state) => state.patternAuthor);
  const currentLicense = useAppStore((state) => state.patternLicense);
  const currentNotes = useAppStore((state) => state.patternNotes);
  const stitchLengthMm = useAppStore((state) => state.stitchLengthMm);
  const gapLengthMm = useAppStore((state) => state.gapLengthMm);
  const strokeWidthMm = useAppStore((state) => state.strokeWidthMm);
  const snapGridMm = useAppStore((state) => state.snapGridMm);

  // Form state
  const [name, setName] = useState(currentName || '');
  const [author, setAuthor] = useState(currentAuthor || '');
  const [license, setLicense] = useState(currentLicense || 'CC BY 4.0');
  const [notes, setNotes] = useState(currentNotes || '');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Validation
  const isValid = name.trim().length > 0 && author.trim().length > 0;
  const hasContent = svgContent.includes('<path') || svgContent.includes('<line');

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);
  };

  // Handle submission
  const handleSubmit = useCallback(async () => {
    if (!isValid || !hasContent) return;

    if (!isSupabaseConfigured()) {
      setStatus('error');
      setErrorMessage('Submissions are not available. Supabase is not configured.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    const slug = generateSlug(name);
    const pattern = {
      id: slug,
      name: name.trim(),
      author: author.trim(),
      license,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tile: {
        svg: svgContent,
        viewBox,
      },
      defaults: {
        stitchLengthMm,
        gapLengthMm,
        strokeWidthMm,
        snapGridMm,
      },
    };

    const result = await supabasePatternService.submitPattern(
      pattern,
      svgContent,
      email.trim() || undefined
    );

    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMessage(result.error.message);
    }
  }, [
    isValid,
    hasContent,
    name,
    author,
    license,
    notes,
    email,
    svgContent,
    viewBox,
    stitchLengthMm,
    gapLengthMm,
    strokeWidthMm,
    snapGridMm,
  ]);

  // Success view
  if (status === 'success') {
    return (
      <Modal isOpen title="Pattern Submitted!" onClose={onClose}>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Thank you for your submission!</h3>
          <p className="text-gray-400 mb-4">
            Your pattern &quot;{name}&quot; has been submitted for review.
          </p>
          <p className="text-sm text-gray-500">
            Our team will review your submission and add it to the library if approved.
            {email && " We'll notify you at the email you provided."}
          </p>
          <Button variant="emerald" size="lg" onClick={onClose} className="mt-6">
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  const footer = (
    <div className="flex justify-between w-full">
      <Button variant="slate" size="lg" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="emerald"
        size="lg"
        onClick={handleSubmit}
        disabled={!isValid || !hasContent || status === 'submitting'}
      >
        {status === 'submitting' ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          'Submit Pattern'
        )}
      </Button>
    </div>
  );

  return (
    <Modal isOpen title="Submit Your Pattern" onClose={onClose} footer={footer}>
      <div className="space-y-6">
        {/* Info banner */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
          <p className="text-emerald-400 text-sm">
            Share your sashiko design with the community! Your pattern will be reviewed by our team
            before being added to the public library.
          </p>
        </div>

        {/* No content warning */}
        {!hasContent && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-amber-400 text-sm">
              Your pattern appears to be empty. Please create a design before submitting.
            </p>
          </div>
        )}

        {/* Error message */}
        {status === 'error' && errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
            <p className="text-rose-400 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <label htmlFor="pattern-name" className="block text-sm font-medium text-gray-300 mb-1">
              Pattern Name <span className="text-rose-400">*</span>
            </label>
            <Input
              id="pattern-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Asanoha Star"
              required
            />
          </div>

          <div>
            <label
              htmlFor="pattern-author"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Your Name <span className="text-rose-400">*</span>
            </label>
            <Input
              id="pattern-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g., Jane Doe"
              required
            />
          </div>

          <div>
            <label
              htmlFor="pattern-license"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              License
            </label>
            <Select
              id="pattern-license"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              options={LICENSE_OPTIONS}
            />
            <p className="text-xs text-gray-500 mt-1">
              Choose how others can use your pattern.{' '}
              <a
                href="https://creativecommons.org/licenses/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                Learn more
              </a>
            </p>
          </div>

          <div>
            <label htmlFor="pattern-notes" className="block text-sm font-medium text-gray-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="pattern-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or history about this pattern..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label htmlFor="pattern-email" className="block text-sm font-medium text-gray-300 mb-1">
              Email (optional)
            </label>
            <Input
              id="pattern-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              We&apos;ll notify you when your pattern is approved (never shared publicly).
            </p>
          </div>
        </div>

        {/* Preview info */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-2">What happens next?</h4>
          <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
            <li>Your pattern is submitted for review</li>
            <li>Our team checks the design quality and content</li>
            <li>If approved, it appears in the public library</li>
            <li>You get credit as the pattern author</li>
          </ol>
        </div>
      </div>
    </Modal>
  );
}

export default SubmitPatternModal;
