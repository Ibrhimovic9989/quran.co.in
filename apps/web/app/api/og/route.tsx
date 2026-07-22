// Dynamic OG image generation for Quran.co.in
// Used for /today and individual ayah sharing
// Route: /api/og?surah=2&ayah=255&arabic=...&translation=...&surahName=Al-Baqarah

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const surah      = searchParams.get('surah') ?? '';
  const ayah       = searchParams.get('ayah') ?? '';
  const arabic     = searchParams.get('arabic') ?? '';
  const translation = searchParams.get('translation') ?? '';
  const surahName  = searchParams.get('surahName') ?? '';
  const isToday    = searchParams.get('today') === '1';

  // Truncate long text for display
  const displayTranslation =
    translation.length > 220 ? translation.slice(0, 217) + '…' : translation;
  const displayArabic =
    arabic.length > 120 ? arabic.slice(0, 117) + '…' : arabic;

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
          padding: '60px 80px',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Subtle top glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(ellipse at top, rgba(16,185,129,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Brand tag */}
        <div
          style={{
            position: 'absolute',
            top: '32px',
            left: '48px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
            }}
          />
          <span style={{ color: '#6ee7b7', fontSize: '14px', fontFamily: 'sans-serif', letterSpacing: '0.05em' }}>
            {isToday ? 'Verse of the Day' : 'Quran.co.in'}
          </span>
        </div>

        {/* Top ornamental rule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', marginBottom: '32px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(180,140,60,0.25)' }} />
          <span style={{ color: 'rgba(180,140,60,0.5)', fontSize: '16px' }}>✦</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(180,140,60,0.25)' }} />
        </div>

        {/* Arabic text */}
        {displayArabic && (
          <p
            style={{
              color: '#fef3c7',
              fontSize: arabic.length > 80 ? '36px' : '44px',
              lineHeight: 1.9,
              textAlign: 'right',
              direction: 'rtl',
              width: '100%',
              marginBottom: '28px',
              fontFamily: 'serif',
            }}
          >
            {displayArabic}
          </p>
        )}

        {/* Translation */}
        {displayTranslation && (
          <p
            style={{
              color: '#d1fae5',
              fontSize: translation.length > 140 ? '22px' : '26px',
              lineHeight: 1.7,
              textAlign: 'center',
              fontStyle: 'italic',
              fontWeight: 300,
              marginBottom: '24px',
              width: '100%',
            }}
          >
            &ldquo;{displayTranslation}&rdquo;
          </p>
        )}

        {/* Bottom ornamental rule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(180,140,60,0.25)' }} />
          <span style={{ color: 'rgba(180,140,60,0.5)', fontSize: '16px' }}>✦</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(180,140,60,0.25)' }} />
        </div>

        {/* Reference + brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <span style={{ color: '#6ee7b7', fontSize: '18px', fontFamily: 'sans-serif' }}>
            — {surahName ? `${surahName}, ` : ''}{surah}:{ayah}
          </span>
          <span style={{ color: '#065f46', fontSize: '16px', fontFamily: 'sans-serif', letterSpacing: '0.08em' }}>
            quran.co.in
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
