'use client';

// A slim, dismissible announcement banner for the "Build on Quran.co.in Stack"
// developer series. Clicking it opens the intro reel in a modal.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Sparkles, X } from 'lucide-react';

const DISMISS_KEY = 'dev-reel-dismissed-v1';

export function DevReelBanner() {
  const [dismissed, setDismissed] = useState(true); // hidden until we read localStorage (no flash)
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // When the modal opens: play from the start, lock scroll, allow Esc to close.
  useEffect(() => {
    if (!open) return;
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      void v.play().catch(() => {
        /* autoplay-with-sound may be blocked — the controls let the user start it */
      });
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      videoRef.current?.pause();
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
      <div className="relative z-30 w-full border-b border-line bg-gradient-to-r from-accent-soft via-gold-soft to-accent-soft">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group mx-auto flex w-full max-w-4xl items-center justify-center gap-3 px-10 py-2.5 text-center text-sm"
        >
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-white">
            <Play className="h-3 w-3 fill-current" />
          </span>
          <span className="text-ink">
            <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-gold-text" aria-hidden />
            <span className="font-medium">Developers — stay tuned.</span>{' '}
            The <b className="font-semibold">Build on Quran.co.in Stack</b> series is coming.{' '}
            <span className="font-semibold text-accent underline-offset-2 group-hover:underline">
              Watch the intro →
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink-soft transition-colors hover:bg-line-soft hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div
          className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Build on Quran.co.in Stack — intro"
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={close}
              aria-label="Close video"
              className="absolute -top-12 right-0 inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" /> Close
            </button>
            <video
              ref={videoRef}
              src="/build-on-stack.mp4"
              controls
              playsInline
              className="h-[86vh] max-h-[86vh] w-auto max-w-full rounded-2xl bg-black shadow-2xl"
              style={{ aspectRatio: '9 / 16' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
