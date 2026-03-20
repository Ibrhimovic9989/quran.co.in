import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const openai = new AzureOpenAI({
  apiKey:     process.env.AZURE_OPENAI_API_KEY!,
  endpoint:   process.env.AZURE_OPENAI_ENDPOINT!,
  deployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? '2023-05-15',
});

export async function GET(req: NextRequest) {
  const q     = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '8'), 20);

  if (q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    // 1. Embed the query
    const embRes = await openai.embeddings.create({
      input: [q],
      model: 'text-embedding-3-small',
    });
    const vector = `[${embRes.data[0].embedding.join(',')}]`;

    // 2. Hybrid cosine similarity search:
    //    - verse_embeddings: translation + arabic (always present)
    //    - tafsir_embeddings: translation + scholarly commentary (richer context)
    //    For each ayah we take the BEST (lowest) distance from either table,
    //    so tafsir-enriched embeddings improve recall without hurting precision.
    const rows = await prisma.$queryRaw<{
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
      ),
      tafsir_scores AS (
        SELECT
          te."ayahId",
          te."surahNumber",
          te."ayahNumber",
          te.embedding <=> ${vector}::vector AS dist
        FROM tafsir_embeddings te
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
      LIMIT ${limit}
    `;

    return NextResponse.json({ results: rows });
  } catch (err) {
    console.error('[semantic-search]', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
