'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../../lib/auth';
import { usePathname, useRouter } from 'next/navigation';
import RoleGuard from '../../../components/layout/RoleGuard';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';

export default function RoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Extract role from pathname
  const roleFromPath = pathname?.split('/')[1];
  const allowedRoles = ['requester', 'moderator', 'assignee', 'admin'];

  // Handle navigation in useEffect to avoid setState during render
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user has access to this role section
    if (roleFromPath && allowedRoles.includes(roleFromPath)) {
      if (user.role !== roleFromPath && user.role !== 'admin') {
        router.push(`/${user.role}/dashboard`);
        return;
      }
    }
  }, [user, loading, roleFromPath, router]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return null;
  }

  // Check if user has access to this role section
  if (roleFromPath && allowedRoles.includes(roleFromPath)) {
    if (user.role !== roleFromPath && user.role !== 'admin') {
      return null;
    }
  }

  return (
    <RoleGuard>
      <div className="min-h-screen">
        {children}
      </div>
    </RoleGuard>
  );
}

