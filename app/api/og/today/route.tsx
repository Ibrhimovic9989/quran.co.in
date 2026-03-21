// Dynamic OG image for /today — uses Prisma directly (no internal HTTP hop)

import { ImageResponse } from 'next/og';
import { PrismaClient } from '@prisma/client';

// Node.js runtime — needed for Prisma
export const runtime = 'nodejs';
export const revalidate = 3600; // regenerate every hour

const prisma = new PrismaClient();

async function getDailyAyah() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
  const totalAyahs = await prisma.verseEmbedding.count();
  const offset = dayOfYear % totalAyahs;

  const rows = await prisma.$queryRaw<{
    surahNumber: number;
    ayahNumber: number;
    translationText: string | null;
    englishName: string;
    englishNameTranslation: string | null;
  }[]>`
    SELECT
      ve."surahNumber",
      ve."ayahNumber",
      a."translationText",
      s."englishName",
      s."englishNameTranslation"
    FROM verse_embeddings ve
    JOIN ayahs  a ON a.id     = ve."ayahId"
    JOIN surahs s ON s.number = ve."surahNumber" AND s."apiProvider" = 'TEMPORARY_API'
    ORDER BY ve."surahNumber", ve."ayahNumber"
    LIMIT 1 OFFSET ${offset}
  `;

  return rows[0] ?? null;
}

export async function GET() {
  let surahNumber = 2;
  let ayahNumber  = 255;
  let translation = 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.';
  let surahName   = 'Al-Baqarah';

  try {
    const ayah = await getDailyAyah();
    if (ayah) {
      surahNumber = ayah.surahNumber;
      ayahNumber  = ayah.ayahNumber;
      translation = ayah.translationText ?? translation;
      surahName   = ayah.englishNameTranslation
        ? `${ayah.englishName} (${ayah.englishNameTranslation})`
        : (ayah.englishName ?? surahName);
    }
  } catch { /* use defaults */ }

  const displayTranslation =
    translation.length > 200 ? translation.slice(0, 197) + '…' : translation;

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0d2218 0%, #0a1a12 60%, #061410 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 80px',
          position: 'relative',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '700px', height: '350px',
          background: 'radial-gradient(ellipse at top, rgba(16,185,129,0.10) 0%, transparent 70%)',
        }} />

        {/* Top row: brand + date */}
        <div style={{
          position: 'absolute', top: '32px', left: 0, right: 0,
          padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ color: '#6ee7b7', fontSize: '16px', fontFamily: 'sans-serif', letterSpacing: '0.06em' }}>
              Verse of the Day
            </span>
          </div>
          <span style={{ color: '#065f46', fontSize: '14px', fontFamily: 'sans-serif' }}>{today}</span>
        </div>

        {/* Top rule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', marginBottom: '40px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(180,140,60,0.3)' }} />
          <span style={{ color: 'rgba(180,140,60,0.6)', fontSize: '18px' }}>*</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(180,140,60,0.3)' }} />
        </div>

        {/* Translation */}
        <p style={{
          color: '#d1fae5',
          fontSize: translation.length > 120 ? '28px' : '34px',
          lineHeight: 1.65,
          textAlign: 'center',
          fontStyle: 'italic',
          fontWeight: 300,
          marginBottom: '36px',
          width: '100%',
        }}>
          &ldquo;{displayTranslation}&rdquo;
        </p>

        {/* Bottom rule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', marginBottom: '28px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(180,140,60,0.3)' }} />
          <span style={{ color: 'rgba(180,140,60,0.6)', fontSize: '18px' }}>*</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(180,140,60,0.3)' }} />
        </div>

        {/* Reference + brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ color: '#6ee7b7', fontSize: '20px', fontFamily: 'sans-serif' }}>
            — {surahName}, {surahNumber}:{ayahNumber}
          </span>
          <span style={{ color: '#064e3b', fontSize: '18px', fontFamily: 'sans-serif', letterSpacing: '0.08em' }}>
            quran.co.in
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
