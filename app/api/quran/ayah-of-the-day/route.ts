import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Prevent Vercel/Next.js from caching this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Cache key: one ayah per user per day (or one global per day for guests)
function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const today = todayKey();

    if (session?.user?.email) {
      // ── Authenticated: personalised pick ──────────────────────────────────
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (user) {
        // Get the surahs the user has read most recently (last 7 days)
        const recentHistory = await prisma.readingHistory.findMany({
          where: {
            userId: user.id,
            readAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
          select: { surahNumber: true, ayahNumber: true },
          orderBy: { readAt: 'desc' },
          take: 20,
        });

        if (recentHistory.length > 0) {
          // Average the embeddings of recently read ayahs → centroid vector
          // Then find the closest ayah not in recent history
          const seenSurahs = [...new Set(recentHistory.map((h) => h.surahNumber))];
          // Use [0] fallback so the array is never empty (avoids ANY(ARRAY[]::int[]) edge case)
          const seenSurahsArr = seenSurahs.length > 0 ? seenSurahs : [0];

          // Use day-of-year as offset into the top-N closest results
          // so the verse changes daily while staying relevant
          const startP = new Date(new Date().getFullYear(), 0, 0);
          const diffP = Date.now() - startP.getTime();
          const dayOfYearP = Math.floor(diffP / (1000 * 60 * 60 * 24));
          const poolSize = 30; // pick from top 30 closest
          const pickIndex = dayOfYearP % poolSize;

          const result = await prisma.$queryRaw<{
            surahNumber: number;
            ayahNumber: number;
            arabicText: string;
            translationText: string | null;
            englishName: string;
            englishNameTranslation: string | null;
          }[]>(Prisma.sql`
            WITH centroid AS (
              SELECT AVG(ve.embedding) AS vec
              FROM verse_embeddings ve
              WHERE (ve."surahNumber", ve."ayahNumber") IN (
                SELECT r."surahNumber", r."ayahNumber"
                FROM reading_history r
                WHERE r."userId" = ${user.id}
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
            FROM verse_embeddings ve
            CROSS JOIN centroid
            JOIN ayahs  a ON a.id     = ve."ayahId"
            JOIN surahs s ON s.number = ve."surahNumber" AND s."apiProvider" = 'TEMPORARY_API'
            WHERE ve."surahNumber" != ALL(ARRAY[${Prisma.join(seenSurahsArr)}]::integer[])
            ORDER BY ve.embedding <=> centroid.vec
            LIMIT 1 OFFSET ${pickIndex}
          `);

          if (result.length > 0) {
            return NextResponse.json({
              ayah: result[0],
              type: 'personalised',
              date: today,
            }, {
              headers: { 'Cache-Control': 'no-store, max-age=0' },
            });
          }
        }
      }
    }

    // ── Guest / fallback: deterministic daily pick based on date ─────────────
    // Use day-of-year to cycle through all ayahs over the year
    const start = new Date(new Date().getFullYear(), 0, 0);
    const diff  = Date.now() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const totalAyahs = await prisma.verseEmbedding.count();
    const offset = dayOfYear % totalAyahs;

    const daily = await prisma.$queryRaw<{
      surahNumber: number;
      ayahNumber: number;
      arabicText: string;
      translationText: string | null;
      englishName: string;
      englishNameTranslation: string | null;
    }[]>`
      SELECT
        ve."surahNumber",
        ve."ayahNumber",
        a."arabicText",
        a."translationText",
        s."englishName",
        s."englishNameTranslation"
      FROM verse_embeddings ve
      JOIN ayahs  a ON a.id     = ve."ayahId"
      JOIN surahs s ON s.number = ve."surahNumber" AND s."apiProvider" = 'TEMPORARY_API'
      ORDER BY ve."surahNumber", ve."ayahNumber"
      LIMIT 1 OFFSET ${offset}
    `;

    return NextResponse.json({
      ayah: daily[0] ?? null,
      type: 'daily',
      date: today,
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });

  } catch (err) {
    console.error('[ayah-of-the-day]', err);
    return NextResponse.json({ error: 'Failed to get ayah' }, { status: 500 });
  }
}
