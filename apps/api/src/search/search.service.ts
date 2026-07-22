// Semantic + similar search over pgvector embeddings.
// Ported from apps/web/app/api/search/{semantic,similar}/route.ts.

import { Injectable } from '@nestjs/common';
import { AzureOpenAI } from 'openai';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchResultRow {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translationText: string | null;
  englishName: string;
  englishNameTranslation: string | null;
  similarity: number;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  private getEmbedClient(): AzureOpenAI {
    return new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
      deployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? '2023-05-15',
    });
  }

  /** Embed the free-text query with Azure OpenAI. */
  async embedQuery(q: string): Promise<string> {
    const embRes = await this.getEmbedClient().embeddings.create({
      input: [q],
      model: 'text-embedding-3-small',
    });
    return `[${embRes.data[0].embedding.join(',')}]`;
  }

  /**
   * Hybrid cosine-similarity search: for each ayah take the BEST (lowest)
   * distance from verse_embeddings OR tafsir_embeddings.
   */
  async semanticSearch(vector: string, limit: number): Promise<SearchResultRow[]> {
    return this.prisma.$queryRaw<SearchResultRow[]>`
      WITH verse_scores AS (
        SELECT ve."ayahId", ve."surahNumber", ve."ayahNumber",
               ve.embedding <=> ${vector}::vector AS dist
        FROM verse_embeddings ve
      ),
      tafsir_scores AS (
        SELECT te."ayahId", te."surahNumber", te."ayahNumber",
               te.embedding <=> ${vector}::vector AS dist
        FROM tafsir_embeddings te
      ),
      best_scores AS (
        SELECT "ayahId", "surahNumber", "ayahNumber", MIN(dist) AS dist
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
  }

  /**
   * "Similar ayahs": reuse the stored embedding of the source ayah (tafsir
   * embedding preferred), search both tables, then diversify cross-surah.
   */
  async similarAyahs(
    surah: number,
    ayah: number,
    limit: number,
    offset: number,
  ): Promise<{ results: SearchResultRow[]; hasMore: boolean } | null> {
    // Prefer tafsir-enriched embedding as source vector; fall back to verse embedding
    const tafsirSource = await this.prisma.$queryRaw<{ embedding: string }[]>`
      SELECT embedding::text
      FROM tafsir_embeddings
      WHERE "surahNumber" = ${surah} AND "ayahNumber" = ${ayah}
      LIMIT 1
    `;

    let vector: string;
    if (tafsirSource.length) {
      vector = tafsirSource[0].embedding;
    } else {
      const verseSource = await this.prisma.$queryRaw<{ embedding: string }[]>`
        SELECT embedding::text
        FROM verse_embeddings
        WHERE "surahNumber" = ${surah} AND "ayahNumber" = ${ayah}
        LIMIT 1
      `;
      if (!verseSource.length) return null;
      vector = verseSource[0].embedding;
    }

    // Fetch generously to allow dedup + cross-surah diversity.
    const fetchLimit = (limit + offset) * 4;

    const raw = await this.prisma.$queryRaw<SearchResultRow[]>`
      WITH verse_scores AS (
        SELECT ve."ayahId", ve."surahNumber", ve."ayahNumber",
               ve.embedding <=> ${vector}::vector AS dist
        FROM verse_embeddings ve
        WHERE NOT (ve."surahNumber" = ${surah} AND ve."ayahNumber" = ${ayah})
      ),
      tafsir_scores AS (
        SELECT te."ayahId", te."surahNumber", te."ayahNumber",
               te.embedding <=> ${vector}::vector AS dist
        FROM tafsir_embeddings te
        WHERE NOT (te."surahNumber" = ${surah} AND te."ayahNumber" = ${ayah})
      ),
      best_scores AS (
        SELECT "ayahId", "surahNumber", "ayahNumber", MIN(dist) AS dist
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

    // Diversify: cross-surah results first, same-surah appended after.
    const crossSurah = raw.filter((r) => r.surahNumber !== surah);
    const sameSurah = raw.filter((r) => r.surahNumber === surah);
    const diversified = [...crossSurah, ...sameSurah];

    const results = diversified.slice(offset, offset + limit);
    const hasMore = diversified.length > offset + limit;
    return { results, hasMore };
  }
}
