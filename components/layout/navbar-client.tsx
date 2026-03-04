// Navbar Client Component
// Client-side navigation bar

'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { SignInButton, SignOutButton, UserProfile } from '@/components/auth';

export function NavbarClient() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-gray-800 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-white text-xl font-semibold">
              Quran.co.in
            </Link>
            <Link
              href="/quran"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Quran
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <UserProfile />
                <SignOutButton />
              </>
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
