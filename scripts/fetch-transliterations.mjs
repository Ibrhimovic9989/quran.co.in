/**
 * Transliteration Backfill Script
 * ─────────────────────────────────
 * Fetches Latin-script transliterations for all 6,236 ayahs from
 * api.alquran.cloud (en.transliteration edition) and stores them in
 * the `transliteration` column of the `ayahs` table.
 *
 * This replaces the unvoweled Arabic that was previously stored there.
 *
 * Usage:
 *   node --env-file=.env.local scripts/fetch-transliterations.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching full Quran transliteration from alquran.cloud…');

  const res = await fetch('https://api.alquran.cloud/v1/quran/en.transliteration');
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);

  const json = await res.json();
  const surahs = json.data?.surahs;
  if (!surahs?.length) throw new Error('Unexpected API response shape');

  // Flatten into a map: "surahNo:ayahNo" -> transliteration text
  const map = new Map();
  for (const surah of surahs) {
    for (const ayah of surah.ayahs) {
      map.set(`${surah.number}:${ayah.numberInSurah}`, ayah.text);
    }
  }
  console.log(`Got ${map.size} transliterations from API`);

  // Fetch all ayah ids for TEMPORARY_API provider
  const ayahs = await prisma.ayah.findMany({
    where: { apiProvider: 'TEMPORARY_API' },
    select: { id: true, surahNumber: true, number: true },
  });
  console.log(`Updating ${ayahs.length} ayahs in DB…`);

  let updated = 0;
  let missing = 0;

  for (const ayah of ayahs) {
    const key = `${ayah.surahNumber}:${ayah.number}`;
    const translit = map.get(key);
    if (!translit) { missing++; continue; }

    await prisma.ayah.update({
      where: { id: ayah.id },
      data: { transliteration: translit },
    });
    updated++;

    if (updated % 500 === 0) {
      console.log(`  ${updated}/${ayahs.length} done…`);
    }
  }

  console.log(`\nDone. Updated: ${updated}, Missing: ${missing}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
