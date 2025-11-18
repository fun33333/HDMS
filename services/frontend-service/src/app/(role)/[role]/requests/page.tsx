'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../lib/auth';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { DataTable } from '../../../../components/ui/DataTable';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { PriorityBadge } from '../../../../components/common/PriorityBadge';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent } from '../../../../components/ui/card';
import { SkeletonLoader, SkeletonTable } from '../../../../components/ui/SkeletonLoader';
import { Plus, Eye } from 'lucide-react';
import { THEME } from '../../../../lib/theme';
import { Ticket } from '../../../../types';
import { ticketService } from '../../../../services/api/ticketService';
import { formatDate } from '../../../../lib/helpers';
import { useRouter } from 'next/navigation';

export default function RequestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'rejected'>('all');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const filters: any = {
          requesterId: user?.id,
        };

        if (filter !== 'all') {
          filters.status = filter === 'resolved' ? 'resolved' : filter;
        }

        const response = await ticketService.getTickets(filters);
        setTickets(response.results || response || []);
        setError(null);
      } catch (error: any) {
        // Handle network errors gracefully - API might not be available
        const isNetworkError = (error as any)?.isNetworkError || !error?.response;
        if (isNetworkError) {
          console.warn('API not available, showing empty state');
          setTickets([]);
          setError(null); // Don't show error for network issues, just empty state
        } else {
          console.error('Error fetching tickets:', error?.message || error);
          setError(error?.message || 'Failed to load tickets');
          setTickets([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [user, filter]);

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ticket.status === 'pending';
    if (filter === 'resolved') return ticket.status === 'resolved';
    if (filter === 'rejected') return ticket.status === 'rejected';
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
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Eye className="w-4 h-4" />}
          onClick={() => router.push(`/requester/request-detail/${ticket.id}`)}
        >
          View
        </Button>
      ),
      sortable: false,
    },
  ];

  if (loading) {
    return (
      <PageWrapper title="My Requests" loading={true} />
    );
  }

  return (
    <PageWrapper
      title="My Requests"
      description="View and manage all your submitted requests"
      actions={
        <Button
          variant="primary"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => router.push('/requester/new-request')}
        >
          New Request
        </Button>
      }
    >
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
          variant={filter === 'resolved' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('resolved')}
        >
          Resolved ({tickets.filter(t => t.status === 'resolved').length})
        </Button>
        <Button
          variant={filter === 'rejected' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('rejected')}
        >
          Rejected ({tickets.filter(t => t.status === 'rejected').length})
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-red-600">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {tickets.length === 0 && !loading ? (
            <div className="p-8 text-center text-gray-500">
              <p>No tickets found. {error ? 'Please try again later.' : 'Start by creating a new request.'}</p>
            </div>
          ) : (
            <DataTable
              data={filteredTickets}
              columns={columns}
              showSearch={true}
              pageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

