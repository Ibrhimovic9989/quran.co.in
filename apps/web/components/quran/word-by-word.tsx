// Word-by-word interlinear layer.
// Every Arabic word carries its gloss beneath; tap a word to hear its
// pronunciation and see the transliteration. (The pattern ~82M quran.com
// users rely on — rendered here with the authentic Hafs script.)

'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface WbwWord {
  position: number;
  charType: string;
  arabic: string;
  translation: string | null;
  transliteration: string | null;
  audioUrl: string | null;
}

const WORD_AUDIO_BASE = 'https://audio.qurancdn.com/';

// One shared element so taps never overlap audio.
let sharedWordAudio: HTMLAudioElement | null = null;
function playWord(url: string | null) {
  if (!url) return;
  if (!sharedWordAudio) sharedWordAudio = new Audio();
  sharedWordAudio.pause();
  sharedWordAudio.src = url.startsWith('http') ? url : WORD_AUDIO_BASE + url;
  sharedWordAudio.play().catch(() => {
    /* autoplay/abort — ignore */
  });
}

export function WordByWordText({
  words,
  className,
}: {
  words: WbwWord[];
  className?: string;
}) {
  const [openPos, setOpenPos] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (openPos === null) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenPos(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [openPos]);

  return (
    <div
      ref={rootRef}
      dir="rtl"
      lang="ar"
      className={cn('flex flex-wrap items-start gap-x-1 gap-y-3', className)}
    >
      {words.map((w) =>
        w.charType === 'end' ? (
          // Verse-end marker glyph (Arabic ayah numeral) — gold, unclickable
          <span
            key={w.position}
            className="ayah-end select-none self-center px-1 font-arabic text-[1.4rem] md:text-[1.8rem]"
            aria-hidden
          >
            {w.arabic}
          </span>
        ) : (
          <span key={w.position} className="relative">
            <button
              onClick={() => {
                setOpenPos(openPos === w.position ? null : w.position);
                playWord(w.audioUrl);
              }}
              className={cn(
                'flex flex-col items-center rounded-xl px-1.5 py-1 transition-colors',
                openPos === w.position ? 'bg-accent-soft' : 'hover:bg-accent-soft/50',
              )}
            >
              <span className="font-arabic text-[1.65rem] leading-[1.8] text-ink md:text-[2rem] md:leading-[1.9]">
                {w.arabic}
              </span>
              {w.translation && (
                <span
                  dir="ltr"
                  lang="en"
                  className="mt-0.5 max-w-[8.5rem] text-center text-[10px] leading-tight text-ink-muted md:text-[11px]"
                >
                  {w.translation}
                </span>
              )}
            </button>

            {openPos === w.position && (
              <div
                dir="ltr"
                className="absolute left-1/2 top-full z-30 mt-1 w-max min-w-[8rem] max-w-[14rem] -translate-x-1/2 rounded-xl border border-line bg-surface px-3 py-2 text-center shadow-card-hover"
              >
                {w.transliteration && (
                  <p className="font-reading text-sm italic text-gold-text">{w.transliteration}</p>
                )}
                {w.translation && (
                  <p className="mt-0.5 font-reading text-xs text-ink-soft">{w.translation}</p>
                )}
              </div>
            )}
          </span>
        ),
      )}
    </div>
  );
}
