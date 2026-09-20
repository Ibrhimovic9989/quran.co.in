// Sign In Button Component
// Google OAuth sign-in button

'use client';

import { signIn } from '@/components/auth/auth-client';

interface SignInButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function SignInButton({ className, children }: SignInButtonProps) {
  const handleSignIn = () => {
    signIn('google', {
      callbackUrl: '/quran',
    });
  };

  return (
    <button
      onClick={handleSignIn}
      className={className || 'rounded-[10px] bg-accent px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-accent-strong'}
    >
      {children || 'Sign in with Google'}
    </button>
  );
}
