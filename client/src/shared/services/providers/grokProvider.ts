/**
 * xAI Grok Provider Adapter
 */

import type { AIProvider } from '@/shared/services/aiRouter';
import { callOpenAICompatible } from '@/shared/services/providers/openAICompatible';

export const grokProvider: AIProvider = {
  id: 'grok',
  name: 'xAI Grok',
  models: ['grok-2-1212', 'grok-2-vision-1212', 'grok-beta'],

  async call(message, opts) {
    const config = opts.config;
    return callOpenAICompatible(message, opts.history || [], opts.userContext || {}, {
      endpoint: 'https://api.x.ai/v1/chat/completions',
      apiKey: config.apiKey,
      model: config.model || 'grok-2-1212',
      providerId: 'grok',
      providerName: 'xAI Grok',
      maxTokens: config.maxTokens || 512,
      temperature: config.temperature ?? 0.7,
    });
  },
};
