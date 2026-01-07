/**
 * PatternCard component
 * Displays a pattern preview card with thumbnail and metadata
 */

import { supabasePatternService } from '../../services/pattern/SupabasePatternService';
import type { DbPattern } from '../../types';

export interface PatternCardProps {
  pattern: DbPattern;
  onSelect: (pattern: DbPattern) => void;
  isLoading?: boolean;
}

export function PatternCard({ pattern, onSelect, isLoading = false }: PatternCardProps) {
  const thumbnailUrl = supabasePatternService.getPatternThumbnailUrl(pattern);

  return (
    <button
      onClick={() => onSelect(pattern)}
      disabled={isLoading}
      className="group relative bg-gray-900 border border-gray-700 rounded-lg overflow-hidden transition-all duration-200 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={`Load pattern: ${pattern.name} by ${pattern.author}`}
    >
      {/* Thumbnail Area */}
      <div className="aspect-square bg-gray-800 relative overflow-hidden">
        {thumbnailUrl ? (
          <div
            className="absolute inset-0 flex items-center justify-center p-4"
            style={{ backgroundColor: '#f5f5dc' }} // Cloth-like background
          >
            <img
              src={thumbnailUrl}
              alt={`Preview of ${pattern.name}`}
              className="max-w-full max-h-full object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-4">
          <span className="text-emerald-400 font-medium text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Load Pattern
          </span>
        </div>
      </div>

      {/* Metadata */}
      <div className="p-3 text-left">
        <h3 className="font-medium text-white text-sm truncate group-hover:text-emerald-400 transition-colors">
          {pattern.name}
        </h3>
        <p className="text-xs text-gray-400 truncate mt-0.5">by {pattern.author}</p>

        {/* Stats Row */}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1" title="Downloads">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {pattern.download_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1" title="Views">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {pattern.view_count.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
}

export default PatternCard;
