// Dashboard Page
// Protected dashboard page

import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { UserProfile } from '@/components/auth/user-profile';
import { SignOutButton } from '@/components/auth/sign-out-button';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-paper px-4 py-6 md:py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <div className="flex items-center gap-4">
            <UserProfile />
            <SignOutButton />
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-line p-4">
          <p className="text-ink-soft">Welcome, {user.name}!</p>
          <p className="break-all text-sm text-muted mt-2">Email: {user.email}</p>
        </div>
      </div>
    </div>
  );
}
