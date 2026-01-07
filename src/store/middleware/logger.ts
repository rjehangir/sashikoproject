/**
 * Development logging middleware
 * Logs state changes in development mode
 *
 * Note: This middleware is kept simple for enterprise refactoring.
 * For production use, consider using zustand/devtools instead.
 */

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}
