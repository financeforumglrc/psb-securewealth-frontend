/**
 * AI Orchestrator
 * Routes chat requests across configured providers using fallback, fastest-first,
 * ensemble, or cost-aware strategies. Tracks health and implements a simple circuit breaker.
 */

import type { ProviderConfig, RoutingMode } from '@/shared/services/aiConfig';
import { getActiveProviders, getRoutingMode, getEnsembleCount } from '@/shared/services/aiConfig';
import type { AIResponse } from '@/shared/services/aiRouter';
import { callProvider } from '@/shared/services/aiRouter';
import type { UserContext } from '@/shared/services/aiPrompts';
import { buildEnsembleMergePrompt } from '@/shared/services/aiPrompts';

const CIRCUIT_BREAKER_KEY = 'sw_ai_circuit_breaker';
const CIRCUIT_WINDOW_MS = 2 * 60 * 1000; // 2 minutes
const DEFAULT_TIMEOUT_MS = 20000;

interface FailureRecord {
  count: number;
  lastFailure: number;
}

function getCircuitBreaker(): Record<string, FailureRecord> {
  try {
    const raw = sessionStorage.getItem(CIRCUIT_BREAKER_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCircuitBreaker(state: Record<string, FailureRecord>) {
  try {
    sessionStorage.setItem(CIRCUIT_BREAKER_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function markProviderFailure(providerId: string) {
  const state = getCircuitBreaker();
  const now = Date.now();
  const record = state[providerId] || { count: 0, lastFailure: now };
  record.count += 1;
  record.lastFailure = now;
  state[providerId] = record;
  setCircuitBreaker(state);
}

export function isProviderTripped(providerId: string): boolean {
  const state = getCircuitBreaker();
  const record = state[providerId];
  if (!record) return false;
  if (Date.now() - record.lastFailure > CIRCUIT_WINDOW_MS) {
    // reset stale record
    delete state[providerId];
    setCircuitBreaker(state);
    return false;
  }
  return record.count >= 2;
}

export function resetProviderHealth(providerId?: string) {
  if (providerId) {
    const state = getCircuitBreaker();
    delete state[providerId];
    setCircuitBreaker(state);
  } else {
    sessionStorage.removeItem(CIRCUIT_BREAKER_KEY);
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function tryProvider(
  provider: ProviderConfig,
  message: string,
  opts: { history?: { user: string; bot: string }[]; userContext?: UserContext }
): Promise<AIResponse> {
  try {
    const result = await withTimeout(
      callProvider(provider.id, message, provider, opts),
      DEFAULT_TIMEOUT_MS
    );
    return result;
  } catch (error) {
    markProviderFailure(provider.id);
    throw error;
  }
}

async function fallbackChain(
  providers: ProviderConfig[],
  message: string,
  opts: { history?: { user: string; bot: string }[]; userContext?: UserContext }
): Promise<AIResponse> {
  const available = providers.filter((p) => !isProviderTripped(p.id));
  const tripped = providers.filter((p) => isProviderTripped(p.id));
  const ordered = [...available, ...tripped];

  const errors: string[] = [];
  for (const provider of ordered) {
    try {
      const result = await tryProvider(provider, message, opts);
      resetProviderHealth(provider.id);
      return result;
    } catch (err) {
      errors.push(`${provider.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  throw new Error(`All AI providers failed. ${errors.join(' | ')}`);
}

async function fastestFirst(
  providers: ProviderConfig[],
  message: string,
  opts: { history?: { user: string; bot: string }[]; userContext?: UserContext },
  count = 3
): Promise<AIResponse> {
  const candidates = providers
    .filter((p) => !isProviderTripped(p.id))
    .slice(0, Math.max(2, count));

  if (candidates.length === 0) {
    return fallbackChain(providers, message, opts);
  }

  const races = candidates.map((p) =>
    tryProvider(p, message, opts).then((r) => ({ ok: true as const, result: r, error: null as Error | null })).catch((err) => ({
      ok: false as const,
      result: null as AIResponse | null,
      error: err instanceof Error ? err : new Error(String(err)),
    }))
  );

  const settled = await Promise.all(races);
  const firstSuccess = settled.find((s) => s.ok && s.result);
  if (firstSuccess?.result) {
    resetProviderHealth(firstSuccess.result.provider);
    return firstSuccess.result;
  }

  const errors = candidates.map((p, i) => `${p.id}: ${settled[i].error?.message || 'failed'}`);
  throw new Error(`All raced providers failed. ${errors.join(' | ')}`);
}

async function ensemble(
  providers: ProviderConfig[],
  message: string,
  opts: { history?: { user: string; bot: string }[]; userContext?: UserContext },
  count = 2
): Promise<AIResponse> {
  const candidates = providers
    .filter((p) => !isProviderTripped(p.id))
    .slice(0, Math.max(2, count));

  if (candidates.length < 2) {
    return fallbackChain(providers, message, opts);
  }

  const races = candidates.map((p) =>
    tryProvider(p, message, opts).catch(() => {
      markProviderFailure(p.id);
      return null;
    })
  );

  const results = (await Promise.all(races)).filter((r): r is AIResponse => r !== null);

  if (results.length === 0) {
    throw new Error('All ensemble providers failed.');
  }

  if (results.length === 1) {
    return results[0];
  }

  // Pick the best single answer using a simple quality heuristic:
  // prefer longer but not too long, with lower latency.
  const scored = results.map((r) => {
    const lengthScore = Math.min(r.text.length, 1500) / 1500;
    const latencyScore = Math.max(0, 1 - r.latencyMs / 10000);
    return { ...r, score: lengthScore * 0.6 + latencyScore * 0.4 };
  });
  scored.sort((a, b) => b.score - a.score);

  // Optional: if top answer is very short compared to others, synthesize
  const best = scored[0];
  if (results.length >= 2 && best.text.length < 120) {
    try {
      const mergeResult = await fallbackChain(providers, buildEnsembleMergePrompt(message, results.map((r) => r.text)), {
        history: [],
        userContext: opts.userContext,
      });
      return {
        ...mergeResult,
        provider: `ensemble (${results.map((r) => r.provider).join('+')})`,
        model: 'merged',
      };
    } catch {
      // fall through to best single answer
    }
  }

  return {
    ...best,
    provider: `ensemble (${results.map((r) => r.provider).join('+')})`,
  };
}

const COMPLEX_KEYWORDS = [
  'retirement',
  'fire',
  'portfolio',
  'rebalance',
  'tax plan',
  'estate',
  'comprehensive',
  'strategy',
  'allocation',
  'monte carlo',
  'scenario',
];

function isComplexQuery(message: string): boolean {
  const lower = message.toLowerCase();
  return COMPLEX_KEYWORDS.some((k) => lower.includes(k));
}

async function costAware(
  providers: ProviderConfig[],
  message: string,
  opts: { history?: { user: string; bot: string }[]; userContext?: UserContext }
): Promise<AIResponse> {
  const cheapOrder = ['gemini', 'groq', 'openrouter', 'mistral', 'cohere', 'huggingface', 'openai', 'anthropic', 'grok', 'nvidia', 'deepseek'];
  const complex = isComplexQuery(message);

  const sorted = [...providers].sort((a, b) => {
    const idxA = cheapOrder.indexOf(a.id);
    const idxB = cheapOrder.indexOf(b.id);
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
  });

  // For complex queries, promote premium providers to the front
  if (complex) {
    const premium = ['openai', 'anthropic', 'grok', 'nvidia', 'deepseek'];
    const premiumSorted = sorted.filter((p) => premium.includes(p.id));
    const rest = sorted.filter((p) => !premium.includes(p.id));
    return fallbackChain([...premiumSorted, ...rest], message, opts);
  }

  return fallbackChain(sorted, message, opts);
}

export interface OrchestratorOptions {
  mode?: RoutingMode;
  history?: { user: string; bot: string }[];
  userContext?: UserContext;
  providers?: ProviderConfig[];
  ensembleCount?: number;
}

export async function callAI(
  message: string,
  opts: OrchestratorOptions = {}
): Promise<AIResponse> {
  const providers = opts.providers || getActiveProviders();
  if (providers.length === 0) {
    throw new Error('No AI providers configured');
  }

  const mode = opts.mode || getRoutingMode();
  const history = opts.history || [];
  const userContext = opts.userContext;

  switch (mode) {
    case 'fastest':
      return fastestFirst(providers, message, { history, userContext });
    case 'ensemble':
      return ensemble(providers, message, { history, userContext }, opts.ensembleCount || getEnsembleCount());
    case 'cost-aware':
      return costAware(providers, message, { history, userContext });
    case 'fallback':
    default:
      return fallbackChain(providers, message, { history, userContext });
  }
}

export function getProviderHealth(): { providerId: string; healthy: boolean; tripped: boolean }[] {
  const providers = getActiveProviders();
  return providers.map((p) => ({
    providerId: p.id,
    healthy: !isProviderTripped(p.id),
    tripped: isProviderTripped(p.id),
  }));
}
