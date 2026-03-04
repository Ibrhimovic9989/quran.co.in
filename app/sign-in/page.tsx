// Sign In Page
// Google OAuth sign-in page

import { SignInButton } from '@/components/auth/sign-in-button';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Quran.co.in
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Continue with your Google account
          </p>
        </div>
        <div className="mt-8">
          <SignInButton className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Sign in with Google
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
