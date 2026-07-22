// Dynamic OG image for /ask — renders Q&A as a shareable card
// Accepts POST { question, answer } and returns a 1200×630 PNG

import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question: string = (body.question ?? '').slice(0, 120);
    const answer: string = (body.answer ?? '').slice(0, 320);

    if (!question || !answer) {
      return NextResponse.json({ error: 'question and answer required' }, { status: 400 });
    }

    const displayAnswer = answer.length >= 320 ? answer.slice(0, 317) + '…' : answer;

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            background: 'linear-gradient(135deg, #1e1030 0%, #18082a 50%, #0f0520 100%)',
            display: 'flex',
            flexDirection: 'column',
            padding: '56px 72px',
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
                'radial-gradient(ellipse at top, rgba(147,51,234,0.12) 0%, transparent 70%)',
            }}
          />

          {/* Top row: brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#a855f7',
                }}
              />
              <span
                style={{
                  color: '#c4b5fd',
                  fontSize: '15px',
                  fontFamily: 'sans-serif',
                  letterSpacing: '0.06em',
                }}
              >
                Ask the Quran
              </span>
            </div>
            <span
              style={{
                color: '#581c87',
                fontSize: '14px',
                fontFamily: 'sans-serif',
                letterSpacing: '0.08em',
              }}
            >
              quran.co.in/ask
            </span>
          </div>

          {/* Question */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '28px',
            }}
          >
            <div
              style={{
                background: '#7c3aed',
                borderRadius: '12px',
                padding: '4px 10px',
                display: 'flex',
              }}
            >
              <span
                style={{
                  color: '#fff',
                  fontSize: '13px',
                  fontFamily: 'sans-serif',
                  fontWeight: 700,
                }}
              >
                Q
              </span>
            </div>
            <p
              style={{
                color: '#e9d5ff',
                fontSize: '22px',
                lineHeight: 1.5,
                fontWeight: 600,
                fontFamily: 'sans-serif',
              }}
            >
              {question}
            </p>
          </div>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              marginBottom: '24px',
            }}
          >
            <div
              style={{ flex: 1, height: '1px', background: 'rgba(147,51,234,0.25)' }}
            />
            <span style={{ color: 'rgba(147,51,234,0.4)', fontSize: '14px' }}>✦</span>
            <div
              style={{ flex: 1, height: '1px', background: 'rgba(147,51,234,0.25)' }}
            />
          </div>

          {/* Answer */}
          <p
            style={{
              color: '#f3e8ff',
              fontSize: answer.length > 200 ? '20px' : '24px',
              lineHeight: 1.7,
              fontWeight: 300,
              flex: 1,
            }}
          >
            {displayAnswer}
          </p>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '20px',
            }}
          >
            <span
              style={{
                color: '#7c3aed',
                fontSize: '14px',
                fontFamily: 'sans-serif',
              }}
            >
              Answers sourced from the Holy Quran
            </span>
            <span
              style={{
                color: '#c4b5fd',
                fontSize: '16px',
                fontFamily: 'sans-serif',
                fontWeight: 600,
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
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
