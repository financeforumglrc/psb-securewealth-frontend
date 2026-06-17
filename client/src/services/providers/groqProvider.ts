/**
 * Groq Provider Adapter
 */

import type { AIProvider } from '../aiRouter';
import { callOpenAICompatible } from './openAICompatible';

export const groqProvider: AIProvider = {
  id: 'groq',
  name: 'Groq',
  models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'],

  async call(message, opts) {
    const config = opts.config;
    return callOpenAICompatible(message, opts.history || [], opts.userContext || {}, {
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey: config.apiKey,
      model: config.model || 'llama3-70b-8192',
      providerId: 'groq',
      providerName: 'Groq',
      maxTokens: config.maxTokens || 512,
      temperature: config.temperature ?? 0.7,
    });
  },
};
