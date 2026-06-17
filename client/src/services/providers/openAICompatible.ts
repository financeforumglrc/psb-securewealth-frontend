/**
 * Shared helper for OpenAI-compatible chat completion endpoints.
 * Covers Groq, DeepSeek, Mistral, OpenRouter, NVIDIA NIM, Grok, and OpenAI.
 */

import type { AIResponse } from '../aiRouter';
import type { UserContext } from '../aiPrompts';
import { buildSystemPrompt } from '../aiPrompts';

export interface OpenAIOpts {
  endpoint: string;
  apiKey: string;
  model: string;
  providerId: string;
  providerName: string;
  maxTokens: number;
  temperature: number;
  headers?: Record<string, string>;
  bodyPatch?: Record<string, unknown>;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callOpenAICompatible(
  message: string,
  history: { user: string; bot: string }[],
  context: UserContext,
  opts: OpenAIOpts
): Promise<AIResponse> {
  const start = performance.now();

  const messages: Message[] = [
    { role: 'system', content: buildSystemPrompt(context) },
  ];

  const recentHistory = history.slice(-6);
  recentHistory.forEach((turn) => {
    messages.push({ role: 'user', content: String(turn.user).slice(0, 1000) });
    messages.push({ role: 'assistant', content: String(turn.bot).slice(0, 1000) });
  });

  messages.push({ role: 'user', content: String(message).slice(0, 2000) });

  const body: Record<string, unknown> = {
    model: opts.model,
    messages,
    max_tokens: opts.maxTokens,
    temperature: opts.temperature,
    ...opts.bodyPatch,
  };

  const response = await fetch(opts.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
      ...opts.headers,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'Unknown error');
    throw new Error(`${opts.providerName} API error (${response.status}): ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error(`Empty response from ${opts.providerName}`);
  }

  return {
    text,
    provider: opts.providerId,
    model: opts.model,
    latencyMs: Math.round(performance.now() - start),
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
        }
      : undefined,
  };
}
