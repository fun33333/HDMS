'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import { 
  ArrowLeft
} from 'lucide-react';
import { THEME } from '../../../../lib/theme';
import { TimelineSection } from '../../../../components/common/TimelineSection';
import { RequesterDetailsCard } from '../../../../components/common/RequesterDetailsCard';
import { StatusLabelBadge } from '../../../../components/common/StatusLabelBadge';
import { StatusUpdateSection } from '../../../../components/common/StatusUpdateSection';

const AssigneeTaskDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { tickets } = useAuth();
  const ticketId = params.id as string;
  
  const ticket = tickets.find(t => t.id === ticketId);

  if (!ticket) {
    return (
      <div className="p-6">
        <h1>Ticket not found</h1>
        <button onClick={() => router.push('/assignee/tasks')}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button 
        onClick={() => router.push('/assignee/tasks')}
        className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Tasks</span>
      </button>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: THEME.colors.primary }}>
          Ticket #{ticket.ticketId}
        </h1>
        <p className="text-lg text-gray-700">Subject: {ticket.subject}</p>
      </div>

      <div className="flex justify-center gap-3 mb-6">
        <StatusLabelBadge status={ticket.status} />
      </div>

      {/* Requester Details */}
      <RequesterDetailsCard ticket={ticket} />

      {/* Timeline */}
      <TimelineSection ticket={ticket} />

      {/* Status Update */}
      <StatusUpdateSection status={ticket.status} completionNote={ticket.completionNote} viewType="assignee" />
    </div>
  );
};

export default AssigneeTaskDetailPage;

