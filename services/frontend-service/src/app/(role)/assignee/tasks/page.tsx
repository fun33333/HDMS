'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { PriorityBadge } from '../../../../components/common/PriorityBadge';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { AnalyticsCard } from '../../../../components/common/AnalyticsCard';
import { TableSkeleton } from '../../../../components/skeletons/TableSkeleton';
import ticketService from '../../../../services/api/ticketService';
import { Ticket } from '../../../../types';
import { THEME } from '../../../../lib/theme';
import { formatDate } from '../../../../lib/helpers';
import {
  FileText,
  Clock,
  CheckCircle,
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Activity
} from 'lucide-react';
import Link from 'next/link';

// Demo tasks generator
const generateDemoTasks = (assigneeId: string): Ticket[] => {
  const now = new Date();
  return [
    {
      id: '1',
      ticketId: 'TKT-001',
      subject: 'Fix network connectivity issue in Building A',
      description: 'Users reporting intermittent network disconnections in Building A. Need to check routers and switches.',
      department: 'IT',
      priority: 'high',
      status: 'assigned',
      requesterId: 'req1',
      requesterName: 'John Doe',
      assigneeId: assigneeId,
      assigneeName: 'Current User',
      submittedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      ticketId: 'TKT-002',
      subject: 'Update software licenses for Office Suite',
      description: 'Need to renew and update Microsoft Office licenses for all departments.',
      department: 'IT',
      priority: 'medium',
      status: 'in_progress',
      requesterId: 'req2',
      requesterName: 'Jane Smith',
      assigneeId: assigneeId,
      assigneeName: 'Current User',
      submittedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      ticketId: 'TKT-003',
      subject: 'Install new printer in Conference Room',
      description: 'Setup and configure new HP LaserJet printer in the main conference room.',
      department: 'IT',
      priority: 'low',
      status: 'assigned',
      requesterId: 'req3',
      requesterName: 'Bob Wilson',
      assigneeId: assigneeId,
      assigneeName: 'Current User',
      submittedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      ticketId: 'TKT-004',
      subject: 'Resolve email server downtime',
      description: 'Email server crashed and needs immediate attention. All users unable to send/receive emails.',
      department: 'IT',
      priority: 'urgent',
      status: 'in_progress',
      requesterId: 'req4',
      requesterName: 'Sarah Johnson',
      assigneeId: assigneeId,
      assigneeName: 'Current User',
      submittedDate: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      ticketId: 'TKT-005',
      subject: 'Configure VPN access for remote workers',
      description: 'Setup VPN credentials for 15 remote employees working from home.',
      department: 'IT',
      priority: 'high',
      status: 'in_progress',
      requesterId: 'req5',
      requesterName: 'Tom Brown',
      assigneeId: assigneeId,
      assigneeName: 'Current User',
      submittedDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '6',
      ticketId: 'TKT-006',
      subject: 'Backup database server',
      description: 'Perform weekly backup of production database and verify integrity.',
      department: 'IT',
      priority: 'medium',
      status: 'completed',
      requesterId: 'req6',
      requesterName: 'Alice Green',
      assigneeId: assigneeId,
      assigneeName: 'Current User',
      submittedDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      completedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '7',
      ticketId: 'TKT-007',
      subject: 'Update antivirus software',
      description: 'Install latest antivirus updates on all workstations across the organization.',
      department: 'IT',
      priority: 'medium',
      status: 'completed',
      requesterId: 'req7',
      requesterName: 'Charlie Davis',
      assigneeId: assigneeId,
      assigneeName: 'Current User',
      submittedDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      completedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '8',
      ticketId: 'TKT-008',
      subject: 'Fix projector in Board Room',
      description: 'Projector not displaying correctly. Colors are distorted and image is blurry.',
      department: 'IT',
      priority: 'low',
      status: 'assigned',
      requesterId: 'req8',
      requesterName: 'David Lee',
      assigneeId: assigneeId,
      assigneeName: 'Current User',
      submittedDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

// Calculate SLA status
const calculateSLA = (ticket: Ticket): {
  status: 'breached' | 'approaching' | 'normal';
  daysRemaining?: number;
  daysOverdue?: number;
  label: string;
} => {
  const createdDate = new Date(ticket.submittedDate);
  const now = new Date();
  const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

  const slaDays = ticket.priority === 'urgent' || ticket.priority === 'high'
    ? 7
    : ticket.priority === 'medium'
      ? 14
      : 30;

  const daysRemaining = slaDays - daysSinceCreation;

  if (daysRemaining < 0) {
    return {
      status: 'breached',
      daysOverdue: Math.abs(Math.round(daysRemaining)),
      label: `${Math.abs(Math.round(daysRemaining))} days overdue`
    };
  } else if (daysRemaining <= 2) {
    return {
      status: 'approaching',
      daysRemaining: Math.round(daysRemaining),
      label: `${Math.round(daysRemaining)} days left`
    };
  } else {
    return {
      status: 'normal',
      daysRemaining: Math.round(daysRemaining),
      label: `${Math.round(daysRemaining)} days left`
    };
  }
};

const MyTasksPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [slaFilter, setSlaFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        if (user?.id) {
          try {
            const response = await ticketService.getTickets({ assigneeId: user.id });
            const ticketsList = Array.isArray(response) ? response : (response?.results || []);
            if (ticketsList.length > 0) {
              setTickets(ticketsList);
            } else {
              // If API returns empty, use demo data
              setTickets(generateDemoTasks(user.id));
            }
          } catch (error: any) {
            // Check if it's a network error
            const isNetworkError = error?.isNetworkError || !error?.response;
            if (isNetworkError) {
              console.warn('API not available, using demo data');
              setTickets(generateDemoTasks(user.id));
            } else {
              console.error('Error fetching tickets:', error);
              setError('Failed to load tasks');
              setTickets(generateDemoTasks(user.id)); // Still show demo data
            }
          }
        } else {
          setTickets(generateDemoTasks('assignee1'));
        }
      } catch (error: any) {
        console.error('Unexpected error:', error);
        setError('An unexpected error occurred');
        setTickets(generateDemoTasks(user?.id || 'assignee1'));
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user?.id]);

  // Filter tickets assigned to current assignee
  const myTasks = useMemo(() => {
    return tickets.filter(t => t.assigneeId === user?.id || t.assigneeId);
  }, [tickets, user?.id]);

  // Filter and search tickets
  const filteredTasks = useMemo(() => {
    let result = [...myTasks];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(task =>
        task.subject.toLowerCase().includes(searchLower) ||
        task.requesterName?.toLowerCase().includes(searchLower) ||
        task.ticketId.toLowerCase().includes(searchLower) ||
        task.department?.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter);
    }

    if (slaFilter !== 'all') {
      result = result.filter(task => {
        const sla = calculateSLA(task);
        if (slaFilter === 'breached') return sla.status === 'breached';
        if (slaFilter === 'approaching') return sla.status === 'approaching';
        if (slaFilter === 'normal') return sla.status === 'normal';
        return true;
      });
    }

    return result;
  }, [myTasks, searchTerm, statusFilter, priorityFilter, slaFilter]);

  const handleViewTicket = (ticketId: string) => {
    router.push(`/assignee/task-detail/${ticketId}`);
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/assignee/dashboard">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: THEME.colors.primary }}>
              My Tasks
            </h1>
            <p className="text-sm md:text-base" style={{ color: THEME.colors.gray }}>
              Manage your assigned tasks and track progress
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: THEME.colors.gray }}>
          <FileText className="w-5 h-5" />
          <span>{myTasks.length} tasks assigned</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
        <div className="h-full">
          <AnalyticsCard
            title="Total Tasks"
            value={myTasks.length}
            icon={FileText}
            color={THEME.colors.light}
            onClick={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
              setSlaFilter('all');
            }}
            hoverDescription="All assigned tasks"
          />
        </div>
        <div className="h-full">
          <AnalyticsCard
            title="Assigned"
            value={myTasks.filter(t => t.status === 'assigned').length}
            icon={Clock}
            color={THEME.colors.medium}
            onClick={() => setStatusFilter('assigned')}
            hoverDescription="Ready to start"
          />
        </div>
        <div className="h-full">
          <AnalyticsCard
            title="In Progress"
            value={myTasks.filter(t => t.status === 'in_progress').length}
            icon={Activity}
            color={THEME.colors.primary}
            onClick={() => setStatusFilter('in_progress')}
            hoverDescription="Currently working"
          />
        </div>
        <div className="h-full">
          <AnalyticsCard
            title="Completed"
            value={myTasks.filter(t => t.status === 'completed' || t.status === 'resolved').length}
            icon={CheckCircle}
            color={THEME.colors.success}
            onClick={() => setStatusFilter('completed')}
            hoverDescription="Successfully done"
          />
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white rounded-2xl shadow-xl border-0">
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: THEME.colors.gray }} size={20} />
              <input
                type="text"
                placeholder="Search by ticket ID, title, requester, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 md:py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm md:text-base"
                style={{
                  borderColor: THEME.colors.background,
                }}
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Filter className="w-4 h-4" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <span className="text-sm" style={{ color: THEME.colors.gray }}>
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: THEME.colors.background }}>
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-sm md:text-base"
                    style={{
                      borderColor: THEME.colors.background,
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                    Priority
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-sm md:text-base"
                    style={{
                      borderColor: THEME.colors.background,
                    }}
                  >
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* SLA Status Filter */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                    SLA Status
                  </label>
                  <select
                    value={slaFilter}
                    onChange={(e) => setSlaFilter(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-sm md:text-base"
                    style={{
                      borderColor: THEME.colors.background,
                    }}
                  >
                    <option value="all">All SLA Status</option>
                    <option value="breached">Breached</option>
                    <option value="approaching">Approaching</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card className="bg-white rounded-2xl shadow-xl border-0">
        <CardHeader className="p-4 md:p-6 lg:p-8 pb-2 md:pb-4">
          <CardTitle className="text-lg md:text-xl lg:text-2xl font-bold" style={{ color: THEME.colors.primary }}>
            My Assigned Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 lg:p-8 pt-2 md:pt-4">
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                {error} - Showing demo data for demonstration purposes.
              </p>
            </div>
          )}

          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: THEME.colors.background }}>
                <FileText className="w-8 h-8" style={{ color: THEME.colors.gray }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: THEME.colors.gray }}>
                No tasks found
              </h3>
              <p style={{ color: THEME.colors.gray }}>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y" style={{ borderColor: THEME.colors.background }}>
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: THEME.colors.background }}>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                          Ticket ID
                        </th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                          Title
                        </th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                          Requester
                        </th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                          Priority
                        </th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                          Created Date
                        </th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                          SLA
                        </th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: THEME.colors.background }}>
                      {filteredTasks.map((ticket) => {
                        const sla = calculateSLA(ticket);
                        return (
                          <tr
                            key={ticket.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-4 px-4 text-xs md:text-sm font-medium whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                              {ticket.ticketId || ticket.id.slice(0, 8)}
                            </td>
                            <td className="py-4 px-4 text-xs md:text-sm max-w-xs" style={{ color: THEME.colors.gray }}>
                              <div className="truncate" title={ticket.subject}>
                                {ticket.subject}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-xs md:text-sm whitespace-nowrap" style={{ color: THEME.colors.gray }}>
                              {ticket.requesterName || 'N/A'}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <PriorityBadge priority={ticket.priority} />
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <StatusBadge status={ticket.status} />
                            </td>
                            <td className="py-4 px-4 text-xs md:text-sm whitespace-nowrap" style={{ color: THEME.colors.gray }}>
                              {formatDate(ticket.submittedDate, 'short')}
                            </td>
                            <td className="py-4 px-4 text-xs md:text-sm whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${sla.status === 'breached'
                                  ? 'bg-red-100 text-red-800'
                                  : sla.status === 'approaching'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                  }`}
                              >
                                {sla.label}
                              </span>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<Eye className="w-3 h-3" />}
                                onClick={() => handleViewTicket(ticket.id)}
                                className="text-xs px-2 md:px-3"
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyTasksPage;
