'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { FilterBar, FilterValues } from '../../../../components/common/FilterBar';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { PriorityBadge } from '../../../../components/common/PriorityBadge';
import { SkeletonLoader, SkeletonTable } from '../../../../components/ui/SkeletonLoader';
import { THEME } from '../../../../lib/theme';
import { Ticket } from '../../../../types';
import { formatDate, formatRelativeTime, getInitials, getAvatarColor } from '../../../../lib/helpers';
import ticketService from '../../../../services/api/ticketService';
import {
  Eye,
  UserPlus,
  XCircle,
  Clock,
  MoreVertical,
  CheckSquare,
  Square,
  Download,
  Filter,
  X,
  ChevronDown,
  FileText,
  AlertCircle,
  Calendar,
  CheckCircle
} from 'lucide-react';

// Mock data generator
const generateMockTickets = (): Ticket[] => {
  const now = new Date();
  const departments = ['Development', 'Finance & Accounts', 'Procurement', 'Basic Maintenance', 'IT', 'Architecture', 'Administration'];
  const statuses: Ticket['status'][] = ['pending', 'submitted', 'assigned', 'in_progress'];
  const priorities: Ticket['priority'][] = ['low', 'medium', 'high', 'urgent'];
  
  // Realistic requester names
  const requesterNames = [
    'Ahmed Khan', 'Fatima Ali', 'Hassan Raza', 'Sara Ahmed', 'Ali Hassan',
    'Zainab Malik', 'Bilal Khan', 'Nadia Sheikh', 'Omar Ali', 'Ayesha Raza',
    'Kamran Malik', 'Saima Khan', 'Tariq Hussain', 'Farhan Ali', 'Hina Sheikh',
    'Usman Khan', 'Amina Raza', 'Zubair Ahmed', 'Rashid Ali', 'Nida Malik',
    'Imran Khan', 'Sana Ali', 'Waseem Raza', 'Maryam Ahmed', 'Faisal Hassan',
    'Rabia Malik', 'Shahid Khan', 'Aisha Ali', 'Tahir Raza', 'Noor Ahmed'
  ];
  
  const mockTickets: Ticket[] = [];
  
  for (let i = 1; i <= 30; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    // Some tickets might not have priority (90% chance of having priority)
    const hasPriority = Math.random() > 0.1;
    const priority = hasPriority ? priorities[Math.floor(Math.random() * priorities.length)] : undefined;
    const dept = departments[Math.floor(Math.random() * departments.length)];
    const hoursAgo = Math.floor(Math.random() * 100);
    const requesterIndex = (i - 1) % requesterNames.length;
    
    mockTickets.push({
      id: `ticket-${i}`,
      ticketId: `HD-2024-${String(i).padStart(3, '0')}`,
      subject: `Sample Ticket ${i}: ${['Server Issue', 'Network Problem', 'Hardware Request', 'Software License', 'Maintenance Request'][Math.floor(Math.random() * 5)]}`,
      description: `This is a sample ticket description for ticket ${i}`,
      department: dept,
      priority: priority as Ticket['priority'] | undefined,
      status,
      requesterId: `req-${i}`,
      requesterName: requesterNames[requesterIndex],
      assigneeId: status === 'assigned' || status === 'in_progress' ? `assignee-${i}` : undefined,
      assigneeName: status === 'assigned' || status === 'in_progress' ? `Assignee ${i}` : undefined,
      submittedDate: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString(),
      assignedDate: status === 'assigned' || status === 'in_progress' 
        ? new Date(now.getTime() - (hoursAgo - 5) * 60 * 60 * 1000).toISOString()
        : undefined,
    });
  }
  
  return mockTickets;
};

// SLA Calculator
const calculateSLA = (ticket: Ticket): { timeRemaining?: number; timeOverdue?: number; isBreached: boolean; isApproaching: boolean; percentage: number } => {
  const now = new Date();
  const submitted = new Date(ticket.submittedDate);
  const slaHours = 72; // 3 days
  const hoursSinceSubmission = (now.getTime() - submitted.getTime()) / (1000 * 60 * 60);
  const remaining = slaHours - hoursSinceSubmission;
  const percentage = (remaining / slaHours) * 100;
  
  const isBreached = hoursSinceSubmission > slaHours;
  const isApproaching = !isBreached && percentage < 25;
  
  return {
    timeRemaining: !isBreached ? remaining : undefined,
    timeOverdue: isBreached ? hoursSinceSubmission - slaHours : undefined,
    isBreached,
    isApproaching,
    percentage: Math.max(0, Math.min(100, percentage))
  };
};

