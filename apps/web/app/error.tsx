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
    <main className="min-h-screen bg-surface flex items-center justify-center">
      <Container>
        <div className="max-w-lg mx-auto text-center py-24">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink mb-3">Something went wrong</h1>
          <p className="text-muted mb-8">
            An unexpected error occurred. Please try again or return to the home page.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-strong transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-line-soft text-ink font-semibold rounded-xl hover:bg-line transition-colors"
            >
              Go Home
            </Link>
          </div>
          {error.digest && (
            <p className="mt-6 text-xs text-muted">Error ID: {error.digest}</p>
          )}
        </div>
      </Container>
    </main>
  );
}
