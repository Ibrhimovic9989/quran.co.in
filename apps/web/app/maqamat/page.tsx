'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Square, ArrowRight, AudioLines } from 'lucide-react';
import {
  MAQAMAT, maqamAudioUrl, MAQAM_COMPARISON, COMPARISON_PASSAGE,
  type Maqam,
} from '@/lib/data/maqamat';

export default function MaqamatPage() {
  // A single shared audio element; `playingKey` identifies which control owns it
  // ('cmp:<maqam>' for the comparison chips, or a card index).
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = (key: string, primary: string, fallback?: string, label?: string) => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    if (playingKey === key) {
      audio.pause();
      setPlayingKey(null);
      setNowPlaying(null);
      return;
    }
    setPlayingKey(key);
    setNowPlaying(label ?? null);
    audio.onended = () => { setPlayingKey(null); setNowPlaying(null); };
    const start = (src: string, onFail?: () => void) => {
      audio.src = src;
      audio.play().catch(() => (onFail ? onFail() : (setPlayingKey(null), setNowPlaying(null))));
    };
    start(primary, fallback ? () => start(fallback) : undefined);
  };

  return (
    <main className="min-h-screen bg-paper pb-24 pt-8 md:pt-12">
      <div className="mx-auto max-w-3xl px-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-text">
          The melodies of recitation
        </p>
        <h1 className="mt-2 font-reading text-3xl font-bold text-ink md:text-4xl">Maqāmāt</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
          Maqāmāt are the melodic modes a reciter moves through — each carries a different
          emotional colour. Once you read with tajwīd, these are how recitation becomes beautiful.
          (Maqām describes the melody; reciters move freely between modes.)
        </p>

        {/* The centerpiece: one sūrah, every mode */}
        <div className="mt-8 rounded-2xl border border-night-gold/30 bg-[#0C1F1A] p-6 md:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-night-gold">Hear the difference</p>
          <h2 className="mt-2 font-arabic text-2xl text-[#F3EDD9]" dir="ltr">{COMPARISON_PASSAGE}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#CFE8DD]">
            The same sūrah, eight melodies. Tap each mode and hear how the tune — not the words —
            changes the feeling.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {MAQAM_COMPARISON.map((c) => {
              const key = `cmp:${c.maqam}`;
              const active = playingKey === key;
              return (
                <button
                  key={c.maqam}
                  onClick={() => play(key, c.primaryUrl, c.fallbackUrl, `${c.maqam} · ${c.reciter}`)}
                  className={
                    'flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ' +
                    (active
                      ? 'border-night-gold bg-night-gold text-[#0C1F1A]'
                      : 'border-night-gold/40 bg-[#16302A] text-[#F3EDD9] hover:border-night-gold')
                  }
                >
                  {active ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {c.maqam}
                </button>
              );
            })}
          </div>
          {nowPlaying && (
            <div className="mt-4 flex items-center gap-2 text-xs text-[#CFE8DD]">
              <AudioLines className="h-4 w-4 text-night-gold" />
              Now playing · {nowPlaying}
            </div>
          )}
        </div>

        <p className="mt-10 text-xs font-bold uppercase tracking-widest text-gold-text">Each mode</p>
        <div className="mt-4 space-y-5">
          {MAQAMAT.map((m, i) => (
            <MaqamCard
              key={m.name}
              m={m}
              playing={playingKey === `card:${i}`}
              onToggle={() => play(`card:${i}`, maqamAudioUrl(m), undefined, `${m.name} · ${m.reciter}`)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function MaqamCard({ m, playing, onToggle }: { m: Maqam; playing: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink">{m.name}</h2>
          <p className="mt-0.5 text-sm font-semibold text-accent">{m.mood}</p>
        </div>
        <span className="font-arabic text-3xl text-gold-text" dir="rtl">{m.arabic}</span>
      </div>

      <p className="mt-3 leading-relaxed text-ink-soft">{m.character}</p>
      <p className="mt-2 text-sm text-ink-muted">
        <span className="font-semibold">Often used for:</span> {m.whenUsed}
      </p>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-accent-soft/40 p-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-ink">{m.reciter}</div>
          <div className="text-xs text-ink-muted">{m.surahName} · {m.surah}:{m.ayah}</div>
        </div>
        <button
          onClick={onToggle}
          aria-label={playing ? 'Stop' : 'Play example'}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent/90"
        >
          {playing ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      </div>

      <Link
        href={`/quran/${m.surah}?ayah=${m.ayah}`}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
      >
        Read in context <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
