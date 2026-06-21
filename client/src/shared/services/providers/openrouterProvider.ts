/**
 * OpenRouter Provider Adapter
 */

import type { AIProvider } from '@/shared/services/aiRouter';
import { callOpenAICompatible } from '@/shared/services/providers/openAICompatible';

export const openrouterProvider: AIProvider = {
  id: 'openrouter',
  name: 'OpenRouter',
  models: [
    'meta-llama/llama-3.1-70b-instruct:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'deepseek/deepseek-chat:free',
    'openai/gpt-4o-mini',
  ],

  async call(message, opts) {
    const config = opts.config;
    return callOpenAICompatible(message, opts.history || [], opts.userContext || {}, {
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: config.apiKey,
      model: config.model || 'meta-llama/llama-3.1-70b-instruct:free',
      providerId: 'openrouter',
      providerName: 'OpenRouter',
      maxTokens: config.maxTokens || 512,
      temperature: config.temperature ?? 0.7,
      headers: {
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'PSB SecureWealth Twin',
      },
    });
  },
};
