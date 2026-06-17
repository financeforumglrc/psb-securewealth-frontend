/**
 * Anthropic Claude Provider Adapter
 */

import type { AIProvider, AIResponse } from '../aiRouter';
import type { UserContext } from '../aiPrompts';
import { buildSystemPrompt } from '../aiPrompts';
import type { ProviderConfig } from '../aiConfig';

interface AnthropicResponse {
  content?: { type: string; text?: string }[];
  error?: { message: string };
  usage?: { input_tokens: number; output_tokens: number };
}

export const anthropicProvider: AIProvider = {
  id: 'anthropic',
  name: 'Anthropic Claude',
  models: ['claude-3-5-haiku-20241022', 'claude-3-5-sonnet-20241022'],

  async call(
    message: string,
    opts: { history?: { user: string; bot: string }[]; userContext?: UserContext; config: ProviderConfig }
  ): Promise<AIResponse> {
    const start = performance.now();
    const config = opts.config;
    const model = config.model || 'claude-3-5-haiku-20241022';

    const messages: { role: 'user' | 'assistant'; content: string }[] = [];
    const recentHistory = (opts.history || []).slice(-6);
    recentHistory.forEach((turn) => {
      messages.push({ role: 'user', content: String(turn.user).slice(0, 1000) });
      messages.push({ role: 'assistant', content: String(turn.bot).slice(0, 1000) });
    });
    messages.push({ role: 'user', content: String(message).slice(0, 2000) });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: config.maxTokens || 512,
        temperature: config.temperature ?? 0.7,
        system: buildSystemPrompt(opts.userContext),
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Anthropic API error (${response.status}): ${errText.slice(0, 200)}`);
    }

    const data: AnthropicResponse = await response.json();

    if (data.error) {
      throw new Error(`Anthropic API error: ${data.error.message}`);
    }

    const text = data.content?.[0]?.text?.trim();
    if (!text) {
      throw new Error('Empty response from Anthropic');
    }

    return {
      text,
      provider: 'anthropic',
      model,
      latencyMs: Math.round(performance.now() - start),
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
          }
        : undefined,
    };
  },
};
