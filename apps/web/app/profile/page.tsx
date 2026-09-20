// Profile Page
// User profile page with account information and settings

'use client';

import { backendUrl } from '@/lib/api/backend';
import { useSession, signOut } from '@/components/auth/auth-client';
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


  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to sign-in with callbackUrl to return to profile
      router.replace('/sign-in?callbackUrl=/profile');
    }
  }, [status, router]);

  // Fetch user data with createdAt
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      setLoadingUserData(true);
      fetch(backendUrl('/api/user/me'), { credentials: 'include' })
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
      <div className="flex min-h-[60vh] items-center justify-center bg-paper">
        <div className="text-center">
          <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-2 border-line border-t-accent"></div>
          <p className="text-[13px] text-muted">Loading...</p>
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

  // Get avatar background tint based on first letter
  const getAvatarColor = (char: string): string => {
    const colors = [
      'bg-tint-sky',
      'bg-tint-peach', // 'e' (101 % 10 = 1) maps to peach
      'bg-tint-sage',
      'bg-tint-lavender',
      'bg-tint-peach',
      'bg-tint-lavender',
      'bg-tint-sun',
      'bg-tint-sun',
      'bg-tint-sage',
      'bg-tint-sky',
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
    <main className="min-h-screen bg-paper">
      <Container className="max-w-3xl">
        <div className="py-6 md:py-12">
          {/* Header */}
          <div className="mb-7">
            <Heading level={1} className="font-heading text-[24px] md:text-[30px] font-bold tracking-[-0.035em] text-ink">
              Profile
            </Heading>
            <Text className="mt-2 text-[13px] leading-[1.7] text-muted">
              Manage your account information and preferences
            </Text>
          </div>

          {/* Profile Card */}
          <Card className="mb-3 rounded-2xl border border-line bg-surface p-0 shadow-none">
            <div className="p-5 md:p-6">
              {/* User Info */}
              <div className="flex items-start gap-4 md:gap-6 mb-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full border border-line ${avatarColor} md:h-20 md:w-20`}>
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="font-heading text-xl font-bold text-ink md:text-2xl">
                        {displayInitials}
                      </span>
                    )}
                  </div>
                </div>

                {/* User Details */}
                <div className="flex-1 min-w-0">
                  <Heading level={2} className="font-heading text-[19px] font-bold tracking-[-0.025em] text-ink md:text-[22px]">
                    {session.user.name || 'User'}
                  </Heading>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4 border-t border-line pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-accent" strokeWidth={1.7} />
                    <div>
                      <Text className="text-[13px] font-semibold text-ink">Name</Text>
                      <Text className="text-[11px] text-muted">{session.user.name || 'Not provided'}</Text>
                    </div>
                  </div>
                </div>

                {session.user.email && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-accent" strokeWidth={1.7} />
                      <div>
                        <Text className="text-[13px] font-semibold text-ink">Email</Text>
                        <Text className="break-all text-[13px] text-muted">{session.user.email}</Text>
                      </div>
                    </div>
                  </div>
                )}

                {userData?.createdAt && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-accent" strokeWidth={1.7} />
                      <div>
                        <Text className="text-[13px] font-semibold text-ink">Member Since</Text>
                        <Text className="text-[11px] text-muted">
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
          <Card className="rounded-2xl border border-line bg-surface p-0 shadow-none">
            <div className="p-5 md:p-6">
              <Heading level={3} className="mb-4 font-heading text-[17px] font-bold tracking-[-0.025em] text-ink">
                Account
              </Heading>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-line bg-surface px-4 py-3 text-xs font-semibold text-accent-strong hover:bg-accent-soft md:w-auto"
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
