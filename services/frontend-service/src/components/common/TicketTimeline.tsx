import React from 'react';
import { Card, CardContent } from '../ui/card';
import { CheckCircle } from 'lucide-react';
import { THEME } from '../../lib/theme';
import { Ticket } from '../../types';

interface TicketTimelineProps {
  ticket: Ticket;
}

export const TicketTimeline: React.FC<TicketTimelineProps> = ({ ticket }) => {
  const timeline = [
    {
      date: new Date(ticket.submittedDate),
      event: 'Ticket Created',
      description: `Ticket created by ${ticket.requesterName}`
    },
    ticket.assignedDate ? {
      date: new Date(ticket.assignedDate),
      event: 'Assigned',
      description: `Assigned to ${ticket.assigneeName || 'Assignee'}`
    } : null,
    ticket.completedDate ? {
      date: new Date(ticket.completedDate),
      event: 'In Progress',
      description: 'Work in progress'
    } : null,
    ticket.resolvedDate ? {
      date: new Date(ticket.resolvedDate),
      event: 'Work Completed',
      description: 'Work completed and verified'
    } : null,
    ticket.resolvedDate ? {
      date: new Date(new Date(ticket.resolvedDate).getTime() + 1000 * 60 * 60 * 4),
      event: 'Approved & Closed',
      description: 'Requester approved & closed ticket'
    } : null
  ].filter(Boolean);

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-6" style={{ color: THEME.colors.primary }}>
          Activity Log / Timeline
        </h2>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          
          {/* Timeline Items */}
          <div className="space-y-6">
            {timeline.map((item: any, index) => (
              <div key={index} className="relative flex items-start">
                {/* Timeline Dot */}
                <div className="relative z-10 flex items-center justify-center w-4 h-4 bg-green-500 rounded-full mr-4 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                
                {/* Content */}
                <div className="flex-1 flex items-start justify-between pb-6">
                  <div>
                    <span className="font-medium text-gray-900 mr-2">
                      {item.date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}, {item.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                    <span className="text-gray-700">{item.description}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
