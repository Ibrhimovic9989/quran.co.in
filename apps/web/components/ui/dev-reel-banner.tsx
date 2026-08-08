'use client';

// A slim, dismissible announcement banner for the "Build on Quran.co.in Stack"
// developer series. Clicking it opens the intro reel in a modal, where visitors
// can also subscribe to be notified for each of the 4 drops.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Loader2, Play, Sparkles, X } from 'lucide-react';
import { backendUrl } from '@/lib/api/backend';

const DISMISS_KEY = 'dev-reel-dismissed-v1';

export function DevReelBanner() {
  const [dismissed, setDismissed] = useState(true); // hidden until we read localStorage (no flash)
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

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
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      void v.play().catch(() => {});
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

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setMsg('');
    try {
      const res = await fetch(backendUrl('/api/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'web' }),
      });
      if (res.ok) {
        setStatus('done');
      } else {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus('error');
        setMsg(body.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMsg('Network error — please try again.');
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
          className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Build on Quran.co.in Stack — intro"
        >
          <div
            className="relative flex flex-col items-center gap-4 py-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close video"
              className="absolute right-0 top-0 inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" /> Close
            </button>

            <video
              ref={videoRef}
              src="/build-on-stack.mp4"
              controls
              playsInline
              className="mt-8 max-h-[72vh] w-auto max-w-full rounded-2xl bg-black shadow-2xl"
              style={{ aspectRatio: '9 / 16' }}
            />

            {/* Notify me — subscribe for each of the 4 drops */}
            <div className="w-full max-w-sm text-center">
              {status === 'done' ? (
                <p className="inline-flex items-center gap-2 text-sm font-medium text-white">
                  <Check className="h-4 w-4 text-emerald-400" />
                  You&apos;re on the list — we&apos;ll email you each drop.
                </p>
              ) : (
                <>
                  <p className="mb-2 text-xs uppercase tracking-wide text-white/60">
                    Get notified for each of the 4 drops
                  </p>
                  <form onSubmit={subscribe} className="flex items-center gap-2">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="min-w-0 flex-1 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/45 focus:border-white/60"
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
                    >
                      {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Notify me
                    </button>
                  </form>
                  {status === 'error' && <p className="mt-2 text-xs text-red-300">{msg}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
