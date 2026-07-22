// Hifz repeat-drill control — repeat each ayah N times with a silence gap.
// Lives in the surah "listen" pill; settings persist via the playback provider.

'use client';

import { useEffect, useRef, useState } from 'react';
import { Repeat } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useOptionalSurahPlayback } from './surah-playback-provider';

const COUNTS = [1, 3, 5, 10];
const GAPS = [0, 2, 5];

export function RepeatControl({ className }: { className?: string }) {
  const playback = useOptionalSurahPlayback();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  if (!playback) return null;
  const active = playback.repeatCount > 1;

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Repeat settings (memorization)"
        title="Repeat each ayah (hifz drill)"
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
          active
            ? 'bg-gold-soft/60 text-gold-text'
            : 'text-ink-muted hover:bg-accent-soft/60 hover:text-ink',
        )}
      >
        <span className="relative">
          <Repeat size={16} strokeWidth={2} aria-hidden />
          {active && (
            <span className="absolute -right-2 -top-1.5 text-[9px] font-bold">
              {playback.repeatCount}×
            </span>
          )}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-40 w-56 rounded-2xl border border-line bg-surface p-4 shadow-card-hover">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gold-text">
            Hifz drill
          </p>

          <p className="mb-1.5 text-xs text-ink-muted">Repeat each ayah</p>
          <div className="mb-3 flex gap-1.5">
            {COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => playback.setRepeatCount(n)}
                className={cn(
                  'flex-1 rounded-full px-2 py-1.5 text-xs font-semibold transition-colors',
                  playback.repeatCount === n
                    ? 'bg-accent text-white'
                    : 'bg-accent-soft/50 text-ink-soft hover:bg-accent-soft',
                )}
              >
                {n === 1 ? 'Off' : `${n}×`}
              </button>
            ))}
          </div>

          <p className="mb-1.5 text-xs text-ink-muted">Pause between repeats</p>
          <div className="flex gap-1.5">
            {GAPS.map((g) => (
              <button
                key={g}
                onClick={() => playback.setRepeatGap(g)}
                className={cn(
                  'flex-1 rounded-full px-2 py-1.5 text-xs font-semibold transition-colors',
                  playback.repeatGap === g
                    ? 'bg-accent text-white'
                    : 'bg-accent-soft/50 text-ink-soft hover:bg-accent-soft',
                )}
              >
                {g === 0 ? 'None' : `${g}s`}
              </button>
            ))}
          </div>

          <p className="mt-3 border-t border-line-soft pt-2 text-[11px] leading-relaxed text-ink-muted">
            Echo-recitation: listen, then repeat aloud in the gap.
          </p>
        </div>
      )}
    </div>
  );
}
