'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Blocks,
  Check,
  Copy,
  Loader2,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth, signIn } from '@/components/auth/auth-client';
import {
  type CreateOAuthAppResult,
  type OAuthApp,
  createOAuthApp,
  deleteOAuthApp,
  listOAuthApps,
  updateRedirectUris,
} from '@/lib/api/oauth-apps';
import { OAuthCredentialsModal } from '@/components/dashboard/oauth-credentials-modal';
import { cn } from '@/lib/utils/cn';

// ── Sign-in gate ────────────────────────────────────────────────────
function SignInPrompt() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent">
        <ShieldCheck className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">
        Sign in to register apps
      </h1>
      <p className="mt-2 leading-relaxed text-ink-soft">
        OAuth apps are tied to your Google account. Sign in to register an app,
        manage its redirect URIs and rotate its credentials — it takes a second
        and there is no separate signup.
      </p>
      <button
        onClick={() => signIn({ callbackUrl: '/apps' })}
        className="mt-7 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-accent-strong"
      >
        <GoogleGlyph />
        Sign in with Google
      </button>
      <p className="mt-6 text-sm text-muted">
        Want the details first?{' '}
        <Link
          href="/docs#oauth"
          className="text-accent underline-offset-2 hover:underline"
        >
          Read the OAuth 2.0 guide
        </Link>
        .
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

// ── Copyable inline client ID ───────────────────────────────────────
function CopyableId({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked
    }
  };

  return (
    <button
      onClick={copy}
      title="Copy client ID"
      className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-line bg-surface-warm px-2.5 py-1 font-mono text-xs text-ink-soft transition-colors hover:bg-line-soft"
    >
      <span className="truncate">{value}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 text-muted" />
      )}
    </button>
  );
}

// ── Redirect-URI row editor (shared by register + edit) ─────────────
function RedirectUriRows({
  uris,
  onChange,
  disabled,
}: {
  uris: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const setAt = (i: number, value: string) => {
    const next = [...uris];
    next[i] = value;
    onChange(next);
  };
  const addRow = () => onChange([...uris, '']);
  const removeRow = (i: number) => onChange(uris.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {uris.map((uri, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="url"
            value={uri}
            onChange={(e) => setAt(i, e.target.value)}
            disabled={disabled}
            placeholder="https://your-app.com/callback"
            className="flex-1 rounded-lg border border-line bg-surface px-3.5 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-[var(--accent-ring)] disabled:opacity-50"
          />
          {uris.length > 1 && (
            <button
              type="button"
              onClick={() => removeRow(i)}
              disabled={disabled}
              aria-label="Remove redirect URI"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line text-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-sm font-medium text-accent transition-colors hover:underline disabled:opacity-50"
      >
        <Plus className="h-3.5 w-3.5" />
        Add another
      </button>
    </div>
  );
}

// ── Inline redirect-URI editor for an existing app ──────────────────
function AppEditor({
  app,
  onSaved,
  onCancel,
}: {
  app: OAuthApp;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) {
  const [uris, setUris] = useState<string[]>(
    app.redirectUris.length ? app.redirectUris : [''],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const cleaned = uris.map((u) => u.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      setError('Add at least one redirect URI.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateRedirectUris(app.id, cleaned);
      await onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update redirect URIs.',
      );
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-line bg-surface-warm p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Edit redirect URIs
      </p>
      <RedirectUriRows uris={uris} onChange={setUris} disabled={saving} />
      {error && (
        <p className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save changes
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-line-soft disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Single app card ─────────────────────────────────────────────────
function AppCard({
  app,
  onChanged,
}: {
  app: OAuthApp;
  onChanged: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete "${app.name}"? Users will no longer be able to sign in with this app, and its client ID and secret will stop working immediately. This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      await deleteOAuthApp(app.id);
      await onChanged();
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : 'Failed to delete app.',
      );
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink">{app.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-medium text-muted">Client ID</span>
            <CopyableId value={app.id} />
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setEditing((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-line-soft"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit URIs
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Redirect URIs
        </p>
        {app.redirectUris.length === 0 ? (
          <p className="mt-1.5 text-sm text-muted">None set.</p>
        ) : (
          <ul className="mt-1.5 space-y-1">
            {app.redirectUris.map((uri) => (
              <li key={uri}>
                <code className="break-all font-mono text-xs text-ink-soft">
                  {uri}
                </code>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && (
        <AppEditor
          app={app}
          onSaved={async () => {
            setEditing(false);
            await onChanged();
          }}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}

// ── OAuth Apps page ─────────────────────────────────────────────────
export default function AppsPage() {
  const { status } = useAuth();

  const [apps, setApps] = useState<OAuthApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [uris, setUris] = useState<string[]>(['']);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<CreateOAuthAppResult | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setApps(await listOAuthApps());
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Failed to load apps.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') void load();
  }, [status, load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;
    const trimmedName = name.trim();
    const cleanedUris = uris.map((u) => u.trim()).filter(Boolean);
    if (!trimmedName) {
      setCreateError('Give your app a name.');
      return;
    }
    if (cleanedUris.length === 0) {
      setCreateError('Add at least one redirect URI.');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const result = await createOAuthApp(trimmedName, cleanedUris);
      setRevealed(result);
      setName('');
      setUris(['']);
      await load();
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Failed to register app.',
      );
    } finally {
      setCreating(false);
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

  return (
    <div className="animate-fade-in mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            OAuth apps
          </h1>
          <p className="mt-1 max-w-2xl text-ink-soft">
            Register an app to let users sign in with their quran.co.in account
            and grant it access to their data. See the{' '}
            <Link
              href="/docs#oauth"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              OAuth 2.0 guide
            </Link>{' '}
            for the full authorization-code flow.
          </p>
        </div>
        <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-soft">
          {apps.length} {apps.length === 1 ? 'app' : 'apps'}
        </span>
      </div>

      {/* Register app */}
      <section className="mt-8 rounded-xl border border-line bg-surface-warm p-6 shadow-card">
        <div className="flex items-center gap-2">
          <Blocks className="h-5 w-5 text-accent" />
          <h2 className="font-semibold text-ink">Register an app</h2>
        </div>
        <p className="mt-1.5 text-sm text-ink-soft">
          Name your app and list the redirect URIs users return to after they
          authorize. The client secret is shown once.
        </p>
        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="app-name"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted"
            >
              App name
            </label>
            <input
              id="app-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="My Quran companion"
              className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-[var(--accent-ring)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Redirect URIs
            </label>
            <RedirectUriRows
              uris={uris}
              onChange={setUris}
              disabled={creating}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Register app
            </button>
          </div>
        </form>
        {createError && (
          <p className="mt-3 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {createError}
          </p>
        )}
      </section>

      {/* Apps list */}
      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-ink">Your apps</h2>

        {loading ? (
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
        ) : apps.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-surface py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-soft text-accent">
              <Blocks className="h-6 w-6" />
            </span>
            <p className="mt-2 font-medium text-ink">
              No apps yet — register one to get started
            </p>
            <p className="max-w-xs text-sm text-ink-soft">
              Once registered, your app can send users through the sign-in flow
              and act on their behalf via the API.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} onChanged={load} />
            ))}
          </div>
        )}
      </section>

      {revealed && (
        <OAuthCredentialsModal
          clientId={revealed.clientId}
          clientSecret={revealed.clientSecret}
          warning={revealed.warning}
          onClose={() => setRevealed(null)}
        />
      )}
    </div>
  );
}
