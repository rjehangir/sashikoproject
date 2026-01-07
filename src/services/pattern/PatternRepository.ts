/**
 * Pattern Repository Service
 * Handles fetching patterns from the server
 */

import type { AsyncResult, PatternV1, PatternIndex } from '../../types';
import { ok, err, PatternV1Schema, PatternIndexSchema } from '../../types';

/**
 * Repository configuration
 */
export interface RepositoryConfig {
  /** Base URL for pattern files */
  baseUrl: string;
  /** Request timeout in ms */
  timeout?: number;
}

/**
 * Pattern Repository - data access layer for patterns
 */
export class PatternRepository {
  private baseUrl: string;
  private timeout: number;

  constructor(config: RepositoryConfig = { baseUrl: '/patterns' }) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout ?? 10000;
  }

  /**
   * Fetch the pattern index
   */
  async fetchIndex(): AsyncResult<PatternIndex> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/index.json`);

      if (!response.ok) {
        return err(new Error(`HTTP ${response.status}: ${response.statusText}`));
      }

      const data = await response.json();
      const parsed = PatternIndexSchema.safeParse(data);

      if (!parsed.success) {
        return err(new Error('Invalid pattern index format'));
      }

      return ok(parsed.data);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to fetch pattern index'));
    }
  }

  /**
   * Fetch a single pattern by ID
   */
  async fetchPattern(id: string): AsyncResult<PatternV1> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/${id}.json`);

      if (!response.ok) {
        if (response.status === 404) {
          return err(new Error(`Pattern not found: ${id}`));
        }
        return err(new Error(`HTTP ${response.status}: ${response.statusText}`));
      }

      const data = await response.json();
      const parsed = PatternV1Schema.safeParse(data);

      if (!parsed.success) {
        const errors = parsed.error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join('; ');
        return err(new Error(`Invalid pattern format: ${errors}`));
      }

      return ok(parsed.data);
    } catch (error) {
      return err(error instanceof Error ? error : new Error(`Failed to fetch pattern: ${id}`));
    }
  }

  /**
   * Fetch multiple patterns by ID
   */
  async fetchPatterns(ids: string[]): AsyncResult<Map<string, PatternV1>> {
    const results = new Map<string, PatternV1>();
    const errors: string[] = [];

    const fetchPromises = ids.map(async (id) => {
      const result = await this.fetchPattern(id);
      if (result.success) {
        results.set(id, result.data);
      } else {
        errors.push(`${id}: ${result.error.message}`);
      }
    });

    await Promise.all(fetchPromises);

    if (errors.length > 0 && results.size === 0) {
      return err(new Error(`Failed to fetch all patterns: ${errors.join('; ')}`));
    }

    return ok(results);
  }

  /**
   * Check if a pattern exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/${id}.json`, {
        method: 'HEAD',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Default singleton instance
export const patternRepository = new PatternRepository();
