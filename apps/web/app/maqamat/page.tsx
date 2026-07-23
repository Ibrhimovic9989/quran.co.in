'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Square, ArrowRight } from 'lucide-react';
import { MAQAMAT, maqamAudioUrl, type Maqam } from '@/lib/data/maqamat';

export default function MaqamatPage() {
  const [playing, setPlaying] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = (i: number) => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    if (playing === i) {
      audio.pause();
      setPlaying(null);
      return;
    }
    audio.src = maqamAudioUrl(MAQAMAT[i]);
    audio.onended = () => setPlaying(null);
    audio.play().then(() => setPlaying(i)).catch(() => setPlaying(null));
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
          Listen to each, then try to imitate it. (Maqām describes the melody; reciters move freely
          between modes.)
        </p>

        <div className="mt-8 space-y-5">
          {MAQAMAT.map((m, i) => (
            <MaqamCard key={m.name} m={m} playing={playing === i} onToggle={() => toggle(i)} />
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
