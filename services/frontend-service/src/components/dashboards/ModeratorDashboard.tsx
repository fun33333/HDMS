'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { KpiCard } from '../common/KpiCard';
import { DepartmentLoadChart } from '../charts/DepartmentLoadChart';
import { DashboardHeader } from './DashboardHeader';
import ticketService from '../../services/api/ticketService';
import { Ticket } from '../../types';
import { THEME } from '../../lib/theme';
import { formatRelativeTime, formatDate } from '../../lib/helpers';
import { generateMockTickets } from '../../lib/mockData';
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  Activity,
  ArrowRight,
  AlertTriangle,
  Timer
} from 'lucide-react';

interface DashboardStats {
  pendingReview: number;
  totalActiveTickets: number;
  ticketsAssignedToday: number;
  averageResolutionTime: number; // in hours
  slaBreaches: number;
}

interface DepartmentWorkload {
  department: string;
  activeTickets: number;
  loadLevel: 'low' | 'medium' | 'high';
}

interface TicketRequiringAttention {
  ticket: Ticket;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface SLATicket {
  ticket: Ticket;
  timeRemaining?: number; // in hours
  timeOverdue?: number; // in hours
  isBreached: boolean;
  isApproaching: boolean;
}

const ModeratorDashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ticketService.getTickets();
        const ticketsList = Array.isArray(response) ? response : (response?.results || []);

        if (ticketsList.length > 0) {
          setTickets(ticketsList);
          setUseMockData(false);
        } else {
          // Use mock data if API returns empty
          const mockTickets = generateMockTickets();
          setTickets(mockTickets);
          setUseMockData(true);
        }

