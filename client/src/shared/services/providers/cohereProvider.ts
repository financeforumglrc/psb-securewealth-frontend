/**
 * Cohere Provider Adapter
 */

import type { AIProvider, AIResponse } from '@/shared/services/aiRouter';
import type { UserContext } from '@/shared/services/aiPrompts';
import { buildSystemPrompt } from '@/shared/services/aiPrompts';
import type { ProviderConfig } from '@/shared/services/aiConfig';

interface CohereResponse {
  text?: string;
  message?: string;
  meta?: { billed_units?: { input_tokens?: number; output_tokens?: number } };
}

export const cohereProvider: AIProvider = {
  id: 'cohere',
  name: 'Cohere',
  models: ['command-r', 'command-r-plus', 'command'],

  async call(
    message: string,
    opts: { history?: { user: string; bot: string }[]; userContext?: UserContext; config: ProviderConfig }
  ): Promise<AIResponse> {
    const start = performance.now();
    const config = opts.config;
    const model = config.model || 'command-r';

    const chatHistory: { role: 'USER' | 'CHATBOT'; message: string }[] = [];
    const recentHistory = (opts.history || []).slice(-6);
    recentHistory.forEach((turn) => {
      chatHistory.push({ role: 'USER', message: String(turn.user).slice(0, 1000) });
      chatHistory.push({ role: 'CHATBOT', message: String(turn.bot).slice(0, 1000) });
    });

    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        message: String(message).slice(0, 2000),
        preamble: buildSystemPrompt(opts.userContext),
        chat_history: chatHistory,
        max_tokens: config.maxTokens || 512,
        temperature: config.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Cohere API error (${response.status}): ${errText.slice(0, 200)}`);
    }

    const data: CohereResponse = await response.json();

    if (data.message) {
      throw new Error(`Cohere API error: ${data.message}`);
    }

    const text = data.text?.trim();
    if (!text) {
      throw new Error('Empty response from Cohere');
    }

    return {
      text,
      provider: 'cohere',
      model,
      latencyMs: Math.round(performance.now() - start),
      usage: data.meta?.billed_units
        ? {
            promptTokens: data.meta.billed_units.input_tokens,
            completionTokens: data.meta.billed_units.output_tokens,
          }
        : undefined,
    };
  },
};
