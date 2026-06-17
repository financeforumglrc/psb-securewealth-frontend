/**
 * Google Gemini Provider Adapter
 */

import type { AIProvider, AIResponse } from '../aiRouter';
import type { UserContext } from '../aiPrompts';
import { buildSystemPrompt } from '../aiPrompts';
import type { ProviderConfig } from '../aiConfig';

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
    finishReason?: string;
  }[];
  error?: { message: string; code: number };
}

export const geminiProvider: AIProvider = {
  id: 'gemini',
  name: 'Google Gemini',
  models: ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro'],

  async call(
    message: string,
    opts: { history?: { user: string; bot: string }[]; userContext?: UserContext; config: ProviderConfig }
  ): Promise<AIResponse> {
    const start = performance.now();
    const config = opts.config;
    const model = config.model || 'gemini-2.0-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;

    const contents: { role: string; parts: { text: string }[] }[] = [
      { role: 'user', parts: [{ text: buildSystemPrompt(opts.userContext) }] },
      {
        role: 'model',
        parts: [{ text: 'Understood. I am Wealth Twin AI, ready to assist with financial guidance.' }],
      },
    ];

    const recentHistory = (opts.history || []).slice(-6);
    recentHistory.forEach((turn) => {
      if (turn.user) contents.push({ role: 'user', parts: [{ text: String(turn.user).slice(0, 1000) }] });
      if (turn.bot) contents.push({ role: 'model', parts: [{ text: String(turn.bot).slice(0, 1000) }] });
    });

    contents.push({ role: 'user', parts: [{ text: String(message).slice(0, 2000) }] });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: config.maxTokens || 512,
          temperature: config.temperature ?? 0.7,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Gemini API error (${response.status}): ${errText.slice(0, 200)}`);
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    return {
      text,
      provider: 'gemini',
      model,
      latencyMs: Math.round(performance.now() - start),
    };
  },
};
