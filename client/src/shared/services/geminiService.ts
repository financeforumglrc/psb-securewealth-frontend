/**
 * Gemini Direct Service — backward-compatible wrapper
 * The multi-provider router (aiRouter.ts / aiOrchestrator.ts) now handles dispatch.
 * This file re-exports the legacy helpers and a thin adapter so existing imports keep working.
 */

import { updateProviderConfig, type ProviderConfig } from '@/shared/services/aiConfig';
import { callProvider, type AIResponse } from '@/shared/services/aiRouter';

export interface GeminiConfig {
  apiKey: string;
  model: string;
}

const CONFIG_KEY = 'sw_gemini_config';

export function getGeminiConfig(): GeminiConfig | null {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setGeminiConfig(config: GeminiConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  // Mirror into the new multi-provider store
  updateProviderConfig('gemini', {
    apiKey: config.apiKey,
    model: config.model || 'gemini-2.0-flash',
    enabled: true,
  });
}

export function clearGeminiConfig() {
  localStorage.removeItem(CONFIG_KEY);
  updateProviderConfig('gemini', { apiKey: '', enabled: false });
}

export function isGeminiConfigured(): boolean {
  return !!getGeminiConfig()?.apiKey;
}

export async function callGeminiDirect(
  message: string,
  opts: { history?: { user: string; bot: string }[]; userContext?: Record<string, unknown> } = {}
): Promise<{ text: string; source: 'gemini' | 'offline' }> {
  const config = getGeminiConfig();
  if (!config?.apiKey) {
    throw new Error('No Gemini API key configured');
  }

  const providerConfig: ProviderConfig = {
    id: 'gemini',
    name: 'Google Gemini',
    apiKey: config.apiKey,
    model: config.model || 'gemini-2.0-flash',
    enabled: true,
    priority: 2,
    maxTokens: 512,
    temperature: 0.7,
  };

  const result: AIResponse = await callProvider('gemini', message, providerConfig, {
    history: opts.history,
    userContext: opts.userContext,
  });

  return { text: result.text, source: 'gemini' };
}
