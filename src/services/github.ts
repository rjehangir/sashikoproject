/**
 * GitHub Stats Service
 * Fetches repository statistics with localStorage caching
 */

const CACHE_KEY = 'sashiko-github-stats';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export interface GitHubStats {
  stars: number;
  forks: number;
  fetchedAt: number;
}

interface CachedStats extends GitHubStats {
  repo: string;
}

/**
 * Get cached stats from localStorage
 */
function getCachedStats(repo: string): GitHubStats | null {
  try {
    const cached = window.localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedStats = JSON.parse(cached);

    // Check if cache is for the same repo and not expired
    if (data.repo !== repo) return null;
    if (Date.now() - data.fetchedAt > CACHE_DURATION_MS) return null;

    return {
      stars: data.stars,
      forks: data.forks,
      fetchedAt: data.fetchedAt,
    };
  } catch {
    return null;
  }
}

/**
 * Save stats to localStorage cache
 */
function setCachedStats(repo: string, stats: GitHubStats): void {
  try {
    const data: CachedStats = {
      ...stats,
      repo,
    };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Fetch GitHub repository statistics
 * Returns cached data if available and fresh, otherwise fetches from API
 *
 * @param repo - Repository in "owner/repo" format
 * @returns GitHub stats or null if fetch fails
 */
export async function fetchGitHubStats(repo: string): Promise<GitHubStats | null> {
  // Check cache first
  const cached = getCachedStats(repo);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      console.warn(`GitHub API returned ${response.status} for ${repo}`);
      return null;
    }

    const data = await response.json();

    const stats: GitHubStats = {
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      fetchedAt: Date.now(),
    };

    // Cache the result
    setCachedStats(repo, stats);

    return stats;
  } catch (error) {
    console.warn('Failed to fetch GitHub stats:', error);
    return null;
  }
}

/**
 * Format a number for display (e.g., 1234 -> "1.2k")
 */
export function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}m`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}
