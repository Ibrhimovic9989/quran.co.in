'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Check, Copy, X } from 'lucide-react';

interface RevealModalProps {
  apiKey: string;
  warning?: string;
  onClose: () => void;
}

export function RevealModal({ apiKey, warning, onClose }: RevealModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked
    }
  };

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
            <h2 className="text-lg font-bold text-ink">Your new API key</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Copy it now and store it somewhere safe.
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

        <div className="mt-5 rounded-xl border border-line bg-ink p-4">
          <code className="block break-all font-mono text-sm text-white/90">
            {apiKey}
          </code>
        </div>

        <button
          onClick={copy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" /> Copied to clipboard
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copy key
            </>
          )}
        </button>

        <div className="mt-5 flex items-start gap-3 rounded-lg border border-gold-soft bg-gold-soft/30 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-text" />
          <p className="text-sm leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">
              You won&apos;t see this key again.
            </span>{' '}
            {warning ??
              'For security, the full secret is shown only once. If you lose it, revoke this key and create a new one.'}
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-line-soft"
        >
          I&apos;ve saved my key
        </button>
      </div>
    </div>
  );
}
