import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const CHUNK_ERROR_RE = /Loading chunk|Failed to fetch|dynamically imported module|Unable to preload CSS|NetworkError|importScripts|chunk/i;

export function isChunkError(error: unknown): boolean {
  if (!error) return false;
  const msg = (error instanceof Error ? error.message : String(error)) || '';
  return CHUNK_ERROR_RE.test(msg);
}

export async function retryImport<T>(factory: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await factory();
    } catch (err) {
      lastError = err;
      if (attempt >= retries) break;
      // Exponential backoff: 400ms, 900ms
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1) ** 2));
    }
  }
  throw lastError;
}

export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: { retries?: number; reloadOnChunkError?: boolean } = {}
): LazyExoticComponent<T> {
  const { retries = 2, reloadOnChunkError = true } = options;
  return lazy(() =>
    retryImport(factory, retries).catch((error: unknown) => {
      if (reloadOnChunkError && isChunkError(error)) {
        const alreadyReloaded = sessionStorage.getItem('sw-chunk-reload') === '1';
        if (!alreadyReloaded) {
          sessionStorage.setItem('sw-chunk-reload', '1');
          // Hard reload with cache-bust to fetch fresh chunks after a stale deploy.
          window.location.href = `${window.location.origin}${window.location.pathname}?r=${Date.now()}`;
        }
      }
      throw error;
    })
  );
}
