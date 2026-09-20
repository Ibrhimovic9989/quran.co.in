// Sign Out Button Component
// Sign out button for authenticated users

'use client';

import { signOut } from '@/components/auth/auth-client';

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
  callbackUrl?: string;
}

export function SignOutButton({ 
  className, 
  children,
  callbackUrl = '/'
}: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl });
  };

  return (
    <button
      onClick={handleSignOut}
      className={className || 'rounded-[10px] border border-line bg-surface px-4 py-2.5 text-xs font-semibold text-ink-soft transition-colors hover:border-red-200 hover:text-red-600'}
    >
      {children || 'Sign Out'}
    </button>
  );
}
