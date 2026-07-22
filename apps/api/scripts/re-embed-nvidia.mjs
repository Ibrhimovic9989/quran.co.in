/**
 * Corpus Re-embedding Pipeline — NVIDIA llama-nemotron-embed-1b-v2 (FREE)
 * ───────────────────────────────────────────────────────────────────────
 * Re-embeds the Quran corpus into verse_embeddings_v2 / tafsir_embeddings_v2
 * (2048-dim) so semantic search works without the dead Azure key.
 *
 * Chunk composition is IDENTICAL to the original Azure pipelines
 * (apps/web/scripts/generate-embeddings.mjs / generate-tafsir-embeddings.mjs)
 * so retrieval semantics carry over.
 *
 * Usage (from apps/api):
 *   node scripts/re-embed-nvidia.mjs verses   # 6,236 ayahs from the DB (fast)
 *   node scripts/re-embed-nvidia.mjs tafsir   # + external tafsir fetches (slow)
 *   node scripts/re-embed-nvidia.mjs all
 *
 * Resumable — already-embedded ayahs are skipped automatically.
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Env (apps/api/.env) ───────────────────────────────────────────────────────

const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^"|"$/g, '')]),
);
process.env.DATABASE_URL ??= env.DATABASE_URL;
process.env.DIRECT_URL ??= env.DIRECT_URL;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY ?? env.NVIDIA_API_KEY;
if (!NVIDIA_API_KEY) {
  console.error('NVIDIA_API_KEY missing');
  process.exit(1);
}

// ── Config ────────────────────────────────────────────────────────────────────

const MODEL = 'nvidia/llama-nemotron-embed-1b-v2';
const EMBED_URL = 'https://integrate.api.nvidia.com/v1/embeddings';
const BATCH_SIZE = 32; // shrinks automatically on 400/413
const BATCH_DELAY_MS = 300;
const TAFSIR_BASE_URL = 'https://quranapi.pages.dev';
const TAFSIR_API_DELAY = 350;
const TAFSIR_MAX_CHARS = 600;

const prisma = new PrismaClient();

// ── Chunk builders (identical to the original pipelines) ─────────────────────

function buildVerseChunk(ayah, surahName) {
  const parts = [
    `Surah ${surahName} (${ayah.surahNumber}), Ayah ${ayah.number}:`,
    ayah.translationText ?? '',
  ];
  if (ayah.arabicText) parts.push(`Arabic: ${ayah.arabicText}`);
  return parts.filter(Boolean).join('\n').trim();
}

function buildTafsirChunk(ayah, surahName, tafsirText) {
  const parts = [
    `Surah ${surahName} (${ayah.surahNumber}), Ayah ${ayah.number}:`,
    ayah.translationText ?? '',
  ];
  if (tafsirText) parts.push(`Commentary: ${tafsirText}`);
  if (ayah.arabicText) parts.push(`Arabic: ${ayah.arabicText}`);
  return parts.filter(Boolean).join('\n').trim();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function progressBar(done, total, label = '') {
  const pct = Math.round((done / total) * 100);
  const filled = Math.round(pct / 2);
  process.stdout.write(
    `\r[${'█'.repeat(filled)}${'░'.repeat(50 - filled)}] ${pct}%  ${done}/${total}  ${label}   `,
  );
}

/** Embed a batch of passages; retries on 429, splits on 400/413. */
async function embedBatch(texts, attempt = 0) {
  const res = await fetch(EMBED_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${NVIDIA_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, input: texts, input_type: 'passage', truncate: 'END' }),
    signal: AbortSignal.timeout(60000),
  });

  if (res.status === 429) {
    if (attempt >= 6) throw new Error('rate limited too many times');
    const wait = Math.min(10_000 * (attempt + 1), 60_000);
    process.stdout.write(`  (429 — waiting ${wait / 1000}s)`);
    await sleep(wait);
    return embedBatch(texts, attempt + 1);
  }

  if ((res.status === 400 || res.status === 413) && texts.length > 1) {
    // Payload too large / bad batch — split and recurse.
    const mid = Math.ceil(texts.length / 2);
    const left = await embedBatch(texts.slice(0, mid), attempt);
    const right = await embedBatch(texts.slice(mid), attempt);
    return [...left, ...right.map((e, i) => ({ ...e, index: e.index + mid }))];
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`embed failed ${res.status}: ${body.slice(0, 150)}`);
  }

  const json = await res.json();
  return json.data; // [{ index, embedding }]
}

