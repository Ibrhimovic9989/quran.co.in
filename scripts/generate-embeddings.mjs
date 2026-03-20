/**
 * Quran Embedding Pipeline
 * ────────────────────────
 * Embeds all 6,236 ayahs using Azure OpenAI text-embedding-3-small.
 * Stores results in the `verse_embeddings` table via pgvector.
 *
 * Usage:
 *   node --env-file=.env.local scripts/generate-embeddings.mjs
 *
 * Supports resuming — already-embedded ayahs are skipped automatically.
 */

import { AzureOpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';

// ── Config ────────────────────────────────────────────────────────────────────

const BATCH_SIZE = 100;          // Ayahs per embedding API call (Azure allows up to 2048)
const DELAY_MS   = 200;          // Pause between batches (avoid rate limit)
const MODEL_NAME = 'text-embedding-3-small';
const MODEL_TAG  = 'text-embedding-3-small-2'; // deployment name stored in DB

const prisma = new PrismaClient();

const openai = new AzureOpenAI({
  apiKey:     process.env.AZURE_OPENAI_API_KEY,
  endpoint:   process.env.AZURE_OPENAI_ENDPOINT,
  deployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? '2023-05-15',
});

// ── Chunking strategy ─────────────────────────────────────────────────────────
//
// For each ayah we build a single rich-text chunk that contains:
//   - Surah name + number  → helps "find ayahs in Al-Baqarah about X"
//   - Ayah number          → context
//   - English translation  → the main semantic signal for English queries
//   - Arabic text          → lets Arabic queries also hit results
//
// Keeping it concise (< 300 tokens) ensures high embedding quality.

function buildChunk(ayah, surahName) {
  const parts = [
    `Surah ${surahName} (${ayah.surahNumber}), Ayah ${ayah.number}:`,
    ayah.translationText ?? '',
  ];
  if (ayah.arabicText) parts.push(`Arabic: ${ayah.arabicText}`);
  return parts.filter(Boolean).join('\n').trim();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function progressBar(done, total) {
  const pct = Math.round((done / total) * 100);
  const filled = Math.round(pct / 2);
  const bar = '█'.repeat(filled) + '░'.repeat(50 - filled);
  process.stdout.write(`\r[${bar}] ${pct}%  ${done}/${total} ayahs`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🕌  Quran Embedding Pipeline\n');

  // 1. Load all ayahs + their surah names
  console.log('📖  Loading ayahs from database...');
  const ayahs = await prisma.ayah.findMany({
    select: {
      id: true,
      surahNumber: true,
      number: true,
      arabicText: true,
      translationText: true,
      surah: { select: { englishName: true, englishNameTranslation: true } },
    },
    orderBy: [{ surahNumber: 'asc' }, { number: 'asc' }],
  });
  console.log(`   Found ${ayahs.length} ayahs.\n`);

  // 2. Find ayahs already embedded (for resume support)
  console.log('🔍  Checking existing embeddings...');
  const existing = await prisma.verseEmbedding.findMany({
    select: { ayahId: true },
  });
  const doneIds = new Set(existing.map((e) => e.ayahId));
  const pending = ayahs.filter((a) => !doneIds.has(a.id));
  console.log(`   Already done: ${doneIds.size}  |  Remaining: ${pending.length}\n`);

  if (pending.length === 0) {
    console.log('✅  All ayahs are already embedded. Nothing to do.');
    return;
  }

  // 3. Process in batches
  const total = pending.length;
  let done = 0;
  let errors = 0;

  console.log(`🚀  Embedding ${total} ayahs in batches of ${BATCH_SIZE}...\n`);

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);

    // Build text chunks for this batch
    const chunks = batch.map((ayah) => {
      const surahName =
        ayah.surah?.englishName ?? `Surah ${ayah.surahNumber}`;
      return buildChunk(ayah, surahName);
    });

    try {
      // Call Azure OpenAI
      const response = await openai.embeddings.create({
        input: chunks,
        model: MODEL_NAME,
      });

      // Upsert into verse_embeddings
      // Prisma doesn't support vector types natively, so we use $executeRaw
      const inserts = response.data.map((item) => {
        const ayah = batch[item.index];
        const vector = `[${item.embedding.join(',')}]`;
        return prisma.$executeRaw`
          INSERT INTO verse_embeddings (id, "ayahId", "surahNumber", "ayahNumber", embedding, model, version, "createdAt", "updatedAt")
          VALUES (
            gen_random_uuid(),
            ${ayah.id},
            ${ayah.surahNumber},
            ${ayah.number},
            ${vector}::vector,
            ${MODEL_TAG},
            1,
            NOW(),
            NOW()
          )
          ON CONFLICT ("ayahId") DO UPDATE
            SET embedding = EXCLUDED.embedding,
                model     = EXCLUDED.model,
                "updatedAt" = NOW()
        `;
      });

      await Promise.all(inserts);

      done += batch.length;
      progressBar(done, total);

    } catch (err) {
      errors++;
      console.error(`\n⚠️  Batch ${i}–${i + batch.length} failed: ${err.message}`);
      // Continue with next batch rather than aborting
    }

    // Rate limit pause between batches
    if (i + BATCH_SIZE < pending.length) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n\n✅  Done!`);
  console.log(`   Embedded : ${done}`);
  console.log(`   Errors   : ${errors}`);
  console.log(`   Total    : ${done + errors}/${total}`);

  if (errors > 0) {
    console.log('\n💡  Re-run the script to retry failed batches (they were skipped, not saved).');
  }
}

main()
  .catch((err) => {
    console.error('\n❌  Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
