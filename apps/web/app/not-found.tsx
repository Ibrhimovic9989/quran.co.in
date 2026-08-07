// 404 Not Found Page

import Link from 'next/link';
import { Container } from '@/components/ui/container';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center">
      <Container>
        <div className="max-w-lg mx-auto text-center py-24">
          <div className="text-8xl font-bold text-gray-100 mb-2 select-none">404</div>
          <div className="text-4xl mb-4" aria-hidden="true">
            ﴿ وَمَا تَدْرِي نَفْسٌ مَّاذَا تَكْسِبُ غَداً ﴾
          </div>
          <h1 className="text-2xl font-bold text-ink mb-3">Page not found</h1>
          <p className="text-muted mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-strong transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/quran"
              className="inline-flex items-center justify-center px-6 py-3 bg-line-soft text-ink font-semibold rounded-xl hover:bg-line transition-colors"
            >
              Browse Quran
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
