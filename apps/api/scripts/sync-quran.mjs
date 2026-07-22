/**
 * Quran Data Sync — re-seed the DB from the external Quran API.
 * Replaces the old apps/web/scripts/sync-quran.ts (QuranSyncService); the
 * API also self-heals at runtime (DB-first with external fallback + sync),
 * so this is only needed for initial seeding or a full refresh.
 *
 * Usage (from apps/api):  node scripts/sync-quran.mjs
 * Resumable — surahs whose ayah count already matches are skipped.
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).replace(/^"|"$/g, '')]),
);
process.env.DATABASE_URL ??= env.DATABASE_URL;
process.env.DIRECT_URL ??= env.DIRECT_URL;

const BASE = process.env.QURAN_COM_API_URL ?? 'https://quranapi.pages.dev';
const PROVIDER = 'TEMPORARY_API';
const BATCH = 50;

const prisma = new PrismaClient();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(path) {
  const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

function surahUpsertData(s, number) {
  return {
    number,
    name: s.surahName,
    englishName: s.surahNameTranslation,
    arabicName: s.surahNameArabic,
    englishNameTranslation: s.surahNameTranslation,
    numberOfAyahs: s.totalAyah,
    revelationType: s.revelationPlace === 'Mecca' ? 'MECCAN' : 'MEDINAN',
    apiProvider: PROVIDER,
    metadata: { surahNameArabicLong: s.surahNameArabicLong, audio: s.audio ?? undefined },
  };
}

function ayahMetadata(s, i) {
  const m = {};
  if (s.bengali?.[i]) m.bengali = s.bengali[i];
  if (s.urdu?.[i]) m.urdu = s.urdu[i];
  if (s.turkish?.[i]) m.turkish = s.turkish[i];
  if (s.uzbek?.[i]) m.uzbek = s.uzbek[i];
  return Object.keys(m).length ? m : undefined;
}

async function syncSurah(surahNo) {
  const s = await fetchJson(`/api/${surahNo}.json`);

  const data = surahUpsertData(s, surahNo);
  const dbSurah = await prisma.surah.upsert({
    where: { number_apiProvider: { number: surahNo, apiProvider: PROVIDER } },
    update: { ...data, apiProvider: undefined, number: undefined },
    create: data,
  });

  for (let i = 0; i < s.english.length; i += BATCH) {
    const slice = s.english.slice(i, i + BATCH);
    await Promise.all(
      slice.map((_, j) => {
        const idx = i + j;
        return prisma.ayah.upsert({
          where: {
            surahNumber_number_apiProvider: {
              surahNumber: surahNo,
              number: idx + 1,
              apiProvider: PROVIDER,
            },
          },
          update: {
            arabicText: s.arabic1[idx],
            translationText: s.english[idx],
            transliteration: s.arabic2[idx],
          },
          create: {
            surahId: dbSurah.id,
            surahNumber: surahNo,
            number: idx + 1,
            apiProvider: PROVIDER,
            arabicText: s.arabic1[idx],
            translationText: s.english[idx],
            transliteration: s.arabic2[idx],
            metadata: ayahMetadata(s, idx),
          },
        });
      }),
    );
  }
  return s.totalAyah;
}

console.log(`🕌  Quran sync from ${BASE} → provider ${PROVIDER}`);
let synced = 0;
let skipped = 0;

for (let n = 1; n <= 114; n++) {
  const surah = await prisma.surah.findFirst({
    where: { number: n, apiProvider: PROVIDER },
    select: { numberOfAyahs: true },
  });
  if (surah) {
    const have = await prisma.ayah.count({ where: { surahNumber: n, apiProvider: PROVIDER } });
    if (have >= surah.numberOfAyahs) {
      skipped++;
      process.stdout.write(`\rSurah ${n}/114 (skipped: ${skipped})   `);
      continue;
    }
  }
  try {
    const total = await syncSurah(n);
    synced++;
    process.stdout.write(`\rSurah ${n}/114 ✓ ${total} ayahs (synced: ${synced})   `);
  } catch (err) {
    console.error(`\n⚠️  surah ${n} failed: ${err.message}`);
  }
  await sleep(250);
}

console.log(`\n✅  done — synced ${synced}, skipped ${skipped}`);
await prisma.$disconnect();
