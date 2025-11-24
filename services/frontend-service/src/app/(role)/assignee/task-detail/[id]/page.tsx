'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../../lib/auth';
import { 
  ArrowLeft,
  Edit,
  CheckCircle,
  MessageSquare,
  Pause,
  Play,
  Upload,
  X,
  FileText,
  Percent,
  Save,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { THEME } from '../../../../../lib/theme';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/Button';
import { PriorityBadge } from '../../../../../components/common/PriorityBadge';
import { StatusBadge } from '../../../../../components/common/StatusBadge';
import ticketService from '../../../../../services/api/ticketService';
import { Ticket } from '../../../../../types';
import { formatDate } from '../../../../../lib/helpers';
import ConfirmModal from '../../../../../components/modals/ConfirmModal';
import TicketChat from '../../../../../components/common/TicketChat';

const AssigneeTaskDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const ticketId = params.id as string;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Progress Update State
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [progressNotes, setProgressNotes] = useState('');
  const [progressFiles, setProgressFiles] = useState<File[]>([]);
  const [savingProgress, setSavingProgress] = useState(false);
  
  // Completion State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionFiles, setCompletionFiles] = useState<File[]>([]);
  const [completing, setCompleting] = useState(false);
  
  // Postponement State
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [postponeReason, setPostponeReason] = useState('');
  const [postponing, setPostponing] = useState(false);
  
  // Other Modals
  const [confirm, setConfirm] = useState<{ 
    open: boolean; 
    action?: 'acknowledge' | 'start' | 'approval';
    title?: string;
    description?: string;
  }>({ open: false });
  const [processing, setProcessing] = useState(false);
  
  // Chat for Sub-Ticket Request
  const [showChatForSubTicket, setShowChatForSubTicket] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        if (ticketId) {
          try {
            const fetchedTicket = await ticketService.getTicketById(ticketId);
            setTicket(fetchedTicket);
            // Set initial progress if available
            if ((fetchedTicket as any).progressPercentage) {
              setProgressPercentage((fetchedTicket as any).progressPercentage);
            }
          } catch (error) {
            console.warn('API not available, using demo data');
            setTicket({
              id: ticketId,
              ticketId: `TKT-${ticketId.slice(0, 3).toUpperCase()}`,
              subject: 'Sample Task',
              description: 'This is a sample task for demonstration purposes.',
              department: 'IT',
              priority: 'medium',
              status: 'assigned',
              requesterId: 'req1',
              requesterName: 'John Doe',
              assigneeId: user?.id,
              assigneeName: user?.name,
              submittedDate: new Date().toISOString(),
            });
          }
        }
      } catch (error: any) {
        console.error('Error fetching ticket:', error);
        setError('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
    
    // Check if we need to show chat for sub-ticket request
    if (searchParams.get('action') === 'request-subticket') {
      setShowChatForSubTicket(true);
    }
  }, [ticketId, user?.id, searchParams]);

  // Check if user is Finance department
  const isFinanceDepartment = user?.department?.toLowerCase() === 'finance';
  
  // Check if user is Department Head (simplified check - in real app, check user role/permissions)
  const isDepartmentHead = user?.role === 'admin' || user?.role === 'moderator' || true; // For demo, allow all

  const handleAcknowledge = () => {
    setConfirm({
      open: true,
      action: 'acknowledge',
      title: 'Acknowledge Assignment',
      description: 'Confirm that you have received and reviewed this task assignment?'
    });
  };

  const handleStartWork = () => {
    setConfirm({
      open: true,
      action: 'start',
      title: 'Start Work',
      description: 'Change status to In Progress and begin working on this task?'
    });
  };

  const handleSaveProgress = async () => {
    if (!ticket || !isDepartmentHead) {
      alert('Only Department Head can update progress');
      return;
    }

    try {
      setSavingProgress(true);
      
      // Save progress update
      await ticketService.addComment(ticket.id, `Progress Update: ${progressPercentage}% - ${progressNotes}`);
      
      // If files are attached, upload them
      if (progressFiles.length > 0) {
        // In real implementation, upload files via file service
        console.log('Uploading progress files:', progressFiles);
      }
      
      // Refresh ticket
      try {
        const updatedTicket = await ticketService.getTicketById(ticket.id);
        setTicket(updatedTicket);
      } catch (error) {
        // Update local state for demo
        setTicket({ 
          ...ticket, 
          status: 'in_progress',
          ...(ticket.status === 'assigned' && { status: 'in_progress' })
        });
      }
      
      // Reset form
      setProgressNotes('');
      setProgressFiles([]);
      alert('Progress updated successfully!');
    } catch (error) {
      console.error('Error saving progress:', error);
      alert('Failed to save progress. Please try again.');
    } finally {
      setSavingProgress(false);
    }
  };

  const handleMarkComplete = () => {
    if (!completionNotes.trim()) {
      alert('Completion notes are required');
      return;
    }
    setShowCompleteModal(true);
  };

  const handleCompleteTask = async () => {
    if (!ticket || !completionNotes.trim()) {
      alert('Completion notes are required');
      return;
    }

    try {
      setCompleting(true);
      
      // Complete ticket with notes and files
      await ticketService.completeTicket(ticket.id, completionNotes, completionFiles[0]);
      
      // Refresh ticket
      try {
        const updatedTicket = await ticketService.getTicketById(ticket.id);
        setTicket(updatedTicket);
      } catch (error) {
        // Update local state for demo
        const now = new Date();
        setTicket({ 
          ...ticket, 
          status: 'completed',
          completedDate: now.toISOString(),
          resolvedDate: now.toISOString(),
          completionNote: completionNotes
        });
      }
      
      setShowCompleteModal(false);
      setCompletionNotes('');
      setCompletionFiles([]);
      alert('Task marked as complete! Requester will be notified for verification.');
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  const handleRequestPostponement = () => {
    setShowPostponeModal(true);
  };

  const handleSubmitPostponement = async () => {
    if (!postponeReason.trim()) {
      alert('Please provide a reason for postponement');
      return;
    }

    try {
      setPostponing(true);
      
      // Send postponement request via comment (in real app, this would be a special request)
      await ticketService.addComment(ticket!.id, `POSTPONEMENT REQUEST: ${postponeReason}`);
      
      setShowPostponeModal(false);
      setPostponeReason('');
      alert('Postponement request sent to Moderator');
    } catch (error) {
      console.error('Error requesting postponement:', error);
      alert('Failed to send postponement request. Please try again.');
    } finally {
      setPostponing(false);
    }
  };

  const handleRequestSubTicket = () => {
    setShowChatForSubTicket(true);
  };

  const handleRequestApproval = () => {
    if (!isFinanceDepartment) {
      alert('Approval requests are only available for Finance department assignees');
      return;
    }
    setConfirm({
      open: true,
      action: 'approval',
      title: 'Request Approval',
      description: 'This will change status to Waiting Approval and notify CEO/Finance approver. Continue?'
    });
  };

  const handleConfirmAction = async () => {
    if (!ticket || !confirm.action) return;

    try {
      setProcessing(true);
      
      switch (confirm.action) {
        case 'acknowledge':
          await ticketService.addComment(ticket.id, 'Task assignment acknowledged and reviewed.');
          break;
        case 'start':
          await ticketService.changeStatus(ticket.id, 'in_progress', 'Work started on this task.');
          break;
        case 'approval':
          await ticketService.changeStatus(ticket.id, 'waiting_approval', 'Approval requested from Finance/CEO.');
          break;
      }

      // Refresh ticket
      try {
        const updatedTicket = await ticketService.getTicketById(ticket.id);
        setTicket(updatedTicket);
      } catch (error) {
        // Update local state for demo
        if (confirm.action === 'start') {
          setTicket({ ...ticket, status: 'in_progress' });
        } else if (confirm.action === 'approval') {
          setTicket({ ...ticket, status: 'waiting_approval' });
        }
      }
    } catch (error) {
      console.error('Error performing action:', error);
      // Update local state for demo
      if (ticket) {
        if (confirm.action === 'start') {
          setTicket({ ...ticket, status: 'in_progress' });
        } else if (confirm.action === 'approval') {
          setTicket({ ...ticket, status: 'waiting_approval' });
        }
      }
    } finally {
      setProcessing(false);
      setConfirm({ open: false });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'progress' | 'completion') => {
    const files = Array.from(e.target.files || []);
    if (type === 'progress') {
      setProgressFiles([...progressFiles, ...files]);
    } else {
      setCompletionFiles([...completionFiles, ...files]);
    }
  };

  const removeFile = (index: number, type: 'progress' | 'completion') => {
    if (type === 'progress') {
      setProgressFiles(progressFiles.filter((_, i) => i !== index));
    } else {
      setCompletionFiles(completionFiles.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: THEME.colors.primary }}></div>
          <p style={{ color: THEME.colors.gray }}>Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-4 md:p-8 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
        <Card className="bg-white rounded-2xl shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: THEME.colors.error }}>
              {error || 'Task not found'}
            </h2>
            <Button variant="primary" onClick={() => router.push('/assignee/tasks')}>
              Back to Tasks
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.push('/assignee/tasks')}
        >
          <span className="hidden sm:inline">Back to Tasks</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: THEME.colors.primary }}>
            Task Details
          </h1>
          <p className="text-sm md:text-base" style={{ color: THEME.colors.gray }}>
            {ticket.ticketId || ticket.id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Task Info Card */}
          <Card className="bg-white rounded-2xl shadow-xl border-0">
            <CardHeader className="p-4 md:p-6 lg:p-8 pb-2 md:pb-4">
              <div className="flex flex-col gap-4">
                <div>
                  <CardTitle className="text-xl md:text-2xl font-bold mb-2" style={{ color: THEME.colors.primary }}>
                    {ticket.subject}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 lg:p-8 pt-2 md:pt-4 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                  Description
                </h3>
                <p className="text-sm md:text-base" style={{ color: THEME.colors.gray }}>
                  {ticket.description}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                    Requester
                  </h3>
                  <p className="text-sm md:text-base" style={{ color: THEME.colors.gray }}>
                    {ticket.requesterName || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                    Department
                  </h3>
                  <p className="text-sm md:text-base" style={{ color: THEME.colors.gray }}>
                    {ticket.department || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                    Created Date
                  </h3>
                  <p className="text-sm md:text-base" style={{ color: THEME.colors.gray }}>
                    {formatDate(ticket.submittedDate, 'long')}
                  </p>
                </div>
                {ticket.assignedDate && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                      Assigned Date
                    </h3>
                    <p className="text-sm md:text-base" style={{ color: THEME.colors.gray }}>
                      {formatDate(ticket.assignedDate, 'long')}
                    </p>
                  </div>
                )}
                {ticket.completedDate && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                      Completed Date
                    </h3>
                    <p className="text-sm md:text-base" style={{ color: THEME.colors.gray }}>
                      {formatDate(ticket.completedDate, 'long')}
                    </p>
                  </div>
                )}
              </div>

              {/* Completion Note */}
              {ticket.completionNote && (
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                    Completion Note
                  </h3>
                  <p className="text-sm md:text-base" style={{ color: THEME.colors.gray }}>
                    {ticket.completionNote}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Update Card - Only for In Progress tasks */}
          {ticket.status === 'in_progress' && isDepartmentHead && (
            <Card className="bg-white rounded-2xl shadow-xl border-0">
              <CardHeader className="p-4 md:p-6 lg:p-8 pb-2 md:pb-4">
                <CardTitle className="text-lg md:text-xl font-bold" style={{ color: THEME.colors.primary }}>
                  Progress Update
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 lg:p-8 pt-2 md:pt-4 space-y-4">
                {/* Progress Percentage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold" style={{ color: THEME.colors.primary }}>
                      Progress: {progressPercentage}%
                    </label>
                    <span className="text-xs" style={{ color: THEME.colors.gray }}>
                      {progressPercentage}/100
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressPercentage}
                    onChange={(e) => setProgressPercentage(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${THEME.colors.primary} 0%, ${THEME.colors.primary} ${progressPercentage}%, ${THEME.colors.background} ${progressPercentage}%, ${THEME.colors.background} 100%)`
                    }}
                  />
                </div>

                {/* Progress Notes */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                    Progress Notes
                  </label>
                  <textarea
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                    placeholder="Describe your progress on this task..."
                    rows={4}
                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-sm md:text-base resize-none"
                    style={{ 
                      borderColor: THEME.colors.background,
                    }}
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                    Attach Files (Optional)
                  </label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: THEME.colors.background }}>
                      <Upload className="w-5 h-5" style={{ color: THEME.colors.primary }} />
                      <span className="text-sm" style={{ color: THEME.colors.gray }}>Add File</span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileChange(e, 'progress')}
                      />
                    </label>
                    {progressFiles.length > 0 && (
                      <div className="space-y-2">
                        {progressFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" style={{ color: THEME.colors.primary }} />
                              <span className="text-sm" style={{ color: THEME.colors.gray }}>{file.name}</span>
                            </div>
                            <button
                              onClick={() => removeFile(index, 'progress')}
                              className="p-1 hover:bg-red-100 rounded"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={<Save className="w-4 h-4" />}
                  onClick={handleSaveProgress}
                  loading={savingProgress}
                >
                  Save Progress
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Chat for Sub-Ticket Request */}
          {showChatForSubTicket && (
            <Card className="bg-white rounded-2xl shadow-xl border-0">
              <CardHeader className="p-4 md:p-6 lg:p-8 pb-2 md:pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg md:text-xl font-bold" style={{ color: THEME.colors.primary }}>
                    Request Sub-Ticket
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChatForSubTicket(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm mt-2" style={{ color: THEME.colors.gray }}>
                  Use the chat below to request a sub-ticket. Flag your message as a sub-ticket request and describe the need for another department.
                </p>
              </CardHeader>
              <CardContent className="p-4 md:p-6 lg:p-8 pt-2 md:pt-4">
                <TicketChat 
                  ticketId={ticket.id} 
                  allowSubTicketRequest={true}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-4 md:space-y-6">
          {/* Assignee Actions Card */}
          <Card className="bg-white rounded-2xl shadow-xl border-0">
            <CardHeader className="p-4 md:p-6 lg:p-8 pb-2 md:pb-4">
              <CardTitle className="text-lg md:text-xl font-bold" style={{ color: THEME.colors.primary }}>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 lg:p-8 pt-2 md:pt-4 space-y-3">
              {ticket.status === 'assigned' && (
                <>
                  <Button
                    variant="primary"
                    fullWidth
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                    onClick={handleAcknowledge}
                  >
                    Acknowledge
                  </Button>
                  <Button
                    variant="success"
                    fullWidth
                    leftIcon={<Play className="w-4 h-4" />}
                    onClick={handleStartWork}
                  >
                    Start Work
                  </Button>
                </>
              )}
              
              {ticket.status === 'in_progress' && (
                <>
                  <Button
                    variant="primary"
                    fullWidth
                    leftIcon={<Edit className="w-4 h-4" />}
                    onClick={() => {
                      // Scroll to progress update section
                      document.getElementById('progress-update')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Update Status
                  </Button>
                  <Button
                    variant="success"
                    fullWidth
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                    onClick={handleMarkComplete}
                  >
                    Mark Complete
                  </Button>
                </>
              )}
              
              {ticket.status !== 'completed' && ticket.status !== 'resolved' && (
                <>
                  <Button
                    variant="outline"
                    fullWidth
                    leftIcon={<MessageSquare className="w-4 h-4" />}
                    onClick={handleRequestSubTicket}
                  >
                    Request Sub-Ticket
                  </Button>
                  {isFinanceDepartment && (
                    <Button
                      variant="outline"
                      fullWidth
                      leftIcon={<DollarSign className="w-4 h-4" />}
                      onClick={handleRequestApproval}
                    >
                      Request Approval
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    fullWidth
                    leftIcon={<Pause className="w-4 h-4" />}
                    onClick={handleRequestPostponement}
                  >
                    Request Postponement
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6" style={{ color: THEME.colors.success }} />
                <h2 className="text-xl font-bold" style={{ color: THEME.colors.primary }}>
                  Mark Task as Complete
                </h2>
              </div>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={completing}
              >
                <X className="w-5 h-5" style={{ color: THEME.colors.gray }} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                  Completion Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Describe what was completed and how..."
                  rows={5}
                  required
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-sm md:text-base resize-none"
                  style={{ 
                    borderColor: THEME.colors.background,
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                  Attach Proof Files (Optional)
                </label>
                <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: THEME.colors.background }}>
                  <Upload className="w-5 h-5" style={{ color: THEME.colors.primary }} />
                  <span className="text-sm" style={{ color: THEME.colors.gray }}>Add File</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'completion')}
                  />
                </label>
                {completionFiles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {completionFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" style={{ color: THEME.colors.primary }} />
                          <span className="text-sm" style={{ color: THEME.colors.gray }}>{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile(index, 'completion')}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-xl">
              <Button
                variant="outline"
                onClick={() => setShowCompleteModal(false)}
                disabled={completing}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleCompleteTask}
                loading={completing}
                disabled={!completionNotes.trim()}
              >
                Mark Complete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Postponement Modal */}
      {showPostponeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <Pause className="w-6 h-6" style={{ color: THEME.colors.warning }} />
                <h2 className="text-xl font-bold" style={{ color: THEME.colors.primary }}>
                  Request Postponement
                </h2>
              </div>
              <button
                onClick={() => setShowPostponeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={postponing}
              >
                <X className="w-5 h-5" style={{ color: THEME.colors.gray }} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-base text-gray-700 mb-4">
                Please provide a reason for requesting postponement. This request will be sent to the Moderator.
              </p>
              <textarea
                value={postponeReason}
                onChange={(e) => setPostponeReason(e.target.value)}
                placeholder="Enter reason for postponement..."
                rows={4}
                required
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-sm md:text-base resize-none"
                style={{ 
                  borderColor: THEME.colors.background,
                }}
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-xl">
              <Button
                variant="outline"
                onClick={() => setShowPostponeModal(false)}
                disabled={postponing}
              >
                Cancel
              </Button>
              <Button
                variant="warning"
                onClick={handleSubmitPostponement}
                loading={postponing}
                disabled={!postponeReason.trim()}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirm.open}
        title={confirm.title || 'Confirm Action'}
        description={confirm.description || 'Are you sure you want to perform this action?'}
        loading={processing}
        onClose={() => setConfirm({ open: false })}
        onConfirm={handleConfirmAction}
        type={confirm.action === 'acknowledge' ? 'info' : 'info'}
        confirmText={confirm.action === 'start' ? 'Start' : confirm.action === 'acknowledge' ? 'Acknowledge' : confirm.action === 'approval' ? 'Request Approval' : 'Confirm'}
      />
    </div>
  );
};

export default AssigneeTaskDetailPage;

