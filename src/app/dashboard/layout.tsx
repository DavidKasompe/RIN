import Sidebar from '@/components/dashboard/Sidebar';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AutumnProvider } from 'autumn-js/react';
import React from 'react';
import TrialLockoutBlocker from './TrialLockoutBlocker';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Redirect to signin if not authorized
  if (!session?.user) {
    redirect('/signin');
  }

  // Redirect to onboarding if they haven't joined a school team yet
  // @ts-ignore - schoolId exists on the extended user schema
  if (!session.user.schoolId) {
    redirect('/onboarding');
  }

  return (
    <AutumnProvider>
      <div style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'rgb(250,250,249)',
        fontFamily: "'DM Sans', 'DM Sans Fallback', system-ui, -apple-system, sans-serif",
      }}>
        <Sidebar />
        <DashboardShell>{children}</DashboardShell>
        
        {/* Trial Lockout Blocker */}
        <TrialLockoutBlocker />
      </div>
    </AutumnProvider>
  );
}
