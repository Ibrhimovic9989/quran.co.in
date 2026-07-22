// Ayah of the day — ported from apps/web/app/api/quran/ayah-of-the-day/route.ts.
// Authenticated users get a personalised pick (pgvector centroid of recently
// read ayahs); guests get a deterministic day-of-year pick.

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { verseTable, embExpr, queryVecCast } from '../common/embeddings-config';

interface DailyAyahRow {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translationText: string | null;
  englishName: string;
  englishNameTranslation: string | null;
}

export interface AyahOfTheDayResult {
  ayah: DailyAyahRow | null;
  type: 'personalised' | 'daily';
  date: string;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function dayOfYear(): number {
  const start = new Date(new Date().getFullYear(), 0, 0);
  return Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
}

@Injectable()
export class AyahOfTheDayService {
  constructor(private readonly prisma: PrismaService) {}

  async getForUser(userId: string | null): Promise<AyahOfTheDayResult> {
    const date = todayKey();

    if (userId) {
      const personalised = await this.getPersonalised(userId);
      if (personalised) return { ayah: personalised, type: 'personalised', date };
    }

    return { ayah: await this.getDaily(), type: 'daily', date };
  }

  /** Centroid of the user's recently-read ayah embeddings → closest unseen ayah. */
  private async getPersonalised(userId: string): Promise<DailyAyahRow | null> {
    const recentHistory = await this.prisma.readingHistory.findMany({
      where: {
        userId,
        readAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { surahNumber: true, ayahNumber: true },
      orderBy: { readAt: 'desc' },
      take: 20,
    });

    if (recentHistory.length === 0) return null;

    const seenSurahs = [...new Set(recentHistory.map((h) => h.surahNumber))];
    // [0] fallback so the array is never empty (avoids ANY(ARRAY[]::int[]) edge case)
    const seenSurahsArr = seenSurahs.length > 0 ? seenSurahs : [0];

    // Day-of-year offset into the top-N closest results so the verse changes
    // daily while staying relevant.
    const poolSize = 30;
    const pickIndex = dayOfYear() % poolSize;

    const result = await this.prisma.$queryRaw<DailyAyahRow[]>(Prisma.sql`
      WITH centroid AS (
        SELECT AVG(ve.embedding) AS vec
        FROM ${verseTable()} ve
        WHERE (ve."surahNumber", ve."ayahNumber") IN (
          SELECT r."surahNumber", r."ayahNumber"
          FROM reading_history r
          WHERE r."userId" = ${userId}
            AND r."readAt" >= NOW() - INTERVAL '7 days'
          LIMIT 20
        )
      )
      SELECT
        ve."surahNumber",
        ve."ayahNumber",
        a."arabicText",
        a."translationText",
        s."englishName",
        s."englishNameTranslation"
      FROM ${verseTable()} ve
      CROSS JOIN centroid
      JOIN ayahs  a ON a.id     = ve."ayahId"
      JOIN surahs s ON s.number = ve."surahNumber" AND s."apiProvider" = 'TEMPORARY_API'
      WHERE ve."surahNumber" != ALL(ARRAY[${Prisma.join(seenSurahsArr)}]::integer[])
      ORDER BY ${embExpr('ve')} <=> centroid.vec${queryVecCast()}
      LIMIT 1 OFFSET ${pickIndex}
    `);

    return result[0] ?? null;
  }

  /** Deterministic guest pick: cycle through all ayahs across the year. */
  private async getDaily(): Promise<DailyAyahRow | null> {
    const countRows = await this.prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*)::int AS count FROM ${verseTable()}
    `;
    const totalAyahs = countRows[0]?.count ?? 0;
    if (totalAyahs === 0) return null;
    const offset = dayOfYear() % totalAyahs;

    const daily = await this.prisma.$queryRaw<DailyAyahRow[]>`
      SELECT
        ve."surahNumber",
        ve."ayahNumber",
        a."arabicText",
        a."translationText",
        s."englishName",
        s."englishNameTranslation"
      FROM ${verseTable()} ve
      JOIN ayahs  a ON a.id     = ve."ayahId"
      JOIN surahs s ON s.number = ve."surahNumber" AND s."apiProvider" = 'TEMPORARY_API'
      ORDER BY ve."surahNumber", ve."ayahNumber"
      LIMIT 1 OFFSET ${offset}
    `;

    return daily[0] ?? null;
  }
}
