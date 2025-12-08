'use client';

import React from 'react';
import { useAuth } from '../../../../lib/auth';
import { useParams } from 'next/navigation';
import { SkeletonLoader } from '../../../../components/ui/SkeletonLoader';
import AdminDashboard from '../../../../components/dashboards/AdminDashboard';
import AssigneeDashboard from '../../../../components/dashboards/AssigneeDashboard';
import ModeratorDashboard from '../../../../components/dashboards/ModeratorDashboard';
import RequestorDashboard from '../../../../components/dashboards/RequestorDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const role = (params?.role as string) || user?.role || '';

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="mb-6">
          <SkeletonLoader type="text" width="200px" height="32px" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLoader key={i} type="card" height="120px" />
          ))}
        </div>
      </div>
    );
  }

  // Render role-specific dashboard
  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'assignee':
      return <AssigneeDashboard />;
    case 'moderator':
      return <ModeratorDashboard />;
    case 'requestor':
      return <RequestorDashboard />;
    default:
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">No dashboard available for role: {role}</p>
        </div>
      );
  }
}