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
import { useEffect } from 'react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7244/ingest/52b67fd4-58b7-42fe-bb56-c406287f7fc9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'profile/page.tsx:15',message:'Profile page loaded',data:{status,hasSession:!!session,userName:session?.user?.name},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }, [status, session]);
  // #endregion

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/52b67fd4-58b7-42fe-bb56-c406287f7fc9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'profile/page.tsx:20',message:'Auth status check',data:{status,willRedirect:status==='unauthenticated'},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (status === 'unauthenticated') {
      router.push('/sign-in');
    }
  }, [status, router]);

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
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 md:w-10 md:h-10 text-gray-600" />
                    )}
                  </div>
                </div>

                {/* User Details */}
                <div className="flex-1 min-w-0">
                  <Heading level={2} className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                    {session.user.name || 'User'}
                  </Heading>
                  {session.user.email && (
                    <div className="flex items-center gap-2 text-sm md:text-base text-gray-600 mb-2">
                      <Mail className="w-4 h-4" />
                      <span>{session.user.email}</span>
                    </div>
                  )}
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

                {session.user.email && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <Text className="text-sm font-medium text-gray-900">Member Since</Text>
                        <Text className="text-xs text-gray-600">
                          {new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
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
