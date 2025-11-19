'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { Card, CardContent } from '../ui/card';
import { 
  Users,
  Activity,
  FileText,
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  Settings,
  UserPlus
} from 'lucide-react';
import ticketService from '../../services/api/ticketService';
import { Ticket } from '../../types';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
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

  const systemStats = {
    totalUsers: 156,
    activeUsers: 142,
    totalTickets: tickets.length,
    resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
    avgResolutionTime: '2.3 days',
    systemUptime: '99.8%',
    satisfactionRating: 4.7
  };

  const recentActivities = [
    { id: 1, action: 'New user registered', user: 'John Doe', time: '2 minutes ago', type: 'user' },
    { id: 2, action: 'Ticket resolved', ticket: 'T-2023-1905', user: 'Rajeev Kumar', time: '5 minutes ago', type: 'ticket' },
    { id: 3, action: 'User role updated', user: 'Ali Ahmed', time: '10 minutes ago', type: 'user' },
    { id: 4, action: 'System backup completed', time: '1 hour ago', type: 'system' },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome back, <span className="text-blue-600">{user?.name || 'Admin User'}</span>!
            </h1>
            <p className="text-lg text-gray-600">Here's your system overview and management dashboard.</p>
          </div>
          <div className="flex items-center space-x-3 bg-purple-50 rounded-xl px-4 py-3 border border-purple-200">
            <Shield className="w-6 h-6 text-purple-600" />
            <span className="text-lg font-semibold text-purple-800">System Administrator</span>
          </div>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Users</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{systemStats.totalUsers}</p>
                <p className="text-xs text-gray-500">{systemStats.activeUsers} active</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Active Users</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">{systemStats.activeUsers}</p>
                <p className="text-xs text-gray-500">Currently online</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Tickets</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">{systemStats.totalTickets}</p>
                <p className="text-xs text-gray-500">{systemStats.resolvedTickets} resolved</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Resolved</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">{systemStats.resolvedTickets}</p>
                <p className="text-xs text-gray-500">Successfully completed</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Avg Resolution Time</p>
              <p className="text-2xl font-bold text-gray-800">{systemStats.avgResolutionTime}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="text-center">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-gray-800">{systemStats.systemUptime}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Satisfaction Rating</p>
              <p className="text-2xl font-bold text-gray-800">{systemStats.satisfactionRating}/5.0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white shadow-xl border-0">
        <CardContent className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activity.type === 'user' ? 'bg-blue-100' :
                  activity.type === 'ticket' ? 'bg-green-100' :
                  'bg-purple-100'
                }`}>
                  {activity.type === 'user' ? <UserPlus className="w-5 h-5 text-blue-600" /> :
                   activity.type === 'ticket' ? <FileText className="w-5 h-5 text-green-600" /> :
                   <Settings className="w-5 h-5 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">
                    {activity.user && `${activity.user} • `}
                    {activity.ticket && `Ticket ${activity.ticket} • `}
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;