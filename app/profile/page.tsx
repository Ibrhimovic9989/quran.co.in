// Profile Page
// User profile page with account information and settings

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Heading, Text } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/atoms';
import { User, Mail, Calendar, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserData {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7244/ingest/52b67fd4-58b7-42fe-bb56-c406287f7fc9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'profile/page.tsx:15',message:'Profile page loaded',data:{status,hasSession:!!session,userName:session?.user?.name,pathname:window.location.pathname},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }, [status, session]);
  // #endregion

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/52b67fd4-58b7-42fe-bb56-c406287f7fc9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'profile/page.tsx:20',message:'Auth status check',data:{status,willRedirect:status==='unauthenticated'},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (status === 'unauthenticated') {
      // Redirect to sign-in with callbackUrl to return to profile
      router.push('/sign-in?callbackUrl=/profile');
    }
  }, [status, router]);

  // Fetch user data with createdAt
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      setLoadingUserData(true);
      fetch('/api/user/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error('Error fetching user data:', data.error);
          } else {
            setUserData(data);
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        })
        .finally(() => {
          setLoadingUserData(false);
        });
    }
  }, [status, session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Get user initials for avatar (returns lowercase for single letter, uppercase for initials)
  const getUserInitials = (name?: string | null, email?: string | null): string => {
    // Prefer email first letter for single-letter avatars (matches common UI patterns)
    if (email) {
      const emailFirst = email[0]?.toLowerCase() || 'u';
      // If name exists and has multiple words, use name initials (uppercase)
      if (name) {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
          return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
      }
      // Otherwise use email first letter (lowercase)
      return emailFirst;
    }
    // Fallback to name
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name[0]?.toLowerCase() || 'u';
    }
    return 'u';
  };

  // Get avatar background color based on first letter
  const getAvatarColor = (char: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-orange-500', // 'e' (101 % 10 = 1) maps to orange
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500',
      'bg-cyan-500',
    ];
    // Use lowercase for consistent color mapping
    const lowerChar = char.toLowerCase();
    const index = lowerChar.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const initials = getUserInitials(session?.user?.name, session?.user?.email);
  const avatarColor = getAvatarColor(initials[0] || 'u');
  // Display lowercase for single letter, uppercase for initials
  const displayInitials = initials.length === 1 ? initials.toLowerCase() : initials;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white">
      <Container>
        <div className="py-6 md:py-12">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <Heading level={1} className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
              Profile
            </Heading>
            <Text className="text-sm md:text-base text-gray-600">
              Manage your account information and preferences
            </Text>
          </div>

          {/* Profile Card */}
          <Card className="border border-gray-200 shadow-lg mb-6">
            <div className="p-4 md:p-6">
              {/* User Info */}
              <div className="flex items-start gap-4 md:gap-6 mb-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 md:w-20 md:h-20 ${avatarColor} rounded-full flex items-center justify-center`}>
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xl md:text-2xl font-semibold">
                        {displayInitials}
                      </span>
                    )}
                  </div>
                </div>

                {/* User Details */}
                <div className="flex-1 min-w-0">
                  <Heading level={2} className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                    {session.user.name || 'User'}
                  </Heading>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <Text className="text-sm font-medium text-gray-900">Name</Text>
                      <Text className="text-xs text-gray-600">{session.user.name || 'Not provided'}</Text>
                    </div>
                  </div>
                </div>

                {session.user.email && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <Text className="text-sm font-medium text-gray-900">Email</Text>
                        <Text className="text-xs text-gray-600">{session.user.email}</Text>
                      </div>
                    </div>
                  </div>
                )}

                {userData?.createdAt && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <Text className="text-sm font-medium text-gray-900">Member Since</Text>
                        <Text className="text-xs text-gray-600">
                          {loadingUserData ? (
                            'Loading...'
                          ) : (
                            new Date(userData.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            })
                          )}
                        </Text>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="border border-gray-200 shadow-lg">
            <div className="p-4 md:p-6">
              <Heading level={3} className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                Account Actions
              </Heading>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  onClick={handleSignOut}
                  className="w-full md:w-auto flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}
