// Sign In Button Component
// Google OAuth sign-in button

'use client';

import { signIn } from 'next-auth/react';

interface SignInButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function SignInButton({ className, children }: SignInButtonProps) {
  const handleSignIn = () => {
    signIn('google', {
      callbackUrl: '/dashboard',
    });
  };

  return (
    <button
      onClick={handleSignIn}
      className={className || 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'}
    >
      {children || 'Sign in with Google'}
    </button>
  );
}
