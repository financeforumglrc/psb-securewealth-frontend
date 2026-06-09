/**
 * Gemini Direct Service — Client-side AI integration
 * Calls Google Gemini API directly from the browser.
 * Free tier: 1,500 requests/day (Google AI Studio)
 * Falls back to offline mode if no key or quota exceeded.
 */

export interface GeminiConfig {
  apiKey: string;
  model: string;
}

const CONFIG_KEY = 'sw_gemini_config';
const DEFAULT_MODEL = 'gemini-2.0-flash';

export function getGeminiConfig(): GeminiConfig | null {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setGeminiConfig(config: GeminiConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function clearGeminiConfig() {
  localStorage.removeItem(CONFIG_KEY);
}

export function isGeminiConfigured(): boolean {
  return !!getGeminiConfig()?.apiKey;
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
    finishReason?: string;
  }[];
  error?: { message: string; code: number };
}

export async function callGeminiDirect(
  message: string,
  opts: { history?: { user: string; bot: string }[]; userContext?: Record<string, unknown> } = {}
): Promise<{ text: string; source: 'gemini' | 'offline' }> {
  const config = getGeminiConfig();
  if (!config?.apiKey) {
    throw new Error('No Gemini API key configured');
  }

  const model = config.model || DEFAULT_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;

  // Build system prompt with user context
  const ctx = opts.userContext || {};
  const systemPrompt = `You are Wealth Twin AI, an expert financial advisor for Indian banking customers. Provide guidance on savings, investments, tax planning, fraud protection, and wealth management.

CURRENT USER CONTEXT:
- Name: ${ctx.name || 'Customer'}
- Monthly Income: ₹${ctx.income || 'N/A'}
- Monthly Expenses: ₹${ctx.expenses || 'N/A'}
- Monthly Savings: ₹${ctx.savings || 'N/A'}
- Net Worth: ₹${ctx.netWorth || 'N/A'}
- Risk Appetite: ${ctx.riskAppetite || 'moderate'}

RULES:
- Never promise guaranteed returns or claim "zero risk"
- Always mention "for educational purposes" for investment advice
- Recommend consulting a SEBI-registered advisor for major decisions
- Use Indian Rupees (₹) and Indian financial instruments
- Keep responses concise (3-5 sentences when possible)
- Be friendly, encouraging, and professional
- Format with **bold** for key numbers and terms
- Use bullet points for lists`;

  const contents: { role: string; parts: { text: string }[] }[] = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood. I am Wealth Twin AI, ready to assist with financial guidance.' }] },
  ];

  // Add recent history (max 6 turns)
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
        maxOutputTokens: 512,
        temperature: 0.7,
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

  return { text, source: 'gemini' };
}
