'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { THEME } from '../../../../lib/theme';
import { Ticket } from '../../../../types';
import ticketService from '../../../../services/api/ticketService';
import { 
  BarChart3, 
  TrendingUp, 
  Download,
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  PlayCircle,
  XCircle,
  Activity,
  Target,
  Award
} from 'lucide-react';

// Local fallback AnalyticsCard component in case '../../../../components/common/AnalyticsCard' is missing
const AnalyticsCard: React.FC<{
  title: string;
  value: number | string;
  icon?: React.ComponentType<any>;
  color?: string;
  hoverDescription?: string;
}> = ({ title, value, icon: Icon, color, hoverDescription }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 hover:shadow-2xl transition-colors" style={{ backgroundColor: color || THEME.colors.light }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="w-6 h-6" style={{ color: THEME.colors.primary }} />}
          <div>
            <div className="text-sm font-medium" style={{ color: THEME.colors.gray }}>{title}</div>
            <div className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>{value}</div>
          </div>
        </div>
      </div>
      {hoverDescription && <div className="mt-2 text-xs" style={{ color: THEME.colors.gray }}>{hoverDescription}</div>}
    </div>
  );
};

const AssigneeReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await ticketService.getTickets({ assigneeId: user?.id });
        const ticketsList = Array.isArray(response) ? response : (response?.results || []);
        setTickets(ticketsList);
      } catch (error: any) {
        console.error('Error fetching tickets:', error);
      }
    };
    if (user?.id) {
      fetchTickets();
    }
  }, [user?.id]);

  // Filter tickets assigned to current user
  const myTasks: Ticket[] = tickets.filter((t: Ticket) => t.assigneeName === user?.name || t.assigneeId === user?.id);

  // Calculate analytics data
  const totalTasks = myTasks.length;
  const resolvedTasks = myTasks.filter((t: Ticket) => t.status === 'resolved').length;
  const pendingTasks = myTasks.filter((t: Ticket) => t.status === 'pending' || t.status === 'assigned').length;
  const inProgressTasks = myTasks.filter((t: Ticket) => t.status === 'in_progress').length;
  const rejectedTasks = myTasks.filter((t: Ticket) => t.status === 'rejected').length;

  const completionRate = totalTasks > 0 ? Math.round((resolvedTasks / totalTasks) * 100) : 0;
  const avgResolutionTime = resolvedTasks > 0 ? '1.8 days' : 'N/A';

  // Priority distribution
  const priorityStats = [
  { name: 'Urgent', count: myTasks.filter((t: Ticket) => t.priority === 'urgent').length, color: THEME.colors.error },
  { name: 'High', count: myTasks.filter((t: Ticket) => t.priority === 'high').length, color: THEME.colors.warning },
  { name: 'Medium', count: myTasks.filter((t: Ticket) => t.priority === 'medium').length, color: THEME.colors.info },
  { name: 'Low', count: myTasks.filter((t: Ticket) => t.priority === 'low').length, color: THEME.colors.success }
  ];

  // Status distribution
  const statusStats = [
    { name: 'Resolved', count: resolvedTasks, color: THEME.colors.success },
    { name: 'In Progress', count: inProgressTasks, color: THEME.colors.warning },
    { name: 'Assigned', count: pendingTasks, color: THEME.colors.info },
    { name: 'Rejected', count: rejectedTasks, color: THEME.colors.error }
  ];

  const handleExportReport = (format: string) => {
    console.log('Exporting report as:', format);
    alert(`Exporting report as ${format}...`);
  };

  return (
    <div className="p-8 space-y-8 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => router.push('/assignee/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" style={{ color: THEME.colors.primary }} />
              </button>
              <h1 className="text-4xl font-bold" style={{ color: THEME.colors.primary }}>
                Performance Report & Analytics
              </h1>
            </div>
            <p className="text-lg" style={{ color: THEME.colors.gray }}>
              Detailed analytics and performance metrics for your assigned tasks
            </p>
          </div>
          <div className="flex items-center space-x-3 rounded-xl px-4 py-3 border" style={{ backgroundColor: THEME.colors.background, borderColor: THEME.colors.light }}>
            <BarChart3 className="w-6 h-6" style={{ color: THEME.colors.primary }} />
            <span className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
              {user?.name || 'Assignee'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Tasks"
          value={totalTasks}
          icon={FileText}
          color={THEME.colors.light}
          hoverDescription="All assigned tasks"
        />
        <AnalyticsCard
          title="Completed"
          value={resolvedTasks}
          icon={CheckCircle}
          color={THEME.colors.success}
          hoverDescription="Successfully resolved"
        />
        <AnalyticsCard
          title="In Progress"
          value={inProgressTasks}
          icon={PlayCircle}
          color={THEME.colors.warning}
          hoverDescription="Currently working"
        />
        <AnalyticsCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={Target}
          color={THEME.colors.primary}
          hoverDescription="Task completion percentage"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: THEME.colors.primary }}>
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>
                Performance Overview
              </h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium" style={{ color: THEME.colors.gray }}>Completion Rate</span>
                  <span className="text-lg font-bold" style={{ color: THEME.colors.primary }}>{completionRate}%</span>
                </div>
                <div className="w-full rounded-full" style={{ backgroundColor: THEME.colors.background, height: '12px' }}>
                  <div 
                    className="rounded-full h-full transition-all duration-500"
                    style={{ 
                      width: `${completionRate}%`,
                      backgroundColor: THEME.colors.primary 
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium" style={{ color: THEME.colors.gray }}>Avg Resolution Time</span>
                  <span className="text-lg font-bold" style={{ color: THEME.colors.primary }}>{avgResolutionTime}</span>
                </div>
                <div className="w-full rounded-full" style={{ backgroundColor: THEME.colors.background, height: '12px' }}>
                  <div 
                    className="rounded-full h-full transition-all duration-500"
                    style={{ 
                      width: '75%',
                      backgroundColor: THEME.colors.medium 
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: THEME.colors.primary }}>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>
                Task Status Distribution
              </h2>
            </div>
            
            <div className="space-y-4">
              {statusStats.map((stat) => (
                <div key={stat.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                    <span className="text-sm font-medium" style={{ color: THEME.colors.gray }}>
                      {stat.name}
                    </span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: THEME.colors.primary }}>
                    {stat.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority & Export Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: THEME.colors.primary }}>
                <Award className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>
                Priority Distribution
              </h2>
            </div>
            
            <div className="space-y-4">
              {priorityStats.map((stat) => (
                <div key={stat.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: stat.color }}
                    />
                    <span className="text-sm font-medium" style={{ color: THEME.colors.gray }}>
                      {stat.name}
                    </span>
                  </div>
                  <span className="text-lg font-bold" style={{ color: THEME.colors.primary }}>
                    {stat.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: THEME.colors.primary }}>
                <Download className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>
                Export Report
              </h2>
            </div>
            
            <div className="space-y-3">
              <Button 
                variant="primary" 
                fullWidth
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => handleExportReport('PDF')}
              >
                Export as PDF
              </Button>
              <Button 
                variant="secondary" 
                fullWidth
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => handleExportReport('Excel')}
              >
                Export as Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssigneeReportsPage;

