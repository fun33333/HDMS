'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/Button';
import { 
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Star,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { THEME } from '../../lib/theme';
import { AnalyticsCard } from '../common/AnalyticsCard';
import ticketService from '../../services/api/ticketService';
import { Ticket } from '../../types';

const ModeratorDashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await ticketService.getTickets();
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

  const handleCardClick = (cardType: string) => {
    router.push('/moderator/total-requests');
  };

  const dashboardStats = {
    totalTickets: tickets.length,
    pendingTickets: tickets.filter(t => t.status === 'pending').length,
    assignedTickets: tickets.filter(t => t.status === 'assigned').length,
    inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
    completedTickets: tickets.filter(t => t.status === 'completed' || t.status === 'resolved').length,
    rejectedTickets: tickets.filter(t => t.status === 'rejected').length
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome! Moderator</h1>
        <p className="text-gray-600">Manage ticket assignments and monitor system performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <AnalyticsCard title="In Progress" value={dashboardStats.inProgressTickets} icon={PlayCircle} color={THEME.colors.medium} onClick={() => handleCardClick('in_progress')} hoverDescription="Currently working" />
        <AnalyticsCard title="Resolved" value={dashboardStats.completedTickets} icon={CheckCircle} color={THEME.colors.primary} onClick={() => handleCardClick('resolved')} hoverDescription="Successfully completed" />
        <AnalyticsCard title="Pending" value={dashboardStats.pendingTickets} icon={Clock} color={THEME.colors.light} onClick={() => handleCardClick('pending')} hoverDescription="Awaiting assignment" />
        <AnalyticsCard title="Rejected" value={dashboardStats.rejectedTickets} icon={XCircle} color={THEME.colors.gray} onClick={() => handleCardClick('rejected')} hoverDescription="Declined by requester" />
        <AnalyticsCard title="Total Requests" value={dashboardStats.totalTickets} icon={FileText} color={THEME.colors.light} onClick={() => handleCardClick('total')} hoverDescription="All submitted requests" />
      </div>

      {/* High Priority & Urgent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <AnalyticsCard title="High Priority" value={tickets.filter(t => t.priority === 'high').length} icon={AlertCircle} color={THEME.colors.primary} onClick={() => handleCardClick('high_priority')} hoverDescription="High priority tickets" />
        <AnalyticsCard title="Urgent" value={tickets.filter(t => t.priority === 'urgent').length} icon={AlertCircle} color={THEME.colors.medium} onClick={() => handleCardClick('urgent')} hoverDescription="Urgent priority tickets" />
      </div>

      {/* Assignment Analytics & Performance */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Assignment Analytics & Performance</h2>
          <div className="flex space-x-3">
            <Button className="px-4 py-2 bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 rounded-lg">Export CSV</Button>
            <Button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">Export PDF</Button>
          </div>
        </div>
      </div>

      {/* Department-wise Assignment Distribution */}
      <Card className="bg-white shadow-lg rounded-lg mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Department-wise assignment distribution</h3>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-500">
              <span>10%</span><span>8%</span><span>6%</span><span>4%</span><span>2%</span><span>0%</span>
            </div>
            <div className="ml-8 mr-4">
              <div className="flex items-end justify-between h-64 space-x-2">
                {['Procurement', 'Electrical', 'IT Mainten', 'IT procurement', 'Plumbers', 'Furniture Mainten', 'HR', 'Accounts'].map((dept) => {
                  const deptTickets = tickets.filter(t => t.department === dept);
                  const openTickets = deptTickets.filter(t => t.status === 'pending' || t.status === 'assigned' || t.status === 'in_progress').length;
                  const closedTickets = deptTickets.filter(t => t.status === 'resolved' || t.status === 'rejected').length;
                  const total = deptTickets.length;
                  const openPercent = total > 0 ? (openTickets / total) * 100 : 0;
                  const closedPercent = total > 0 ? (closedTickets / total) * 100 : 0;
                  
                  return (
                    <div key={dept} className="flex-1 flex flex-col items-center space-y-2">
                      <div className="flex space-x-1 h-48 items-end">
                        <div className="w-4 bg-blue-500 rounded-t-sm relative group" style={{ height: `${Math.max(openPercent * 2.4, 4)}px` }}>
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {openTickets} Open ({openPercent.toFixed(1)}%)
                          </div>
                        </div>
                        <div className="w-4 bg-green-500 rounded-t-sm relative group" style={{ height: `${Math.max(closedPercent * 2.4, 4)}px` }}>
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {closedTickets} Closed ({closedPercent.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 text-center mt-2">{dept}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Open Tickets Score</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Closed Tickets Score</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="bg-white shadow-lg rounded-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center group-hover:text-blue-600 transition-colors duration-300">Performance Cards</h3>
            <div className="text-center">
              <div className="relative w-52 h-52 mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-52 h-52 transform -rotate-90 group-hover:rotate-0 transition-transform duration-700" viewBox="0 0 36 36">
                  <path className="text-gray-200" stroke="currentColor" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-blue-500 group-hover:text-blue-600 transition-colors duration-300" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{tickets.length}</div>
                    <div className="text-lg text-gray-500 group-hover:text-gray-600 transition-colors duration-300">Tickets</div>
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300">Tickets Assigned</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center group-hover:text-green-600 transition-colors duration-300">Performance Cards</h3>
            <div className="text-center">
              <div className="relative w-52 h-52 mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-52 h-52 transform -rotate-90 group-hover:rotate-0 transition-transform duration-700" viewBox="0 0 36 36">
                  <path className="text-gray-200" stroke="currentColor" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-green-500 group-hover:text-green-600 transition-colors duration-300" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                      {tickets.length > 0 ? Math.round((tickets.filter(t => t.status === 'resolved').length / tickets.length) * 100) : 0}
                    </div>
                    <div className="text-lg text-gray-500 group-hover:text-gray-600 transition-colors duration-300">%</div>
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors duration-300">Resolution Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Performance Indicators & Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <Card className="bg-gray-800 text-white shadow-lg rounded-lg hover:shadow-2xl hover:scale-105 hover:bg-gray-700 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm group-hover:text-gray-200 transition-colors duration-300">Avg. Assignment Time</p>
                  <p className="text-2xl font-bold group-hover:text-green-400 transition-colors duration-300">
                    {dashboardStats.inProgressTickets > 0 ? Math.round(dashboardStats.inProgressTickets * 24 / Math.max(dashboardStats.inProgressTickets, 1)) : 0} Hours
                  </p>
                </div>
                <div className="flex items-center text-green-400 group-hover:text-green-300 group-hover:scale-110 transition-all duration-300">
                  <TrendingUp className="w-5 h-5 mr-1 group-hover:animate-bounce" />
                  <span className="text-sm">+5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 text-white shadow-lg rounded-lg hover:shadow-2xl hover:scale-105 hover:bg-gray-700 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm group-hover:text-gray-200 transition-colors duration-300">Ticket Resolution Rate</p>
                  <p className="text-2xl font-bold group-hover:text-green-400 transition-colors duration-300">
                    {tickets.length > 0 ? Math.round((tickets.filter(t => t.status === 'resolved').length / tickets.length) * 100) : 0}%
                  </p>
                </div>
                <div className="flex items-center text-green-400 group-hover:text-green-300 group-hover:scale-110 transition-all duration-300">
                  <TrendingUp className="w-5 h-5 mr-1 group-hover:animate-bounce" />
                  <span className="text-sm">+3%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Performance Table */}
        <Card className="bg-white shadow-lg rounded-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Department</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Assigned</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Resolved</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {['Procurement', 'Electrical', 'IT Mainten', 'IT procurement', 'Plumbers', 'Furniture Mainten', 'HR', 'Accounts'].map((dept) => {
                    const deptTickets = tickets.filter(t => t.department === dept);
                    const assigned = deptTickets.filter(t => t.status === 'assigned' || t.status === 'in_progress').length;
                    const resolved = deptTickets.filter(t => t.status === 'resolved' || t.status === 'rejected').length;
                    const total = deptTickets.length;
                    const rating = total > 0 ? (3.5 + (resolved / total) * 1.5).toFixed(1) : '-';
                    
                    return (
                      <tr key={dept} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-3 text-sm text-gray-900 font-medium">{dept}</td>
                        <td className="py-3 text-sm text-gray-600">{assigned}</td>
                        <td className="py-3 text-sm text-gray-600">{resolved}</td>
                        <td className="py-3 text-sm text-gray-600">
                          {rating !== '-' ? (
                            <div className="flex items-center">
                              <span className="mr-2 font-medium">{rating}/5</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < Math.floor(parseFloat(rating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModeratorDashboard;