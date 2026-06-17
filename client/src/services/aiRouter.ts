/**
 * Unified AI Router
 * Dispatches requests to the correct provider adapter.
 */

import type { ProviderConfig } from './aiConfig';
import type { UserContext } from './aiPrompts';

import { geminiProvider } from './providers/geminiProvider';
import { grokProvider } from './providers/grokProvider';
import { huggingfaceProvider } from './providers/huggingfaceProvider';
import { openrouterProvider } from './providers/openrouterProvider';
import { nvidiaProvider } from './providers/nvidiaProvider';
import { openaiProvider } from './providers/openaiProvider';
import { anthropicProvider } from './providers/anthropicProvider';
import { deepseekProvider } from './providers/deepseekProvider';
import { groqProvider } from './providers/groqProvider';
import { cohereProvider } from './providers/cohereProvider';
import { mistralProvider } from './providers/mistralProvider';

export interface AIResponse {
  text: string;
  provider: string;
  model: string;
  latencyMs: number;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
  };
}

export interface AIProvider {
  id: string;
  name: string;
  models: string[];
  call(
    message: string,
    opts: {
      history?: { user: string; bot: string }[];
      userContext?: UserContext;
      config: ProviderConfig;
    }
  ): Promise<AIResponse>;
}

const PROVIDERS: Record<string, AIProvider> = {
  gemini: geminiProvider,
  grok: grokProvider,
  huggingface: huggingfaceProvider,
  openrouter: openrouterProvider,
  nvidia: nvidiaProvider,
  openai: openaiProvider,
  anthropic: anthropicProvider,
  deepseek: deepseekProvider,
  groq: groqProvider,
  cohere: cohereProvider,
  mistral: mistralProvider,
};

export function getProvider(id: string): AIProvider | undefined {
  return PROVIDERS[id];
}

export function listProviders(): AIProvider[] {
  return Object.values(PROVIDERS);
}

export async function callProvider(
  providerId: string,
  message: string,
  config: ProviderConfig,
  opts: { history?: { user: string; bot: string }[]; userContext?: UserContext } = {}
): Promise<AIResponse> {
  const provider = getProvider(providerId);
  if (!provider) {
    throw new Error(`Unknown AI provider: ${providerId}`);
  }
  return provider.call(message, { ...opts, config });
}
