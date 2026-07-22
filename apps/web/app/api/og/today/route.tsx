// Dynamic OG image for /today — renders Arabic + English translation
// GET: fetches daily ayah via Prisma (for crawlers / meta tags)
// POST: uses provided data (for "Share as Image" button — matches what user sees)

import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';
export const revalidate = 3600;

const prisma = new PrismaClient();

// Google Fonts CDN — Amiri Regular (Arabic Quran font)
const AMIRI_FONT_URL =
  'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUpvrIw74NL.ttf';

let fontCache: ArrayBuffer | null = null;
async function loadArabicFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  const res = await fetch(AMIRI_FONT_URL);
  fontCache = await res.arrayBuffer();
  return fontCache;
}

interface AyahData {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translation: string;
  surahName: string;
}

async function getDailyAyah(): Promise<AyahData | null> {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalAyahs = await prisma.verseEmbedding.count();
  const offset = dayOfYear % totalAyahs;

  const rows = await prisma.$queryRaw<
    {
      surahNumber: number;
      ayahNumber: number;
      arabicText: string;
      translationText: string | null;
      englishName: string;
      englishNameTranslation: string | null;
    }[]
  >`
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

  const r = rows[0];
  if (!r) return null;
  return {
    surahNumber: r.surahNumber,
    ayahNumber: r.ayahNumber,
    arabicText: r.arabicText,
    translation: r.translationText ?? '',
    surahName: r.englishNameTranslation
      ? `${r.englishName} (${r.englishNameTranslation})`
      : r.englishName,
  };
}

function renderCard(ayah: AyahData, fontData: ArrayBuffer) {
  const { surahNumber, ayahNumber, arabicText, translation, surahName } = ayah;

  // Truncate for image space
  const maxArabic = 180;
  const displayArabic =
    arabicText.length > maxArabic
      ? arabicText.slice(0, maxArabic - 1) + '…'
      : arabicText;

  const maxTranslation = 240;
  const displayTranslation =
    translation.length > maxTranslation
      ? translation.slice(0, maxTranslation - 1) + '…'
      : translation;

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const arabicFontSize = displayArabic.length > 100 ? '28px' : '36px';
  const translationFontSize = displayTranslation.length > 140 ? '20px' : '24px';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background:
            'linear-gradient(135deg, #0d2218 0%, #0a1a12 60%, #061410 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 72px',
          position: 'relative',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '700px',
            height: '300px',
            background:
              'radial-gradient(ellipse at top, rgba(16,185,129,0.10) 0%, transparent 70%)',
          }}
        />

        {/* Top bar: brand + date */}
        <div
          style={{
            position: 'absolute',
            top: '28px',
            left: 0,
            right: 0,
            padding: '0 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10b981',
              }}
            />
            <span
              style={{
                color: '#6ee7b7',
                fontSize: '15px',
                fontFamily: 'sans-serif',
                letterSpacing: '0.06em',
              }}
            >
              Verse of the Day
            </span>
          </div>
          <span
            style={{
              color: '#065f46',
              fontSize: '13px',
              fontFamily: 'sans-serif',
            }}
          >
            {today}
          </span>
        </div>

        {/* Arabic text */}
        <p
          style={{
            fontFamily: 'Amiri',
            fontSize: arabicFontSize,
            lineHeight: 1.9,
            color: '#fde68a',
            textAlign: 'center',
            direction: 'rtl',
            marginBottom: '16px',
            width: '100%',
          }}
        >
          {displayArabic}
        </p>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            width: '100%',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              flex: 1,
              height: '1px',
              background: 'rgba(180,140,60,0.3)',
            }}
          />
          <span style={{ color: 'rgba(180,140,60,0.5)', fontSize: '14px' }}>
            ✦
          </span>
          <div
            style={{
              flex: 1,
              height: '1px',
              background: 'rgba(180,140,60,0.3)',
            }}
          />
        </div>

        {/* English translation */}
        <p
          style={{
            color: '#d1fae5',
            fontSize: translationFontSize,
            lineHeight: 1.6,
            textAlign: 'center',
            fontStyle: 'italic',
            fontWeight: 300,
            marginBottom: '24px',
            width: '100%',
          }}
        >
          &ldquo;{displayTranslation}&rdquo;
        </p>

        {/* Reference + brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            position: 'absolute',
            bottom: '28px',
            left: 0,
            right: 0,
            padding: '0 48px',
          }}
        >
          <span
            style={{
              color: '#6ee7b7',
              fontSize: '18px',
              fontFamily: 'sans-serif',
            }}
          >
            — {surahName}, {surahNumber}:{ayahNumber}
          </span>
          <span
            style={{
              color: '#064e3b',
              fontSize: '16px',
              fontFamily: 'sans-serif',
              letterSpacing: '0.08em',
            }}
          >
            quran.co.in
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Amiri',
          data: fontData,
          weight: 400 as const,
          style: 'normal' as const,
        },
      ],
    }
  );
}

// GET — for crawlers / OG meta
export async function GET() {
  try {
    const [fontData, ayah] = await Promise.all([
      loadArabicFont(),
      getDailyAyah(),
    ]);

    const data: AyahData = ayah ?? {
      surahNumber: 2,
      ayahNumber: 255,
      arabicText:
        'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
      translation:
        'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.',
      surahName: 'Al-Baqarah (The Cow)',
    };

    return renderCard(data, fontData);
  } catch {
    return new Response('Image generation failed', { status: 500 });
  }
}

// POST — for "Share as Image" button (sends actual ayah data from the page)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { arabicText, translationText, surahNumber, ayahNumber, englishName, englishNameTranslation } = body;

    if (!arabicText || !surahNumber) {
      return NextResponse.json({ error: 'arabicText and surahNumber are required' }, { status: 400 });
    }

    const fontData = await loadArabicFont();

    const data: AyahData = {
      surahNumber,
      ayahNumber: ayahNumber ?? 1,
      arabicText,
      translation: translationText ?? '',
      surahName: englishNameTranslation
        ? `${englishName} (${englishNameTranslation})`
        : (englishName ?? `Surah ${surahNumber}`),
    };

    return renderCard(data, fontData);
  } catch {
    return new Response('Image generation failed', { status: 500 });
  }
}
