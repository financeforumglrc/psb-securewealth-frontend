/**
 * Mistral AI Provider Adapter
 */

import type { AIProvider } from '@/shared/services/aiRouter';
import { callOpenAICompatible } from '@/shared/services/providers/openAICompatible';

export const mistralProvider: AIProvider = {
  id: 'mistral',
  name: 'Mistral AI',
  models: ['mistral-small-latest', 'mistral-medium-latest', 'mistral-large-latest'],

  async call(message, opts) {
    const config = opts.config;
    return callOpenAICompatible(message, opts.history || [], opts.userContext || {}, {
      endpoint: 'https://api.mistral.ai/v1/chat/completions',
      apiKey: config.apiKey,
      model: config.model || 'mistral-small-latest',
      providerId: 'mistral',
      providerName: 'Mistral AI',
      maxTokens: config.maxTokens || 512,
      temperature: config.temperature ?? 0.7,
    });
  },
};
