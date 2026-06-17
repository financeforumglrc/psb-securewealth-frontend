/**
 * Multi-provider AI configuration store
 * Keys are stored in localStorage, mirroring the existing Gemini config UX.
 */

export interface ProviderConfig {
  id: string;
  name: string;
  apiKey: string;
  model: string;
  enabled: boolean;
  priority: number;
  maxTokens: number;
  temperature: number;
}

export type RoutingMode = 'fallback' | 'fastest' | 'ensemble' | 'cost-aware';

interface AIStore {
  providers: ProviderConfig[];
  mode: RoutingMode;
  ensembleCount: number;
}

const STORE_KEY = 'sw_ai_providers_v2';

export const DEFAULT_PROVIDERS: ProviderConfig[] = [
  {
    id: 'groq',
    name: 'Groq',
    apiKey: '',
    model: 'llama-3.3-70b-versatile',
    enabled: false,
    priority: 1,
    maxTokens: 512,
    temperature: 0.7,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    apiKey: '',
    model: 'gemini-2.0-flash',
    enabled: false,
    priority: 2,
    maxTokens: 512,
    temperature: 0.7,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    apiKey: '',
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    enabled: false,
    priority: 3,
    maxTokens: 512,
    temperature: 0.7,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    apiKey: '',
    model: 'gpt-4o-mini',
    enabled: false,
    priority: 4,
    maxTokens: 512,
    temperature: 0.7,
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    apiKey: '',
    model: 'claude-3-5-haiku-20241022',
    enabled: false,
    priority: 5,
    maxTokens: 512,
    temperature: 0.7,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    apiKey: '',
    model: 'deepseek-chat',
    enabled: false,
    priority: 6,
    maxTokens: 512,
    temperature: 0.7,
  },
  {
    id: 'grok',
    name: 'xAI Grok',
    apiKey: '',
    model: 'grok-2-1212',
    enabled: false,
    priority: 7,
    maxTokens: 512,
    temperature: 0.7,
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    apiKey: '',
    model: 'meta/llama-3.1-70b-instruct',
    enabled: false,
    priority: 8,
    maxTokens: 512,
    temperature: 0.7,
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    apiKey: '',
    model: 'mistral-small-latest',
    enabled: false,
    priority: 9,
    maxTokens: 512,
    temperature: 0.7,
  },
  {
    id: 'cohere',
    name: 'Cohere',
    apiKey: '',
    model: 'command-r',
    enabled: false,
    priority: 10,
    maxTokens: 512,
    temperature: 0.7,
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    apiKey: '',
    model: 'mistralai/Mistral-7B-Instruct-v0.3',
    enabled: false,
    priority: 11,
    maxTokens: 512,
    temperature: 0.7,
  },
];

function migrateLegacyGeminiConfig(): Partial<ProviderConfig> | null {
  try {
    const raw = localStorage.getItem('sw_gemini_config');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.apiKey) {
      return {
        id: 'gemini',
        apiKey: parsed.apiKey,
        model: parsed.model || 'gemini-2.0-flash',
        enabled: true,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export function getAIStore(): AIStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AIStore;
      // Merge with defaults in case new providers were added
      const merged = DEFAULT_PROVIDERS.map((def) => {
        const existing = parsed.providers?.find((p) => p.id === def.id);
        return existing ? { ...def, ...existing } : def;
      });
      return {
        providers: merged,
        mode: parsed.mode || 'fallback',
        ensembleCount: parsed.ensembleCount || 2,
      };
    }
  } catch {
    // fall through
  }

  const migrated = migrateLegacyGeminiConfig();
  const providers = DEFAULT_PROVIDERS.map((p) =>
    p.id === 'gemini' && migrated ? { ...p, ...migrated } : p
  );
  return { providers, mode: 'fallback', ensembleCount: 2 };
}

export function saveAIStore(store: AIStore) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function getProviderConfigs(): ProviderConfig[] {
  return getAIStore().providers;
}

export function getActiveProviders(): ProviderConfig[] {
  return getProviderConfigs()
    .filter((p) => p.enabled && p.apiKey.trim().length > 0)
    .sort((a, b) => a.priority - b.priority);
}

export function isAIConfigured(): boolean {
  return getActiveProviders().length > 0;
}

export function getActiveProviderCount(): number {
  return getActiveProviders().length;
}

export function getProviderConfig(id: string): ProviderConfig | undefined {
  return getProviderConfigs().find((p) => p.id === id);
}

export function updateProviderConfig(id: string, patch: Partial<ProviderConfig>) {
  const store = getAIStore();
  store.providers = store.providers.map((p) => (p.id === id ? { ...p, ...patch } : p));
  saveAIStore(store);
}

export function setRoutingMode(mode: RoutingMode) {
  const store = getAIStore();
  store.mode = mode;
  saveAIStore(store);
}

export function getRoutingMode(): RoutingMode {
  return getAIStore().mode;
}

