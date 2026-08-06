'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  KeyRound,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useAuth, signIn } from '@/components/auth/auth-client';
import {
  type ApiKey,
  type CreateKeyResult,
  createKey,
  listKeys,
  revokeKey,
} from '@/lib/api/developer';
import { RevealModal } from '@/components/dashboard/reveal-modal';
import { WhichAuth } from '@/components/dashboard/which-auth';
import { AskAccessCard } from '@/components/dashboard/ask-access-card';
import { AskAdminPanel } from '@/components/dashboard/ask-admin-panel';
import { cn } from '@/lib/utils/cn';

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ── Sign-in gate ────────────────────────────────────────────────────
function SignInPrompt() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent">
        <ShieldCheck className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">
        Sign in to manage your keys
      </h1>
      <p className="mt-2 leading-relaxed text-ink-soft">
        API keys are tied to your Google account. Sign in to create, view and
        revoke keys — it takes a second and there is no separate signup.
      </p>
      <button
        onClick={() => signIn({ callbackUrl: '/dashboard' })}
        className="mt-7 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-accent-strong"
      >
        <GoogleGlyph />
        Sign in with Google
      </button>
      <p className="mt-6 text-sm text-muted">
        Just exploring?{' '}
        <Link
          href="/docs"
          className="text-accent underline-offset-2 hover:underline"
        >
          Read the quickstart
        </Link>{' '}
        — public reads need no key.
      </p>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.3 14.7 2.3 12 2.3 6.9 2.3 2.8 6.4 2.8 11.5S6.9 20.7 12 20.7c5.3 0 8.8-3.7 8.8-9 0-.6-.06-1-.15-1.5H12z"
      />
    </svg>
  );
}

// ── Keys table ──────────────────────────────────────────────────────
function KeysTable({
  keys,
  onRevoke,
  revokingId,
}: {
  keys: ApiKey[];
  onRevoke: (key: ApiKey) => void;
  revokingId: string | null;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-card">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-line bg-surface-warm text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Key</th>
            <th className="px-4 py-3 font-semibold">Tier</th>
            <th className="px-4 py-3 font-semibold">Requests</th>
            <th className="px-4 py-3 font-semibold">Last used</th>
            <th className="px-4 py-3 font-semibold">Created</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {keys.map((k) => (
            <tr
              key={k.id}
              className={cn('align-middle', k.revoked && 'opacity-50')}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 font-medium text-ink">
                  {k.name}
                  {k.revoked && (
                    <span className="rounded-full bg-line-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                      Revoked
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <code className="font-mono text-xs text-ink-soft">
                  {k.keyPrefix}
                  <span className="text-muted">••••••••</span>
                </code>
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium capitalize text-accent">
                  {k.tier}
                </span>
              </td>
              <td className="px-4 py-3 tabular-nums text-ink-soft">
                {k.requestCount.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {formatDate(k.lastUsedAt)}
              </td>
              <td className="px-4 py-3 text-ink-soft">
                {formatDate(k.createdAt)}
              </td>
              <td className="px-4 py-3 text-right">
                {k.revoked ? (
                  <span className="text-xs text-muted">—</span>
                ) : (
                  <button
                    onClick={() => onRevoke(k)}
                    disabled={revokingId === k.id}
                    className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    {revokingId === k.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Revoke
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, status } = useAuth();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<CreateKeyResult | null>(null);

  const [revokingId, setRevokingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadingKeys(true);
    setLoadError(null);
    try {
      setKeys(await listKeys());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load keys.');
    } finally {
      setLoadingKeys(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') void load();
  }, [status, load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || creating) return;
    setCreating(true);
    setCreateError(null);
    try {
      const result = await createKey(name);
      setRevealed(result);
      setNewName('');
      await load();
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Failed to create key.',
      );
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (key: ApiKey) => {
    if (
      !window.confirm(
        `Revoke "${key.name}"? Any app using this key will immediately stop working. This cannot be undone.`,
      )
    ) {
      return;
    }
    setRevokingId(key.id);
    try {
      await revokeKey(key.id);
      await load();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : 'Failed to revoke key.',
      );
    } finally {
      setRevokingId(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-32 text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <SignInPrompt />;
  }

  const activeCount = keys.filter((k) => !k.revoked).length;

  return (
    <div className="animate-fade-in mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-ink-soft">
            Manage the API keys tied to{' '}
            <span className="font-medium text-ink">{user?.email}</span>.
          </p>
        </div>
        <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-soft">
          {activeCount} active {activeCount === 1 ? 'key' : 'keys'}
        </span>
      </div>

      <WhichAuth current="keys" />

      {/* Create key */}
      <section className="mt-8 rounded-xl border border-line bg-surface-warm p-6 shadow-card">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-accent" />
          <h2 className="font-semibold text-ink">Create a new key</h2>
        </div>
        <p className="mt-1.5 text-sm text-ink-soft">
          Give it a memorable name — e.g. the app or environment it&apos;s for.
          The secret is shown once.
        </p>
        <form
          onSubmit={handleCreate}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={80}
            placeholder="My production app"
            className="flex-1 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-[var(--accent-ring)]"
          />
          <button
            type="submit"
            disabled={!newName.trim() || creating}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create key
          </button>
        </form>
        {createError && (
          <p className="mt-3 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {createError}
          </p>
        )}
      </section>

      {/* Keys list */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-ink">Your API keys</h2>

        {loadingKeys ? (
          <div className="flex items-center justify-center rounded-xl border border-line bg-surface py-16 text-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-surface py-14 text-center">
            <AlertCircle className="h-7 w-7 text-red-500" />
            <p className="text-sm text-ink-soft">{loadError}</p>
            <button
              onClick={() => void load()}
              className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-line-soft"
            >
              Try again
            </button>
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-surface py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent">
              <KeyRound className="h-6 w-6" />
            </span>
            <p className="mt-2 font-medium text-ink">No API keys yet</p>
            <p className="max-w-xs text-sm text-ink-soft">
              Create your first key above to start making authenticated requests
              at the higher rate-limit tier.
            </p>
          </div>
        ) : (
          <KeysTable
            keys={keys}
            onRevoke={handleRevoke}
            revokingId={revokingId}
          />
        )}
      </section>

      <AskAccessCard />

      <AskAdminPanel />

      {revealed && (
        <RevealModal
          apiKey={revealed.apiKey}
          warning={revealed.warning}
          onClose={() => setRevealed(null)}
        />
      )}
    </div>
  );
}
