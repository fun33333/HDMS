'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../lib/auth';
import { useParams } from 'next/navigation';
import { AnalyticsCard } from '../../../../components/common/AnalyticsCard';
import { SkeletonLoader } from '../../../../components/ui/SkeletonLoader';
import { Card, CardHeader, CardContent } from '../../../../components/ui/card';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';
import { THEME } from '../../../../lib/theme';
import { formatDate } from '../../../../lib/helpers';
import analyticsService from '../../../../services/api/analyticsService';

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  resolvedRequests: number;
  rejectedRequests: number;
  avgResolutionTime: string;
  satisfactionRating: number;
  inProgressRequests?: number;
  assignedTickets?: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const params = useParams();
  const role = (params?.role as string) || user?.role || '';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Try to fetch from API, but fallback to mock data if it fails
        const data = await analyticsService.getDashboardStats(role);
        setStats(data);
      } catch (error) {
        // Silently fallback to mock data if API is not available
        console.warn('API not available, using mock data:', error);
        setStats(getMockStats(role));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [role]);

  const getMockStats = (userRole: string): DashboardStats => {
    const baseStats = {
      totalRequests: 45,
      pendingRequests: 12,
      resolvedRequests: 28,
      rejectedRequests: 5,
      avgResolutionTime: '2.5 days',
      satisfactionRating: 4.2,
    };

    switch (userRole) {
      case 'requester':
        return baseStats;
      case 'moderator':
        return {
          ...baseStats,
          inProgressRequests: 8,
          assignedTickets: 15,
        };
      case 'assignee':
        return {
          ...baseStats,
          assignedTickets: 10,
          inProgressRequests: 6,
        };
      case 'admin':
        return {
          ...baseStats,
          totalRequests: 150,
          pendingRequests: 35,
          resolvedRequests: 100,
          rejectedRequests: 15,
        };
      default:
        return baseStats;
    }
  };

  const getRoleCards = (userRole: string) => {
    if (!stats) return [];

    switch (userRole) {
      case 'requester':
        return [
          {
            title: 'Total Requests',
            value: stats.totalRequests,
            icon: FileText,
            color: THEME.colors.primary,
            description: 'All your submitted requests',
          },
          {
            title: 'Pending',
            value: stats.pendingRequests,
            icon: Clock,
            color: THEME.colors.warning,
            description: 'Awaiting response',
          },
          {
            title: 'Resolved',
            value: stats.resolvedRequests,
            icon: CheckCircle,
            color: THEME.colors.success,
            description: 'Successfully completed',
          },
          {
            title: 'Rejected',
            value: stats.rejectedRequests,
            icon: XCircle,
            color: THEME.colors.error,
            description: 'Requests not approved',
          },
        ];
      case 'moderator':
        return [
          {
            title: 'New Requests',
            value: stats.pendingRequests,
            icon: FileText,
            color: THEME.colors.primary,
            description: 'Awaiting review',
          },
          {
            title: 'Assigned Tickets',
            value: stats.assignedTickets || 0,
            icon: Users,
            color: THEME.colors.info,
            description: 'Currently assigned',
          },
          {
            title: 'In Progress',
            value: stats.inProgressRequests || 0,
            icon: Activity,
            color: THEME.colors.warning,
            description: 'Being processed',
          },
          {
            title: 'Resolved',
            value: stats.resolvedRequests,
            icon: CheckCircle,
            color: THEME.colors.success,
            description: 'Completed tickets',
          },
        ];
      case 'assignee':
        return [
          {
            title: 'My Tasks',
            value: stats.assignedTickets || 0,
            icon: FileText,
            color: THEME.colors.primary,
            description: 'Assigned to you',
          },
          {
            title: 'In Progress',
            value: stats.inProgressRequests || 0,
            icon: Activity,
            color: THEME.colors.warning,
            description: 'Currently working',
          },
          {
            title: 'Completed',
            value: stats.resolvedRequests,
            icon: CheckCircle,
            color: THEME.colors.success,
            description: 'Finished tasks',
          },
          {
            title: 'Avg. Time',
            value: stats.avgResolutionTime,
            icon: Clock,
            color: THEME.colors.info,
            description: 'Resolution time',
          },
        ];
      case 'admin':
        return [
          {
            title: 'Total Requests',
            value: stats.totalRequests,
            icon: FileText,
            color: THEME.colors.primary,
            description: 'All system requests',
          },
          {
            title: 'Pending',
            value: stats.pendingRequests,
            icon: Clock,
            color: THEME.colors.warning,
            description: 'Awaiting action',
          },
          {
            title: 'Resolved',
            value: stats.resolvedRequests,
            icon: CheckCircle,
            color: THEME.colors.success,
            description: 'Successfully completed',
          },
          {
            title: 'Satisfaction',
            value: `${stats.satisfactionRating}/5`,
            icon: TrendingUp,
            color: THEME.colors.success,
            description: 'User satisfaction rating',
          },
        ];
      default:
        return [];
    }
  };

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

  const cards = getRoleCards(role);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8 animate-slide-in">
        <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: THEME.colors.primary }}>
          Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Welcome back, <span className="font-semibold" style={{ color: THEME.colors.primary }}>{user?.name || 'User'}</span>! Here's your overview.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((card, index) => (
          <div key={index} style={{ animationDelay: `${index * 100}ms` }} className="animate-fade-in">
            <AnalyticsCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              description={card.description}
            />
          </div>
        ))}
      </div>

      {/* Additional Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="animate-fade-in" variant="elevated">
          <CardHeader>
            <h3 className="text-xl font-bold" style={{ color: THEME.colors.primary }}>
              Quick Stats
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-gray-600 font-medium">Average Resolution Time</span>
                <span className="font-bold text-lg" style={{ color: THEME.colors.primary }}>{stats?.avgResolutionTime || 'N/A'}</span>
              </div>
              {stats?.satisfactionRating && (
                <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-gray-600 font-medium">Satisfaction Rating</span>
                  <span className="font-bold text-lg" style={{ color: THEME.colors.success }}>{stats.satisfactionRating}/5</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" variant="elevated" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <h3 className="text-xl font-bold" style={{ color: THEME.colors.primary }}>
              Recent Activity
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-gray-600 font-medium">System is running smoothly</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: THEME.colors.medium }}></div>
                <span className="text-sm text-gray-600 font-medium">Last updated: {formatDate(new Date(), 'short')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

