// Mushaf page navigation — RTL book order (next page turns leftward),
// keyboard arrows, and a jump-to-page control.

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MushafPageNav({ page, surahs }: { page: number; surahs: string[] }) {
  const router = useRouter();
  const [jump, setJump] = useState('');

  const prev = page > 1 ? page - 1 : null;
  const next = page < 604 ? page + 1 : null;

  // Arrow keys: ← = next (turn the page leftward, RTL), → = previous
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft' && next) router.push(`/mushaf/${next}`);
      if (e.key === 'ArrowRight' && prev) router.push(`/mushaf/${prev}`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router, prev, next]);

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(jump, 10);
    if (n >= 1 && n <= 604) router.push(`/mushaf/${n}`);
  };

  return (
    <div className="mt-5 flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        {/* next page sits on the LEFT — Arabic book direction */}
        {next ? (
          <Link
            href={`/mushaf/${next}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-soft shadow-card transition-colors hover:border-gold/50 hover:text-ink"
            aria-label={`Page ${next}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : (
          <span className="h-10 w-10" />
        )}

        <form onSubmit={go} className="flex items-center gap-1.5 text-sm text-ink-muted">
          <span>Page</span>
          <input
            value={jump}
            onChange={(e) => setJump(e.target.value)}
            placeholder={String(page)}
            inputMode="numeric"
            className="h-9 w-16 rounded-full border border-line bg-surface px-3 text-center text-sm text-ink focus:border-accent focus:outline-none"
            aria-label="Jump to page"
          />
          <span>of 604</span>
        </form>

        {prev ? (
          <Link
            href={`/mushaf/${prev}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-soft shadow-card transition-colors hover:border-gold/50 hover:text-ink"
            aria-label={`Page ${prev}`}
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        ) : (
          <span className="h-10 w-10" />
        )}
      </div>

      <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
        {surahs.join(' · ')}
      </p>
    </div>
  );
}
