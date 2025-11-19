'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/Button';
import { 
  Plus,
  Clock,
  Star,
  FileText,
  CheckCircle,
  PlayCircle,
  XCircle
} from 'lucide-react';
import { THEME } from '../../lib/theme';
import { AnalyticsCard } from '../common/AnalyticsCard';
import ticketService from '../../services/api/ticketService';
import { Ticket } from '../../types';

const RequesterDashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await ticketService.getTickets({ requesterId: user?.id });
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

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  const handleMouseMove = (e: React.MouseEvent, segment: string) => {
    setHoveredSegment(segment);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
  };

  const stats = {
    resolvedRequests: tickets.filter(t => t.status === 'resolved').length,
    inProgressRequests: tickets.filter(t => t.status === 'in_progress').length,
    pendingRequests: tickets.filter(t => t.status === 'pending').length,
    rejectedRequests: tickets.filter(t => t.status === 'rejected').length,
  };

  const statusData = [
    { key: 'resolved', count: stats.resolvedRequests, color: THEME.colors.primary, hoverColor: THEME.colors.medium, label: 'Resolved' },
    { key: 'in_progress', count: stats.inProgressRequests, color: THEME.colors.medium, hoverColor: THEME.colors.light, label: 'In Progress' },
    { key: 'pending', count: stats.pendingRequests, color: THEME.colors.light, hoverColor: THEME.colors.gray, label: 'Pending' },
    { key: 'rejected', count: stats.rejectedRequests, color: THEME.colors.gray, hoverColor: THEME.colors.background, label: 'Rejected' }
  ];

  const calculateDonutSegments = () => {
    const total = statusData.reduce((sum, status) => sum + status.count, 0);
    const circumference = 2 * Math.PI * 40;
    return statusData.map((status) => {
      const percent = total > 0 ? (status.count / total) : 0;
      return { ...status, length: percent * circumference, percent };
    }).filter(s => s.count > 0);
  };

  const totalRequests = statusData.reduce((sum, status) => sum + status.count, 0);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>
          Welcome ! Requester
        </h1>
        <Button variant="secondary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => router.push('/requester/new-request')}>
          New Request
        </Button>
      </div>

      {/* Analytics & Reports Section */}
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-bold" style={{ color: THEME.colors.primary }}>Analytics & Reports</h2>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <AnalyticsCard title="Total Requests" value={totalRequests} icon={FileText} color={THEME.colors.light} onClick={() => handleCardClick('/requester/requests')} hoverDescription="All submitted requests" />
          {statusData.map((status) => {
            const statusInfo = {
              resolved: { description: 'Successfully completed', Icon: CheckCircle },
              in_progress: { description: 'Currently working', Icon: PlayCircle },
              pending: { description: 'Awaiting assignment', Icon: Clock },
              rejected: { description: 'Declined by requester', Icon: XCircle }
            }[status.key] || { description: '', Icon: FileText };

            return (
              <AnalyticsCard
                key={status.key}
                title={status.label}
                value={status.count}
                icon={statusInfo.Icon}
                color={status.color}
                onClick={() => handleCardClick('/requester/requests')}
                hoverDescription={statusInfo.description}
              />
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Donut Chart */}
          <Card className="rounded-lg bg-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: THEME.colors.primary }}>My Requests by Status</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {(() => {
                      const segments = calculateDonutSegments();
                      let currentOffset = 0;
                      const circumference = 2 * Math.PI * 40;

                      return segments.map((segment) => {
                        const isHovered = hoveredSegment === segment.key;
                        const offset = currentOffset;
                        currentOffset += segment.length;

                        return (
                          <circle
                            key={segment.key}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={isHovered ? segment.hoverColor : segment.color}
                            strokeWidth={isHovered ? '24' : '20'}
                            strokeDasharray={`${segment.length} ${circumference}`}
                            strokeDashoffset={`${-offset}`}
                            className="cursor-pointer transition-all duration-300"
                            onMouseMove={(e) => handleMouseMove(e, segment.key)}
                            onMouseLeave={handleMouseLeave}
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>{totalRequests}</span>
                  </div>
                </div>
              </div>
              
              {hoveredSegment && (
                <div 
                  className="fixed z-50 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium pointer-events-none"
                  style={{ left: tooltipPosition.x + 10, top: tooltipPosition.y - 40, transform: 'translateX(-50%)' }}
                >
                  {(() => {
                    const segment = statusData.find(s => s.key === hoveredSegment);
                    return segment ? `${segment.label}: ${segment.count} requests` : '';
                  })()}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                {calculateDonutSegments().map((segment) => (
                  <div key={segment.key} className="flex items-center group cursor-pointer">
                    <div className="w-3 h-3 rounded-full mr-2 group-hover:opacity-80 transition-colors duration-300" style={{ backgroundColor: segment.color }}></div>
                    <span className="text-sm group-hover:font-semibold transition-all duration-300" style={{ color: THEME.colors.primary }}>{segment.label}</span>
                    <span className="text-xs ml-2 font-medium" style={{ color: THEME.colors.gray }}>{segment.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card className="rounded-lg bg-white">
            <CardContent className="p-4">
              <h3 className="text-lg font-bold mb-10" style={{ color: THEME.colors.primary }}>My Requests by Department</h3>
              <div className="h-80 relative">
                {(() => {
                  const departmentCounts = tickets.reduce((acc, ticket) => {
                    acc[ticket.department] = (acc[ticket.department] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  
                  const allDepartments = Object.entries(departmentCounts).sort(([,a], [,b]) => b - a);
                  const maxCount = Math.max(1, ...allDepartments.map(([,count]) => count));
                  const chartHeight = 180;
                  const yAxisMax = Math.ceil(maxCount / 5) * 5;
                  const yAxisStep = yAxisMax / 5;
                  const yAxisLabels = Array.from({ length: 6 }, (_, i) => Math.round(yAxisMax - (i * yAxisStep)));
                  
                  return (
                    <div className="absolute inset-0 flex items-end justify-between px-6 pb-16">
                      <div className="flex flex-col justify-between h-full text-xs pb-16" style={{ color: THEME.colors.gray }}>
                        {yAxisLabels.map((label, idx) => (
                          <span key={idx} className="whitespace-nowrap">{label}</span>
                        ))}
                      </div>
                      <div className="flex-1 flex items-end justify-center gap-1 px-1 pb-16" style={{ flexWrap: 'nowrap' }}>
                        {allDepartments.map(([department, count]) => {
                          const height = maxCount > 0 ? (count / maxCount) * chartHeight : 0;
                          const displayHeight = Math.max(height, 8);
                          
                          return (
                            <div key={department} className="flex flex-col items-center group flex-shrink-0" style={{ width: '50px' }}>
                              <div className="w-8 rounded-t transition-all duration-300 hover:opacity-90 hover:shadow-lg cursor-pointer relative group" style={{ backgroundColor: THEME.colors.primary, height: `${displayHeight}px`, minHeight: '8px' }}>
                                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-20 pointer-events-none">
                                  {department}: {count} requests
                                </div>
                              </div>
                              <span className="text-[10px] mt-1 font-medium text-center leading-tight" style={{ color: THEME.colors.primary }} title={department}>
                                {department.length > 6 ? `${department.substring(0, 6)}...` : department}
                              </span>
                              <span className="text-[10px] font-semibold mt-0.5" style={{ color: THEME.colors.gray }}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="rounded-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 mr-4" style={{ color: THEME.colors.primary }} />
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Resolution Time for My Tickets</p>
                  <p className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>1.8 Days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex mr-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-6 h-6 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">My Satisfaction Rating</p>
                  <p className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>4.5/5.0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RequesterDashboard;