// Dropdown Menu Component
interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
  }>;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-1">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                item.danger
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function TicketPoolPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const departmentParam = searchParams.get('department');

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'all' | 'pending' | 'under_review'>('all');
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    status: departmentParam ? 'all' : 'all',
    priority: 'all',
    department: departmentParam || 'all',
    dateRange: 'all',
  });
  const [slaFilter, setSlaFilter] = useState<'all' | 'breached' | 'approaching' | 'normal'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await ticketService.getTickets();
        const ticketsList = Array.isArray(response) ? response : (response?.results || []);
        
        if (ticketsList.length > 0) {
          setTickets(ticketsList);
          setUseMockData(false);
        } else {
          const mockTickets = generateMockTickets();
          setTickets(mockTickets);
          setUseMockData(true);
        }
      } catch (error: any) {
        const isNetworkError = error?.isNetworkError || !error?.response;
        if (isNetworkError) {
        console.warn('API not available, using mock data');
          const mockTickets = generateMockTickets();
          setTickets(mockTickets);
          setUseMockData(true);
        } else {
          console.error('Error fetching tickets:', error?.message || error);
          const mockTickets = generateMockTickets();
          setTickets(mockTickets);
          setUseMockData(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'submitted', label: 'Under Review' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'postponed', label: 'Postponed' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const departmentOptions = [
      { value: 'all', label: 'All Departments' },
    ...Array.from(new Set(tickets.map(t => t.department))).map(dept => ({
      value: dept,
      label: dept,
    })),
    ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
  ];

  // Filter tickets
  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    // View filter
    if (view === 'pending') {
      filtered = filtered.filter(t => t.status === 'pending' || t.status === 'submitted');
    } else if (view === 'under_review') {
      filtered = filtered.filter(t => t.status === 'submitted');
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.ticketId.toLowerCase().includes(searchLower) ||
        t.subject.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.requesterName.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(t => t.priority === filters.priority);
    }

    // Department filter
    if (filters.department !== 'all') {
      filtered = filtered.filter(t => t.department === filters.department);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'yesterday':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter(t => new Date(t.submittedDate) >= startDate);
    }

    // SLA filter
    if (slaFilter !== 'all') {
      filtered = filtered.filter(t => {
        const sla = calculateSLA(t);
        if (slaFilter === 'breached') return sla.isBreached;
        if (slaFilter === 'approaching') return sla.isApproaching;
        if (slaFilter === 'normal') return !sla.isBreached && !sla.isApproaching;
        return true;
      });
    }

    return filtered;
  }, [tickets, view, filters, slaFilter]);

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedTickets.size === filteredTickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(filteredTickets.map(t => t.id)));
    }
  };

  const handleSelectTicket = (ticketId: string) => {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(ticketId)) {
      newSelected.delete(ticketId);
    } else {
      newSelected.add(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  // Bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedTickets.size === 0) return;

    const selectedTicketIds = Array.from(selectedTickets);
    
    switch (action) {
      case 'assign':
        router.push(`/moderator/assigned?bulk=${selectedTicketIds.join(',')}`);
        break;
      case 'priority':
        // Open priority change modal
        alert(`Change priority for ${selectedTicketIds.length} tickets`);
        break;
      case 'postpone':
        // Open postpone modal
        alert(`Postpone ${selectedTicketIds.length} tickets`);
        break;
      case 'export':
        // Export selected tickets
        const selectedTicketsData = tickets.filter(t => selectedTickets.has(t.id));
        const csv = [
          ['Ticket ID', 'Subject', 'Requester', 'Department', 'Status', 'Priority', 'Created Date'].join(','),
          ...selectedTicketsData.map(t => [
            t.ticketId,
            t.subject,
            t.requesterName,
            t.department,
            t.status,
            t.priority,
            formatDate(t.submittedDate, 'short')
          ].join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tickets-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        break;
    }
    
    setSelectedTickets(new Set());
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      department: departmentParam || 'all',
      dateRange: 'all',
    });
    setSlaFilter('all');
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6" style={{ backgroundColor: THEME.colors.background }}>
        <SkeletonLoader type="text" width="200px" height="32px" className="mb-6" />
        <SkeletonTable rows={5} cols={8} />
      </div>
    );
  }

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

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: THEME.colors.primary }}>
              Ticket Pool
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Manage and assign tickets from the pool
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={view === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView('all')}
          >
            All ({tickets.length})
          </Button>
          <Button
            variant={view === 'pending' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView('pending')}
          >
            Pending ({tickets.filter(t => t.status === 'pending' || t.status === 'submitted').length})
          </Button>
          <Button
            variant={view === 'under_review' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView('under_review')}
          >
            Under Review ({tickets.filter(t => t.status === 'submitted').length})
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      {showFilters && (
      <Card className="mb-6 shadow-lg">
        <CardContent className="p-4 md:p-6">
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              statusOptions={statusOptions}
              priorityOptions={priorityOptions}
              departmentOptions={departmentOptions}
              dateRangeOptions={dateRangeOptions}
              onClearFilters={handleClearFilters}
            />
            
            {/* SLA Filter */}
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                SLA Status
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'breached', label: 'Breached' },
                  { value: 'approaching', label: 'Approaching' },
                  { value: 'normal', label: 'Normal' },
                ].map(option => (
                <Button
                    key={option.value}
                    variant={slaFilter === option.value ? 'primary' : 'outline'}
                  size="sm"
                    onClick={() => setSlaFilter(option.value as any)}
                  >
                    {option.label}
                </Button>
                ))}
              </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Bulk Actions Bar */}
      {selectedTickets.size > 0 && (
        <Card className="mb-6 shadow-lg border-2" style={{ borderColor: THEME.colors.primary }}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: THEME.colors.primary }}>
                  {selectedTickets.size} ticket{selectedTickets.size > 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTickets(new Set())}
                >
                  Clear
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <DropdownMenu
                  trigger={
                    <Button variant="primary" size="sm" rightIcon={<ChevronDown className="w-4 h-4" />}>
                  Bulk Actions
                </Button>
                  }
                  items={[
                    {
                      label: 'Assign to Department',
                      icon: <UserPlus className="w-4 h-4" />,
                      onClick: () => handleBulkAction('assign'),
                    },
                    {
                      label: 'Change Priority',
                      icon: <AlertCircle className="w-4 h-4" />,
                      onClick: () => handleBulkAction('priority'),
                    },
                    {
                      label: 'Postpone',
                      icon: <Clock className="w-4 h-4" />,
                      onClick: () => handleBulkAction('postpone'),
                    },
                    {
                      label: 'Export Selected',
                      icon: <Download className="w-4 h-4" />,
                      onClick: () => handleBulkAction('export'),
                    },
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets Table */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12">
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center justify-center"
                    >
                      {selectedTickets.size === filteredTickets.length && filteredTickets.length > 0 ? (
                        <CheckSquare className="w-5 h-5" style={{ color: THEME.colors.primary }} />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Requester
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SLA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">No tickets found</p>
                        <p className="text-sm text-gray-400">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => {
                    const sla = calculateSLA(ticket);
                    const isSelected = selectedTickets.has(ticket.id);
                    const initials = getInitials(ticket.requesterName);
                    const avatarColor = getAvatarColor(ticket.requesterName);
                    
                    return (
                      <tr
                        key={ticket.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleSelectTicket(ticket.id)}
                            className="flex items-center justify-center"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5" style={{ color: THEME.colors.primary }} />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </td>

                        {/* Ticket ID */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => router.push(`/moderator/review?id=${ticket.id}`)}
                            className="font-semibold hover:underline transition-colors"
                            style={{ color: THEME.colors.primary }}
                          >
                            {ticket.ticketId}
                          </button>
                        </td>

                        {/* Title */}
                        <td className="px-4 py-4">
                          <div className="max-w-[200px]">
                            <p className="text-sm font-medium text-gray-900 truncate" title={ticket.subject}>
                              {ticket.subject}
                            </p>
                          </div>
                        </td>

                        {/* Requester */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                              style={{ backgroundColor: avatarColor }}
                            >
                              {initials}
                            </div>
                            <span className="text-sm text-gray-700">{ticket.requesterName}</span>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{ticket.department}</span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusBadge status={ticket.status} />
                        </td>

                        {/* Priority */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          {ticket.priority ? (
                          <PriorityBadge priority={ticket.priority} />
                          ) : (
                            <span className="text-xs text-gray-400 italic">Not set</span>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900">
                              {formatDate(ticket.submittedDate, 'short')}
                            </span>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(ticket.submittedDate)}
                          </span>
                          </div>
                        </td>

                        {/* SLA */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          {sla.isBreached ? (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <span className="text-xs font-semibold text-red-600">
                                {Math.floor(sla.timeOverdue! / 24)}d overdue
                              </span>
                            </div>
                          ) : sla.isApproaching ? (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-yellow-500" />
                              <span className="text-xs font-semibold text-yellow-600">
                                {Math.floor(sla.timeRemaining! / 24)}d left
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-gray-600">
                                {Math.floor(sla.timeRemaining! / 24)}d left
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <DropdownMenu
                            trigger={
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreVertical className="w-5 h-5 text-gray-600" />
                            </button>
                            }
                            items={[
                              {
                                label: 'Review',
                                icon: <Eye className="w-4 h-4" />,
                                onClick: () => router.push(`/moderator/review/${ticket.id}`), // ✅ Fixed: Use [id] route instead of query
                              },
                              {
                                label: 'Assign',
                                icon: <UserPlus className="w-4 h-4" />,
                                onClick: () => {
                                  // Open assign modal or navigate to assign page
                                  router.push(`/moderator/review/${ticket.id}?action=assign`);
                                },
                              },
                              {
                                label: 'Reject',
                                icon: <XCircle className="w-4 h-4" />,
                                onClick: () => {
                                  // Navigate to review page with reject action
                                  router.push(`/moderator/review/${ticket.id}?action=reject`);
                                },
                                danger: true,
                              },
                              {
                                label: 'Postpone',
                                icon: <Clock className="w-4 h-4" />,
                                onClick: () => {
                                  // Navigate to review page with postpone action
                                  router.push(`/moderator/review/${ticket.id}?action=postpone`);
                                },
                              },
                              {
                                label: 'View Detail',
                                icon: <FileText className="w-4 h-4" />,
                                onClick: () => router.push(`/moderator/review/${ticket.id}`), // ✅ Fixed: Same as Review
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredTickets.length > 0 && (
            <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredTickets.length}</span> of{' '}
                <span className="font-semibold">{filteredTickets.length}</span> tickets
      </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={true}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 px-2">Page 1 of 1</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={true}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

