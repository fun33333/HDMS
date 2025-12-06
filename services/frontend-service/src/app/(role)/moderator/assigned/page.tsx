'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { PriorityBadge } from '../../../../components/common/PriorityBadge';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { ViewButton, ReassignButton } from '../../../../components/common/ActionButtons';
import {
  UserPlus,
  FileText,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import DataTable, { Column } from '../../../../components/ui/DataTable';
import PageSkeleton from '../../../../components/ui/PageSkeleton'; // Keeping for safety, though unused in this file after edit
import { TableSkeleton } from '../../../../components/skeletons/TableSkeleton';
import ErrorBanner from '../../../../components/ui/ErrorBanner';
import ConfirmModal from '../../../../components/modals/ConfirmModal';
import ticketService from '../../../../services/api/ticketService';
import { Ticket } from '../../../../types';
import { THEME } from '../../../../lib/theme';
import { formatDate, formatRelativeTime } from '../../../../lib/helpers';

// Mock data generator for assigned tickets
const generateMockAssignedTickets = (): Ticket[] => {
  const now = new Date();
  const departments = ['Development', 'Finance & Accounts', 'Procurement', 'Basic Maintenance', 'IT', 'Architecture', 'Administration'];
  const assignees = ['Ahmed Khan', 'Fatima Ali', 'Hassan Raza', 'Sara Ahmed', 'Ali Hassan', 'Zainab Malik', 'Bilal Khan', 'Nadia Sheikh'];
  const priorities: Ticket['priority'][] = ['low', 'medium', 'high', 'urgent'];
  const requesterNames = [
    'Ahmed Khan', 'Fatima Ali', 'Hassan Raza', 'Sara Ahmed', 'Ali Hassan',
    'Zainab Malik', 'Bilal Khan', 'Nadia Sheikh', 'Omar Ali', 'Ayesha Raza',
    'Kamran Malik', 'Saima Khan', 'Tariq Hussain', 'Farhan Ali', 'Hina Sheikh'
  ];

  const mockTickets: Ticket[] = [];

  for (let i = 1; i <= 20; i++) {
    const dept = departments[Math.floor(Math.random() * departments.length)];
    const assignee = assignees[Math.floor(Math.random() * assignees.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const hoursAgo = Math.floor(Math.random() * 72);
    const requesterIndex = (i - 1) % requesterNames.length;
    const status = Math.random() > 0.5 ? 'assigned' : 'in_progress';

    mockTickets.push({
      id: `assigned-ticket-${i}`,
      ticketId: `HD-2024-${String(i).padStart(3, '0')}`,
      subject: `Assigned Ticket ${i}: ${['Server Issue', 'Network Problem', 'Hardware Request', 'Software License', 'Maintenance Request'][Math.floor(Math.random() * 5)]}`,
      description: `This is an assigned ticket description for ticket ${i}`,
      department: dept,
      priority,
      status,
      requesterId: `req-${i}`,
      requesterName: requesterNames[requesterIndex],
      assigneeId: `assignee-${i}`,
      assigneeName: assignee,
      submittedDate: new Date(now.getTime() - (hoursAgo + 24) * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString(),
    });
  }

  return mockTickets;
};

const AssignedTicketsPage: React.FC = () => {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; ticketId?: string }>({ open: false });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Fetch tickets function
  const fetchTickets = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Fetch both assigned and in_progress tickets
      const response = await ticketService.getTickets();

      // ✅ Check if response exists and has results
      if (response && (Array.isArray(response) || response.results)) {
        const ticketsList = Array.isArray(response) ? response : (response.results || []);

        // Filter for assigned and in_progress tickets
        const assignedTickets = ticketsList.filter(t =>
          t.status === 'assigned' || t.status === 'in_progress'
        );

        setTickets(assignedTickets);
        setUseMockData(false);
        setError(null);
      } else {
        // No valid response, use mock data
        const mockTickets = generateMockAssignedTickets();
        setTickets(mockTickets);
        setUseMockData(true);
        setError(null);
      }
    } catch (error: any) {
      // ✅ Handle network errors gracefully
      const isNetworkError = error?.isNetworkError || !error?.response;

      if (isNetworkError) {
        console.warn('API not available, using mock data');
        const mockTickets = generateMockAssignedTickets();
        setTickets(mockTickets);
        setUseMockData(true);
        setError(null);
      } else {
        console.error('Error fetching tickets:', error?.message || error);
        setError('Failed to load tickets. Please try again.');
        setTickets([]);
        setUseMockData(false);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTickets();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTickets(true);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const assignedTickets = tickets.filter(t => t.status === 'assigned' || t.status === 'in_progress');

  // Calculate statistics
  const stats = {
    total: assignedTickets.length,
    assigned: assignedTickets.filter(t => t.status === 'assigned').length,
    inProgress: assignedTickets.filter(t => t.status === 'in_progress').length,
    byDepartment: assignedTickets.reduce((acc, t) => {
      acc[t.department] = (acc[t.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const handleViewTicket = (ticketId: string) => {
    router.push(`/moderator/review/${ticketId}`);
  };

  const handleReassignTicket = (ticketId: string) => {
    setConfirm({ open: true, ticketId });
  };

  const filteredTickets = assignedTickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.requesterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.assigneeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesDepartment = departmentFilter === 'all' || ticket.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
  });

  const columns: Column<any>[] = [
    {
      key: 'ticketId',
      header: 'Ticket ID',
      sortable: true,
      accessor: (r) => (
        <button
          onClick={() => handleViewTicket(r.id)}
          className="font-semibold hover:underline transition-colors"
          style={{ color: THEME.colors.primary }}
        >
          {r.ticketId}
        </button>
      )
    },
    {
      key: 'subject',
      header: 'Title',
      sortable: true,
      accessor: (r) => (
        <span className="text-gray-900 max-w-[200px] truncate block" title={r.subject}>
          {r.subject}
        </span>
      )
    },
    {
      key: 'requesterName',
      header: 'Requester',
      sortable: true,
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
            style={{ backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}` }}
          >
            {r.requesterName?.substring(0, 2).toUpperCase() || 'N/A'}
          </div>
          <span className="text-sm text-gray-700">{r.requesterName || '—'}</span>
        </div>
      )
    },
    {
      key: 'assigneeName',
      header: 'Assignee',
      sortable: true,
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-gray-900">{r.assigneeName || 'Not assigned'}</span>
        </div>
      )
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      accessor: (r) => <span className="text-sm text-gray-600">{r.department}</span>
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      accessor: (r) => r.priority ? <PriorityBadge priority={r.priority} /> : <span className="text-xs text-gray-400 italic">Not set</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (r) => <StatusBadge status={r.status} />
    },
    {
      key: 'assignedDate',
      header: 'Assigned Date',
      sortable: true,
      accessor: (r) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-900">
            {r.assignedDate ? formatDate(r.assignedDate, 'short') : 'N/A'}
          </span>
          {r.assignedDate && (
            <span className="text-xs text-gray-500">
              {formatRelativeTime(r.assignedDate)}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (r) => (
        <div className="flex gap-2">
          <ViewButton onClick={() => handleViewTicket(r.id)} />
          <ReassignButton onClick={() => handleReassignTicket(r.id)} variant="success" />
        </div>
      )
    }
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ backgroundColor: THEME.colors.background }}>
      {/* Mock Data Indicator */}
      {useMockData && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <strong>Demo Mode:</strong> Showing mock data for demonstration purposes
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Link href="/moderator/dashboard" className="mr-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: THEME.colors.primary }}>
              Assigned Tickets
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              View and manage tickets assigned to assignees
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={() => fetchTickets(true)}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Total Assigned</p>
                <p className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>
                  {stats.total}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: THEME.colors.primary + '15' }}>
                <FileText className="w-6 h-6" style={{ color: THEME.colors.primary }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Assigned</p>
                <p className="text-2xl font-bold" style={{ color: THEME.colors.info }}>
                  {stats.assigned}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: THEME.colors.info + '15' }}>
                <UserPlus className="w-6 h-6" style={{ color: THEME.colors.info }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold" style={{ color: THEME.colors.warning }}>
                  {stats.inProgress}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: THEME.colors.warning + '15' }}>
                <Clock className="w-6 h-6" style={{ color: THEME.colors.warning }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Departments</p>
                <p className="text-2xl font-bold" style={{ color: THEME.colors.success }}>
                  {Object.keys(stats.byDepartment).length}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: THEME.colors.success + '15' }}>
                <TrendingUp className="w-6 h-6" style={{ color: THEME.colors.success }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter - Responsive */}
      <Card className="mb-6 shadow-lg">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by ticket ID, title, requester, assignee, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 pr-10"
                style={{
                  borderColor: THEME.colors.gray,
                }}
                onFocus={(e) => e.target.style.borderColor = THEME.colors.primary}
                onBlur={(e) => e.target.style.borderColor = THEME.colors.gray}
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
                style={{
                  borderColor: THEME.colors.gray,
                }}
                onFocus={(e) => e.target.style.borderColor = THEME.colors.primary}
                onBlur={(e) => e.target.style.borderColor = THEME.colors.gray}
              >
                <option value="all">All Status ({assignedTickets.length})</option>
                <option value="assigned">Assigned ({stats.assigned})</option>
                <option value="in_progress">In Progress ({stats.inProgress})</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
                style={{
                  borderColor: THEME.colors.gray,
                }}
                onFocus={(e) => e.target.style.borderColor = THEME.colors.primary}
                onBlur={(e) => e.target.style.borderColor = THEME.colors.gray}
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
                style={{
                  borderColor: THEME.colors.gray,
                }}
                onFocus={(e) => e.target.style.borderColor = THEME.colors.primary}
                onBlur={(e) => e.target.style.borderColor = THEME.colors.gray}
              >
                <option value="all">All Departments</option>
                {Object.keys(stats.byDepartment).map(dept => (
                  <option key={dept} value={dept}>
                    {dept} ({stats.byDepartment[dept]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-lg md:text-xl font-bold text-gray-900">
              Assigned Tickets
            </CardTitle>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{filteredTickets.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{assignedTickets.length}</span> tickets
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="p-4">
              <ErrorBanner
                message={error}
                onRetry={() => {
                  setError(null);
                  fetchTickets();
                }}
              />
            </div>
          )}
          {filteredTickets.length === 0 && !error ? (
            <div className="text-center py-12 px-4">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No assigned tickets found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || departmentFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'No tickets have been assigned yet. Assign tickets from the Ticket Pool or Review page.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable
                data={filteredTickets}
                columns={columns}
                initialSort={{ key: 'assignedDate', dir: 'desc' }}
                pageSize={10}
                showSearch={false}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={confirm.open}
        title={'Reassign this ticket?'}
        description="You can proceed to the relevant page after confirmation."
        onClose={() => setConfirm({ open: false })}
        onConfirm={() => {
          const id = confirm.ticketId;
          setConfirm({ open: false });
          if (id) router.push(`/moderator/reassign/${id}`);
        }}
      />
    </div>
  );
};

export default AssignedTicketsPage;
