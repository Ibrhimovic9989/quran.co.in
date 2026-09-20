// Global Error Boundary Page

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/container';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service if available
    console.error('Application error:', error);
  }, [error]);

  return (
    <main className="flex min-h-[72vh] items-center justify-center bg-paper py-16">
      <Container>
        <div className="mx-auto max-w-lg rounded-[22px] border border-line bg-surface px-6 py-14 text-center md:px-10">
          <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-500">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="font-heading text-[26px] font-bold tracking-[-0.035em] text-ink">Something went wrong</h1>
          <p className="mx-auto mt-3 max-w-sm text-[13px] leading-[1.75] text-muted">
            An unexpected error occurred. Please try again or return to the home page.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-[10px] bg-accent px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-[10px] border border-line bg-surface px-4 py-3 text-xs font-semibold text-accent-strong transition-colors hover:bg-accent-soft"
            >
              Go Home
            </Link>
          </div>
          {error.digest && (
            <p className="mt-6 text-[11px] text-muted">Error ID: {error.digest}</p>
          )}
        </div>
      </Container>
    </main>
  );
}
