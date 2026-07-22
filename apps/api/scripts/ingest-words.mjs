/**
 * Word-by-word ingestion — quran.com v4 API → quran_words table.
 * ~77,000 words: Uthmani text, English gloss, transliteration, word audio,
 * and Madinah mushaf page/line layout.
 *
 * Usage (from apps/api):  node scripts/ingest-words.mjs
 * Resumable — chapters that already have words are skipped.
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

const API = 'https://api.quran.com/api/v4';
const prisma = new PrismaClient();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(chapter, page) {
  const url = `${API}/verses/by_chapter/${chapter}?words=true&word_fields=text_uthmani&per_page=50&page=${page}`;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (res.status === 429) {
        await sleep(5000 * (attempt + 1));
        continue;
      }
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    } catch (e) {
      if (attempt === 4) throw e;
      await sleep(2000 * (attempt + 1));
    }
  }
}

async function insertWords(rows) {
  if (rows.length === 0) return;
  // Multi-row insert for speed; conflict-safe for resume.
  const values = [];
  const params = [];
  let i = 1;
  for (const r of rows) {
    values.push(`($${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++})`);
    params.push(
      r.surah, r.ayah, r.position, r.charType, r.text,
      r.translation, r.transliteration, r.audioUrl, r.pageNumber, r.lineNumber,
    );
  }
  await prisma.$executeRawUnsafe(
    `INSERT INTO quran_words
       ("surahNumber","ayahNumber",position,"charType","textUthmani",translation,transliteration,"audioUrl","pageNumber","lineNumber")
     VALUES ${values.join(',')}
     ON CONFLICT ("surahNumber","ayahNumber",position) DO NOTHING`,
    ...params,
  );
}

console.log('📖  Word-by-word ingestion (quran.com v4)');
let totalWords = 0;

for (let chapter = 1; chapter <= 114; chapter++) {
  const existing = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS c FROM quran_words WHERE "surahNumber" = $1`, chapter,
  );
  if (existing[0].c > 0) {
    process.stdout.write(`\rchapter ${chapter}/114 (skip, ${existing[0].c} words)   `);
    continue;
  }

  let page = 1;
  let chapterWords = 0;
  for (;;) {
    const data = await fetchPage(chapter, page);
    const rows = [];
    for (const verse of data.verses) {
      const [s, a] = verse.verse_key.split(':').map(Number);
      for (const w of verse.words) {
        rows.push({
          surah: s,
          ayah: a,
          position: w.position,
          charType: w.char_type_name ?? 'word',
          text: w.text_uthmani ?? w.text ?? '',
          translation: w.translation?.text ?? null,
          transliteration: w.transliteration?.text ?? null,
          audioUrl: w.audio_url ?? null,
          pageNumber: w.page_number ?? null,
          lineNumber: w.line_number ?? null,
        });
      }
    }
    await insertWords(rows);
    chapterWords += rows.length;
    if (!data.pagination.next_page) break;
    page = data.pagination.next_page;
    await sleep(250);
  }

  totalWords += chapterWords;
  process.stdout.write(`\rchapter ${chapter}/114 ✓ ${chapterWords} words (total ${totalWords})   `);
  await sleep(250);
}

const grand = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS c FROM quran_words`);
console.log(`\n✅  done — ${grand[0].c} words in table`);
await prisma.$disconnect();
