// 404 Not Found Page

import Link from 'next/link';
import { Container } from '@/components/ui/container';

export default function NotFound() {
  return (
    <main className="flex min-h-[72vh] items-center justify-center bg-paper py-16">
      <Container>
        <div className="mx-auto max-w-lg rounded-[22px] border border-line bg-surface px-6 py-14 text-center md:px-10">
          <div className="mb-2 select-none font-heading text-7xl font-extrabold tracking-[-0.045em] text-line">404</div>
          <div className="text-4xl mb-4" aria-hidden="true">
            ﴿ وَمَا تَدْرِي نَفْسٌ مَّاذَا تَكْسِبُ غَداً ﴾
          </div>
          <h1 className="font-heading text-[26px] font-bold tracking-[-0.035em] text-ink">Page not found</h1>
          <p className="mx-auto mt-3 max-w-sm text-[13px] leading-[1.75] text-muted">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-[10px] bg-accent px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              Go Home
            </Link>
            <Link
              href="/quran"
              className="inline-flex items-center justify-center rounded-[10px] border border-line bg-surface px-4 py-3 text-xs font-semibold text-accent-strong transition-colors hover:bg-accent-soft"
            >
              Browse Quran
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
