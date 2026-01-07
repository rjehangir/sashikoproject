import { useAppStore } from '../../store';
import { Button } from '../ui';

/**
 * Sashiko Logo Component
 * Matches the favicon design
 */
function SashikoLogo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="6" className="fill-indigo-700 dark:fill-indigo-600" />
      <g className="stroke-cream-50" strokeWidth="2" strokeLinecap="round" fill="none">
        <line x1="6" y1="6" x2="26" y2="26" />
        <line x1="6" y1="26" x2="26" y2="6" />
        <line x1="16" y1="6" x2="16" y2="26" />
        <line x1="6" y1="16" x2="26" y2="16" />
      </g>
    </svg>
  );
}

/**
 * Theme Toggle Button
 */
function ThemeToggle() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200 dark:text-cream-300 dark:hover:text-cream-50 dark:hover:bg-charcoal-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        // Sun icon for dark mode (click to go light)
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon icon for light mode (click to go dark)
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}

interface GitHubStatsProps {
  url: string;
  stars: number;
  forks: number;
}

/**
 * GitHub Link with Stars and Forks
 */
function GitHubStats({ url, stars, forks }: GitHubStatsProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View project on GitHub"
      className="flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200 dark:text-cream-300 dark:hover:text-cream-50 dark:hover:bg-charcoal-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
      <div className="flex items-center gap-3 text-sm">
        <span className="flex items-center gap-1" aria-label={`${stars} stars`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
          </svg>
          <span>{stars}</span>
        </span>
        <span className="flex items-center gap-1" aria-label={`${forks} forks`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.878a2.25 2.25 0 111.5 0v.878a2.25 2.25 0 01-2.25 2.25h-1.5v2.128a2.251 2.251 0 11-1.5 0V8.5h-1.5A2.25 2.25 0 013.5 6.25v-.878a2.25 2.25 0 111.5 0zM5 3.25a.75.75 0 10-1.5 0 .75.75 0 001.5 0zm6.75.75a.75.75 0 10.75-.75.75.75 0 00-.75.75zM8 12.25a.75.75 0 10-1.5 0 .75.75 0 001.5 0z" />
          </svg>
          <span>{forks}</span>
        </span>
      </div>
    </a>
  );
}

export interface HeaderProps {
  title: string;
  githubUrl?: string;
  githubStats?: { stars: number; forks: number };
  onOpenLibrary?: () => void;
  onOpenSubmit?: () => void;
  onOpenAdmin?: () => void;
  onNewDesign?: () => void;
  onSaveDraft?: () => void;
}

export function Header({
  title,
  githubUrl,
  githubStats,
  onOpenLibrary,
  onOpenSubmit,
  onOpenAdmin,
  onNewDesign,
  onSaveDraft,
}: HeaderProps) {
  return (
    <header className="bg-cream-100 border-b border-cream-300 dark:bg-charcoal-800 dark:border-charcoal-700 px-4 py-3 flex items-center justify-between">
      {/* Left section: Logo, Title, Back to Home */}
      <div className="flex items-center gap-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <SashikoLogo className="w-9 h-9" />
          <div className="flex flex-col">
            <h1 className="text-lg font-serif font-semibold text-charcoal-900 dark:text-cream-50 leading-tight">
              {title}
            </h1>
            <a
              href="/"
              className="text-xs text-charcoal-500 hover:text-indigo-700 dark:text-cream-400 dark:hover:text-indigo-400 transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-cream-300 dark:bg-charcoal-600 hidden sm:block" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2 hidden sm:flex">
          {onNewDesign && (
            <Button
              variant="primary"
              size="sm"
              onClick={onNewDesign}
              aria-label="Start a new design"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              New
            </Button>
          )}

          {onSaveDraft && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onSaveDraft}
              aria-label="Save current design as draft"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              Save
            </Button>
          )}

          {onOpenLibrary && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenLibrary}
              aria-label="Open pattern library"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Library
            </Button>
          )}

          {onOpenSubmit && (
            <Button
              variant="success"
              size="sm"
              onClick={onOpenSubmit}
              aria-label="Submit your pattern"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Submit
            </Button>
          )}

          {/* Hidden admin button */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="opacity-0 hover:opacity-100 focus:opacity-100 text-charcoal-400 hover:text-charcoal-600 dark:text-cream-500 dark:hover:text-cream-400 p-1 rounded transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Open admin panel"
              title="Admin Panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Right section: GitHub, Theme Toggle */}
      <div className="flex items-center gap-2">
        {githubUrl && (
          <GitHubStats
            url={githubUrl}
            stars={githubStats?.stars ?? 0}
            forks={githubStats?.forks ?? 0}
          />
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
