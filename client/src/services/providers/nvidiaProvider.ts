/**
 * NVIDIA NIM Provider Adapter
 */

import type { AIProvider } from '../aiRouter';
import { callOpenAICompatible } from './openAICompatible';

export const nvidiaProvider: AIProvider = {
  id: 'nvidia',
  name: 'NVIDIA NIM',
  models: [
    'meta/llama-3.1-70b-instruct',
    'meta/llama-3.1-8b-instruct',
    'mistralai/mistral-7b-instruct-v0.3',
  ],

  async call(message, opts) {
    const config = opts.config;
    return callOpenAICompatible(message, opts.history || [], opts.userContext || {}, {
      endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
      apiKey: config.apiKey,
      model: config.model || 'meta/llama-3.1-70b-instruct',
      providerId: 'nvidia',
      providerName: 'NVIDIA NIM',
      maxTokens: config.maxTokens || 512,
      temperature: config.temperature ?? 0.7,
    });
  },
};
