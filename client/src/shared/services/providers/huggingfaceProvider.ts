/**
 * Hugging Face Provider Adapter
 * Uses the inference API for text-generation models.
 */

import type { AIProvider, AIResponse } from '@/shared/services/aiRouter';
import type { UserContext } from '@/shared/services/aiPrompts';
import { buildSystemPrompt } from '@/shared/services/aiPrompts';
import type { ProviderConfig } from '@/shared/services/aiConfig';

interface HFResponse {
  generated_text?: string;
  error?: string;
}

export const huggingfaceProvider: AIProvider = {
  id: 'huggingface',
  name: 'Hugging Face',
  models: [
    'mistralai/Mistral-7B-Instruct-v0.3',
    'meta-llama/Llama-3.1-8B-Instruct',
    'google/gemma-2-9b-it',
  ],

  async call(
    message: string,
    opts: { history?: { user: string; bot: string }[]; userContext?: UserContext; config: ProviderConfig }
  ): Promise<AIResponse> {
    const start = performance.now();
    const config = opts.config;
    const model = config.model || 'mistralai/Mistral-7B-Instruct-v0.3';

    const recentHistory = (opts.history || []).slice(-3);
    const historyText = recentHistory
      .map((turn) => `User: ${turn.user}\nAssistant: ${turn.bot}`)
      .join('\n');

    const prompt = `${buildSystemPrompt(opts.userContext)}\n\n${historyText}\nUser: ${message}\nAssistant:`;

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: config.maxTokens || 512,
          temperature: config.temperature ?? 0.7,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Hugging Face API error (${response.status}): ${errText.slice(0, 200)}`);
    }

    const data: HFResponse[] | HFResponse = await response.json();
    const first = Array.isArray(data) ? data[0] : data;

    if (first?.error) {
      throw new Error(`Hugging Face error: ${first.error}`);
    }

    const text = first?.generated_text?.trim();
    if (!text) {
      throw new Error('Empty response from Hugging Face');
    }

    return {
      text,
      provider: 'huggingface',
      model,
      latencyMs: Math.round(performance.now() - start),
    };
  },
};
