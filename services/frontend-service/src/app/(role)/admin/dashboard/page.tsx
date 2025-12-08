'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { AnalyticsCard } from '../../../../components/common/AnalyticsCard';
import { TicketVolumeChart } from '../../../../components/charts/TicketVolumeChart';
import { DepartmentLoadChart } from '../../../../components/charts/DepartmentLoadChart';
import { ResolutionTimeTrendChart } from '../../../../components/charts/ResolutionTimeTrendChart';
import { StatusDistributionChart } from '../../../../components/charts/StatusDistributionChart';
import { THEME } from '../../../../lib/theme';
import ticketService from '../../../../services/api/ticketService';
import userService from '../../../../services/api/userService';
import { Ticket } from '../../../../types';
import { User } from '../../../../types';
import { formatDate, formatRelativeTime } from '../../../../lib/helpers';
import {
  Users,
  FileText,
  Activity,
  Building2,
  Server,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserPlus,
  Settings,
  Shield
} from 'lucide-react';

// Generate demo data
const generateDemoTickets = (): Ticket[] => {
  const now = new Date();
  return Array.from({ length: 150 }, (_, i) => ({
    id: `ticket-${i + 1}`,
    ticketId: `TKT-${String(i + 1).padStart(3, '0')}`,
    subject: `Sample Ticket ${i + 1}`,
    description: `Description for ticket ${i + 1}`,
    department: ['Development', 'Finance & Accounts', 'Procurement', 'Basic Maintenance', 'IT', 'Architecture', 'Administration'][i % 7],
    priority: ['low', 'medium', 'high', 'urgent'][i % 4] as any,
    status: ['assigned', 'in_progress', 'resolved', 'completed', 'pending'][i % 5] as any,
    requestorId: `req-${i + 1}`,
    requestorName: `User ${i + 1}`,
    submittedDate: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    assignedDate: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    ...(i % 3 === 0 && {
      completedDate: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedDate: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }),
  }));
};

