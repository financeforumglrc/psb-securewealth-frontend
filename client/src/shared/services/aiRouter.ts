/**
 * Unified AI Router
 * Dispatches requests to the correct provider adapter.
 */

import type { ProviderConfig } from '@/shared/services/aiConfig';
import type { UserContext } from '@/shared/services/aiPrompts';

import { geminiProvider } from '@/shared/services/providers/geminiProvider';
import { grokProvider } from '@/shared/services/providers/grokProvider';
import { huggingfaceProvider } from '@/shared/services/providers/huggingfaceProvider';
import { openrouterProvider } from '@/shared/services/providers/openrouterProvider';
import { nvidiaProvider } from '@/shared/services/providers/nvidiaProvider';
import { openaiProvider } from '@/shared/services/providers/openaiProvider';
import { anthropicProvider } from '@/shared/services/providers/anthropicProvider';
import { deepseekProvider } from '@/shared/services/providers/deepseekProvider';
import { groqProvider } from '@/shared/services/providers/groqProvider';
import { cohereProvider } from '@/shared/services/providers/cohereProvider';
import { mistralProvider } from '@/shared/services/providers/mistralProvider';

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
