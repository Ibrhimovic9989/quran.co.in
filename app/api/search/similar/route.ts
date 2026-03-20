import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const surah  = parseInt(req.nextUrl.searchParams.get('surah') ?? '0');
  const ayah   = parseInt(req.nextUrl.searchParams.get('ayah')  ?? '0');
  const limit  = Math.min(parseInt(req.nextUrl.searchParams.get('limit')  ?? '5'), 20);
  const offset = Math.max(parseInt(req.nextUrl.searchParams.get('offset') ?? '0'), 0);

  if (!surah || !ayah) {
    return NextResponse.json({ error: 'surah and ayah params required' }, { status: 400 });
  }

  try {
    // Prefer tafsir-enriched embedding as source vector; fall back to verse embedding
    const tafsirSource = await prisma.$queryRaw<{ embedding: string }[]>`
      SELECT embedding::text
      FROM tafsir_embeddings
      WHERE "surahNumber" = ${surah} AND "ayahNumber" = ${ayah}
      LIMIT 1
    `;

    let vector: string;

    if (tafsirSource.length) {
      vector = tafsirSource[0].embedding;
    } else {
      const verseSource = await prisma.$queryRaw<{ embedding: string }[]>`
        SELECT embedding::text
        FROM verse_embeddings
        WHERE "surahNumber" = ${surah} AND "ayahNumber" = ${ayah}
        LIMIT 1
      `;
      if (!verseSource.length) {
        return NextResponse.json({ error: 'Ayah not found in embeddings' }, { status: 404 });
      }
      vector = verseSource[0].embedding;
    }

    // Hybrid nearest-neighbour across both tables.
    // Diversify by deprioritising same surah — fetch extra results then push
    // same-surah results to the end so cross-surah verses appear first.
    const fetchLimit = (limit + offset) * 4; // fetch generously to allow dedup + diversity

    const raw = await prisma.$queryRaw<{
      surahNumber:            number;
      ayahNumber:             number;
      arabicText:             string;
      translationText:        string | null;
      englishName:            string;
      englishNameTranslation: string | null;
      similarity:             number;
    }[]>`
      WITH verse_scores AS (
        SELECT
          ve."ayahId",
          ve."surahNumber",
          ve."ayahNumber",
          ve.embedding <=> ${vector}::vector AS dist
        FROM verse_embeddings ve
        WHERE NOT (ve."surahNumber" = ${surah} AND ve."ayahNumber" = ${ayah})
      ),
      tafsir_scores AS (
        SELECT
          te."ayahId",
          te."surahNumber",
          te."ayahNumber",
          te.embedding <=> ${vector}::vector AS dist
        FROM tafsir_embeddings te
        WHERE NOT (te."surahNumber" = ${surah} AND te."ayahNumber" = ${ayah})
      ),
      best_scores AS (
        SELECT
          "ayahId",
          "surahNumber",
          "ayahNumber",
          MIN(dist) AS dist
        FROM (
          SELECT * FROM verse_scores
          UNION ALL
          SELECT * FROM tafsir_scores
        ) combined
        GROUP BY "ayahId", "surahNumber", "ayahNumber"
      )
      SELECT
        b."surahNumber",
        b."ayahNumber",
        a."arabicText",
        a."translationText",
        s."englishName",
        s."englishNameTranslation",
        ROUND((1 - b.dist)::numeric, 4) AS similarity
      FROM best_scores b
      JOIN ayahs  a ON a.id     = b."ayahId"
      JOIN surahs s ON s.number = b."surahNumber" AND s."apiProvider" = 'TEMPORARY_API'
      ORDER BY b.dist
      LIMIT ${fetchLimit}
    `;

    // Diversify: cross-surah results first, same-surah results appended after
    const crossSurah = raw.filter((r) => r.surahNumber !== surah);
    const sameSurah  = raw.filter((r) => r.surahNumber === surah);
    const diversified = [...crossSurah, ...sameSurah];

    // Apply offset + limit for pagination
    const results = diversified.slice(offset, offset + limit);
    const hasMore  = diversified.length > offset + limit;

    return NextResponse.json({ results, hasMore });
  } catch (err) {
    console.error('[similar-ayahs]', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