export function setEnsembleCount(count: number) {
  const store = getAIStore();
  store.ensembleCount = Math.max(2, Math.min(5, count));
  saveAIStore(store);
}

export function getEnsembleCount(): number {
  return getAIStore().ensembleCount;
}

export function clearAIConfig() {
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem('sw_gemini_config');
}

export const PROVIDER_MODELS: Record<string, string[]> = {
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  gemini: ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro'],
  openrouter: [
    'meta-llama/llama-3.1-8b-instruct:free',
    'meta-llama/llama-3.1-70b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'deepseek/deepseek-chat:free',
    'openai/gpt-4o-mini',
  ],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-haiku-20241022', 'claude-3-5-sonnet-20241022'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  grok: ['grok-2-1212', 'grok-2-vision-1212', 'grok-beta'],
  nvidia: ['meta/llama-3.1-70b-instruct', 'meta/llama-3.1-8b-instruct', 'mistralai/mistral-7b-instruct-v0.3'],
  mistral: ['mistral-small-latest', 'mistral-medium-latest', 'mistral-large-latest'],
  cohere: ['command-r', 'command-r-plus', 'command'],
  huggingface: ['mistralai/Mistral-7B-Instruct-v0.3', 'meta-llama/Llama-3.1-8B-Instruct', 'google/gemma-2-9b-it'],
};

/* ═══════════════════════════════════════════════════════════════
   ENV-BASED DEFAULT KEY SEEDING
   For demo/hackathon builds, provider keys can be injected at build
   time via Vite env vars. Free/cheap providers are prioritised as the
   primary route; paid providers (especially DeepSeek) are placed at
   the end as premium fallbacks. Seeding only fills empty provider
   slots so a user’s manual overrides in the Provider Hub are kept.
   ═══════════════════════════════════════════════════════════════ */

const ENV_KEY_MAP: Record<string, string | undefined> = {
  groq: import.meta.env.VITE_DEFAULT_GROQ_KEY,
  gemini: import.meta.env.VITE_DEFAULT_GEMINI_KEY,
  openrouter: import.meta.env.VITE_DEFAULT_OPENROUTER_KEY,
  openai: import.meta.env.VITE_DEFAULT_OPENAI_KEY,
  anthropic: import.meta.env.VITE_DEFAULT_ANTHROPIC_KEY,
  deepseek: import.meta.env.VITE_DEFAULT_DEEPSEEK_KEY,
  grok: import.meta.env.VITE_DEFAULT_GROK_KEY,
  nvidia: import.meta.env.VITE_DEFAULT_NVIDIA_KEY,
  mistral: import.meta.env.VITE_DEFAULT_MISTRAL_KEY,
  cohere: import.meta.env.VITE_DEFAULT_COHERE_KEY,
  huggingface: import.meta.env.VITE_DEFAULT_HUGGINGFACE_KEY,
};

const PRIMARY_FREE_PROVIDERS = ['gemini', 'groq', 'openrouter', 'mistral', 'cohere', 'huggingface'];
const PREMIUM_FALLBACK_PROVIDERS = ['openai', 'anthropic', 'grok', 'nvidia', 'deepseek'];

export function seedDefaultAIKeys() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

  const store = getAIStore();
  let changed = false;

  store.providers.forEach((provider) => {
    const envKey = ENV_KEY_MAP[provider.id];
    const hasStoredKey = provider.apiKey?.trim().length > 0;
    const hasEnvKey = typeof envKey === 'string' && envKey.trim().length > 0;

    if (hasEnvKey) {
      const trimmedEnv = envKey.trim();
      const isSealed = provider.apiKey?.trim() === trimmedEnv;

      if (!hasStoredKey) {
        provider.apiKey = trimmedEnv;
        provider.enabled = true;
        changed = true;
      }

      // For providers running the bundled demo key, always keep the model
      // aligned with the current default. This auto-replaces decommissioned
      // model IDs without touching a user's manual overrides.
      if (isSealed || !hasStoredKey) {
        const defaultModel = DEFAULT_PROVIDERS.find((d) => d.id === provider.id)?.model;
        if (defaultModel && provider.model !== defaultModel) {
          provider.model = defaultModel;
          changed = true;
        }
      }
    }

    // Enforce routing hierarchy only for providers we seeded (or that already have keys)
    if (provider.apiKey.trim().length > 0) {
      const primaryIndex = PRIMARY_FREE_PROVIDERS.indexOf(provider.id);
      const premiumIndex = PREMIUM_FALLBACK_PROVIDERS.indexOf(provider.id);
      const targetPriority =
        primaryIndex !== -1
          ? primaryIndex + 1
          : premiumIndex !== -1
            ? 100 + premiumIndex + 1
          : provider.priority;

      if (provider.priority !== targetPriority) {
        provider.priority = targetPriority;
        changed = true;
      }
    }
  });

  if (changed) {
    saveAIStore(store);
  }
}
