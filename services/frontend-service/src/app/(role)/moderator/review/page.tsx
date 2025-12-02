'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { PriorityBadge } from '../../../../components/common/PriorityBadge';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { 
  CheckCircle,
  XCircle,
  User,
  Calendar,
  FileText,
  Eye,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import { THEME } from '../../../../lib/theme';
import ticketService from '../../../../services/api/ticketService';
import { Ticket } from '../../../../types';
import Link from 'next/link';

const ReviewPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Fetch tickets that are completed and need review
        const response = await ticketService.getTickets();
        
        // Check if response exists and has results
        if (response && (Array.isArray(response) || response.results)) {
          const ticketsList = Array.isArray(response) ? response : (response.results || []);
          
          // Filter tickets that are completed (status: 'completed' or have completionNote/completionImage)
          const completedTickets = ticketsList.filter(ticket => 
            ticket.status === 'completed' || 
            ticket.status === 'in_progress' ||
            (ticket.completionNote || ticket.completionImage)
          );
          setTickets(completedTickets);
          setUseMockData(false);
        } else {
          // No valid response, use mock data
          setTickets([]);
          setUseMockData(true);
        }
      } catch (error: any) {
        // Handle network errors gracefully
        const isNetworkError = error?.isNetworkError || !error?.response;
        
        if (isNetworkError) {
          console.warn('API not available, using empty tickets list');
          setTickets([]);
          setUseMockData(true);
        } else {
          console.error('Error fetching tickets:', error?.message || error);
          setTickets([]);
          setUseMockData(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.requesterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.assigneeName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: THEME.colors.primary }}></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Mock Data Indicator */}
      {useMockData && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <strong>Demo Mode:</strong> API not available. Showing empty list.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: THEME.colors.primary }}>
          Review Completed Work
        </h1>
        <p className="text-gray-600">Review and approve completed tickets from assignees</p>
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
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
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
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : useMockData
                ? 'API not available. No tickets to display.'
                : 'No completed tickets available for review'}
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
                      {ticket.priority && <PriorityBadge priority={ticket.priority} />}
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
                          <p className="text-gray-500 text-xs">Assignee</p>
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

                      {ticket.completedDate && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-gray-500 text-xs">Completed</p>
                            <p className="font-medium text-green-600">
                              {new Date(ticket.completedDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Completion Indicators */}
                    {(ticket.completionNote || ticket.completionImage) && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-700 font-medium">
                            {ticket.completionNote ? 'Has completion note' : ''}
                            {ticket.completionNote && ticket.completionImage ? ' & ' : ''}
                            {ticket.completionImage ? 'Has completion image' : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <Link href={`/moderator/review/${ticket.id}`}>
                      <Button
                        variant="primary"
                        leftIcon={<Eye className="w-4 h-4" />}
                      >
                        Review
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
            <span className="font-semibold">{tickets.length}</span> completed tickets
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;