'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/Button';
import { KpiCard } from '../common/KpiCard';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityDistributionChart } from '../charts/PriorityDistributionChart';
import { StatusDistributionChart } from '../charts/StatusDistributionChart';
import { ResolutionTimeTrendChart } from '../charts/ResolutionTimeTrendChart';
import { DashboardHeader } from './DashboardHeader';
import DataTable, { Column } from '../ui/DataTable';
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Ticket } from '../../types';
import {
  getMockTickets,
  calculateTicketStats,
  getPriorityDistribution,
  getStatusDistribution
} from '../../lib/mockData';

const requestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'resolved' | 'drafts'>('all');

  // Fetch tickets (hard-coded for now)
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Use hard-coded data
        const mockTickets = getMockTickets(user?.id || '1');
        setTickets(mockTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  // Calculate statistics
  const stats = useMemo(() => calculateTicketStats(tickets), [tickets]);

  // Get recent tickets (5-10 most recent)
  const recentTickets = useMemo(() => {
    const sorted = [...tickets].sort((a, b) => {
      const dateA = new Date(a.submittedDate).getTime();
      const dateB = new Date(b.submittedDate).getTime();
      return dateB - dateA;
    });

    // Apply filter
    if (activeFilter === 'open') {
      return sorted.filter(t =>
        t.status === 'pending' || t.status === 'assigned' || t.status === 'in_progress'
      ).slice(0, 10);
    } else if (activeFilter === 'resolved') {
      return sorted.filter(t =>
        t.status === 'resolved' || t.status === 'completed'
      ).slice(0, 10);
    } else if (activeFilter === 'drafts') {
      // Drafts are not tickets, so return empty array
      return [];
    }

    return sorted.slice(0, 10);
  }, [tickets, activeFilter]);

  // Get priority and status distributions
  const priorityDistribution = useMemo(() => getPriorityDistribution(tickets), [tickets]);
  const statusDistribution = useMemo(() => getStatusDistribution(tickets), [tickets]);

  // Format date helper
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Define columns for DataTable
  const columns: Column<Ticket>[] = [
    {
      key: 'ticketId',
      header: 'ID',
      accessor: (ticket) => (
        <span className="font-medium" style={{ color: '#274c77' }}>
          {ticket.ticketId}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'subject',
      header: 'Title',
      accessor: (ticket) => (
        <div className="max-w-xs">
          <p className="font-medium text-sm truncate" style={{ color: '#111827' }}>
            {ticket.subject}
          </p>
          {ticket.description && (
            <p className="text-xs truncate mt-1" style={{ color: '#8b8c89' }}>
              {ticket.description}
            </p>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (ticket) => <StatusBadge status={ticket.status} />,
      sortable: true,
    },
    {
      key: 'priority',
      header: 'Priority',
      accessor: (ticket) => <PriorityBadge priority={ticket.priority} />,
      sortable: true,
    },
    {
      key: 'department',
      header: 'Department',
      accessor: (ticket) => (
        <span className="text-sm" style={{ color: '#6b7280' }}>
          {ticket.department}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'submittedDate',
      header: 'Created',
      accessor: (ticket) => (
        <span className="text-sm" style={{ color: '#6b7280' }}>
          {formatDate(ticket.submittedDate)}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (ticket) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/requestor/request-detail/${ticket.id}`);
          }}
          rightIcon={<ArrowRight className="w-3 h-3" />}
          className="text-xs"
        >
          View
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6" style={{ backgroundColor: '#e7ecef', minHeight: '100vh' }}>
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" style={{ backgroundColor: '#e7ecef', minHeight: '100vh' }}>
      {/* Shared Dashboard Header */}
      <DashboardHeader
        title={`Welcome, ${user?.name || 'User'}! 👋`}
        subtitle="Here's an overview of your help desk requests"
        stats={[
          { label: 'Total Requests', value: stats.totalRequests },
          { label: 'Open Tickets', value: stats.openTickets, isWarning: stats.openTickets > 5 }
        ]}
        actionButton={{
          label: 'New Request',
          onClick: () => router.push('/requestor/new-request'),
          icon: <Plus className="w-4 h-4" style={{ color: 'white' }} />
        }}
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Total Requests"
          value={stats.totalRequests}
          icon={FileText}
          color="#ffffff"
          backgroundColor="#365486"
          description="All tickets you've created"
          onClick={() => router.push('/requestor/requests')}
        />

        <KpiCard
          title="Open Tickets"
          value={stats.openTickets}
          icon={AlertCircle}
          color="#ffffff"
          backgroundColor="#adb5bd"
          description="Tickets in progress/pending"
          trend={stats.openTickets > 0 ? {
            value: stats.openTickets > 5 ? 10 : -5,
            label: 'vs last week'
          } : undefined}
          onClick={() => {
            setActiveFilter('open');
            router.push('/requestor/requests?filter=open');
          }}
        />

        <KpiCard
          title="Resolved This Month"
          value={stats.resolvedThisMonth}
          icon={CheckCircle}
          color="#ffffff"
          backgroundColor="#6096ba"
          description="Tickets closed this month"
          trend={{
            value: stats.resolvedTrend,
            label: 'vs last month'
          }}
          onClick={() => {
            setActiveFilter('resolved');
            router.push('/requestor/requests?filter=resolved');
          }}
        />

        <KpiCard
          title="Average Resolution Time"
          value={`${stats.avgResolutionTime} days`}
          icon={Clock}
          color="#374151"
          backgroundColor="#e5e7eb"
          description="Average time to resolve"
          trend={{
            value: -stats.resolutionTimeTrend,
            label: 'vs last month'
          }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution Chart */}
        <PriorityDistributionChart data={priorityDistribution} />

        {/* Status Distribution Chart */}
        <StatusDistributionChart data={statusDistribution} />
      </div>

      {/* Resolution Time Trend Chart */}
      <ResolutionTimeTrendChart data={[]} />

      {/* Recent Requests Table */}
      <Card className="rounded-xl bg-white shadow-md">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-bold" style={{ color: '#274c77' }}>
              My Recent Requests
            </h2>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'open', 'resolved', 'drafts'] as const).map((filter) => {
                const isActive = activeFilter === filter;
                if (isActive) {
                  return (
                    <Button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      variant="primary"
                      size="sm"
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Button>
                  );
                }
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 bg-gray-100 hover:bg-gray-200 border-none"
                    style={{
                      color: '#374151',
                      fontWeight: 500,
                    }}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/requestor/requests')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="text-sm"
              >
                View All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={recentTickets}
            columns={columns}
            showSearch={false}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default requestorDashboard;