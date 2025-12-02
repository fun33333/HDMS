'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../../lib/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { PriorityBadge } from '../../../../components/common/PriorityBadge';
import { FilterBar, FilterValues } from '../../../../components/common/FilterBar';
import { TicketCard } from '../../../../components/common/TicketCard';
import DataTable from '../../../../components/ui/DataTable';
import { Plus, Eye } from 'lucide-react';
import { Ticket } from '../../../../types';
import { ticketService } from '../../../../services/api/ticketService';
import { getMockTickets } from '../../../../lib/mockData';
import { formatRelativeTime, truncateText } from '../../../../lib/helpers';
import { SelectOption } from '../../../../components/ui/Select';

// Status options
const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'rejected', label: 'Rejected' },
];

// Priority options
const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'urgent', label: 'Urgent' },
];

// Date range options
const DATE_RANGE_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Time' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom Range' },
];

export default function RequestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<FilterValues>({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    priority: searchParams.get('priority') || 'all',
    department: searchParams.get('department') || 'all',
    dateRange: searchParams.get('dateRange') || 'all',
  });

  // Department options (dynamically from tickets)
  const departmentOptions = useMemo<SelectOption[]>(() => {
    const departments = Array.from(new Set(tickets.map(t => t.department))).sort();
    return [
      { value: 'all', label: 'All Departments' },
      ...departments.map(dept => ({ value: dept, label: dept })),
    ];
  }, [tickets]);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const apiFilters: any = {
          requesterId: user.id,
          page: currentPage,
          pageSize,
        };

        if (filters.status !== 'all') apiFilters.status = filters.status;
        if (filters.priority !== 'all') apiFilters.priority = filters.priority;
        if (filters.department !== 'all') apiFilters.department = filters.department;
        if (filters.search) apiFilters.search = filters.search;

        // Date range filter
        if (filters.dateRange !== 'all' && filters.dateRange !== 'custom') {
          const days = parseInt(filters.dateRange);
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - days);
          apiFilters.createdAfter = startDate.toISOString();
        }

        try {
          const response = await ticketService.getTickets(apiFilters);
          // Handle both TicketListResponse and array responses
          const ticketsArray = Array.isArray(response) 
            ? response 
            : (response?.results || []);
          setTickets(ticketsArray);
          setError(null);
        } catch (apiError: any) {
          // Fallback to mock data if API fails
          console.warn('API not available, using mock data');
          const mockTickets = getMockTickets(user.id);
          setTickets(mockTickets);
        setError(null);
        }
      } catch (error: any) {
        console.error('Error fetching tickets:', error);
          setError(error?.message || 'Failed to load tickets');
          setTickets([]);
      } finally {
        setLoading(false);
      }
    };

      fetchTickets();
  }, [user?.id, filters, currentPage, pageSize]);

  // Filter and search tickets
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // Client-side search (if API doesn't handle it)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.description?.toLowerCase().includes(searchLower) ||
        ticket.ticketId.toLowerCase().includes(searchLower)
      );
    }

    // Client-side status filter
    if (filters.status !== 'all') {
      result = result.filter(t => t.status === filters.status);
    }

    // Client-side priority filter
    if (filters.priority !== 'all') {
      result = result.filter(t => t.priority === filters.priority);
    }

    // Client-side department filter
    if (filters.department !== 'all') {
      result = result.filter(t => t.department === filters.department);
    }

    // Client-side date range filter
    if (filters.dateRange !== 'all' && filters.dateRange !== 'custom') {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      result = result.filter(t => {
        const ticketDate = new Date(t.submittedDate);
        return ticketDate >= cutoffDate;
      });
    }

    return result;
  }, [tickets, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / pageSize);
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, currentPage, pageSize]);

  // Handle filter change
  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      }
    });
    router.replace(`/requester/requests?${params.toString()}`, { scroll: false });
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: FilterValues = {
      search: '',
      status: 'all',
      priority: 'all',
      department: 'all',
      dateRange: 'all',
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    router.replace('/requester/requests', { scroll: false });
  };

  // Table columns for desktop view
  const columns = [
    {
      key: 'ticketId',
      header: 'Ticket ID',
      accessor: (ticket: Ticket) => (
        <button
          onClick={() => router.push(`/requester/request-detail/${ticket.id}`)}
          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline text-left"
        >
          {ticket.ticketId}
        </button>
      ),
      sortable: true,
    },
    {
      key: 'subject',
      header: 'Title',
      accessor: (ticket: Ticket) => (
        <div className="max-w-xs">
          <p 
            className="font-medium text-gray-900 truncate" 
            title={ticket.subject}
          >
            {truncateText(ticket.subject, 50)}
          </p>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (ticket: Ticket) => <StatusBadge status={ticket.status} />,
      sortable: true,
    },
    {
      key: 'priority',
      header: 'Priority',
      accessor: (ticket: Ticket) => <PriorityBadge priority={ticket.priority} />,
      sortable: true,
    },
    {
      key: 'department',
      header: 'Department',
      accessor: (ticket: Ticket) => (
        <span className="text-gray-600 text-sm">{ticket.department}</span>
      ),
      sortable: true,
    },
    {
      key: 'submittedDate',
      header: 'Created Date',
      accessor: (ticket: Ticket) => (
        <span className="text-gray-600 text-sm">
          {formatRelativeTime(ticket.submittedDate)}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (ticket: Ticket) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => router.push(`/requester/request-detail/${ticket.id}`)}
          leftIcon={<Eye className="w-4 h-4" />}
        >
          View
        </Button>
      ),
      sortable: false,
    },
  ];

    return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" style={{ backgroundColor: '#e7ecef', minHeight: '100vh' }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#274c77' }}>
            My Requests
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            View and manage all your submitted requests
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-5 h-5" />}
          onClick={() => router.push('/requester/new-request')}
          className="w-full sm:w-auto"
        >
          New Request
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        statusOptions={STATUS_OPTIONS}
        priorityOptions={PRIORITY_OPTIONS}
        departmentOptions={departmentOptions}
        dateRangeOptions={DATE_RANGE_OPTIONS}
        onClearFilters={handleClearFilters}
      />

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

      {/* Loading State */}
      {loading ? (
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile View - Cards */}
          {isMobile ? (
            <div className="space-y-4">
              {paginatedTickets.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <p>No requests found. Try adjusting your filters or create a new request.</p>
                  </CardContent>
                </Card>
              ) : (
                paginatedTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onView={(id) => router.push(`/requester/request-detail/${id}`)}
                  />
                ))
              )}
            </div>
          ) : (
            /* Desktop View - Table */
      <Card>
        <CardContent className="p-0">
                {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
                    <p>No requests found. Try adjusting your filters or create a new request.</p>
            </div>
          ) : (
            <DataTable
                    data={paginatedTickets}
              columns={columns}
                    showSearch={false}
                    pageSize={pageSize}
            />
          )}
        </CardContent>
      </Card>
          )}

          {/* Pagination Controls */}
          {filteredTickets.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredTickets.length)} of {filteredTickets.length} requests
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  ««
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ‹ Prev
                </Button>
                <span className="text-sm text-gray-700 px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next ›
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage >= totalPages}
                >
                  »»
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

