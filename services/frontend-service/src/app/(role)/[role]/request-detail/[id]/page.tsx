'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../lib/auth';
import { useTicketActions } from '../../../../../hooks/useTicketActions';
import { useSocket } from '../../../../../hooks/useSocket';
import { Card, CardContent, CardHeader } from '../../../../../components/ui/card';
import { StatusBadge } from '../../../../../components/common/StatusBadge';
import { PriorityBadge } from '../../../../../components/common/PriorityBadge';
import { TicketTimeline } from '../../../../../components/common/TicketTimeline';
import { ParticipantsCard } from '../../../../../components/common/ParticipantsCard';
import { AttachmentsCard } from '../../../../../components/common/AttachmentsCard';
import { SLACard } from '../../../../../components/common/SLACard';
import TicketChat from '../../../../../components/common/TicketChat';
import { Button } from '../../../../../components/ui/Button';
import { ResolveModal, ReopenModal } from '../../../../../components/modals/TicketActionModals';
import { 
  ArrowLeft, 
  Edit, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Building2,
  Tag,
  User,
  Calendar,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { THEME } from '../../../../../lib/theme';
import { Ticket } from '../../../../../types';
import { ticketService } from '../../../../../services/api/ticketService';
import { formatDate, formatRelativeTime } from '../../../../../lib/helpers';
import { getMockTicketById } from '../../../../../lib/mockData';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { setActiveTicket, changeStatus } = useTicketActions();
  const ticketId = params?.id as string;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenCount, setReopenCount] = useState(0);

  // Connect to socket for real-time updates
  const { subscribe, unsubscribe } = useSocket(
    ticketId ? `/ws/tickets/${ticketId}/` : undefined
  );

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        try {
          const data = await ticketService.getTicketById(ticketId);
          setTicket(data);
          setActiveTicket(data);
          setError(null);
          // Get reopen count from ticket metadata or API
          setReopenCount((data as any).reopenCount || 0);
        } catch (apiError: any) {
          console.warn('API not available, using mock data');
          const mockTicket = getMockTicketById(ticketId, user?.id);
          if (mockTicket) {
            setTicket(mockTicket);
            setActiveTicket(mockTicket);
            setError(null);
            setReopenCount(0);
          } else {
            setError('Ticket not found');
            setTicket(null);
          }
        }
      } catch (err: any) {
        console.error('Error fetching ticket:', err);
        const mockTicket = getMockTicketById(ticketId, user?.id);
        if (mockTicket) {
          setTicket(mockTicket);
          setActiveTicket(mockTicket);
          setError(null);
        } else {
          setError(err?.message || 'Failed to load ticket');
          setTicket(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId, setActiveTicket, user?.id]);

  // Subscribe to ticket updates
  useEffect(() => {
    if (!ticketId || !ticket) return;

    const handleTicketUpdate = (data: any) => {
      setTicket(prev => prev ? { ...prev, ...data.changes } : null);
    };

    try {
      subscribe('ticket_updated', handleTicketUpdate);
    } catch (error) {
      console.warn('Socket subscription failed (non-blocking):', error);
    }

    return () => {
      try {
        unsubscribe('ticket_updated', handleTicketUpdate);
      } catch (error) {
        // Silently handle unsubscribe errors
      }
    };
  }, [ticketId, ticket, subscribe, unsubscribe]);

  // Calculate auto-close countdown
  const autoCloseCountdown = useMemo(() => {
    if (ticket?.status !== 'resolved' || !ticket?.resolvedDate) return null;
    
    const resolvedDate = new Date(ticket.resolvedDate);
    const autoCloseDate = new Date(resolvedDate.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
    const now = new Date();
    const diffMs = autoCloseDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return null;
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { days: diffDays, hours: diffHours };
  }, [ticket?.status, ticket?.resolvedDate]);

  const handleDownload = (attachment: any) => {
    if (typeof attachment === 'string') {
      window.open(attachment, '_blank');
    } else {
      window.open(attachment.url, '_blank');
    }
  };

  const handleResolve = async () => {
    if (!ticket) return;
    await changeStatus(ticket.id, 'resolved');
    setShowResolveModal(false);
  };

  const handleRequestRework = async (reason: string) => {
    if (!ticket) return;
    // Implement rework request logic
    console.log('Request rework:', reason);
    setShowResolveModal(false);
  };

  const handleReopen = async (reason: string) => {
    if (!ticket || reopenCount >= 2) return;
    // Implement reopen request logic
    await changeStatus(ticket.id, 'pending');
    setReopenCount(prev => prev + 1);
    setShowReopenModal(false);
  };

  const handleCancel = async () => {
    if (!ticket || !confirm('Are you sure you want to cancel this ticket? This action cannot be undone.')) return;
    // Implement cancel/delete logic
    await ticketService.deleteTicket(ticket.id);
    router.push('/requester/requests');
  };

  const canEdit = ticket?.status === ('draft' as any) || ticket?.status === 'pending';
  const canResolve = ticket?.status === 'completed';
  const canReopen = (ticket?.status === ('closed' as any)) && reopenCount < 2;
  const canCancel = ticket?.status === ('draft' as any);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8" style={{ backgroundColor: '#e7ecef', minHeight: '100vh' }}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded-xl"></div>
                <div className="h-48 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-4 sm:p-6 lg:p-8" style={{ backgroundColor: '#e7ecef', minHeight: '100vh' }}>
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold mb-2">Ticket Not Found</h2>
              <p className="text-gray-600 mb-4">{error || 'The ticket you are looking for does not exist.'}</p>
              <Button
                variant="primary"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => router.back()}
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const descriptionWords = ticket.description.split(' ');
  const isLongDescription = descriptionWords.length > 100;
  const displayDescription = descriptionExpanded || !isLongDescription 
    ? ticket.description 
    : descriptionWords.slice(0, 100).join(' ') + '...';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" style={{ backgroundColor: '#e7ecef', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: THEME.colors.primary }}>
                    {ticket.ticketId}
                  </h1>
                  <span className="text-gray-400">-</span>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex-1">
                    {ticket.subject}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {formatRelativeTime(ticket.submittedDate)}</span>
                  </div>
                  {ticket.resolvedDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Last Updated: {formatRelativeTime(ticket.resolvedDate)}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => router.back()}
                className="flex-shrink-0"
              >
                Back
              </Button>
            </div>

            {/* Auto-close countdown */}
            {autoCloseCountdown && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <Clock className="w-4 h-4" />
                  <span>
                    Will auto-close in {autoCloseCountdown.days} day{autoCloseCountdown.days !== 1 ? 's' : ''} {autoCloseCountdown.hours > 0 ? `and ${autoCloseCountdown.hours} hour${autoCloseCountdown.hours !== 1 ? 's' : ''}` : ''}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content - All cards full width like header */}
        <div className="space-y-6">
          {/* Ticket Info & Participants Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ticket Info Card */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                  Ticket Information
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-600">Department</p>
                  </div>
                  <p className="font-medium text-gray-900">{ticket.department}</p>
                </div>

                {(ticket as any).category && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-600">Category</p>
                    </div>
                    <p className="font-medium text-gray-900">{(ticket as any).category}</p>
                  </div>
                )}

                {ticket.assigneeName && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-600">Assignee</p>
                    </div>
                    <p className="font-medium text-gray-900">{ticket.assigneeName}</p>
                  </div>
                )}

                {/* SLA Card */}
                <SLACard
                  submittedDate={ticket.submittedDate}
                  dueDate={(ticket as any).dueDate}
                  slaHours={(ticket as any).slaHours || 72}
                  status={ticket.status}
                />

                {(ticket as any).dueDate && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-600">Due Date</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatDate((ticket as any).dueDate, 'long')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Participants Card */}
            <ParticipantsCard ticket={ticket} />
          </div>

            {/* Description Card */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                  Description
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {displayDescription}
                </p>
                {isLongDescription && (
                  <button
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    className="mt-3 flex items-center gap-1 text-sm font-medium"
                    style={{ color: THEME.colors.primary }}
                  >
                    {descriptionExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show More
                      </>
                    )}
                  </button>
                )}
              </CardContent>
            </Card>

          {/* Attachments Card */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <AttachmentsCard
              ticketAttachments={ticket.attachments}
              onDownload={handleDownload}
            />
          )}

          {/* Timeline Card */}
          <TicketTimeline ticket={ticket} />

          {/* Chat Section */}
          {ticket.status !== ('draft' as any) && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                  Comments & Chat
                </h3>
              </CardHeader>
              <CardContent className="p-0">
                <TicketChat ticketId={ticket.id} />
              </CardContent>
            </Card>
          )}

          {/* Action Buttons Card */}
          {(canEdit || canResolve || canReopen || canCancel) && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                  Actions
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {canEdit && (
                    <Button
                      variant="outline"
                      fullWidth
                      leftIcon={<Edit className="w-4 h-4" />}
                      onClick={() => router.push(`/requester/new-request?edit=${ticket.id}`)}
                    >
                      Edit Request
                    </Button>
                  )}

                  {canResolve && (
                    <Button
                      variant="primary"
                      fullWidth
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                      onClick={() => setShowResolveModal(true)}
                    >
                      Resolve
                    </Button>
                  )}

                  {canReopen && (
                    <Button
                      variant="outline"
                      fullWidth
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                      onClick={() => setShowReopenModal(true)}
                      disabled={reopenCount >= 2}
                    >
                      Request Reopen
                    </Button>
                  )}

                  {canCancel && (
                    <Button
                      variant="outline"
                      fullWidth
                      leftIcon={<XCircle className="w-4 h-4" />}
                      onClick={handleCancel}
                      style={{ color: THEME.colors.error }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>

                {!canEdit && ticket.status !== ('draft' as any) && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      This ticket cannot be edited after submission.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <ResolveModal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        onResolve={handleResolve}
        onRequestRework={handleRequestRework}
      />

      <ReopenModal
        isOpen={showReopenModal}
        onClose={() => setShowReopenModal(false)}
        onSubmit={handleReopen}
        reopenCount={reopenCount}
        maxReopens={2}
      />
    </div>
  );
}
