// 404 Not Found Page

import Link from 'next/link';
import { Container } from '@/components/ui/container';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <Container>
        <div className="max-w-lg mx-auto text-center py-24">
          <div className="text-8xl font-bold text-gray-100 mb-2 select-none">404</div>
          <div className="text-4xl mb-4" aria-hidden="true">
            ﴿ وَمَا تَدْرِي نَفْسٌ مَّاذَا تَكْسِبُ غَداً ﴾
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h1>
          <p className="text-gray-500 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/quran"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Browse Quran
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
