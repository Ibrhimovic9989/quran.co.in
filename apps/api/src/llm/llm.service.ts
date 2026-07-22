// LLM provider chain with automatic fallback.
//
// Free-tier strategy: try providers in order (NVIDIA NIM → OpenRouter free →
// Azure if configured). When a provider fails with a rate limit (429), auth
// error (401/403), or server error (5xx/network), it is put on cooldown and
// the request falls through to the next provider in the chain. Both NVIDIA
// (integrate.api.nvidia.com) and OpenRouter (openrouter.ai) speak the
// OpenAI-compatible protocol, so one client implementation covers all.
//
// Keys (all optional — chain is built from whichever are present):
//   NVIDIA_API_KEY       https://build.nvidia.com  (nvapi-...)
//   OPENROUTER_API_KEY   https://openrouter.ai     (sk-or-...)
//   AZURE_OPENAI_*       legacy Azure deployment
//
// Model lists (comma-separated, tried in order) override the curated defaults:
//   NVIDIA_CHAT_MODELS, OPENROUTER_CHAT_MODELS
// NVIDIA free-tier limits are PER MODEL, so every extra model in the list is
// real extra free capacity. OpenRouter's free quota is account-wide, so its
// entries add resilience/variety rather than capacity. A model name that
// doesn't exist just fails once and cools down — safe to experiment.
//
// EMBEDDINGS CAVEAT: the pgvector corpus (verse_embeddings/tafsir_embeddings)
// was built with text-embedding-3-small (1536-dim). Query embeddings MUST come
// from the same model, so embeddings do NOT fall back across vendors — only
// Azure serves them until the corpus is re-embedded with a free model.

import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import OpenAI, { AzureOpenAI } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export interface ChatProviderConfig {
  /** Unique id used for cooldown tracking + logs, e.g. "nvidia:meta/llama-3.3-70b-instruct" */
  id: string;
  vendor: 'nvidia' | 'openrouter' | 'azure';
  model: string;
}

const COOLDOWN_MS: Record<string, number> = {
  rate_limit: 5 * 60_000, // 429 — free-tier window exhausted
  auth: 60 * 60_000, // 401/403 — bad key; don't hammer it
  bad_model: 24 * 60 * 60_000, // 404/400 — model name doesn't exist on this vendor
  timeout: 5 * 60_000, // request timed out — model is cold/queued, skip it a while
  server: 60_000, // 5xx / network hiccup
};

/** Per-attempt request timeout — a queued cold model must not hang the chain. */
function requestTimeoutMs(): number {
  return parseInt(process.env.LLM_TIMEOUT_MS ?? '20000', 10);
}