        // Generate recent activity from tickets
        const activity = generateRecentActivity(ticketsList.length > 0 ? ticketsList : generateMockTickets());
        setRecentActivity(activity);
      } catch (error: any) {
        const isNetworkError = error?.isNetworkError || !error?.response;
        if (isNetworkError) {
          console.warn('API not available, using mock data');
          const mockTickets = generateMockTickets();
          setTickets(mockTickets);
          setUseMockData(true);

          const activity = generateRecentActivity(mockTickets);
          setRecentActivity(activity);
        } else {
          console.error('Error fetching tickets:', error?.message || error);
          const mockTickets = generateMockTickets();
          setTickets(mockTickets);
          setUseMockData(true);

          const activity = generateRecentActivity(mockTickets);
          setRecentActivity(activity);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate dashboard statistics
  const stats: DashboardStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const slaHours = 72; // 3 days default SLA

    // Pending Review - tickets pending > 24 hours
    const pendingReview = tickets.filter(t => {
      if (t.status !== 'pending' && t.status !== 'submitted') return false;
      const submitted = new Date(t.submittedDate);
      const hoursSinceSubmission = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60);
      return hoursSinceSubmission > 24;
    }).length;

    // Total Active Tickets - all non-closed tickets
    const totalActiveTickets = tickets.filter(t =>
      !['resolved', 'closed', 'rejected'].includes(t.status)
    ).length;

    // Tickets Assigned Today
    const ticketsAssignedToday = tickets.filter(t => {
      if (!t.assignedDate) return false;
      const assigned = new Date(t.assignedDate);
      return assigned >= today;
    }).length;

    // Average Resolution Time
    const resolvedTickets = tickets.filter(t => t.resolvedDate);
    const avgResolutionTime = resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum, t) => {
        const submitted = new Date(t.submittedDate);
        const resolved = new Date(t.resolvedDate!);
        const hours = (resolved.getTime() - submitted.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0) / resolvedTickets.length
      : 0;

    // SLA Breaches
    const slaBreaches = tickets.filter(t => {
      if (['resolved', 'closed', 'rejected'].includes(t.status)) return false;
      const submitted = new Date(t.submittedDate);
      const hoursSinceSubmission = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60);
      return hoursSinceSubmission > slaHours;
    }).length;

    return {
      pendingReview,
      totalActiveTickets,
      ticketsAssignedToday,
      averageResolutionTime: Math.round(avgResolutionTime),
      slaBreaches
    };
  }, [tickets]);

  // Department Workload
  const departmentWorkload: DepartmentWorkload[] = useMemo(() => {
    const deptMap = new Map<string, number>();

    tickets.forEach(t => {
      if (!['resolved', 'closed', 'rejected'].includes(t.status)) {
        const count = deptMap.get(t.department) || 0;
        deptMap.set(t.department, count + 1);
      }
    });

    const workload: DepartmentWorkload[] = Array.from(deptMap.entries()).map(([dept, count]) => {
      let loadLevel: 'low' | 'medium' | 'high' = 'low';
      if (count > 15) loadLevel = 'high';
      else if (count > 8) loadLevel = 'medium';

      return { department: dept, activeTickets: count, loadLevel };
    });

    return workload.sort((a, b) => b.activeTickets - a.activeTickets);
  }, [tickets]);

  // Chart data for Department Workload
  const chartData = useMemo(() => {
    return departmentWorkload.map(dept => ({
      department: dept.department,
      assigned: dept.activeTickets,
      completed: 0,
      pending: 0
    }));
  }, [departmentWorkload]);

  // Tickets Requiring Attention
  const ticketsRequiringAttention: TicketRequiringAttention[] = useMemo(() => {
    const now = new Date();
    const attentionTickets: TicketRequiringAttention[] = [];

    tickets.forEach(ticket => {
      const submitted = new Date(ticket.submittedDate);
      const hoursSinceSubmission = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60);
      const slaHours = 72;

      // Pending review > 24 hours
      if ((ticket.status === 'pending' || ticket.status === 'submitted') && hoursSinceSubmission > 24) {
        attentionTickets.push({
          ticket,
          reason: `Pending review for ${Math.floor(hoursSinceSubmission / 24)} days`,
          priority: hoursSinceSubmission > 48 ? 'high' : 'medium'
        });
      }

      // SLA breaches
      if (!['resolved', 'closed', 'rejected'].includes(ticket.status) && hoursSinceSubmission > slaHours) {
        const existing = attentionTickets.find(item => item.ticket.id === ticket.id);
        if (!existing) {
          attentionTickets.push({
            ticket,
            reason: `SLA breached by ${Math.floor((hoursSinceSubmission - slaHours) / 24)} days`,
            priority: 'high'
          });
        }
      }
    });

    return attentionTickets
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 10); // Top 10
  }, [tickets]);

  // SLA Alerts
  const slaAlerts: SLATicket[] = useMemo(() => {
    const now = new Date();
    const slaHours = 72;
    const alerts: SLATicket[] = [];

    tickets.forEach(ticket => {
      if (['resolved', 'closed', 'rejected'].includes(ticket.status)) return;

      const submitted = new Date(ticket.submittedDate);
      const hoursSinceSubmission = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60);
      const remaining = slaHours - hoursSinceSubmission;
      const percentage = (remaining / slaHours) * 100;

      const isBreached = hoursSinceSubmission > slaHours;
      const isApproaching = !isBreached && percentage < 25;

      if (isBreached || isApproaching) {
        alerts.push({
          ticket,
          timeOverdue: isBreached ? hoursSinceSubmission - slaHours : undefined,
          timeRemaining: !isBreached ? remaining : undefined,
          isBreached,
          isApproaching
        });
      }
    });

    return alerts
      .sort((a, b) => {
        if (a.isBreached && !b.isBreached) return -1;
        if (!a.isBreached && b.isBreached) return 1;
        return (a.timeOverdue || 0) - (b.timeOverdue || 0);
      })
      .slice(0, 10); // Top 10
  }, [tickets]);

  // Generate Recent Activity
  const generateRecentActivity = (ticketsList: Ticket[]): any[] => {
    const activities: any[] = [];

    ticketsList.forEach(ticket => {
      // Ticket assigned
      if (ticket.assignedDate) {
        activities.push({
          id: `${ticket.id}-assigned`,
          type: 'assigned',
          title: 'Ticket Assigned',
          description: `${ticket.ticketId}: ${ticket.subject}`,
          timestamp: ticket.assignedDate,
          user: ticket.moderatorName || 'System',
          ticketId: ticket.id
        });
      }

      // Ticket completed
      if (ticket.completedDate) {
        activities.push({
          id: `${ticket.id}-completed`,
          type: 'completed',
          title: 'Work Completed',
          description: `${ticket.ticketId}: ${ticket.subject}`,
          timestamp: ticket.completedDate,
          user: ticket.assigneeName || 'Assignee',
          ticketId: ticket.id
        });
      }

      // Ticket resolved
      if (ticket.resolvedDate) {
        activities.push({
          id: `${ticket.id}-resolved`,
          type: 'resolved',
          title: 'Ticket Resolved',
          description: `${ticket.ticketId}: ${ticket.subject}`,
          timestamp: ticket.resolvedDate,
          user: ticket.requesterName,
          ticketId: ticket.id
        });
      }

      // Recent ticket created
      const submitted = new Date(ticket.submittedDate);
      const hoursAgo = (Date.now() - submitted.getTime()) / (1000 * 60 * 60);
      if (hoursAgo < 24) {
        activities.push({
          id: `${ticket.id}-created`,
          type: 'created',
          title: 'Ticket Created',
          description: `${ticket.ticketId}: ${ticket.subject}`,
          timestamp: ticket.submittedDate,
          user: ticket.requesterName,
          ticketId: ticket.id
        });
      }
    });

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created': return FileText;
      case 'assigned': return Users;
      case 'completed': return CheckCircle;
      case 'resolved': return CheckCircle;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'created': return THEME.colors.info;
      case 'assigned': return THEME.colors.primary;
      case 'completed': return THEME.colors.success;
      case 'resolved': return THEME.colors.success;
      default: return THEME.colors.gray;
    }
  };

  const handleDepartmentClick = (department: string) => {
    router.push(`/moderator/ticket-pool?department=${encodeURIComponent(department)}`);
  };

  const handleTicketClick = (ticketId: string) => {
    router.push(`/moderator/review?id=${ticketId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ backgroundColor: THEME.colors.background }}>
      {/* Mock Data Indicator */}
      {useMockData && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <strong>Demo Mode:</strong> Showing mock data for demonstration purposes
          </p>
        </div>
      )}

      {/* Shared Dashboard Header */}
      <DashboardHeader
        title="Helpdesk Overview"
        subtitle="System-wide statistics and performance metrics"
        lastUpdated={formatDate(new Date().toISOString(), 'time')}
        stats={[
          { label: 'Total Tickets', value: tickets.length, color: THEME.colors.primary },
          { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, color: THEME.colors.success },
          { label: 'Pending', value: tickets.filter(t => ['pending', 'submitted'].includes(t.status)).length, color: THEME.colors.warning },
          { label: 'SLA Breaches', value: stats.slaBreaches, color: THEME.colors.error }
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
        <KpiCard
          title="Pending Review"
          value={stats.pendingReview}
          icon={Clock}
          color={THEME.colors.warning}
          description="Tickets awaiting review > 24h"
          onClick={() => router.push('/moderator/review')}
        />
        <KpiCard
          title="Total Active Tickets"
          value={stats.totalActiveTickets}
          icon={FileText}
          color={THEME.colors.primary}
          description="All non-closed tickets"
        />
        <KpiCard
          title="Assigned Today"
          value={stats.ticketsAssignedToday}
          icon={Users}
          color={THEME.colors.info}
          description="Tickets assigned today"
        />
        <KpiCard
          title="Avg Resolution Time"
          value={`${stats.averageResolutionTime}h`}
          icon={Timer}
          color={THEME.colors.success}
          description="Average time to resolve"
        />
        <KpiCard
          title="SLA Breaches"
          value={stats.slaBreaches}
          icon={AlertCircle}
          color={stats.slaBreaches > 0 ? THEME.colors.error : THEME.colors.success}
          backgroundColor={stats.slaBreaches > 0 ? '#FEE2E2' : '#D1FAE5'}
          description={stats.slaBreaches > 0 ? 'Tickets with breached SLA' : 'All tickets within SLA'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Department Workload */}
        <div className="lg:col-span-2">
          <Card className="h-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold" style={{ color: THEME.colors.primary }}>
                Department Workload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <DepartmentLoadChart data={chartData} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets Requiring Attention */}
        <div className="lg:col-span-1">
          <Card className="h-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2" style={{ color: THEME.colors.error }}>
                <AlertCircle className="w-5 h-5" />
                Requires Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {ticketsRequiringAttention.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>No urgent issues found</p>
                  </div>
                ) : (
                  ticketsRequiringAttention.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      style={{
                        borderLeftColor: item.priority === 'high' ? THEME.colors.error : THEME.colors.warning
                      }}
                      onClick={() => handleTicketClick(item.ticket.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm text-gray-800">{item.ticket.ticketId}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {item.ticket.department}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 truncate mb-1">{item.ticket.subject}</p>
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {item.reason}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Alerts */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2" style={{ color: THEME.colors.warning }}>
              <Clock className="w-5 h-5" />
              SLA Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slaAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>All tickets within SLA</p>
                </div>
              ) : (
                slaAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleTicketClick(alert.ticket.id)}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{alert.ticket.ticketId}</span>
                        {alert.isBreached && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                            Breached
                          </span>
                        )}
                        {alert.isApproaching && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                            Approaching
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate max-w-[200px] sm:max-w-xs">
                        {alert.ticket.subject}
                      </p>
                    </div>
                    <div className="text-right">
                      {alert.isBreached ? (
                        <span className="text-sm font-bold text-red-600">
                          -{Math.round(alert.timeOverdue || 0)}h
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-yellow-600">
                          {Math.round(alert.timeRemaining || 0)}h left
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2" style={{ color: THEME.colors.info }}>
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity</p>
                </div>
              ) : (
                recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  const color = getActivityColor(activity.type);

                  return (
                    <div key={activity.id} className="flex gap-3">
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(activity.timestamp)}
                          </span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-500 font-medium">
                            {activity.user}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModeratorDashboard;