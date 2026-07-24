'use client';

// SVG pitch-ribbon — draws a maqām's melodic shape over three register bands.
// Mirrors the Flutter MaqamRibbon. Dots sized by loudness; active phrase glows;
// a playhead marks progress.

import type { LessonPhrase } from '@/lib/data/maqam-lessons';

const GOLD = '#D9B45C';
const BRIGHT = '#E3C97E';

export function MaqamRibbon({
  phrases, activeIndex = -1, height = 180, userContour, userColor = '#34B18A',
}: {
  phrases: LessonPhrase[];
  activeIndex?: number;
  height?: number;
  userContour?: number[]; // learner's pitch as 0..1 levels over progress
  userColor?: string;
}) {
  const W = 340, padL = 44, padR = 20, padT = 18, padB = 20;
  const chartW = W - padL - padR, chartH = height - padT - padB;
  const n = phrases.length;
  const X = (i: number) => padL + (n === 1 ? chartW / 2 : (chartW * i) / (n - 1));
  const Y = (p: number) => padT + chartH * (1 - p);
  const pts = phrases.map((ph, i) => [X(i), Y(ph.pitch)] as [number, number]);

  // Catmull-Rom → cubic bézier for a smooth contour.
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }

  const bands = ['high', 'mid', 'low'];

  return (
    <svg viewBox={`0 0 ${W} ${height}`} width="100%" style={{ display: 'block' }} role="img" aria-label="maqam pitch shape">
      <rect x="0" y="0" width={W} height={height} rx="18" fill="#0C1F1A" />
      {bands.map((label, b) => {
        const y = padT + chartH * (b / 3) + chartH / 6;
        return (
          <g key={label}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            <text x="10" y={y + 3} fill="rgba(255,255,255,0.4)" fontSize="10">{label}</text>
          </g>
        );
      })}
      {/* glow + line */}
      <path d={d} fill="none" stroke={GOLD} strokeOpacity="0.25" strokeWidth="10" strokeLinecap="round" />
      <path d={d} fill="none" stroke={BRIGHT} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* playhead */}
      {activeIndex >= 0 && activeIndex < n && (
        <line x1={X(activeIndex)} y1={padT - 6} x2={X(activeIndex)} y2={height - padB + 6}
          stroke={GOLD} strokeOpacity="0.5" strokeWidth="1.5" />
      )}
      {/* learner's live pitch line */}
      {userContour && userContour.length > 1 && (
        <polyline
          fill="none"
          stroke={userColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.9"
          points={userContour
            .map((lv, i) => {
              const x = padL + (chartW * i) / (userContour.length - 1);
              return `${x},${Y(lv)}`;
            })
            .join(' ')}
        />
      )}
      {/* phrase dots */}
      {pts.map((p, i) => {
        const active = i === activeIndex;
        const r = 3 + phrases[i].dynamic * 4;
        return (
          <g key={i}>
            {active && <circle cx={p[0]} cy={p[1]} r={r + 6} fill={GOLD} fillOpacity="0.35" />}
            <circle cx={p[0]} cy={p[1]} r={r} fill={active ? '#F3EDD9' : GOLD} fillOpacity={active ? 1 : 0.85} />
          </g>
        );
      })}
    </svg>
  );
}
