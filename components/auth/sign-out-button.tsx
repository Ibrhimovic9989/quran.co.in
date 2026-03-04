// Sign Out Button Component
// Sign out button for authenticated users

'use client';

import { signOut } from 'next-auth/react';

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
      className={className || 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'}
    >
      {children || 'Sign Out'}
    </button>
  );
}
