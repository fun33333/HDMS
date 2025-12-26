'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { PriorityBadge } from '../../../../components/common/PriorityBadge';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import ticketService from '../../../../services/api/ticketService';
import { Ticket } from '../../../../types';
import { THEME } from '../../../../lib/theme';
import { formatDate } from '../../../../lib/helpers';
import DataTable, { Column } from '../../../../components/ui/DataTable';
import {
  FileText,
  ArrowLeft,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const MyTasksPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'resolved'>('all');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        if (user?.id) {
          // Fetch all tickets assigned to user
          const response = await ticketService.getTickets({ assigneeId: user.id });
          const ticketsList = Array.isArray(response) ? response : (response?.results || []);
          setTickets(ticketsList);
        }
      } catch (error: any) {
        console.error('Error fetching tickets:', error);
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user?.id]);

  const filteredTickets = useMemo(() => {
    if (activeFilter === 'active') {
      return tickets.filter(t => ['assigned', 'in_progress', 'pending', 'under_review'].includes(t.status));
    }
    if (activeFilter === 'resolved') {
      return tickets.filter(t => ['resolved', 'completed', 'closed', 'rejected'].includes(t.status));
    }
    return tickets;
  }, [tickets, activeFilter]);

  const columns: Column<Ticket>[] = [
    {
      key: 'ticketId',
      header: 'ID',
      accessor: (ticket) => (
        <span className="font-medium" style={{ color: THEME.colors.primary }}>
          {ticket.ticketId}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'subject',
      header: 'Subject',
      accessor: (ticket) => (
        <div className="max-w-xs">
          <p className="font-medium text-sm truncate" style={{ color: '#111827' }}>
            {ticket.subject}
          </p>
          <p className="text-xs truncate mt-1 text-gray-500">
            {ticket.description}
          </p>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'requestorName',
      header: 'Requestor',
      accessor: (ticket) => (
        <div className="text-sm text-gray-700">
          {ticket.requestorName?.split('\n')[0]}
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
      key: 'submittedDate',
      header: 'Created',
      accessor: (ticket) => (
        <span className="text-sm text-gray-600">
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
            router.push(`/assignee/task-detail/${ticket.id}`);
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
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/assignee/dashboard">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>
              My Tasks
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your assigned work
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Main Content */}
      <Card className="rounded-xl bg-white shadow-sm border-0">
        <CardHeader className="pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {(['all', 'active', 'resolved'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveFilter(filter)}
                  className="capitalize"
                >
                  {filter}
                </Button>
              ))}
            </div>
            <div className="text-sm text-gray-500">
              {filteredTickets.length} tasks
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
              <p className="text-gray-500">You don't have any tickets in this category.</p>
            </div>
          ) : (
            <DataTable
              data={filteredTickets}
              columns={columns}
              showSearch={true}
              pageSize={10}
              onRowClick={(ticket) => router.push(`/assignee/task-detail/${ticket.id}`)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyTasksPage;