function classifyError(err: unknown): keyof typeof COOLDOWN_MS {
  const status = (err as { status?: number })?.status;
  if (status === 429) return 'rate_limit';
  if (status === 401 || status === 403) return 'auth';
  if (status === 404 || status === 400) return 'bad_model';
  if (err instanceof Error && /timed?\s*out/i.test(err.message)) return 'timeout';
  return 'server';
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly cooldowns = new Map<string, number>(); // provider id → available-again timestamp

  // ── Chain construction ──────────────────────────────────────────────────────

  /**
   * Curated free chat models, best-first. Instruction-tuned only — reasoning
   * models (R1/thinking variants) are excluded because their chain-of-thought
   * output would leak into the streamed answer.
   */
  // All names verified against each vendor's /v1/models on 2026-07-22.
  private static readonly NVIDIA_DEFAULT_MODELS = [
    'nvidia/llama-3.3-nemotron-super-49b-v1', // verified warm + strong
    'meta/llama-3.3-70b-instruct',
    'nvidia/llama-3.3-nemotron-super-49b-v1.5',
    'meta/llama-4-maverick-17b-128e-instruct',
    'nvidia/llama-3.1-nemotron-70b-instruct',
    'qwen/qwen3-next-80b-a3b-instruct',
    'mistralai/mistral-large-2-instruct',
    'meta/llama-3.1-70b-instruct',
    'mistralai/mixtral-8x7b-instruct-v0.1',
    'meta/llama-3.1-8b-instruct', // fast last resort, verified warm
  ];

  private static readonly OPENROUTER_DEFAULT_MODELS = [
    'nvidia/nemotron-3-super-120b-a12b:free',
    'google/gemma-4-31b-it:free',
    'openai/gpt-oss-20b:free',
    'google/gemma-4-26b-a4b-it:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'nvidia/nemotron-nano-9b-v2:free',
  ];

  private modelList(envVar: string | undefined, defaults: string[]): string[] {
    const fromEnv = (envVar ?? '')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    return fromEnv.length > 0 ? fromEnv : defaults;
  }

  private chatChain(): ChatProviderConfig[] {
    const chain: ChatProviderConfig[] = [];

    if (process.env.NVIDIA_API_KEY) {
      for (const model of this.modelList(
        process.env.NVIDIA_CHAT_MODELS,
        LlmService.NVIDIA_DEFAULT_MODELS,
      )) {
        chain.push({ id: `nvidia:${model}`, vendor: 'nvidia', model });
      }
    }

    if (process.env.OPENROUTER_API_KEY) {
      for (const model of this.modelList(
        process.env.OPENROUTER_CHAT_MODELS,
        LlmService.OPENROUTER_DEFAULT_MODELS,
      )) {
        chain.push({ id: `openrouter:${model}`, vendor: 'openrouter', model });
      }
    }

    if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_CHAT_DEPLOYMENT) {
      chain.push({ id: 'azure:chat', vendor: 'azure', model: 'azure' });
    }

    return chain;
  }

  private clientFor(provider: ChatProviderConfig): OpenAI {
    // maxRetries: 0 — the SDK's own retry/backoff would stall the cascade;
    // our chain IS the retry strategy. timeout skips cold/queued models.
    const common = { timeout: requestTimeoutMs(), maxRetries: 0 };
    switch (provider.vendor) {
      case 'nvidia':
        return new OpenAI({
          ...common,
          baseURL: 'https://integrate.api.nvidia.com/v1',
          apiKey: process.env.NVIDIA_API_KEY!,
        });
      case 'openrouter':
        return new OpenAI({
          ...common,
          baseURL: 'https://openrouter.ai/api/v1',
          apiKey: process.env.OPENROUTER_API_KEY!,
          defaultHeaders: {
            'HTTP-Referer': 'https://quran.co.in',
            'X-Title': 'Quran.co.in',
          },
        });
      case 'azure':
        return new AzureOpenAI({
          ...common,
          apiKey: process.env.AZURE_OPENAI_API_KEY!,
          endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
          deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
          apiVersion: process.env.AZURE_OPENAI_CHAT_API_VERSION ?? '2024-04-01-preview',
        });
    }
  }

  // ── Cooldown bookkeeping ────────────────────────────────────────────────────

  private isAvailable(id: string): boolean {
    const until = this.cooldowns.get(id);
    return !until || until <= Date.now();
  }

  private punish(id: string, err: unknown) {
    const kind = classifyError(err);
    const ms = COOLDOWN_MS[kind];
    this.cooldowns.set(id, Date.now() + ms);
    const status = (err as { status?: number })?.status ?? 'network';
    this.logger.warn(`provider ${id} failed (${status}, ${kind}) — cooling down ${ms / 1000}s`);
  }

  // ── Chat (streaming) with fallback ──────────────────────────────────────────

  /**
   * Open a streaming chat completion on the first available provider.
   * Falls through the chain on request-time failures (429/401/5xx/network).
   */
  async chatStream(messages: ChatCompletionMessageParam[], maxTokens = 1024) {
    const chain = this.chatChain();
    if (chain.length === 0) {
      throw new ServiceUnavailableException({
        error: 'No LLM provider configured. Set NVIDIA_API_KEY or OPENROUTER_API_KEY.',
      });
    }

    let lastError: unknown;
    for (const provider of chain) {
      if (!this.isAvailable(provider.id)) continue;

      try {
        const client = this.clientFor(provider);
        const stream = await client.chat.completions.create({
          model: provider.vendor === 'azure' ? 'azure' : provider.model,
          messages,
          stream: true,
          ...(provider.vendor === 'azure'
            ? { max_completion_tokens: maxTokens }
            : { max_tokens: maxTokens }),
        });
        this.logger.log(`chat served by ${provider.id}`);
        return stream;
      } catch (err) {
        lastError = err;
        this.punish(provider.id, err);
      }
    }

    this.logger.error(`all chat providers failed/cooling down (${chain.length} in chain)`);
    throw lastError ?? new ServiceUnavailableException({ error: 'All LLM providers unavailable' });
  }

  // ── Embeddings (Azure-only until corpus re-embed — see caveat above) ───────

  /** True when a query-embedding provider matching the corpus space exists. */
  hasEmbeddingProvider(): boolean {
    return Boolean(
      process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT,
    ) && this.isAvailable('azure:embed');
  }

  /** Embed a query in the corpus space. Throws if no compatible provider. */
  async embedQuery(text: string): Promise<string> {
    if (!this.hasEmbeddingProvider()) {
      throw new ServiceUnavailableException({ error: 'No embedding provider available' });
    }
    try {
      const client = new AzureOpenAI({
        apiKey: process.env.AZURE_OPENAI_API_KEY!,
        endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
        deployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
        apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? '2023-05-15',
      });
      const res = await client.embeddings.create({
        input: [text],
        model: 'text-embedding-3-small',
      });
      return `[${res.data[0].embedding.join(',')}]`;
    } catch (err) {
      this.punish('azure:embed', err);
      throw err;
    }
  }
}
