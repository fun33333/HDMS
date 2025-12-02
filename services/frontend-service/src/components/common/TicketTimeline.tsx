import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { 
  CheckCircle, 
  UserPlus, 
  MessageSquare, 
  XCircle, 
  Clock, 
  FileText,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { THEME } from '../../lib/theme';
import { Ticket } from '../../types';
import { formatRelativeTime, formatDate } from '../../lib/helpers';

interface TicketTimelineProps {
  ticket: Ticket;
}

export const TicketTimeline: React.FC<TicketTimelineProps> = ({ ticket }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created':
        return CheckCircle;
      case 'assigned':
        return UserPlus;
      case 'status_changed':
        return RefreshCw;
      case 'commented':
        return MessageSquare;
      case 'completed':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      case 'approved':
        return CheckCircle;
      case 'reopened':
        return RefreshCw;
      default:
        return Clock;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'created':
        return '#10b981'; // green
      case 'assigned':
        return '#3b82f6'; // blue
      case 'status_changed':
        return '#8b5cf6'; // purple
      case 'commented':
        return '#f59e0b'; // amber
      case 'completed':
        return '#10b981'; // green
      case 'rejected':
        return '#ef4444'; // red
      case 'approved':
        return '#10b981'; // green
      case 'reopened':
        return '#f59e0b'; // amber
      default:
        return '#6b7280'; // gray
    }
  };

  const timeline = [
    {
      type: 'created',
      date: new Date(ticket.submittedDate),
      event: 'Ticket Created',
      description: `Ticket created by ${ticket.requesterName}`,
      user: ticket.requesterName,
    },
    ticket.assignedDate ? {
      type: 'assigned',
      date: new Date(ticket.assignedDate),
      event: 'Assigned',
      description: ticket.assigneeName 
        ? `Assigned to ${ticket.assigneeName}`
        : `Assigned to ${ticket.department} department`,
      user: ticket.moderatorName || 'System',
    } : null,
    ticket.status === 'in_progress' && ticket.assignedDate ? {
      type: 'status_changed',
      date: new Date(ticket.assignedDate),
      event: 'Status Changed',
      description: `Status changed to In Progress`,
      user: ticket.assigneeName || 'System',
    } : null,
    ticket.completedDate ? {
      type: 'completed',
      date: new Date(ticket.completedDate),
      event: 'Work Completed',
      description: ticket.completionNote || 'Work completed and verified',
      user: ticket.assigneeName || 'Assignee',
    } : null,
    ticket.resolvedDate ? {
      type: 'approved',
      date: new Date(ticket.resolvedDate),
      event: 'Resolved',
      description: 'Ticket marked as resolved',
      user: ticket.requesterName || 'Requester',
    } : null,
    ticket.status === 'rejected' ? {
      type: 'rejected',
      date: new Date(ticket.submittedDate),
      event: 'Rejected',
      description: ticket.rejectionReason || 'Ticket was rejected',
      user: ticket.moderatorName || 'Moderator',
    } : null,
  ].filter(Boolean) as Array<{
    type: string;
    date: Date;
    event: string;
    description: string;
    user: string;
  }>;

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
          Timeline
        </h3>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          {/* Timeline Items */}
          <div className="space-y-4">
            {timeline.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No timeline events</p>
            ) : (
              timeline.map((item, index) => {
                const Icon = getEventIcon(item.type);
                const color = getEventColor(item.type);
                
                return (
                  <div key={index} className="relative flex items-start gap-4">
                    {/* Timeline Dot */}
                    <div 
                      className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color + '20' }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-4 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            {item.event}
                          </p>
                          <p className="text-sm text-gray-700 mb-2">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>By {item.user}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(item.date.toISOString())}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 flex-shrink-0">
                          {formatDate(item.date.toISOString(), 'short')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
