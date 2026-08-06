'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, ShieldCheck, X } from 'lucide-react';
import {
  type AskRequestRow,
  decideAskAccess,
  listAskRequests,
} from '@/lib/api/ask-access';
import { cn } from '@/lib/utils/cn';

// Owner-only panel to approve/deny Ask access requests. listAskRequests()
// returns null for non-admins (403), so this renders nothing for them.
export function AskAdminPanel() {
  const [rows, setRows] = useState<AskRequestRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRows(await listAskRequests());
    } catch {
      setRows(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (row: AskRequestRow, decision: 'approved' | 'denied') => {
    setBusyId(row.id);
    try {
      await decideAskAccess(row.id, decision);
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to record decision.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading || rows === null) return null; // not an admin, or still checking

  const pending = rows.filter((r) => r.askAccess === 'pending');

  return (
    <section className="mt-10 rounded-xl border border-accent/30 bg-surface p-6 shadow-card">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-accent" />
        <h2 className="font-semibold text-ink">Ask access requests</h2>
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">
          admin
        </span>
        {pending.length > 0 && (
          <span className="ml-auto rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-semibold text-gold-text">
            {pending.length} pending
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">No requests yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-lg border border-line bg-surface-warm p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    {row.name}{' '}
                    <span className="font-normal text-muted">· {row.email}</span>
                  </p>
                  {row.askUseCase && (
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {row.askUseCase}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
                      row.askAccess === 'approved'
                        ? 'bg-accent-soft text-accent'
                        : row.askAccess === 'pending'
                          ? 'bg-gold-soft text-gold-text'
                          : 'bg-line-soft text-muted',
                    )}
                  >
                    {row.askAccess}
                  </span>
                  {row.askAccess !== 'approved' && (
                    <button
                      onClick={() => decide(row, 'approved')}
                      disabled={busyId === row.id}
                      className="inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-50"
                    >
                      {busyId === row.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Approve
                    </button>
                  )}
                  {row.askAccess !== 'denied' && (
                    <button
                      onClick={() => decide(row, 'denied')}
                      disabled={busyId === row.id}
                      className="inline-flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Deny
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
