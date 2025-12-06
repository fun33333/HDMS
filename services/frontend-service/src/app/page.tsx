import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { THEME } from '../lib/theme';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import useSkeletonDelay from '../hooks/useSkeletonDelay';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const showSkeleton = useSkeletonDelay(loading);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect authenticated users to their role-specific dashboard
        router.push(`/${user.role}/dashboard`);
      } else {
        // Redirect unauthenticated users to login
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (showSkeleton) {
    return (
      <DashboardSkeleton />
    );
  }

  return null;
}