async function upsertEmbedding(table, ayah, embedding) {
  const vector = `[${embedding.join(',')}]`;
  // table is a trusted constant, never user input
  await prisma.$executeRawUnsafe(
    `INSERT INTO ${table} (id, "ayahId", "surahNumber", "ayahNumber", embedding, model, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4::vector, $5, NOW(), NOW())
     ON CONFLICT ("ayahId") DO UPDATE
       SET embedding = EXCLUDED.embedding, model = EXCLUDED.model, "updatedAt" = NOW()`,
    ayah.id,
    ayah.surahNumber,
    ayah.number,
    vector,
    MODEL,
  );
}

async function loadAyahs() {
  return prisma.ayah.findMany({
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
}

async function doneIdsFor(table) {
  const rows = await prisma.$queryRawUnsafe(`SELECT "ayahId" FROM ${table}`);
  return new Set(rows.map((r) => r.ayahId));
}

// ── Verses ────────────────────────────────────────────────────────────────────

async function embedVerses() {
  console.log('\n📖  VERSES → verse_embeddings_v2');
  const ayahs = await loadAyahs();
  const done = await doneIdsFor('verse_embeddings_v2');
  const pending = ayahs.filter((a) => !done.has(a.id));
  console.log(`   total ${ayahs.length} · done ${done.size} · pending ${pending.length}`);
  if (pending.length === 0) return;

  let processed = 0;
  let errors = 0;
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    const chunks = batch.map((a) => buildVerseChunk(a, a.surah?.englishName ?? `Surah ${a.surahNumber}`));
    try {
      const data = await embedBatch(chunks);
      await Promise.all(data.map((item) => upsertEmbedding('verse_embeddings_v2', batch[item.index], item.embedding)));
      processed += batch.length;
    } catch (err) {
      errors++;
      console.error(`\n⚠️  batch ${i} failed: ${err.message}`);
    }
    progressBar(processed, pending.length, `errors:${errors}`);
    await sleep(BATCH_DELAY_MS);
  }
  console.log(`\n   verses done: ${processed}, errors: ${errors}`);
}

// ── Tafsir ────────────────────────────────────────────────────────────────────

async function fetchTafsir(surahNo, ayahNo) {
  try {
    const res = await fetch(`${TAFSIR_BASE_URL}/api/tafsir/${surahNo}_${ayahNo}.json`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.tafsirs?.[0]?.content ?? '';
    const clean = raw
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*?([^*]+)\*\*?/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    return clean.length > 0 ? clean.slice(0, TAFSIR_MAX_CHARS) : null;
  } catch {
    return null;
  }
}

async function embedTafsir() {
  console.log('\n📚  TAFSIR → tafsir_embeddings_v2');
  const ayahs = await loadAyahs();
  const done = await doneIdsFor('tafsir_embeddings_v2');
  const pending = ayahs.filter((a) => !done.has(a.id));
  console.log(`   total ${ayahs.length} · done ${done.size} · pending ${pending.length}`);
  if (pending.length === 0) return;

  let processed = 0;
  let errors = 0;
  let missed = 0;

  // Fetch + embed in rolling groups so a crash loses at most one group.
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    const chunks = [];
    for (const a of batch) {
      const tafsirText = await fetchTafsir(a.surahNumber, a.number);
      if (!tafsirText) missed++;
      chunks.push(buildTafsirChunk(a, a.surah?.englishName ?? `Surah ${a.surahNumber}`, tafsirText));
      await sleep(TAFSIR_API_DELAY);
    }
    try {
      const data = await embedBatch(chunks);
      await Promise.all(data.map((item) => upsertEmbedding('tafsir_embeddings_v2', batch[item.index], item.embedding)));
      processed += batch.length;
    } catch (err) {
      errors++;
      console.error(`\n⚠️  batch ${i} failed: ${err.message}`);
    }
    progressBar(processed, pending.length, `no-tafsir:${missed} errors:${errors}`);
  }
  console.log(`\n   tafsir done: ${processed}, no-tafsir (embedded without commentary): ${missed}, errors: ${errors}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const mode = process.argv[2] ?? 'all';
console.log(`🕌  NVIDIA Re-embedding Pipeline — model ${MODEL}, mode: ${mode}`);

try {
  if (mode === 'verses' || mode === 'all') await embedVerses();
  if (mode === 'tafsir' || mode === 'all') await embedTafsir();
  console.log('\n✅  done');
} catch (err) {
  console.error('\n❌  fatal:', err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
