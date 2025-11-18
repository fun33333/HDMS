'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../hooks/useAuth';
import { useTicketActions } from '../../../../../hooks/useTicketActions';
import { useSocket } from '../../../../../hooks/useSocket';
import { PageWrapper } from '../../../../../components/layout/PageWrapper';
import { Card, CardContent, CardHeader } from '../../../../../components/ui/card';
import { StatusBadge } from '../../../../../components/common/StatusBadge';
import { PriorityBadge } from '../../../../../components/common/PriorityBadge';
import { TicketTimeline } from '../../../../../components/common/TicketTimeline';
import { TicketChat } from '../../../../../components/common/TicketChat';
import { Button } from '../../../../../components/ui/Button';
import { SkeletonLoader } from '../../../../../components/ui/SkeletonLoader';
import { ArrowLeft, Edit, CheckCircle, XCircle } from 'lucide-react';
import { THEME } from '../../../../../lib/theme';
import { Ticket } from '../../../../../types';
import { ticketService } from '../../../../../services/api/ticketService';
import { formatDate } from '../../../../../lib/helpers';
import { useTicketStore } from '../../../../../store/ticketStore';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { setActiveTicket } = useTicketActions();
  const ticketId = params?.id as string;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Connect to socket for real-time updates
  const { subscribe, unsubscribe } = useSocket(
    ticketId ? `/ws/tickets/${ticketId}/` : undefined
  );

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId) return;

      try {
        const data = await ticketService.getTicketById(ticketId);
        setTicket(data);
        setActiveTicket(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId, setActiveTicket]);

  // Subscribe to ticket updates
  useEffect(() => {
    if (!ticketId) return;

    const handleTicketUpdate = (data: any) => {
      setTicket(prev => prev ? { ...prev, ...data.changes } : null);
    };

    subscribe('ticket_updated', handleTicketUpdate);

    return () => {
      unsubscribe('ticket_updated', handleTicketUpdate);
    };
  }, [ticketId, subscribe, unsubscribe]);

  if (loading) {
    return (
      <PageWrapper title="Ticket Details" loading={true} />
    );
  }

  if (error || !ticket) {
    return (
      <PageWrapper
        title="Ticket Details"
        error={error || 'Ticket not found'}
        actions={
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        }
      />
    );
  }

  return (
    <PageWrapper
      title={`Ticket ${ticket.ticketId}`}
      description={ticket.subject}
      actions={
        <Button
          variant="outline"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.back()}
        >
          Back
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2" style={{ color: THEME.colors.primary }}>
                    {ticket.subject}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                  Description
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {ticket.attachments && ticket.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                    Attachments
                  </h4>
                  <div className="space-y-2">
                    {ticket.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-sm text-gray-700">{attachment}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                Timeline
              </h3>
            </CardHeader>
            <CardContent>
              <TicketTimeline ticket={ticket} />
            </CardContent>
          </Card>

          {/* Chat */}
          {ticket.status !== 'pending' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                  Comments & Chat
                </h3>
              </CardHeader>
              <CardContent>
                <TicketChat ticketId={ticket.id} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                Ticket Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Department</p>
                <p className="font-medium">{ticket.department}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Requester</p>
                <p className="font-medium">{ticket.requesterName}</p>
              </div>

              {ticket.assigneeName && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Assigned To</p>
                  <p className="font-medium">{ticket.assigneeName}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-1">Submitted</p>
                <p className="text-sm">{formatDate(ticket.submittedDate, 'long')}</p>
              </div>

              {ticket.assignedDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Assigned</p>
                  <p className="text-sm">{formatDate(ticket.assignedDate, 'long')}</p>
                </div>
              )}

              {ticket.resolvedDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Resolved</p>
                  <p className="text-sm">{formatDate(ticket.resolvedDate, 'long')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions (Role-based) */}
          {user?.role === 'requester' && ticket.status === 'pending' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                  Actions
                </h3>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  fullWidth
                  leftIcon={<Edit className="w-4 h-4" />}
                  onClick={() => router.push(`/requester/requests`)}
                >
                  Edit Request
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