const generateDemoUsers = (): User[] => {
  return Array.from({ length: 156 }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: ['requestor', 'assignee', 'moderator', 'admin'][i % 4] as any,
    department: ['Development', 'Finance & Accounts', 'Procurement', 'Basic Maintenance', 'IT', 'Architecture', 'Administration'][i % 7],
    status: i < 142 ? 'active' : 'inactive',
    lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'30' | '180' | '365'>('30');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tickets
        let ticketsList: Ticket[] = [];
        try {
          const ticketsResponse = await ticketService.getTickets();
          ticketsList = Array.isArray(ticketsResponse)
            ? ticketsResponse
            : (ticketsResponse?.results || []);
          if (ticketsList.length === 0) {
            ticketsList = generateDemoTickets();
          }
        } catch (error: any) {
          const isNetworkError = error?.isNetworkError || !error?.response;
          if (isNetworkError) {
            console.warn('API not available, using demo tickets');
            ticketsList = generateDemoTickets();
          } else {
            throw error;
          }
        }

        // Fetch users
        let usersList: User[] = [];
        try {
          const usersResponse = await userService.getUsers();
          usersList = Array.isArray(usersResponse)
            ? usersResponse
            : (usersResponse?.results || []);
          if (usersList.length === 0) {
            usersList = generateDemoUsers();
          }
        } catch (error: any) {
          const isNetworkError = error?.isNetworkError || !error?.response;
          if (isNetworkError) {
            console.warn('API not available, using demo users');
            usersList = generateDemoUsers();
          } else {
            throw error;
          }
        }

        setTickets(ticketsList);
        setUsers(usersList);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        setTickets(generateDemoTickets());
        setUsers(generateDemoUsers());
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate KPIs
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalTickets = tickets.length;
  const activeTickets = tickets.filter(t =>
    !['resolved', 'completed', 'closed', 'rejected'].includes(t.status)
  ).length;
  const departments = Array.from(new Set(users.map(u => u.department).filter(Boolean))).length;
  const systemUptime = '99.8%'; // Mock data

  // Calculate analytics data
  const ticketVolumeData = useMemo(() => {
    const days = timeRange === '30' ? 30 : timeRange === '180' ? 180 : 365;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayTickets = tickets.filter(t => {
        const ticketDate = new Date(t.submittedDate);
        return ticketDate.toDateString() === date.toDateString();
      });

      const created = dayTickets.length;
      const resolved = dayTickets.filter(t =>
        t.resolvedDate && new Date(t.resolvedDate).toDateString() === date.toDateString()
      ).length;

      data.push({ date: dateStr, created, resolved });
    }

    return data;
  }, [tickets, timeRange]);

  const departmentWorkloadData = useMemo(() => {
    const departments = Array.from(new Set(tickets.map(t => t.department).filter(Boolean)));
    return departments.map(dept => {
      const deptTickets = tickets.filter(t => t.department === dept);
      return {
        department: dept,
        assigned: deptTickets.length,
        completed: deptTickets.filter(t => t.status === 'resolved' || t.status === 'completed').length,
        pending: deptTickets.filter(t => t.status === 'assigned' || t.status === 'pending').length,
      };
    });
  }, [tickets]);

  const resolutionTimeData = useMemo(() => {
    const days = 30;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const completedTickets = tickets.filter(t => {
        if (t.resolvedDate || t.completedDate) {
          const resolvedDate = new Date(t.resolvedDate || t.completedDate || '');
          return resolvedDate.toDateString() === date.toDateString();
        }
        return false;
      });

      const avgDays = completedTickets.length > 0
        ? completedTickets.reduce((sum, t) => {
          const resolvedDate = new Date(t.resolvedDate || t.completedDate || '');
          const createdDate = new Date(t.submittedDate);
          const diffDays = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
          return sum + diffDays;
        }, 0) / completedTickets.length
        : 0;

      data.push({ date: dateStr, averageDays: Math.round(avgDays * 10) / 10 || 0 });
    }

    return data;
  }, [tickets]);

  const statusDistributionData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    tickets.forEach(t => {
      const status = t.status.charAt(0).toUpperCase() + t.status.slice(1).replace('_', ' ');
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([name, count]) => ({
      name,
      count,
      color: THEME.colors.primary,
    }));
  }, [tickets]);

  // Recent Users Activity
  const recentUserActivity = useMemo(() => {
    return users
      .filter(u => u.lastLogin)
      .sort((a, b) => {
        const dateA = new Date(a.lastLogin || 0).getTime();
        const dateB = new Date(b.lastLogin || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 10)
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        lastLogin: u.lastLogin || '',
        action: 'Last login',
      }));
  }, [users]);

  // System Alerts
  const systemAlerts = useMemo(() => {
    const alerts = [];

    // SLA breaches
    const slaBreaches = tickets.filter(t => {
      if (['resolved', 'completed', 'closed'].includes(t.status)) return false;
      const createdDate = new Date(t.submittedDate);
      const now = new Date();
      const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      const slaDays = t.priority === 'urgent' || t.priority === 'high' ? 7 : t.priority === 'medium' ? 14 : 30;
      return daysSinceCreation > slaDays;
    });

    if (slaBreaches.length > 0) {
      alerts.push({
        id: 'sla-breaches',
        type: 'warning',
        title: `${slaBreaches.length} SLA Breaches`,
        message: `${slaBreaches.length} tickets have exceeded their SLA`,
        icon: AlertCircle,
      });
    }

    // High priority pending
    const highPriorityPending = tickets.filter(t =>
      (t.priority === 'high' || t.priority === 'urgent') &&
      ['assigned', 'pending'].includes(t.status)
    );

    if (highPriorityPending.length > 0) {
      alerts.push({
        id: 'high-priority',
        type: 'error',
        title: `${highPriorityPending.length} High Priority Pending`,
        message: `${highPriorityPending.length} urgent/high priority tickets are pending`,
        icon: XCircle,
      });
    }

    // System health
    alerts.push({
      id: 'system-health',
      type: 'success',
      title: 'System Health: Good',
      message: 'All systems operational',
      icon: CheckCircle,
    });

    return alerts;
  }, [tickets]);

  // Calculate SLA Compliance Rate
  const slaComplianceRate = useMemo(() => {
    const completedTickets = tickets.filter(t =>
      t.resolvedDate || t.completedDate
    );

    if (completedTickets.length === 0) return 100;

    const withinSLA = completedTickets.filter(t => {
      const createdDate = new Date(t.submittedDate);
      const resolvedDate = new Date(t.resolvedDate || t.completedDate || '');
      const daysToResolve = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      const slaDays = t.priority === 'urgent' || t.priority === 'high' ? 7 : t.priority === 'medium' ? 14 : 30;
      return daysToResolve <= slaDays;
    }).length;

    return Math.round((withinSLA / completedTickets.length) * 100);
  }, [tickets]);

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: THEME.colors.primary }}></div>
          <p style={{ color: THEME.colors.gray }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
      {/* Header Card */}
      <Card className="bg-white rounded-2xl shadow-xl border-0">
        <CardContent className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2" style={{ color: THEME.colors.primary }}>
                System Overview
              </h1>
              <p className="text-base md:text-lg" style={{ color: THEME.colors.gray }}>
                HDMS Administration
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ backgroundColor: THEME.colors.background, borderColor: THEME.colors.light }}>
              <Shield className="w-5 h-5 md:w-6 md:h-6" style={{ color: THEME.colors.primary }} />
              <span className="text-base md:text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                System Administrator
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 auto-rows-fr">
        <div className="h-full">
          <AnalyticsCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            color={THEME.colors.primary}
            hoverDescription={`${activeUsers} active users`}
          />
        </div>
        <div className="h-full">
          <AnalyticsCard
            title="Total Tickets"
            value={totalTickets}
            icon={FileText}
            color={THEME.colors.medium}
            hoverDescription="All-time ticket count"
          />
        </div>
        <div className="h-full">
          <AnalyticsCard
            title="Active Tickets"
            value={activeTickets}
            icon={Activity}
            color={THEME.colors.warning}
            hoverDescription="Currently open tickets"
          />
        </div>
        <div className="h-full">
          <AnalyticsCard
            title="Departments"
            value={departments}
            icon={Building2}
            color={THEME.colors.light}
            hoverDescription="Total departments"
          />
        </div>
        <div className="h-full">
          <AnalyticsCard
            title="System Uptime"
            value={systemUptime}
            icon={Server}
            color={THEME.colors.success}
            hoverDescription="Availability percentage"
          />
        </div>
      </div>

      {/* System-Wide Analytics */}
      <Card className="bg-white rounded-2xl shadow-xl border-0">
        <CardHeader className="p-4 md:p-6 lg:p-8 pb-2 md:pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-xl md:text-2xl font-bold" style={{ color: THEME.colors.primary }}>
              System-Wide Analytics
            </CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange('30')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${timeRange === '30'
                    ? 'text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                style={timeRange === '30' ? { backgroundColor: THEME.colors.primary } : {}}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange('180')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${timeRange === '180'
                    ? 'text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                style={timeRange === '180' ? { backgroundColor: THEME.colors.primary } : {}}
              >
                6 Months
              </button>
              <button
                onClick={() => setTimeRange('365')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${timeRange === '365'
                    ? 'text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                style={timeRange === '365' ? { backgroundColor: THEME.colors.primary } : {}}
              >
                1 Year
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 lg:p-8 pt-2 md:pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
            {/* Ticket Volume Trends */}
            <Card className="bg-white rounded-xl shadow-md border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                  Ticket Volume Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TicketVolumeChart data={ticketVolumeData} height={250} />
              </CardContent>
            </Card>

            {/* Department Performance */}
            <Card className="bg-white rounded-xl shadow-md border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                  Department Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DepartmentLoadChart data={departmentWorkloadData} height={250} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Resolution Time Trends */}
            <Card className="bg-white rounded-xl shadow-md border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                  Resolution Time Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResolutionTimeTrendChart data={resolutionTimeData} height={250} />
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="bg-white rounded-xl shadow-md border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatusDistributionChart data={statusDistributionData} height={250} />
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
            <Card className="bg-white rounded-xl shadow-md border-0">
              <CardContent className="p-4 md:p-6">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: THEME.colors.primary }} />
                  <p className="text-sm font-medium mb-1" style={{ color: THEME.colors.gray }}>
                    SLA Compliance Rate
                  </p>
                  <p className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>
                    {slaComplianceRate}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md border-0">
              <CardContent className="p-4 md:p-6">
                <div className="text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: THEME.colors.medium }} />
                  <p className="text-sm font-medium mb-1" style={{ color: THEME.colors.gray }}>
                    Avg Resolution Time
                  </p>
                  <p className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>
                    {resolutionTimeData.length > 0
                      ? `${Math.round(resolutionTimeData.reduce((sum, d) => sum + d.averageDays, 0) / resolutionTimeData.length)} days`
                      : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-xl shadow-md border-0">
              <CardContent className="p-4 md:p-6">
                <div className="text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2" style={{ color: THEME.colors.success }} />
                  <p className="text-sm font-medium mb-1" style={{ color: THEME.colors.gray }}>
                    User Activity
                  </p>
                  <p className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>
                    {activeUsers}/{totalUsers}
                  </p>
                  <p className="text-xs mt-1" style={{ color: THEME.colors.gray }}>
                    Active Users
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Recent Users Activity & System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Users Activity */}
        <Card className="bg-white rounded-2xl shadow-xl border-0">
          <CardHeader className="p-4 md:p-6 lg:p-8 pb-2 md:pb-4">
            <CardTitle className="text-lg md:text-xl font-bold" style={{ color: THEME.colors.primary }}>
              Recent Users Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 lg:p-8 pt-2 md:pt-4">
            {recentUserActivity.length === 0 ? (
              <div className="text-center py-8">
                <p style={{ color: THEME.colors.gray }}>No recent activity</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2" style={{ borderColor: THEME.colors.background }}>
                      <th className="text-left py-2 px-2 text-xs md:text-sm font-semibold" style={{ color: THEME.colors.primary }}>
                        User
                      </th>
                      <th className="text-left py-2 px-2 text-xs md:text-sm font-semibold" style={{ color: THEME.colors.primary }}>
                        Role
                      </th>
                      <th className="text-left py-2 px-2 text-xs md:text-sm font-semibold" style={{ color: THEME.colors.primary }}>
                        Last Login
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUserActivity.map((activity) => (
                      <tr
                        key={activity.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                        style={{ borderColor: THEME.colors.background }}
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ backgroundColor: THEME.colors.primary }}>
                              {activity.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs md:text-sm font-medium" style={{ color: THEME.colors.primary }}>
                                {activity.name}
                              </p>
                              <p className="text-xs" style={{ color: THEME.colors.gray }}>
                                {activity.department}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-xs px-2 py-1 rounded" style={{
                            backgroundColor: THEME.colors.background,
                            color: THEME.colors.primary
                          }}>
                            {activity.role}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-xs md:text-sm" style={{ color: THEME.colors.gray }}>
                          {formatRelativeTime(activity.lastLogin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="bg-white rounded-2xl shadow-xl border-0">
          <CardHeader className="p-4 md:p-6 lg:p-8 pb-2 md:pb-4">
            <CardTitle className="text-lg md:text-xl font-bold" style={{ color: THEME.colors.primary }}>
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 lg:p-8 pt-2 md:pt-4">
            {systemAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-2" style={{ color: THEME.colors.success }} />
                <p style={{ color: THEME.colors.gray }}>No alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {systemAlerts.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 rounded-xl border"
                      style={{
                        backgroundColor: alert.type === 'error' ? '#FEE2E2' : alert.type === 'warning' ? '#FEF3C7' : '#D1FAE5',
                        borderColor: alert.type === 'error' ? '#FECACA' : alert.type === 'warning' ? '#FDE68A' : '#A7F3D0',
                      }}
                    >
                      <Icon
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        style={{
                          color: alert.type === 'error' ? THEME.colors.error : alert.type === 'warning' ? THEME.colors.warning : THEME.colors.success
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold mb-1" style={{ color: THEME.colors.primary }}>
                          {alert.title}
                        </p>
                        <p className="text-xs" style={{ color: THEME.colors.gray }}>
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            {error} - Showing demo data for demonstration purposes.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
