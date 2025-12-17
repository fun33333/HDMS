'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../lib/auth';
import {
  ArrowLeft,
  CheckCircle,
  X,
  Upload,
  Save,
  FileText
} from 'lucide-react';
import { THEME } from '../../../../../lib/theme';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/Button';
import ticketService from '../../../../../services/api/ticketService';
import { Ticket } from '../../../../../types';
import TicketHistory from '../../../../../components/tickets/TicketHistory';
import AssigneeActionsPanel from '../../../../../components/tickets/AssigneeActionsPanel';
import TicketDetailsPanel from '../../../../../components/review/TicketDetailsPanel';
import TicketChatPanel from '../../../../../components/review/TicketChatPanel';
import ConfirmModal from '../../../../../components/modals/ConfirmModal';
import TicketChat from '../../../../../components/common/TicketChat';
import { getMockTicketById } from '../../../../../lib/mockData';

const AssigneeTaskDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Action State
  const [processing, setProcessing] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [showSubTicketChat, setShowSubTicketChat] = useState(false);

  const [progressPercentage, setProgressPercentage] = useState(0);
  const [progressNotes, setProgressNotes] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionFile, setCompletionFile] = useState<File | null>(null);
  const [postponeReason, setPostponeReason] = useState('');

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({ open: false, title: '', description: '', action: async () => { } });

  const fetchTicket = async () => {
    try {
      setLoading(true);
      if (ticketId) {
        const fetchedTicket = await ticketService.getTicketById(ticketId);
        setTicket(fetchedTicket);
        if ((fetchedTicket as any).progress_percent) {
          setProgressPercentage((fetchedTicket as any).progress_percent);
        }
      }
    } catch (error: any) {
      console.error('Error fetching ticket:', error);
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const handleActionSelect = (action: 'acknowledge' | 'start' | 'progress' | 'complete' | 'postpone' | 'subticket' | 'approval') => {
    switch (action) {
      case 'acknowledge':
        setConfirmModal({
          open: true,
          title: 'Acknowledge Assignment',
          description: 'Confirm that you have reviewed this task and accept the assignment.',
          action: async () => {
            await ticketService.acknowledgeTicket(ticketId, 'Acknowledged via Dashboard');
          }
        });
        break;
      case 'start':
        setConfirmModal({
          open: true,
          title: 'Start Work',
          description: 'Change status to In Progress? This indicates you have started working.',
          action: async () => {
            await ticketService.changeStatus(ticketId, 'in_progress', 'Started work');
          }
        });
        break;
      case 'progress':
        setShowProgressModal(true);
        break;
      case 'complete':
        setShowCompleteModal(true);
        break;
      case 'postpone':
        setShowPostponeModal(true);
        break;
      case 'subticket':
        setShowSubTicketChat(true);
        break;
    }
  };

  const executeConfirmAction = async () => {
    if (!ticket) return;
    try {
      setProcessing(true);
      await confirmModal.action();
      alert('Action successful');
      setConfirmModal({ ...confirmModal, open: false });
      fetchTicket(); // Refresh
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!ticket) return;
    try {
      setProcessing(true);
      await ticketService.updateProgress(ticket.id, progressPercentage);
      if (progressNotes) {
        await ticketService.addComment(ticket.id, `[Progress Update] ${progressPercentage}%: ${progressNotes}`);
      }
      setShowProgressModal(false);
      alert('Progress updated');
      fetchTicket();
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!ticket) return;
    try {
      if (!completionNotes) return alert('Please add completion notes');
      setProcessing(true);
      await ticketService.completeTicket(ticket.id, completionNotes, completionFile || undefined);
      setShowCompleteModal(false);
      alert('Ticket marked as resolved');
      fetchTicket();
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handlePostponeSubmit = async () => {
    if (!ticket) return;
    try {
      if (!postponeReason) return alert('Reason required');
      setProcessing(true);
      await ticketService.postponeTicket(ticket.id, postponeReason);
      setShowPostponeModal(false);
      alert('Postponement requested');
      fetchTicket();
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading task...</div>;
  if (error || !ticket) return <div className="p-8 text-center text-red-500">{error || 'Task not found'}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/assignee/tasks')}>
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{ticket.subject}</h1>
            <p className="text-sm text-gray-500">{ticket.ticketId} • {ticket.status.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & History */}
        <div className="lg:col-span-2 space-y-6">
          <TicketDetailsPanel ticket={ticket} />
          <TicketHistory ticketId={ticket.id} />
        </div>

        {/* Right Column: Actions & Chat */}
        <div className="space-y-6">
          <AssigneeActionsPanel
            ticket={ticket}
            onActionSelect={handleActionSelect}
            loading={processing}
          />

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <CardHeader className="pb-2 border-b border-gray-100 bg-gray-50">
              <CardTitle className="text-sm font-bold text-gray-700">Communication</CardTitle>
            </CardHeader>
            <div className="h-[500px]">
              <TicketChat ticketId={ticket.id} />
            </div>
          </Card>
        </div>
      </div>

      {/* MODALS */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ ...confirmModal, open: false })}
        onConfirm={executeConfirmAction}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText="Confirm"
        type="info"
      />

      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Update Progress</h3>
            <label className="block text-sm font-semibold mb-2">Progress: {progressPercentage}%</label>
            <input type="range" min="0" max="100" value={progressPercentage} onChange={(e) => setProgressPercentage(Number(e.target.value))} className="w-full mb-4" />

            <textarea
              className="w-full border rounded p-2 mb-4"
              placeholder="Progress notes..."
              value={progressNotes}
              onChange={(e) => setProgressNotes(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowProgressModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveProgress} loading={processing}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Complete Task</h3>
            <textarea
              className="w-full border rounded p-2 mb-4"
              placeholder="Completion notes (required)..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={4}
            />
            <label className="block mb-4">
              <span className="text-sm font-semibold">Attach Proof (Optional)</span>
              <input type="file" onChange={(e) => setCompletionFile(e.target.files?.[0] || null)} className="block w-full text-sm mt-1" />
            </label>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCompleteModal(false)}>Cancel</Button>
              <Button variant="success" onClick={handleComplete} loading={processing}>Complete</Button>
            </div>
          </div>
        </div>
      )}

      {/* Postpone Modal */}
      {showPostponeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Request Postponement</h3>
            <textarea
              className="w-full border rounded p-2 mb-4"
              placeholder="Reason for postponement..."
              value={postponeReason}
              onChange={(e) => setPostponeReason(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowPostponeModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handlePostponeSubmit} loading={processing}>Submit</Button>
            </div>
          </div>
        </div>
      )}

      {/* Subticket Chat Modal Overlay (Or just rely on main chat with a flag?) */}
      {showSubTicketChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">Request Sub-Ticket</h3>
              <button onClick={() => setShowSubTicketChat(false)}><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-2">Discuss with Moderator to request a sub-ticket.</p>
            <div className="flex-1 overflow-hidden border rounded-lg">
              <TicketChat ticketId={ticket.id} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssigneeTaskDetailPage;
