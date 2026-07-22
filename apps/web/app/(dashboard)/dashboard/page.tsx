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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <UserProfile />
            <SignOutButton />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Welcome, {user.name}!</p>
          <p className="text-sm text-gray-500 mt-2">Email: {user.email}</p>
        </div>
      </div>
    </div>
  );
}
