/**
 * Tajwīd ingestion — quran.com v4 API (uthmani_tajweed) → quran_tajweed table.
 * Parses the `<tajweed class=...>...</tajweed>` HTML into compact rule-runs so
 * clients render colored spans without parsing HTML.
 *
 * Each ayah is stored as runs: [[text, ruleClass|null], ...] (JSON).
 *
 * Usage (from apps/api):  node scripts/ingest-tajweed.mjs
 * Resumable — chapters already present are skipped.
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

const seenRules = new Set();

/**
 * Parse quran.com uthmani_tajweed HTML into [[text, rule|null], ...].
 * Merges consecutive plain-text runs; drops the trailing verse-number span.
 */
function parseTajweed(html) {
  const runs = [];
  const push = (text, rule) => {
    if (!text) return;
    if (rule == null && runs.length && runs[runs.length - 1][1] == null) {
      runs[runs.length - 1][0] += text; // merge adjacent plain text
    } else {
      runs.push([text, rule]);
    }
    if (rule) seenRules.add(rule);
  };

  const re = /<tajweed\s+class=["']?([a-z_]+)["']?>([\s\S]*?)<\/tajweed>|<span\s+class=["']?end["']?>[\s\S]*?<\/span>/g;
  let last = 0;
  let m;
  while ((m = re.exec(html)) !== null) {
    push(html.slice(last, m.index), null); // plain text before the tag
    if (m[1]) push(m[2], m[1]); // a <tajweed> run (m[2] = text, m[1] = class)
    // the <span class=end> branch is skipped entirely (verse number glyph)
    last = re.lastIndex;
  }
  push(html.slice(last), null);
  // trim a trailing space left by dropping the end-glyph
  if (runs.length && runs[runs.length - 1][1] == null) {
    runs[runs.length - 1][0] = runs[runs.length - 1][0].replace(/\s+$/, '');
    if (!runs[runs.length - 1][0]) runs.pop();
  }
  return runs;
}

async function fetchChapter(chapter, page) {
  const url = `${API}/quran/verses/uthmani_tajweed?chapter_number=${chapter}&per_page=50&page=${page}`;
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

async function ensureTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS quran_tajweed (
      "surahNumber" integer NOT NULL,
      "ayahNumber"  integer NOT NULL,
      runs          jsonb   NOT NULL,
      PRIMARY KEY ("surahNumber","ayahNumber")
    )`);
}

async function insertRows(rows) {
  if (rows.length === 0) return;
  const values = [];
  const params = [];
  let i = 1;
  for (const r of rows) {
    values.push(`($${i++}, $${i++}, $${i++}::jsonb)`);
    params.push(r.surah, r.ayah, JSON.stringify(r.runs));
  }
  await prisma.$executeRawUnsafe(
    `INSERT INTO quran_tajweed ("surahNumber","ayahNumber",runs)
     VALUES ${values.join(',')}
     ON CONFLICT ("surahNumber","ayahNumber") DO NOTHING`,
    ...params,
  );
}

const ONLY = process.argv[2] ? Number(process.argv[2]) : null; // optional single chapter for testing

console.log('🎨  Tajwīd ingestion (quran.com v4 uthmani_tajweed)');
await ensureTable();
let total = 0;

for (let chapter = 1; chapter <= 114; chapter++) {
  if (ONLY && chapter !== ONLY) continue;
  const existing = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS c FROM quran_tajweed WHERE "surahNumber" = $1`, chapter,
  );
  if (existing[0].c > 0) {
    process.stdout.write(`\rchapter ${chapter}/114 (skip, ${existing[0].c} ayat)   `);
    continue;
  }

  let page = 1;
  let chapterAyat = 0;
  for (;;) {
    const data = await fetchChapter(chapter, page);
    const rows = data.verses.map((v) => {
      const [s, a] = v.verse_key.split(':').map(Number);
      return { surah: s, ayah: a, runs: parseTajweed(v.text_uthmani_tajweed ?? '') };
    });
    await insertRows(rows);
    chapterAyat += rows.length;
    if (!data.pagination?.next_page) break;
    page = data.pagination.next_page;
    await sleep(200);
  }

  total += chapterAyat;
  process.stdout.write(`\rchapter ${chapter}/114 ✓ ${chapterAyat} ayat (total ${total})   `);
  await sleep(200);
}

const grand = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS c FROM quran_tajweed`);
console.log(`\n✅  done — ${grand[0].c} ayat in quran_tajweed`);
console.log(`distinct rule classes seen: ${[...seenRules].sort().join(', ')}`);
await prisma.$disconnect();
