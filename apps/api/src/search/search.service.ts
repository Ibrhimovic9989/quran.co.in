// Semantic + similar search over pgvector embeddings.
// Ported from apps/web/app/api/search/{semantic,similar}/route.ts.

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LlmService } from '../llm/llm.service';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
  ) {}

  /** True when vector search is possible (embedding provider up). */
  canVectorSearch(): boolean {
    return this.llm.hasEmbeddingProvider();
  }

  /** Embed the free-text query in the corpus embedding space. */
  async embedQuery(q: string): Promise<string> {
    return this.llm.embedQuery(q);
  }

  /**
   * Keyword fallback when no embedding provider is available: Postgres
   * full-text search over the English translations. Same response shape as
   * the vector path (ts_rank scaled into a 0..0.99 pseudo-similarity).
   */
  async keywordSearch(q: string, limit: number): Promise<SearchResultRow[]> {
    // websearch_to_tsquery ANDs terms by default, which is too strict for a
    // recall-oriented fallback — OR the words instead (ts_rank still ranks
    // multi-term matches higher).
    const orQuery = q
      .split(/\s+/)
      .filter(Boolean)
      .join(' OR ');

    return this.prisma.$queryRaw<SearchResultRow[]>`
      SELECT
        a."surahNumber",
        a."number" AS "ayahNumber",
        a."arabicText",
        a."translationText",
        s."englishName",
        s."englishNameTranslation",
        ROUND(LEAST(
          ts_rank(
            to_tsvector('english', coalesce(a."translationText", '')),
            websearch_to_tsquery('english', ${orQuery})
          ) * 10, 0.99)::numeric, 4) AS similarity
      FROM ayahs a
      JOIN surahs s ON s.number = a."surahNumber" AND s."apiProvider" = 'TEMPORARY_API'
      WHERE a."apiProvider" = 'TEMPORARY_API'
        AND to_tsvector('english', coalesce(a."translationText", ''))
            @@ websearch_to_tsquery('english', ${orQuery})
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;
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
