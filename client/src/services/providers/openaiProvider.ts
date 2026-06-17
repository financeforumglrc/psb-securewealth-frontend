/**
 * OpenAI Provider Adapter
 */

import type { AIProvider } from '../aiRouter';
import { callOpenAICompatible } from './openAICompatible';

export const openaiProvider: AIProvider = {
  id: 'openai',
  name: 'OpenAI',
  models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],

  async call(message, opts) {
    const config = opts.config;
    return callOpenAICompatible(message, opts.history || [], opts.userContext || {}, {
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: config.apiKey,
      model: config.model || 'gpt-4o-mini',
      providerId: 'openai',
      providerName: 'OpenAI',
      maxTokens: config.maxTokens || 512,
      temperature: config.temperature ?? 0.7,
    });
  },
};
