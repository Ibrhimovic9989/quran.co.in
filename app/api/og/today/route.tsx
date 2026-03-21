// Dynamic OG image for /today — fetches today's ayah and renders it
// Edge runtime: calls internal API then renders via ImageResponse

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Cache for 1 hour — same ayah all day, no need to regenerate on every share
export const revalidate = 3600;

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;

    // Fetch today's ayah from our own API (Node.js runtime, has Prisma)
    const res = await fetch(`${origin}/api/quran/ayah-of-the-day`, {
      next: { revalidate: 3600 },
    });

    let surahNumber = 2;
    let ayahNumber = 255;
    let translation = 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.';
    let surahName = 'Al-Baqarah';

    if (res.ok) {
      const data = await res.json();
      const ayah = data.ayah;
      if (ayah) {
        surahNumber = ayah.surahNumber;
        ayahNumber  = ayah.ayahNumber;
        translation = ayah.translationText ?? translation;
        surahName   = ayah.englishNameTranslation
          ? `${ayah.englishName} (${ayah.englishNameTranslation})`
          : ayah.englishName ?? surahName;
      }
    }

    const displayTranslation =
      translation.length > 200 ? translation.slice(0, 197) + '…' : translation;

    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
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
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '700px',
              height: '350px',
              background:
                'radial-gradient(ellipse at top, rgba(16,185,129,0.10) 0%, transparent 70%)',
            }}
          />

          {/* Top row: brand + date */}
          <div
            style={{
              position: 'absolute',
              top: '32px',
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
                  fontSize: '16px',
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
                fontSize: '14px',
                fontFamily: 'sans-serif',
              }}
            >
              {today}
            </span>
          </div>

          {/* Top rule */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              width: '100%',
              marginBottom: '40px',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'rgba(180,140,60,0.3)' }} />
            <span style={{ color: 'rgba(180,140,60,0.6)', fontSize: '18px' }}>✦</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(180,140,60,0.3)' }} />
          </div>

          {/* Translation quote */}
          <p
            style={{
              color: '#d1fae5',
              fontSize: translation.length > 120 ? '28px' : '34px',
              lineHeight: 1.65,
              textAlign: 'center',
              fontStyle: 'italic',
              fontWeight: 300,
              marginBottom: '36px',
              width: '100%',
            }}
          >
            &ldquo;{displayTranslation}&rdquo;
          </p>

          {/* Bottom rule */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              width: '100%',
              marginBottom: '28px',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'rgba(180,140,60,0.3)' }} />
            <span style={{ color: 'rgba(180,140,60,0.6)', fontSize: '18px' }}>✦</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(180,140,60,0.3)' }} />
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
            <span
              style={{
                color: '#6ee7b7',
                fontSize: '20px',
                fontFamily: 'sans-serif',
              }}
            >
              — {surahName}, {surahNumber}:{ayahNumber}
            </span>
            <span
              style={{
                color: '#064e3b',
                fontSize: '18px',
                fontFamily: 'sans-serif',
                letterSpacing: '0.08em',
              }}
            >
              quran.co.in
            </span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch {
    // Fallback: plain branded image
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            background: '#0d2218',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#6ee7b7', fontSize: '40px', fontFamily: 'sans-serif' }}>
            Quran.co.in — Verse of the Day
          </span>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
