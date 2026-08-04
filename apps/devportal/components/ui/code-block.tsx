'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CodeBlockProps {
  code: string;
  label?: string;
  className?: string;
}

export function CodeBlock({ code, label, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — no-op
    }
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-line bg-ink text-[13px] leading-relaxed shadow-card',
        className,
      )}
    >
      {label && (
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="font-mono text-xs uppercase tracking-wide text-white/50">
            {label}
          </span>
        </div>
      )}
      <button
        onClick={copy}
        aria-label="Copy code"
        className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/80 opacity-0 transition-opacity hover:bg-white/10 focus:opacity-100 group-hover:opacity-100"
        style={label ? { top: '3rem' } : undefined}
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
      <pre className="overflow-x-auto px-4 py-4">
        <code className="font-mono text-white/90">{code}</code>
      </pre>
    </div>
  );
}
