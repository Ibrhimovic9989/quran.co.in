/**
 * Tafsir Embedding Pipeline
 * ─────────────────────────
 * Builds enriched embeddings that combine each ayah's English translation
 * with its tafsir (scholarly commentary) fetched from the Quran API.
 * Stores results in the `tafsir_embeddings` table via pgvector.
 *
 * Why tafsir-aware?
 *   A query like "patience in times of hardship" may not match the literal
 *   translation well, but the tafsir often explains the verse's context,
 *   relevance, and application — dramatically improving semantic recall.
 *
 * Usage:
 *   node --env-file=.env.local scripts/generate-tafsir-embeddings.mjs
 *
 * Supports resuming — already-embedded ayahs are skipped automatically.
 * Rate-limited to ~1 req/s for the external tafsir API.
 */

import { AzureOpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';

// ── Config ────────────────────────────────────────────────────────────────────

const EMBED_BATCH_SIZE  = 50;    // ayahs per Azure OpenAI embedding call
const TAFSIR_API_DELAY  = 350;   // ms between tafsir API calls (rate limit safe)
const EMBED_DELAY       = 200;   // ms between embedding batches
const TAFSIR_MAX_CHARS  = 600;   // max chars of tafsir content to include in chunk
const MODEL_NAME        = 'text-embedding-3-small';
const MODEL_TAG         = 'text-embedding-3-small-tafsir';

const TAFSIR_BASE_URL   = 'https://quranapi.pages.dev';

const prisma = new PrismaClient();

const openai = new AzureOpenAI({
  apiKey:     process.env.AZURE_OPENAI_API_KEY,
  endpoint:   process.env.AZURE_OPENAI_ENDPOINT,
  deployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? '2023-05-15',
});

// ── Tafsir fetching ───────────────────────────────────────────────────────────

async function fetchTafsir(surahNo, ayahNo) {
  try {
    const res = await fetch(
      `${TAFSIR_BASE_URL}/api/tafsir/${surahNo}_${ayahNo}.json`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    // data.tafsirs is an array; prefer the first entry (usually Ibn Kathir)
    const tafsirs = data?.tafsirs ?? [];
    if (tafsirs.length === 0) return null;

    // Strip markdown symbols, collapse whitespace, truncate
    const raw = tafsirs[0]?.content ?? '';
    const clean = raw
      .replace(/#{1,6}\s*/g, '')   // headings
      .replace(/\*\*?([^*]+)\*\*?/g, '$1') // bold/italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // markdown links
      .replace(/\s+/g, ' ')
      .trim();
    return clean.length > 0 ? clean.slice(0, TAFSIR_MAX_CHARS) : null;
  } catch {
    return null;
  }
}

// ── Chunking strategy ─────────────────────────────────────────────────────────
//
// For each ayah we build a chunk that contains:
//   - Surah name + number + ayah number  → context anchor
//   - English translation                → direct semantic signal
//   - Tafsir excerpt (first author)      → scholarly context, use-cases, themes
//   - Arabic text                        → Arabic query support
//
// The tafsir excerpt dramatically enriches queries like:
//   "forgiveness after sin", "patience in hardship", "stories of the prophets"

function buildChunk(ayah, surahName, tafsirText) {
  const parts = [
    `Surah ${surahName} (${ayah.surahNumber}), Ayah ${ayah.number}:`,
    ayah.translationText ?? '',
  ];
  if (tafsirText) parts.push(`Commentary: ${tafsirText}`);
  if (ayah.arabicText) parts.push(`Arabic: ${ayah.arabicText}`);
  return parts.filter(Boolean).join('\n').trim();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function progressBar(done, total, label = '') {
  const pct = Math.round((done / total) * 100);
  const filled = Math.round(pct / 2);
  const bar = '█'.repeat(filled) + '░'.repeat(50 - filled);
  process.stdout.write(`\r[${bar}] ${pct}%  ${done}/${total}  ${label}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🕌  Tafsir Embedding Pipeline\n');

  // 1. Load all ayahs + surah names
  console.log('📖  Loading ayahs from database...');
  const ayahs = await prisma.ayah.findMany({
    select: {
      id: true,
      surahNumber: true,
      number: true,
      arabicText: true,
      translationText: true,
      surah: { select: { englishName: true } },
    },
    orderBy: [{ surahNumber: 'asc' }, { number: 'asc' }],
  });
  console.log(`   Found ${ayahs.length} ayahs.\n`);

  // 2. Skip already-embedded ayahs
  console.log('🔍  Checking existing tafsir embeddings...');
  const existing = await prisma.tafsirEmbedding.findMany({
    select: { ayahId: true },
  });
  const doneIds = new Set(existing.map((e) => e.ayahId));
  const pending = ayahs.filter((a) => !doneIds.has(a.id));
  console.log(`   Already done: ${doneIds.size}  |  Remaining: ${pending.length}\n`);

  if (pending.length === 0) {
    console.log('✅  All ayahs already have tafsir embeddings. Nothing to do.');
    return;
  }

  console.log(`📡  Phase 1: Fetching tafsir for ${pending.length} ayahs...\n`);

  // 3. Fetch tafsir for each pending ayah (rate-limited)
  const enriched = []; // { ayah, chunk }
  let fetched = 0;
  let tafsirMissed = 0;

  for (const ayah of pending) {
    const surahName = ayah.surah?.englishName ?? `Surah ${ayah.surahNumber}`;
    const tafsirText = await fetchTafsir(ayah.surahNumber, ayah.number);
    if (!tafsirText) tafsirMissed++;

    enriched.push({
      ayah,
      chunk: buildChunk(ayah, surahName, tafsirText),
    });

    fetched++;
    progressBar(fetched, pending.length, tafsirText ? '(tafsir ✓)' : '(no tafsir)');
    await sleep(TAFSIR_API_DELAY);
  }

  console.log(`\n\n   Tafsir fetched: ${fetched - tafsirMissed}  |  Fell back to translation-only: ${tafsirMissed}\n`);

  // 4. Embed in batches
  console.log(`🚀  Phase 2: Embedding ${enriched.length} chunks in batches of ${EMBED_BATCH_SIZE}...\n`);

  let done = 0;
  let errors = 0;

  for (let i = 0; i < enriched.length; i += EMBED_BATCH_SIZE) {
    const batch = enriched.slice(i, i + EMBED_BATCH_SIZE);
    const chunks = batch.map((e) => e.chunk);

    try {
      const response = await openai.embeddings.create({
        input: chunks,
        model: MODEL_NAME,
      });

      const inserts = response.data.map((item) => {
        const { ayah } = batch[item.index];
        const vector = `[${item.embedding.join(',')}]`;
        return prisma.$executeRaw`
          INSERT INTO tafsir_embeddings (id, "ayahId", "surahNumber", "ayahNumber", embedding, model, "createdAt", "updatedAt")
          VALUES (
            gen_random_uuid(),
            ${ayah.id},
            ${ayah.surahNumber},
            ${ayah.number},
            ${vector}::vector,
            ${MODEL_TAG},
            NOW(),
            NOW()
          )
          ON CONFLICT ("ayahId") DO UPDATE
            SET embedding   = EXCLUDED.embedding,
                model       = EXCLUDED.model,
                "updatedAt" = NOW()
        `;
      });

      await Promise.all(inserts);
      done += batch.length;
      progressBar(done, enriched.length);

    } catch (err) {
      errors++;
      console.error(`\n⚠️  Batch ${i}–${i + batch.length} failed: ${err.message}`);
    }

    if (i + EMBED_BATCH_SIZE < enriched.length) {
      await sleep(EMBED_DELAY);
    }
  }

  console.log(`\n\n✅  Done!`);
  console.log(`   Embedded : ${done}`);
  console.log(`   Errors   : ${errors}`);
  if (errors > 0) {
    console.log('\n💡  Re-run the script to retry failed batches.');
  }
}

main()
  .catch((err) => {
    console.error('\n❌  Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
