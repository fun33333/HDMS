'use client';

import React, { useEffect, useState } from 'react';
import DataTable from '../../../../components/ui/DataTable';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { PriorityBadge } from '../../../../components/common/PriorityBadge';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent } from '../../../../components/ui/card';
import { SkeletonLoader, SkeletonTable } from '../../../../components/ui/SkeletonLoader';
import { Eye, UserPlus, FileText } from 'lucide-react';
import { THEME } from '../../../../lib/theme';
import { Ticket } from '../../../../types';
import { formatDate } from '../../../../lib/helpers';
import { useRouter } from 'next/navigation';
import ticketService from '../../../../services/api/ticketService';

export default function TicketPoolPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'assigned'>('all');
  const router = useRouter();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Try to fetch tickets from pool endpoint, fallback to regular tickets
        const response = await ticketService.getTickets({ status: 'pending' });
        const ticketsList = Array.isArray(response) ? response : (response?.results || []);
        setTickets(ticketsList);
      } catch (error: any) {
        // Handle network errors gracefully - API might not be available
        const isNetworkError = error?.isNetworkError || !error?.response;
        if (isNetworkError) {
          console.warn('API not available, using empty tickets list');
          setTickets([]);
        } else {
          console.error('Error fetching tickets:', error?.message || error);
          setTickets([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ticket.status === 'pending';
    if (filter === 'assigned') return ticket.status === 'assigned';
    return true;
  });

  const columns = [
    {
      key: 'ticketId',
      header: 'Ticket ID',
      accessor: (ticket: Ticket) => (
        <span className="font-semibold" style={{ color: THEME.colors.primary }}>
          {ticket.ticketId}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'subject',
      header: 'Subject',
      accessor: (ticket: Ticket) => (
        <span className="text-gray-900">{ticket.subject}</span>
      ),
      sortable: true,
    },
    {
      key: 'department',
      header: 'Department',
      accessor: (ticket: Ticket) => (
        <span className="text-gray-600">{ticket.department}</span>
      ),
      sortable: true,
    },
    {
      key: 'priority',
      header: 'Priority',
      accessor: (ticket: Ticket) => <PriorityBadge priority={ticket.priority} />,
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (ticket: Ticket) => <StatusBadge status={ticket.status} />,
      sortable: true,
    },
    {
      key: 'requesterName',
      header: 'Requester',
      accessor: (ticket: Ticket) => (
        <span className="text-gray-600">{ticket.requesterName}</span>
      ),
      sortable: true,
    },
    {
      key: 'submittedDate',
      header: 'Submitted',
      accessor: (ticket: Ticket) => (
        <span className="text-gray-600 text-sm">
          {formatDate(ticket.submittedDate, 'short')}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (ticket: Ticket) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={() => router.push(`/moderator/review/${ticket.id}`)}
          >
            View
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => router.push(`/moderator/assign/${ticket.id}`)}
          >
            Assign
          </Button>
          <Button
            variant="success"
            size="sm"
            leftIcon={<FileText className="w-4 h-4" />}
            onClick={() => router.push(`/moderator/create-subtickets?parent=${ticket.id}`)}
          >
            Create Subtickets
          </Button>
        </div>
      ),
      sortable: false,
    },
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <SkeletonLoader type="text" width="200px" height="32px" className="mb-6" />
        <SkeletonTable rows={5} cols={8} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: THEME.colors.primary }}>
            Ticket Pool
          </h1>
          <p className="text-base text-gray-600">
            Manage and assign tickets from the pool
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({tickets.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Pending ({tickets.filter(t => t.status === 'pending').length})
        </Button>
        <Button
          variant={filter === 'assigned' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('assigned')}
        >
          Assigned ({tickets.filter(t => t.status === 'assigned').length})
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={filteredTickets}
            columns={columns}
            showSearch={true}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
}

