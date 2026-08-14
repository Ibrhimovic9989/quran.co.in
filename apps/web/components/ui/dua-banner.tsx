'use client';

// A dignified duʿā request for Ḥāfiẓ Umar and his family. A quiet banner that
// opens a modal with the message and duʿās. Only Ḥāfiẓ Umar is named; his
// mother and sister are referred to without names, out of respect.
import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';

const DISMISS_KEY = 'dua-hafiz-umar-v1';

export function DuaBanner() {
  const [dismissed, setDismissed] = useState(true); // hidden until localStorage read
  const [open, setOpen] = useState(false);
  const [ameen, setAmeen] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  if (dismissed) return null;

  return (
    <>
      <div className="relative z-30 w-full border-b border-line bg-surface-warm">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group mx-auto flex w-full max-w-4xl items-center justify-center gap-2.5 px-10 py-2.5 text-center text-sm text-ink-soft"
        >
          <span aria-hidden className="text-base leading-none">🤲</span>
          <span>
            Please make duʿā for <b className="font-semibold text-ink">Ḥāfiẓ Umar</b> and his family.{' '}
            <span className="italic text-muted">Innā lillāhi wa innā ilayhi rājiʿūn.</span>{' '}
            <span className="font-semibold text-accent underline-offset-2 group-hover:underline">
              Make duʿā →
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted transition-colors hover:bg-line-soft hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div
          className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="A moment of duʿā"
        >
          <div
            className="relative my-8 w-full max-w-lg rounded-2xl border border-line bg-surface p-8 text-center shadow-2xl sm:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted transition-colors hover:bg-line-soft hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="font-arabic text-3xl leading-[1.9] text-ink">
              إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
            </p>
            <p className="mt-2 font-reading text-sm italic text-ink-muted">
              To Allah we belong, and to Him we return.
            </p>

            <div className="ayah-divider mx-auto my-7 w-40" />

            <p className="font-reading text-base leading-relaxed text-ink-soft">
              <b className="text-ink">Ḥāfiẓ Umar</b> — a young ḥāfiẓ of the Holy Qurʼān from
              Hyderabad — together with his <b className="text-ink">mother</b> and{' '}
              <b className="text-ink">sister</b>, returned to Allah in a road accident. His father
              and younger sister survived and are recovering. Please take a moment to remember them
              in your duʿās.
            </p>

            <div className="mt-7 rounded-xl border border-line bg-surface-warm p-5">
              <p className="font-arabic text-2xl leading-[2] text-ink">
                اللَّهُمَّ اغْفِرْ لَهُمْ وَارْحَمْهُمْ وَأَدْخِلْهُمُ الْجَنَّةَ
              </p>
              <p className="mt-2 font-reading text-sm italic text-ink-muted">
                O Allah, forgive them, have mercy on them, and admit them into Paradise. Grant their
                family patience, and a complete recovery to those who survived.
              </p>
            </div>

            {ameen ? (
              <p className="mt-7 font-reading text-base font-medium text-accent">
                Āmīn. Jazāk Allāhu khayran for your duʿā. 🤍
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setAmeen(true)}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-accent-strong"
              >
                🤲 Āmīn
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
