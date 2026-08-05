'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Check, Copy, X } from 'lucide-react';

interface OAuthCredentialsModalProps {
  clientId: string;
  clientSecret: string;
  warning?: string;
  onClose: () => void;
}

function CopyableField({ label, value }: { label: string; value: string }) {
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
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs font-medium text-white/80 transition-colors hover:bg-white/10"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <div className="rounded-xl border border-line bg-ink p-3.5">
        <code className="block break-all font-mono text-sm text-white/90">
          {value}
        </code>
      </div>
    </div>
  );
}

export function OAuthCredentialsModal({
  clientId,
  clientSecret,
  warning,
  onClose,
}: OAuthCredentialsModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">
              Your app credentials
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Copy the secret now and store it somewhere safe.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-line-soft hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <CopyableField label="Client ID" value={clientId} />
          <CopyableField label="Client secret" value={clientSecret} />
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-lg border border-gold-soft bg-gold-soft/30 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-text" />
          <p className="text-sm leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">
              You won&apos;t see this secret again.
            </span>{' '}
            {warning ??
              'For security, the client secret is shown only once. If you lose it, delete this app and register a new one. The client ID stays visible in your app list.'}
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-line-soft"
        >
          I&apos;ve saved my credentials
        </button>
      </div>
    </div>
  );
}
