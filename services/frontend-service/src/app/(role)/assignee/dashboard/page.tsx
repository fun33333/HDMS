'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { AnalyticsCard } from '../../../../components/common/AnalyticsCard';
import { PriorityBadge } from '../../../../components/common/PriorityBadge';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { DepartmentLoadChart } from '../../../../components/charts/DepartmentLoadChart';
import { ResolutionTimeTrendChart } from '../../../../components/charts/ResolutionTimeTrendChart';
import ticketService from '../../../../services/api/ticketService';
import userService from '../../../../services/api/userService';
import { Ticket } from '../../../../types';
import { User } from '../../../../types';
import { THEME } from '../../../../lib/theme';
import { formatDate } from '../../../../lib/helpers';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Building2,
  User as UserIcon,
  Eye,
  Edit,
  Activity
} from 'lucide-react';

interface DepartmentWorkloadData {
  department: string;
  assigned: number;
  completed: number;
  pending: number;
}

interface PerformanceMetricsData {
  date: string;
  averageDays: number;
}

// Demo/Mock Data
const generateDemoTickets = (): Ticket[] => {
  const now = new Date();
  const demoTickets: Ticket[] = [
    {
      id: '1',
      ticketId: 'TKT-001',
      subject: 'Fix network connectivity issue in Building A',
      description: 'Users reporting intermittent network disconnections',
      department: 'IT',
      priority: 'high',
      status: 'in_progress',
      requesterId: 'req1',
      requesterName: 'John Doe',
      assigneeId: 'assignee1',
      assigneeName: 'Mike Assignee',
      submittedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      ticketId: 'TKT-002',
      subject: 'Update software licenses for Office Suite',
      description: 'Need to renew and update Microsoft Office licenses',
      department: 'IT',
      priority: 'medium',
      status: 'assigned',
      requesterId: 'req2',
      requesterName: 'Jane Smith',
      assigneeId: 'assignee1',
      assigneeName: 'Mike Assignee',
      submittedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      ticketId: 'TKT-003',
      subject: 'Install new printer in Conference Room',
      description: 'Setup and configure new HP LaserJet printer',
      department: 'IT',
      priority: 'low',
      status: 'in_progress',
      requesterId: 'req3',
      requesterName: 'Bob Wilson',
      assigneeId: 'assignee1',
      assigneeName: 'Mike Assignee',
      submittedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      ticketId: 'TKT-004',
      subject: 'Resolve email server downtime',
      description: 'Email server crashed and needs immediate attention',
      department: 'IT',
      priority: 'urgent',
      status: 'assigned',
      requesterId: 'req4',
      requesterName: 'Sarah Johnson',
      assigneeId: 'assignee1',
      assigneeName: 'Mike Assignee',
      submittedDate: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      ticketId: 'TKT-005',
      subject: 'Configure VPN access for remote workers',
      description: 'Setup VPN credentials for 15 remote employees',
      department: 'IT',
      priority: 'high',
      status: 'in_progress',
      requesterId: 'req5',
      requesterName: 'Tom Brown',
      assigneeId: 'assignee1',
      assigneeName: 'Mike Assignee',
      submittedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '6',
      ticketId: 'TKT-006',
      subject: 'Backup database server',
      description: 'Perform weekly backup of production database',
      department: 'IT',
      priority: 'medium',
      status: 'resolved',
      requesterId: 'req6',
      requesterName: 'Alice Green',
      assigneeId: 'assignee1',
      assigneeName: 'Mike Assignee',
      submittedDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      completedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '7',
      ticketId: 'TKT-007',
      subject: 'Update antivirus software',
      description: 'Install latest antivirus updates on all workstations',
      department: 'IT',
      priority: 'medium',
      status: 'resolved',
      requesterId: 'req7',
      requesterName: 'Charlie Davis',
      assigneeId: 'assignee1',
      assigneeName: 'Mike Assignee',
      submittedDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      completedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
  return demoTickets;
};

const AssigneeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [departmentHead, setDepartmentHead] = useState<User | null>(null);
  const [departmentWorkload, setDepartmentWorkload] = useState<DepartmentWorkloadData[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetricsData[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch assigned tickets
        if (user?.id) {
          let ticketsList: Ticket[] = [];
          try {
            const ticketsResponse = await ticketService.getTickets({ assigneeId: user.id });
            ticketsList = Array.isArray(ticketsResponse) 
              ? ticketsResponse 
              : (ticketsResponse?.results || []);
          } catch (error) {
            console.warn('API not available, using demo data');
            ticketsList = generateDemoTickets();
          }

          if (ticketsList.length === 0) {
            ticketsList = generateDemoTickets();
          }

          setTickets(ticketsList);

          // Set department head
          if (user.department) {
            try {
              const usersResponse = await userService.getUsers({ 
                department: user.department,
                role: 'assignee'
              });
              const departmentUsers = Array.isArray(usersResponse)
                ? usersResponse
                : (usersResponse?.results || []);
              
              const head = departmentUsers.find(u => 
                u.role === 'admin' || u.id === user.id
              ) || departmentUsers[0];
              
              if (head) {
                setDepartmentHead(head);
              } else {
                setDepartmentHead({
                  id: 'head1',
                  name: 'Mike Assignee',
                  email: 'mike@example.com',
                  role: 'assignee',
                  department: user.department || 'IT',
                });
              }
            } catch (error) {
              setDepartmentHead({
                id: 'head1',
                name: 'Mike Assignee',
                email: 'mike@example.com',
                role: 'assignee',
                department: user.department || 'IT',
              });
            }
          }

          // Generate department workload data
          const workloadData: DepartmentWorkloadData[] = [];
          const dept = user.department || 'IT';
          const deptTickets = ticketsList.filter(t => t.department === dept);
          workloadData.push({
            department: dept,
            assigned: deptTickets.length,
            completed: deptTickets.filter(t => t.status === 'resolved' || t.status === 'completed').length,
            pending: deptTickets.filter(t => t.status === 'assigned' || t.status === 'pending').length,
          });
          setDepartmentWorkload(workloadData);

          // Generate performance metrics (last 30 days)
          const metricsData: PerformanceMetricsData[] = [];
          const today = new Date();
          for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const completedTickets = ticketsList.filter(t => {
              if (t.resolvedDate || t.completedDate) {
                const resolvedDate = new Date(t.resolvedDate || t.completedDate || '');
                const createdDate = new Date(t.submittedDate);
                const diffDays = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
                return diffDays >= 0 && diffDays <= 30;
              }
              return false;
            });
            
            const avgDays = completedTickets.length > 0
              ? completedTickets.reduce((sum, t) => {
                  const resolvedDate = new Date(t.resolvedDate || t.completedDate || '');
                  const createdDate = new Date(t.submittedDate);
                  const diffDays = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
                  return sum + diffDays;
                }, 0) / completedTickets.length
              : 2.5 + (Math.random() - 0.5) * 1.5;
            
            metricsData.push({
              date: dateStr,
              averageDays: Math.round(avgDays * 10) / 10 || 0,
            });
          }
          setPerformanceMetrics(metricsData);
        }
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        const demoTickets = generateDemoTickets();
        setTickets(demoTickets);
        setDepartmentHead({
          id: 'head1',
          name: 'Mike Assignee',
          email: 'mike@example.com',
          role: 'assignee',
          department: user?.department || 'IT',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    } else {
      const demoTickets = generateDemoTickets();
      setTickets(demoTickets);
      setDepartmentHead({
        id: 'head1',
        name: 'Mike Assignee',
        email: 'mike@example.com',
        role: 'assignee',
        department: 'IT',
      });
      setLoading(false);
    }
  }, [user?.id, user?.department]);

  // Calculate KPIs
  const activeTasks = tickets.filter(t => 
    t.status === 'in_progress'
  ).length;
  
  const pendingTasks = tickets.filter(t => 
    t.status === 'assigned' || t.status === 'pending'
  ).length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const completedThisMonth = tickets.filter(t => {
    if (t.completedDate || t.resolvedDate) {
      const completedDate = new Date(t.completedDate || t.resolvedDate || '');
      return completedDate.getMonth() === currentMonth && 
             completedDate.getFullYear() === currentYear &&
             (t.status === 'resolved' || t.status === 'completed');
    }
    return false;
  }).length;

  // Calculate average resolution time (department average)
  const completedTickets = tickets.filter(t => 
    (t.status === 'resolved' || t.status === 'completed') && 
    (t.resolvedDate || t.completedDate)
  );
  
  const avgResolutionTime = completedTickets.length > 0
    ? completedTickets.reduce((sum, t) => {
        const resolvedDate = new Date(t.resolvedDate || t.completedDate || '');
        const createdDate = new Date(t.submittedDate);
        const diffDays = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        return sum + diffDays;
      }, 0) / completedTickets.length
    : 0;

  // Active tasks for table (in progress or assigned)
  const activeTasksList = tickets.filter(t => 
    t.status === 'in_progress' || t.status === 'assigned'
  );

  // Calculate SLA (days remaining)
  const calculateSLA = (ticket: Ticket): string => {
    const createdDate = new Date(ticket.submittedDate);
    const now = new Date();
    const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    
    const slaDays = ticket.priority === 'urgent' || ticket.priority === 'high' 
      ? 7 
      : ticket.priority === 'medium' 
      ? 14 
      : 30;
    
    const daysRemaining = slaDays - daysSinceCreation;
    
    if (daysRemaining < 0) {
      return `${Math.abs(Math.round(daysRemaining))} days overdue`;
    } else if (daysRemaining <= 1) {
      return 'Due today';
    } else {
      return `${Math.round(daysRemaining)} days left`;
    }
  };

  const handleStartWork = async (ticketId: string) => {
    try {
      await ticketService.changeStatus(ticketId, 'in_progress');
      const response = await ticketService.getTickets({ assigneeId: user?.id });
      const ticketsList = Array.isArray(response) ? response : (response?.results || []);
      setTickets(ticketsList.length > 0 ? ticketsList : generateDemoTickets());
    } catch (error) {
      console.error('Error starting work:', error);
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, status: 'in_progress' } : t
      ));
    }
  };

  const handleUpdateProgress = (ticketId: string) => {
    router.push(`/assignee/task-detail/${ticketId}`);
  };

  const handleMarkComplete = async (ticketId: string) => {
    try {
      await ticketService.changeStatus(ticketId, 'completed', 'Task completed by assignee');
      const response = await ticketService.getTickets({ assigneeId: user?.id });
      const ticketsList = Array.isArray(response) ? response : (response?.results || []);
      setTickets(ticketsList.length > 0 ? ticketsList : generateDemoTickets());
    } catch (error) {
      console.error('Error completing ticket:', error);
      const now = new Date();
      setTickets(prev => prev.map(t => 
        t.id === ticketId 
          ? { ...t, status: 'completed', completedDate: now.toISOString(), resolvedDate: now.toISOString() }
          : t
      ));
    }
  };

  const handleViewTicket = (ticketId: string) => {
    router.push(`/assignee/task-detail/${ticketId}`);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: THEME.colors.primary }}></div>
          <p style={{ color: THEME.colors.gray }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
      {/* Header Card */}
      <Card className="bg-white rounded-2xl shadow-xl border-0">
        <CardContent className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: THEME.colors.primary }}>
                <Building2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold" style={{ color: THEME.colors.primary }}>
                  {user?.department || 'IT'} Dashboard
                </h1>
                <div className="flex items-center gap-2 mt-1 text-xs md:text-sm" style={{ color: THEME.colors.gray }}>
                  <UserIcon className="w-3 h-3 md:w-4 md:h-4" />
                  <span>
                    <strong>Department Head:</strong> {departmentHead?.name || user?.name || 'Mike Assignee'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
        <div className="h-full">
          <AnalyticsCard
            title="Active Tasks"
            value={activeTasks}
            icon={Activity}
            color={THEME.colors.primary}
            hoverDescription="Tickets in progress"
          />
        </div>
        <div className="h-full">
          <AnalyticsCard
            title="Pending Tasks"
            value={pendingTasks}
            icon={Clock}
            color={THEME.colors.warning}
            hoverDescription="Assigned but not started"
          />
        </div>
        <div className="h-full">
          <AnalyticsCard
            title="Completed This Month"
            value={completedThisMonth}
            icon={CheckCircle}
            color={THEME.colors.success}
            hoverDescription="Count of completed tickets"
          />
        </div>
        <div className="h-full">
          <AnalyticsCard
            title="Average Resolution Time"
            value={avgResolutionTime > 0 ? `${Math.round(avgResolutionTime)} days` : 'N/A'}
            icon={TrendingUp}
            color={THEME.colors.medium}
            hoverDescription="Department average"
          />
        </div>
      </div>

      {/* My Active Tasks Table */}
      <Card className="bg-white rounded-2xl shadow-xl border-0">
        <CardHeader className="p-4 md:p-6 lg:p-8 pb-2 md:pb-4">
          <CardTitle className="text-lg md:text-xl lg:text-2xl font-bold" style={{ color: THEME.colors.primary }}>
            My Active Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 lg:p-8 pt-2 md:pt-4">
          {activeTasksList.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: THEME.colors.background }}>
                <CheckCircle className="w-8 h-8" style={{ color: THEME.colors.gray }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: THEME.colors.gray }}>
                No active tasks
              </h3>
              <p style={{ color: THEME.colors.gray }}>You don't have any active tasks at the moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y" style={{ borderColor: THEME.colors.background }}>
                    <thead>
                      <tr className="border-b-2" style={{ borderColor: THEME.colors.background }}>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                          ID
                        </th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                          Title
                        </th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                          Priority
                        </th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                          Created
                        </th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                          SLA
                        </th>
                        <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: THEME.colors.background }}>
                      {activeTasksList.map((ticket) => (
                        <tr 
                          key={ticket.id} 
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4 text-xs md:text-sm font-medium whitespace-nowrap" style={{ color: THEME.colors.primary }}>
                            {ticket.ticketId || ticket.id.slice(0, 8)}
                          </td>
                          <td className="py-4 px-4 text-xs md:text-sm max-w-xs" style={{ color: THEME.colors.gray }}>
                            <div className="truncate" title={ticket.subject}>
                              {ticket.subject}
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <PriorityBadge priority={ticket.priority} />
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <StatusBadge status={ticket.status} />
                          </td>
                          <td className="py-4 px-4 text-xs md:text-sm whitespace-nowrap" style={{ color: THEME.colors.gray }}>
                            {formatDate(ticket.submittedDate, 'short')}
                          </td>
                          <td className="py-4 px-4 text-xs md:text-sm whitespace-nowrap" style={{ color: THEME.colors.gray }}>
                            {calculateSLA(ticket)}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1 md:gap-2">
                              {ticket.status === 'assigned' && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  leftIcon={<Play className="w-3 h-3" />}
                                  onClick={() => handleStartWork(ticket.id)}
                                  className="text-xs px-2 md:px-3"
                                >
                                  <span className="hidden sm:inline">Start Work</span>
                                  <span className="sm:hidden">Start</span>
                                </Button>
                              )}
                              {ticket.status === 'in_progress' && (
                                <>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    leftIcon={<Edit className="w-3 h-3" />}
                                    onClick={() => handleUpdateProgress(ticket.id)}
                                    className="text-xs px-2 md:px-3"
                                  >
                                    <span className="hidden sm:inline">Update Progress</span>
                                    <span className="sm:hidden">Update</span>
                                  </Button>
                                  <Button
                                    variant="success"
                                    size="sm"
                                    leftIcon={<CheckCircle className="w-3 h-3" />}
                                    onClick={() => handleMarkComplete(ticket.id)}
                                    className="text-xs px-2 md:px-3"
                                  >
                                    <span className="hidden sm:inline">Mark Complete</span>
                                    <span className="sm:hidden">Complete</span>
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<Eye className="w-3 h-3" />}
                                onClick={() => handleViewTicket(ticket.id)}
                                className="text-xs px-2 md:px-3"
                              >
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Department Workload Chart */}
        <Card className="bg-white rounded-2xl shadow-xl border-0">
          <CardHeader className="p-4 md:p-6 lg:p-8 pb-2 md:pb-4">
            <CardTitle className="text-lg md:text-xl lg:text-2xl font-bold" style={{ color: THEME.colors.primary }}>
              Department Workload
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 lg:p-8 pt-2 md:pt-4">
            <div className="w-full" style={{ minHeight: '300px' }}>
              <DepartmentLoadChart 
                data={departmentWorkload.length > 0 ? departmentWorkload : undefined}
                height={300}
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics Chart */}
        <Card className="bg-white rounded-2xl shadow-xl border-0">
          <CardHeader className="p-4 md:p-6 lg:p-8 pb-2 md:pb-4">
            <CardTitle className="text-lg md:text-xl lg:text-2xl font-bold" style={{ color: THEME.colors.primary }}>
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 lg:p-8 pt-2 md:pt-4">
            <div className="w-full" style={{ minHeight: '300px' }}>
              <ResolutionTimeTrendChart 
                data={performanceMetrics.length > 0 ? performanceMetrics : []}
                height={300}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssigneeDashboardPage;
