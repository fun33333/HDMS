'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { PriorityBadge } from '../../../../components/common/PriorityBadge';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import {
  User,
  Calendar,
  FileText,
  Search,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { THEME } from '../../../../lib/theme';
import ticketService from '../../../../services/api/ticketService';
import { Ticket } from '../../../../types';
import Link from 'next/link';
import { generateMockReassignableTickets } from '../../../../lib/mockData';
import { DashboardSkeleton } from '../../../../components/skeletons/DashboardSkeleton';

const ReassignPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  useEffect(() => {
    let isMounted = true;

    const fetchTickets = async () => {
      try {
        setLoading(true);
        // Fetch tickets that can be reassigned (assigned or in_progress tickets)
        const response = await ticketService.getTickets();

        if (!isMounted) return;

        // Check if response exists and has results
        if (response && (Array.isArray(response) || response.results)) {
          const ticketsList = Array.isArray(response) ? response : (response.results || []);

          // Filter tickets that are assigned or in progress (can be reassigned)
          const reassignableTickets = ticketsList.filter(ticket =>
            ticket.status === 'assigned' ||
            ticket.status === 'in_progress' ||
            ticket.status === 'pending'
          );

          setTickets(reassignableTickets);
          setUseMockData(false);
        } else {
          // No valid response, use mock data
          const mockTickets = generateMockReassignableTickets();
          setTickets(mockTickets);
          setUseMockData(true);
        }
      } catch (error: any) {
        if (!isMounted) return;

        // Handle network errors gracefully
        const isNetworkError = error?.isNetworkError || !error?.response || error?.message?.includes('Network Error');

        if (isNetworkError) {
          console.warn('API not available, using mock data');
          const mockTickets = generateMockReassignableTickets();
          setTickets(mockTickets);
          setUseMockData(true);
        } else {
          console.error('Error fetching tickets:', error);
          setTickets([]);
          setUseMockData(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTickets();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.requesterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.assigneeName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || ticket.department === filterDepartment;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-4 md:p-6">
      {/* Demo Mode Banner */}
      {useMockData && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <strong>Demo Mode:</strong> Using mock data. API is unavailable.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: THEME.colors.primary }}>
          Reassign Tickets
        </h1>
        <p className="text-gray-600">Reassign tickets to different assignees</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2"
            style={{
              borderColor: THEME.colors.gray
            }}
            onFocus={(e) => e.target.style.borderColor = THEME.colors.primary}
            onBlur={(e) => e.target.style.borderColor = THEME.colors.gray}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2"
            style={{
              borderColor: THEME.colors.gray
            }}
            onFocus={(e) => e.target.style.borderColor = THEME.colors.primary}
            onBlur={(e) => e.target.style.borderColor = THEME.colors.gray}
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2"
            style={{
              borderColor: THEME.colors.gray
            }}
            onFocus={(e) => e.target.style.borderColor = THEME.colors.primary}
            onBlur={(e) => e.target.style.borderColor = THEME.colors.gray}
          >
            <option value="all">All Departments</option>
            <option value="Development">Development</option>
            <option value="Finance & Accounts">Finance & Accounts</option>
            <option value="Procurement">Procurement</option>
            <option value="Basic Maintenance">Basic Maintenance</option>
            <option value="IT">IT</option>
            <option value="Architecture">Architecture</option>
            <option value="Administration">Administration</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tickets found</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterDepartment !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No tickets available for reassignment'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold" style={{ color: THEME.colors.primary }}>
                        {ticket.subject}
                      </h3>
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{ticket.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-500 text-xs">Requester</p>
                          <p className="font-medium text-gray-800">{ticket.requesterName || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-gray-500 text-xs">Current Assignee</p>
                          <p className="font-medium text-gray-800">{ticket.assigneeName || 'Not assigned'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-500 text-xs">Submitted</p>
                          <p className="font-medium text-gray-800">
                            {new Date(ticket.submittedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-500 text-xs">Department</p>
                          <p className="font-medium text-gray-800">{ticket.department || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {ticket.assignedDate && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-700 font-medium">
                            Assigned on: {new Date(ticket.assignedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <Link href={`/moderator/reassign/${ticket.id}`}>
                      <Button
                        variant="primary"
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                      >
                        Reassign
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {filteredTickets.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredTickets.length}</span> of{' '}
            <span className="font-semibold">{tickets.length}</span> reassignable tickets
          </p>
        </div>
      )}
    </div>
  );
};

export default ReassignPage;
