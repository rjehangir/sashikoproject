/**
 * Environment configuration
 * Centralizes access to environment variables
 */

interface EnvConfig {
  appTitle: string;
  appVersion: string;
  githubRepo: string;
  enableAnalytics: boolean;
}

export const env: EnvConfig = {
  appTitle: import.meta.env.VITE_APP_TITLE || 'The Sashiko Project',
  appVersion: import.meta.env.VITE_APP_VERSION || '0.0.0',
  githubRepo: import.meta.env.VITE_GITHUB_REPO || 'YOUR_USERNAME/sashiko',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};
