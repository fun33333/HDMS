'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/Button';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { 
  FileText, 
  User, 
  CheckCircle,
  Clock,
  PlayCircle,
  Eye,
  Play,
  Check,
  Calendar,
  Building,
  Award,
  BarChart3,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { THEME } from '../../lib/theme';
import { AnalyticsCard } from '../common/AnalyticsCard';
import ticketService from '../../services/api/ticketService';
import { Ticket } from '../../types';

const AssigneeDashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await ticketService.getTickets({ assigneeId: user?.id });
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
    if (user?.id) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const myTasks = tickets.filter(t => t.assigneeId === user?.id);

  const handleStartTask = (taskId: string) => {
    console.log('Starting task:', taskId);
    alert(`Task ${taskId} has been started and moved to In Progress`);
  };

  const handleCompleteTask = (taskId: string) => {
    console.log('Completing task:', taskId);
    alert(`Task ${taskId} has been completed and moved to Resolved`);
  };

  const handleViewTask = (taskId: string) => {
    console.log('Viewing task:', taskId);
  };

  const filteredTasks = myTasks.filter(task => 
    task.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.requesterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completionRate = myTasks.length > 0 ? Math.round((myTasks.filter(t => t.status === 'resolved').length / myTasks.length) * 100) : 0;
  const activeTasks = myTasks.filter(t => t.status === 'assigned' || t.status === 'in_progress').length;

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 space-y-8 min-h-screen">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold" style={{ color: THEME.colors.primary }}>
            Welcome back, <span style={{ color: THEME.colors.medium }}>{user?.name || 'Rajeev Kumar'}</span>!
          </h1>
          <p className="text-lg" style={{ color: THEME.colors.gray }}>Here's what's happening with your assigned tasks today.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Tasks"
          value={myTasks.length}
          icon={FileText}
          color={THEME.colors.light}
          onClick={() => router.push('/assignee/tasks')}
          hoverDescription="All assigned tasks"
        />
        <AnalyticsCard
          title="Assigned"
          value={myTasks.filter(t => t.status === 'assigned').length}
          icon={Clock}
          color={THEME.colors.medium}
          onClick={() => router.push('/assignee/tasks')}
          hoverDescription="Ready to start"
        />
        <AnalyticsCard
          title="In Progress"
          value={myTasks.filter(t => t.status === 'in_progress').length}
          icon={PlayCircle}
          color={THEME.colors.primary}
          onClick={() => router.push('/assignee/tasks')}
          hoverDescription="Currently working"
        />
        <AnalyticsCard
          title="Completed"
          value={myTasks.filter(t => t.status === 'resolved').length}
          icon={CheckCircle}
          color={THEME.colors.gray}
          onClick={() => router.push('/assignee/tasks')}
          hoverDescription="Successfully done"
        />
      </div>

      {/* Performance Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: THEME.colors.primary }}>
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>Performance Overview</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: THEME.colors.gray }}>Completion Rate</span>
                  <span className="text-lg font-bold" style={{ color: THEME.colors.primary }}>{completionRate}%</span>
                </div>
                <div className="w-full rounded-full h-4 overflow-hidden" style={{ backgroundColor: THEME.colors.background }}>
                  <div 
                    className="h-4 rounded-full transition-all duration-1000 ease-out shadow-lg" 
                    style={{ 
                      width: `${completionRate}%`,
                      backgroundColor: THEME.colors.primary
                    }}
                  ></div>
                </div>
                <p className="text-xs mt-2" style={{ color: THEME.colors.gray }}>Tasks completed successfully</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: THEME.colors.gray }}>Active Tasks</span>
                  <span className="text-lg font-bold" style={{ color: THEME.colors.medium }}>{activeTasks}</span>
                </div>
                <div className="w-full rounded-full h-4 overflow-hidden" style={{ backgroundColor: THEME.colors.background }}>
                  <div 
                    className="h-4 rounded-full transition-all duration-1000 ease-out shadow-lg" 
                    style={{ 
                      width: `${myTasks.length > 0 ? (activeTasks / myTasks.length) * 100 : 0}%`,
                      backgroundColor: THEME.colors.medium
                    }}
                  ></div>
                </div>
                <p className="text-xs mt-2" style={{ color: THEME.colors.gray }}>Currently in progress</p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t" style={{ borderColor: THEME.colors.background }}>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1" style={{ color: THEME.colors.primary }}>
                    {myTasks.filter(t => t.status === 'resolved').length}
                  </div>
                  <div className="text-sm font-medium" style={{ color: THEME.colors.gray }}>Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1" style={{ color: THEME.colors.medium }}>
                    {activeTasks}
                  </div>
                  <div className="text-sm font-medium" style={{ color: THEME.colors.gray }}>Active</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: THEME.colors.primary }}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>Quick Actions</h3>
            </div>
            
            <div className="space-y-4">
              <Link href="/assignee/tasks" className="block">
                <Button variant="primary" className="w-full justify-start h-16 text-left rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <FileText className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                  <div className="flex flex-col items-start">
                    <div className="font-semibold text-base">View All My Tasks</div>
                    <div className="text-sm opacity-90 mt-0.5">Manage your assigned tasks</div>
                  </div>
                </Button>
              </Link>
              
              <Link href="/assignee/profile" className="block">
                <Button variant="secondary" className="w-full justify-start h-16 text-left rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group">
                  <User className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                  <div className="flex flex-col items-start">
                    <div className="font-semibold text-base">Manage Profile</div>
                    <div className="text-sm opacity-75 mt-0.5">Update your information</div>
                  </div>
                </Button>
              </Link>
              
              <Button variant="secondary" className="w-full justify-start h-16 text-left rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group">
                <Award className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <div className="flex flex-col items-start">
                  <div className="font-semibold text-base">View Achievements</div>
                  <div className="text-sm opacity-75 mt-0.5">Track your progress</div>
                </div>
              </Button>
              
              <Button variant="secondary" className="w-full justify-start h-16 text-left rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group" onClick={() => router.push('/assignee/reports')}>
                <BarChart3 className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <div className="flex flex-col items-start">
                  <div className="font-semibold text-base">Performance Report</div>
                  <div className="text-sm opacity-75 mt-0.5">Detailed analytics</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card className="bg-white shadow-xl border-0">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: THEME.colors.primary }}>
                <Target className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>Recent Tasks</h2>
            </div>
            <Link href="/assignee/tasks">
              <Button variant="primary" className="rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                View All Tasks
              </Button>
            </Link>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: THEME.colors.background }}>
                <FileText className="w-12 h-12" style={{ color: THEME.colors.gray }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: THEME.colors.gray }}>No tasks found</h3>
              <p style={{ color: THEME.colors.gray }}>You don't have any assigned tasks at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group" style={{ borderColor: THEME.colors.background, backgroundColor: THEME.colors.background }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-bold group-hover:transition-colors duration-300" style={{ color: THEME.colors.primary }}>{task.subject}</h3>
                        <PriorityBadge priority={task.priority} withBorder={true} />
                        <StatusBadge status={task.status} withIcon={true} withBorder={true} />
                      </div>
                      
                      <p className="mb-4 leading-relaxed" style={{ color: THEME.colors.gray }}>{task.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm" style={{ color: THEME.colors.gray }}>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" style={{ color: THEME.colors.primary }} />
                          <span><strong>Requester:</strong> {task.requesterName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4" style={{ color: THEME.colors.primary }} />
                          <span><strong>Department:</strong> {task.department}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" style={{ color: THEME.colors.primary }} />
                          <span><strong>Assigned:</strong> {new Date(task.submittedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-6">
                      <Button variant="primary" size="sm" leftIcon={<Eye className="w-4 h-4" />} onClick={() => handleViewTask(task.id)}>
                        View
                      </Button>
                      
                      {task.status === 'assigned' && (
                        <Button variant="success" size="sm" leftIcon={<Play className="w-4 h-4" />} onClick={() => handleStartTask(task.id)}>
                          Start
                        </Button>
                      )}
                      
                      {task.status === 'in_progress' && (
                        <Button variant="success" size="sm" leftIcon={<Check className="w-4 h-4" />} onClick={() => handleCompleteTask(task.id)}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssigneeDashboard;