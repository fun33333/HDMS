'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { PriorityBadge } from '../../../../components/common/PriorityBadge';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause,
  ArrowLeft,
  Search,
  Filter,
  User,
  Calendar,
  Building,
  Eye,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';
import { THEME } from '../../../../lib/theme';
import { AnalyticsCard } from '../../../../components/common/AnalyticsCard';
import DataTable, { Column } from '../../../../components/ui/DataTable';
import PageSkeleton from '../../../../components/ui/PageSkeleton';
import ErrorBanner from '../../../../components/ui/ErrorBanner';
import ConfirmModal from '../../../../components/modals/ConfirmModal';
import ticketService from '../../../../services/api/ticketService';
import { Ticket } from '../../../../types';
import { useEffect } from 'react';

const MyTasksPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [confirm, setConfirm] = useState<{ open: boolean; ticketId?: string; action?: 'start' | 'complete' }>({ open: false });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await ticketService.getTickets({ assigneeId: user?.id });
        const ticketsList = Array.isArray(response) ? response : (response?.results || []);
        setTickets(ticketsList);
      } catch (error: any) {
        console.error('Error fetching tickets:', error);
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchTickets();
    }
  }, [user?.id]);

  // Filter tickets assigned to current assignee
  const myTasks = tickets.filter(t => t.assigneeId === user?.id);


  const filteredTasks = myTasks.filter(task => {
    const matchesSearch = task.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.requesterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStartTask = (taskId: string) => {
    setConfirm({ open: true, ticketId: taskId, action: 'start' });
  };

  const handleCompleteTask = (taskId: string) => {
    setConfirm({ open: true, ticketId: taskId, action: 'complete' });
  };

  const handleViewTask = (taskId: string) => {
    router.push(`/assignee/task-detail/${taskId}`);
  };

  const columns: Column<any>[] = [
    { key: 'ticketId', header: 'Ticket', sortable: true, accessor: (r) => <span className="font-medium">{r.ticketId}</span> },
    { key: 'subject', header: 'Subject', sortable: true, accessor: (r) => r.subject },
    { key: 'status', header: 'Status', sortable: true, accessor: (r) => <StatusBadge status={r.status} withIcon={true} /> },
    { key: 'submittedDate', header: 'Assigned', sortable: true, accessor: (r) => new Date(r.submittedDate).toLocaleDateString() },
    { key: 'actions', header: 'Actions', accessor: (r) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => handleViewTask(r.id)}
            className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center space-x-1"
          >
            <Eye className="w-3 h-3" />
            <span>View</span>
          </Button>
          {r.status === 'assigned' && (
            <Button
              onClick={() => handleStartTask(r.id)}
              className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center space-x-1"
            >
              <Play className="w-3 h-3" />
              <span>Start</span>
            </Button>
          )}
          {r.status === 'in_progress' && (
            <Button
              onClick={() => handleCompleteTask(r.id)}
              className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center space-x-1"
            >
              <Check className="w-3 h-3" />
              <span>Complete</span>
            </Button>
          )}
        </div>
      )
    }
  ];

  if (loading) return <PageSkeleton rows={8} />;
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/assignee/dashboard">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600">Manage your assigned tasks and track progress</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-gray-500" />
          <span className="text-sm text-gray-500">{myTasks.length} tasks assigned</span>
        </div>
      </div>

      {/* Quick Stats - Using AnalyticsCard with THEME colors (All different colors) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Tasks"
          value={myTasks.length}
          icon={FileText}
          color={THEME.colors.light}
          onClick={() => setStatusFilter('all')}
          hoverDescription="All assigned tasks"
        />

        <AnalyticsCard
          title="Assigned"
          value={myTasks.filter(t => t.status === 'assigned').length}
          icon={Clock}
          color={THEME.colors.medium}
          onClick={() => setStatusFilter('assigned')}
          hoverDescription="Ready to start"
        />

        <AnalyticsCard
          title="In Progress"
          value={myTasks.filter(t => t.status === 'in_progress').length}
          icon={Play}
          color={THEME.colors.primary}
          onClick={() => setStatusFilter('in_progress')}
          hoverDescription="Currently working"
        />

        <AnalyticsCard
          title="Completed"
          value={myTasks.filter(t => t.status === 'resolved').length}
          icon={CheckCircle}
          color={THEME.colors.gray}
          onClick={() => setStatusFilter('resolved')}
          hoverDescription="Successfully done"
        />
      </div>

      {/* Search and Filter */}
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search my tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">My Assigned Tasks</h2>
            <span className="text-sm text-gray-500">{filteredTasks.length} tasks</span>
          </div>
          {error ? <ErrorBanner message={error} onRetry={() => setError(null)} /> : null}
          <DataTable data={filteredTasks} columns={columns} initialSort={{ key: 'submittedDate', dir: 'desc' }} pageSize={10} showSearch={false} />
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={confirm.open}
        title={confirm.action === 'start' ? 'Start this task?' : 'Complete this task?'}
        description="This will update the task status."
        loading={processing}
        onClose={() => setConfirm({ open: false })}
        onConfirm={async () => {
          const { ticketId, action } = confirm;
          if (!ticketId || !action) return;
          try {
            setProcessing(true);
            if (action === 'start') {
              await ticketService.updateTicket(ticketId, { status: 'in_progress' });
            }
            if (action === 'complete') {
              await ticketService.updateTicket(ticketId, { status: 'resolved' });
            }
            // Refresh tickets
            const response = await ticketService.getTickets({ assigneeId: user?.id });
            const ticketsList = Array.isArray(response) ? response : (response?.results || []);
            setTickets(ticketsList);
          } finally {
            setProcessing(false);
            setConfirm({ open: false });
          }
        }}
      />
    </div>
  );
};

export default MyTasksPage;
