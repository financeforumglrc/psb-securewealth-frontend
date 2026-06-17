/**
 * DeepSeek Provider Adapter
 */

import type { AIProvider } from '../aiRouter';
import { callOpenAICompatible } from './openAICompatible';

export const deepseekProvider: AIProvider = {
  id: 'deepseek',
  name: 'DeepSeek',
  models: ['deepseek-chat', 'deepseek-reasoner'],

  async call(message, opts) {
    const config = opts.config;
    return callOpenAICompatible(message, opts.history || [], opts.userContext || {}, {
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      apiKey: config.apiKey,
      model: config.model || 'deepseek-chat',
      providerId: 'deepseek',
      providerName: 'DeepSeek',
      maxTokens: config.maxTokens || 512,
      temperature: config.temperature ?? 0.7,
    });
  },
};
