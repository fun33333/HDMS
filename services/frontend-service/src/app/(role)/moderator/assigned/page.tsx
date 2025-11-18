'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { PriorityBadge } from '../../../components/common/PriorityBadge';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { ViewButton, ReassignButton } from '../../../components/common/ActionButtons';
import { SearchFilters } from '../../../components/common/SearchFilters';
import { 
  UserPlus,
  FileText,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import DataTable, { Column } from '../../../components/ui/DataTable';
import PageSkeleton from '../../../components/ui/PageSkeleton';
import ErrorBanner from '../../../components/ui/ErrorBanner';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const AssignedTicketsPage: React.FC = () => {
  const { tickets } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; ticketId?: string }>( { open: false } );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const assignedTickets = tickets.filter(t => t.status === 'assigned');

  const handleViewTicket = (ticketId: string) => {
    router.push(`/moderator/request-detail/${ticketId}`);
  };

  const handleReassignTicket = (ticketId: string) => {
    setConfirm({ open: true, ticketId });
  };

  const filteredTickets = assignedTickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.requesterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.assigneeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesDepartment = departmentFilter === 'all' || ticket.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
  });

  const columns: Column<any>[] = [
    { key: 'ticketId', header: 'Ticket', sortable: true, accessor: (r) => <span className="font-medium">{r.ticketId}</span> },
    { key: 'subject', header: 'Subject', sortable: true, accessor: (r) => r.subject },
    { key: 'requesterName', header: 'Requester', sortable: true, accessor: (r) => r.requesterName || '—' },
    { key: 'assigneeName', header: 'Assignee', sortable: true, accessor: (r) => r.assigneeName || 'Not assigned' },
    { key: 'priority', header: 'Priority', sortable: true, accessor: (r) => <PriorityBadge priority={r.priority} /> },
    { key: 'status', header: 'Status', sortable: true, accessor: (r) => <StatusBadge status={r.status} /> },
    { key: 'department', header: 'Department', sortable: true, accessor: (r) => r.department },
    { key: 'assignedDate', header: 'Assigned Date', sortable: true, accessor: (r) => r.assignedDate ? new Date(r.assignedDate).toLocaleDateString() : 'N/A' },
    { key: 'actions', header: 'Actions', accessor: (r) => (
        <div className="flex gap-2">
          <ViewButton onClick={() => handleViewTicket(r.id)} />
          <ReassignButton onClick={() => handleReassignTicket(r.id)} variant="success" />
        </div>
      )
    }
  ];

  if (loading) return <PageSkeleton rows={8} />;
  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/moderator/dashboard" className="mr-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assigned Tickets</h1>
        <p className="text-gray-600">View and manage tickets assigned to assignees</p>
      </div>

      {/* Search and Filter */}
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
      />

      {/* Tickets Table */}
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Assigned Tickets</h2>
            <span className="text-sm text-gray-500">{filteredTickets.length} tickets</span>
          </div>
          {error ? <ErrorBanner message={error} onRetry={() => setError(null)} /> : null}
          <DataTable data={filteredTickets} columns={columns} initialSort={{ key: 'assignedDate', dir: 'desc' }} pageSize={10} showSearch={false} />
        </CardContent>
      </Card>

      <ConfirmModal
        open={confirm.open}
        title={'Reassign this ticket?'}
        description="You can proceed to the relevant page after confirmation."
        onCancel={() => setConfirm({ open: false })}
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
