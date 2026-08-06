'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  type AskAccess,
  getAskAccess,
  requestAskAccess,
} from '@/lib/api/ask-access';

// The Ask (AI) endpoint has real per-call cost, so third-party access to it is
// granted by hand. This card lets a developer request it and shows their state.
export function AskAccessCard() {
  const [state, setState] = useState<AskAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [useCase, setUseCase] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setState(await getAskAccess());
    } catch {
      // leave null — card still renders the request form
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || useCase.trim().length < 20) return;
    setSubmitting(true);
    setError(null);
    try {
      setState(await requestAskAccess(useCase.trim()));
      setUseCase('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const status = state?.askAccess ?? 'none';

  return (
    <section className="mt-8 rounded-xl border border-line bg-surface-warm p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h2 className="font-semibold text-ink">Ask (AI) access</h2>
        </div>
        {status === 'approved' && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
            <CheckCircle2 className="h-3.5 w-3.5" /> Approved
          </span>
        )}
        {status === 'pending' && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-1 text-xs font-semibold text-gold-text">
            <Clock className="h-3.5 w-3.5" /> Pending review
          </span>
        )}
      </div>

      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
        The <span className="font-medium text-ink">Ask</span> endpoint answers
        questions with AI over the Qurʼan — it has real per-call cost, so API
        access to it is granted by hand. The public read endpoints don’t need
        this.
      </p>

      {loading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking your status…
        </div>
      ) : status === 'approved' ? (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-line bg-surface p-4 text-sm text-ink-soft">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span>
            Your account is approved. Any API key you own can now call{' '}
            <code className="rounded bg-line-soft px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
              POST /api/quran/ask
            </code>
            . Please keep within fair use.
          </span>
        </div>
      ) : status === 'pending' ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4 text-sm text-ink-soft">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-text" />
            <span>
              Thanks — your request is in the queue. We review these manually and
              you’ll be enabled here once approved.
            </span>
          </div>
          {state?.askUseCase && (
            <p className="text-xs leading-relaxed text-muted">
              <span className="font-medium text-ink-soft">Your use-case:</span>{' '}
              {state.askUseCase}
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3">
          {status === 'denied' && (
            <div className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4 text-sm text-ink-soft">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <span>
                A previous request wasn’t approved. You’re welcome to submit an
                updated use-case below.
              </span>
            </div>
          )}
          <label
            htmlFor="ask-usecase"
            className="block text-xs font-semibold uppercase tracking-wide text-muted"
          >
            What will you build, and roughly how much traffic?
          </label>
          <textarea
            id="ask-usecase"
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="e.g. A Ramadan study bot for my community WhatsApp group — a few hundred questions a day, cited answers only."
            className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-[var(--accent-ring)]"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted">
              {useCase.trim().length < 20
                ? `${20 - useCase.trim().length} more characters`
                : 'Looks good'}
            </span>
            <button
              type="submit"
              disabled={submitting || useCase.trim().length < 20}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Request access
            </button>
          </div>
          {error && (
            <p className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
