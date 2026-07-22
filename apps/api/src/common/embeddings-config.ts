// Embedding-space configuration.
//
// The corpus exists in two spaces:
//   v1: verse_embeddings / tafsir_embeddings      — Azure text-embedding-3-small, 1536-dim
//   v2: verse_embeddings_v2 / tafsir_embeddings_v2 — NVIDIA llama-nemotron-embed-1b-v2, 2048-dim
//
// Query embeddings MUST come from the same model as the table being searched,
// so table names, distance expressions and the query-embedding provider all
// switch together. Default: nvidia when NVIDIA_API_KEY exists (Azure key is
// dead); override with EMBEDDINGS_PROVIDER=azure to go back.
//
// v2 is 2048-dim which exceeds pgvector's 2000-dim HNSW limit for `vector`,
// so its ANN index is on embedding::halfvec(2048) — distance expressions must
// use the same cast to hit the index.

import { Prisma } from '@prisma/client';

export type EmbeddingsProvider = 'nvidia' | 'azure';

export const NVIDIA_EMBED_MODEL = 'nvidia/llama-nemotron-embed-1b-v2';

export function embeddingsProvider(): EmbeddingsProvider {
  const explicit = process.env.EMBEDDINGS_PROVIDER;
  if (explicit === 'nvidia' || explicit === 'azure') return explicit;
  return process.env.NVIDIA_API_KEY ? 'nvidia' : 'azure';
}

const isV2 = () => embeddingsProvider() === 'nvidia';

/** Verse embeddings table name (raw SQL fragment — trusted constants only). */
export function verseTable(): Prisma.Sql {
  return Prisma.raw(isV2() ? 'verse_embeddings_v2' : 'verse_embeddings');
}

export function tafsirTable(): Prisma.Sql {
  return Prisma.raw(isV2() ? 'tafsir_embeddings_v2' : 'tafsir_embeddings');
}

/** Stored-embedding expression for distance ops, e.g. `ve.embedding::halfvec(2048)`. */
export function embExpr(alias: string): Prisma.Sql {
  // alias comes from our own code, never user input
  return Prisma.raw(isV2() ? `${alias}.embedding::halfvec(2048)` : `${alias}.embedding`);
}

/** Cast applied to the parameterized query vector. */
export function queryVecCast(): Prisma.Sql {
  return Prisma.raw(isV2() ? '::halfvec(2048)' : '::vector');
}
