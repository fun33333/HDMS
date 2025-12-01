'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { TextArea } from '../../../../../components/ui/TextArea';
import { Select, SelectOption } from '../../../../../components/ui/Select';
import { StatusBadge } from '../../../../../components/common/StatusBadge';
import { PriorityBadge } from '../../../../../components/common/PriorityBadge';
import { SLACard } from '../../../../../components/common/SLACard';
import { TicketTimeline } from '../../../../../components/common/TicketTimeline';
import { ParticipantsCard } from '../../../../../components/common/ParticipantsCard';
import { AttachmentsCard } from '../../../../../components/common/AttachmentsCard';
import TicketChat from '../../../../../components/common/TicketChat';
import SplitTicketModal from '../../../../../components/modals/SplitTicketModal';
import { THEME } from '../../../../../lib/theme';
import { Ticket } from '../../../../../types';
import { formatDate, formatRelativeTime } from '../../../../../lib/helpers';
import ticketService from '../../../../../services/api/ticketService';
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  UserPlus,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Scissors,
  Undo2,
  Calendar,
  Users,
  TrendingUp,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Eye
} from 'lucide-react';
import RejectTicketModal from '../../../../../components/modals/RejectTicketModal';
import AlertModal from '../../../../../components/modals/AlertModal';

// Action Types
type ActionType = 'approve_assign' | 'reject' | 'request_clarification' | null;

// Department Workload Interface
interface DepartmentWorkload {
  department: string;
  activeTickets: number;
  capacity: number;
  loadPercentage: number;
  availableMembers: number;
  totalMembers: number;
  members: Array<{
    id: string;
    name: string;
    available: boolean;
    currentTickets: number;
  }>;
}

// Mock Department Workload Data (Replace with API call)
const getDepartmentWorkload = (department: string): DepartmentWorkload => {
  const mockData: Record<string, DepartmentWorkload> = {
    'Development': { 
      department: 'Development', 
      activeTickets: 8, 
      capacity: 20, 
      loadPercentage: 40, 
      availableMembers: 4, 
      totalMembers: 5,
      members: [
        { id: '1', name: 'Ahmed Khan', available: true, currentTickets: 2 },
        { id: '2', name: 'Fatima Ali', available: true, currentTickets: 1 },
        { id: '3', name: 'Hassan Raza', available: true, currentTickets: 2 },
        { id: '4', name: 'Sara Ahmed', available: true, currentTickets: 1 },
        { id: '5', name: 'Ali Hassan', available: false, currentTickets: 4 },
      ]
    },
    'Finance & Accounts': { 
      department: 'Finance & Accounts', 
      activeTickets: 6, 
      capacity: 15, 
      loadPercentage: 40, 
      availableMembers: 3, 
      totalMembers: 4,
      members: [
        { id: '1', name: 'Zainab Malik', available: true, currentTickets: 1 },
        { id: '2', name: 'Bilal Khan', available: true, currentTickets: 2 },
        { id: '3', name: 'Nadia Sheikh', available: true, currentTickets: 1 },
        { id: '4', name: 'Omar Ali', available: false, currentTickets: 4 },
      ]
    },
    'Procurement': { 
      department: 'Procurement', 
      activeTickets: 5, 
      capacity: 15, 
      loadPercentage: 33, 
      availableMembers: 3, 
      totalMembers: 3,
      members: [
        { id: '1', name: 'Kamran Malik', available: true, currentTickets: 1 },
        { id: '2', name: 'Ayesha Raza', available: true, currentTickets: 2 },
        { id: '3', name: 'Tariq Hussain', available: true, currentTickets: 1 },
      ]
    },
    'Basic Maintenance': { 
      department: 'Basic Maintenance', 
      activeTickets: 10, 
      capacity: 20, 
      loadPercentage: 50, 
      availableMembers: 4, 
      totalMembers: 5,
      members: [
        { id: '1', name: 'Saima Khan', available: true, currentTickets: 2 },
        { id: '2', name: 'Usman Ali', available: true, currentTickets: 1 },
        { id: '3', name: 'Hina Sheikh', available: true, currentTickets: 2 },
        { id: '4', name: 'Bilal Ahmed', available: true, currentTickets: 1 },
        { id: '5', name: 'Nida Raza', available: false, currentTickets: 5 },
      ]
    },
    'IT': { 
      department: 'IT', 
      activeTickets: 12, 
      capacity: 20, 
      loadPercentage: 60, 
      availableMembers: 3, 
      totalMembers: 5,
      members: [
        { id: '1', name: 'Ahmed Khan', available: true, currentTickets: 2 },
        { id: '2', name: 'Fatima Ali', available: true, currentTickets: 3 },
        { id: '3', name: 'Hassan Raza', available: true, currentTickets: 1 },
        { id: '4', name: 'Sara Ahmed', available: false, currentTickets: 5 },
        { id: '5', name: 'Ali Hassan', available: false, currentTickets: 4 },
      ]
    },
    'Architecture': { 
      department: 'Architecture', 
      activeTickets: 4, 
      capacity: 15, 
      loadPercentage: 27, 
      availableMembers: 3, 
      totalMembers: 3,
      members: [
        { id: '1', name: 'Zara Khan', available: true, currentTickets: 1 },
        { id: '2', name: 'Faisal Ali', available: true, currentTickets: 1 },
        { id: '3', name: 'Mehreen Sheikh', available: true, currentTickets: 1 },
      ]
    },
    'Administration': { 
      department: 'Administration', 
      activeTickets: 3, 
      capacity: 15, 
      loadPercentage: 20, 
      availableMembers: 4, 
      totalMembers: 4,
      members: [
        { id: '1', name: 'Rashid Malik', available: true, currentTickets: 0 },
        { id: '2', name: 'Sana Ahmed', available: true, currentTickets: 1 },
        { id: '3', name: 'Imran Khan', available: true, currentTickets: 1 },
        { id: '4', name: 'Amina Ali', available: true, currentTickets: 0 },
      ]
    },
  };
  
  return mockData[department] || { 
    department, 
    activeTickets: 0, 
    capacity: 10, 
    loadPercentage: 0, 
    availableMembers: 1, 
    totalMembers: 1,
    members: [{ id: '1', name: 'Team Member 1', available: true, currentTickets: 0 }]
  };
};

export default function ReviewTicketPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // ✅ Fixed: Get ticket ID from params (dynamic route)
  const ticketId = params?.id as string;
  
  // ✅ Get action from query params (optional)
  const actionParam = searchParams.get('action'); // 'assign', 'reject', 'postpone'
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [priorityOverride, setPriorityOverride] = useState<string>('');
  const [slaOverride, setSlaOverride] = useState<string>('');
  const [reason, setReason] = useState('');
  const [showWorkload, setShowWorkload] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastAction, setLastAction] = useState<any>(null);
  const [undoTimer, setUndoTimer] = useState<number | null>(null);
  const [undoTimeRemaining, setUndoTimeRemaining] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    details?: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  // ✅ Auto-select action if coming from ticket pool
  useEffect(() => {
    if (actionParam === 'assign') {
      setActionType('approve_assign');
    } else if (actionParam === 'reject') {
      setActionType('reject');
    } else if (actionParam === 'postpone') {
      // Postpone is not a standard action, we'll handle it separately
      setActionType(null);
      // You can add postpone logic here
    }
  }, [actionParam]);

  // ✅ Fixed: Fetch ticket using ID from params
  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId) {
        setLoading(false);
        return;
      }
      
      try {
        const data = await ticketService.getTicketById(ticketId);
        setTicket(data);
        setSelectedDepartment(data.department);
        setPriorityOverride(data.priority || 'medium');
      } catch (error: any) {
        // Handle error and use mock data
        const isNetworkError = error?.isNetworkError || !error?.response;
        if (isNetworkError) {
          console.warn('API not available, using mock data');
        } else {
          console.error('Error fetching ticket:', error?.message || error);
        }
        
        // Use mock data if API fails
        const mockTicket: Ticket = {
          id: ticketId,
          ticketId: `HD-2024-${String(ticketId).padStart(3, '0')}`,
          subject: 'Sample Ticket for Review',
          description: 'This is a sample ticket description that needs to be reviewed by the moderator.',
          department: 'IT',
          priority: 'high',
          status: 'submitted',
          requesterId: 'req-1',
          requesterName: 'Ahmed Khan',
          submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        };
        setTicket(mockTicket);
        setSelectedDepartment(mockTicket.department);
        setPriorityOverride(mockTicket.priority);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]); // ✅ Dependencies: ticketId

  // Calculate SLA
  const slaDueDate = useMemo(() => {
    if (!ticket) return null;
    const submitted = new Date(ticket.submittedDate);
    const slaHours = 72; // 3 days
    return new Date(submitted.getTime() + slaHours * 60 * 60 * 1000);
  }, [ticket]);

  // Department options
  const departmentOptions: SelectOption[] = [
    { value: 'Development', label: 'Development' },
    { value: 'Finance & Accounts', label: 'Finance & Accounts' },
    { value: 'Procurement', label: 'Procurement' },
    { value: 'Basic Maintenance', label: 'Basic Maintenance' },
    { value: 'IT', label: 'IT' },
    { value: 'Architecture', label: 'Architecture' },
    { value: 'Administration', label: 'Administration' },
  ];

  // Priority options
  const priorityOptions: SelectOption[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  // Get department workload
  const departmentWorkload = useMemo(() => {
    if (!selectedDepartment) return null;
    return getDepartmentWorkload(selectedDepartment);
  }, [selectedDepartment]);

  // Assignee options (based on selected department)
  const assigneeOptions: SelectOption[] = useMemo(() => {
    if (!selectedDepartment || !departmentWorkload) return [];
    
    return [
      { value: '', label: 'Auto-assign to department head' },
      ...departmentWorkload.members.map(member => ({
        value: member.id,
        label: `${member.name}${member.available ? ' (Available)' : ' (Busy - ' + member.currentTickets + ' tickets)'}`,
        disabled: !member.available,
      }))
    ];
  }, [selectedDepartment, departmentWorkload]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (actionType === 'approve_assign') {
      if (!selectedDepartment) {
        newErrors.department = 'Please select a department';
      }
    }

    if (actionType === 'reject') {
      if (!reason.trim()) {
        newErrors.reason = 'Rejection reason is required';
      } else if (reason.trim().length < 10) {
        newErrors.reason = 'Please provide a detailed reason (at least 10 characters)';
      }
    }

    if (actionType === 'request_clarification') {
      if (!reason.trim()) {
        newErrors.reason = 'Clarification request is required';
      } else if (reason.trim().length < 10) {
        newErrors.reason = 'Please provide detailed clarification request (at least 10 characters)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to show alert
  const showAlert = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    details?: string
  ) => {
    setAlertModal({
      isOpen: true,
      type,
      title,
      message,
      details,
    });
  };

  // Handle action submission
  const handleSubmitAction = async () => {
    if (!ticket) return;

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      let result;
      
      if (actionType === 'approve_assign') {
        // Store last action for undo
        setLastAction({
          type: 'approve_assign',
          previousStatus: ticket.status,
          previousDepartment: ticket.department,
          previousAssignee: ticket.assigneeId,
          ticketId: ticket.id,
          timestamp: Date.now(),
        });

        // Start undo timer (15 minutes = 900000 ms)
        const timer = window.setInterval(() => {
          setUndoTimeRemaining(prev => {
            if (prev <= 0) {
              clearInterval(timer);
              setUndoTimer(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setUndoTimer(timer);
        setUndoTimeRemaining(900); // 15 minutes in seconds

        try {
          result = await ticketService.assignTicket(ticket.id, selectedAssignee || selectedDepartment);
          
          if (priorityOverride !== ticket.priority) {
            await ticketService.changePriority(ticket.id, priorityOverride);
          }
          
          // ✅ Success with details
          showAlert(
            'success',
            'Ticket Assigned Successfully!',
            'The ticket has been assigned successfully.',
            `Department: ${selectedDepartment}\nAssignee: ${result.assigneeName || 'Auto-assigned'}\nPriority: ${priorityOverride}`
          );
        } catch (assignError: any) {
          const isNetworkError = assignError?.isNetworkError || !assignError?.response;
          
          if (isNetworkError) {
            console.warn('API not available, simulating assignment (Demo Mode)');
            
            result = {
              ...ticket,
              status: 'assigned' as const,
              assigneeId: selectedAssignee || 'auto-assigned',
              assigneeName: selectedAssignee 
                ? departmentWorkload?.members.find(m => m.id === selectedAssignee)?.name || 'Department Head'
                : `${selectedDepartment} Department Head`,
              assignedDate: new Date().toISOString(),
              department: selectedDepartment,
              priority: priorityOverride as any,
            };
            
            // ✅ Demo mode success
            showAlert(
              'info',
              'Ticket Assigned (Demo Mode)',
              'The ticket has been assigned successfully in demo mode.',
              `Department: ${selectedDepartment}\nAssignee: ${result.assigneeName}\nPriority: ${priorityOverride}\n\nNote: API not available, this is a demo action.`
            );
          } else {
            throw assignError;
          }
        }
      } else if (actionType === 'reject') {
        try {
          result = await ticketService.rejectTicket(ticket.id, reason);
          
          // ✅ Success with reason
          showAlert(
            'success',
            'Ticket Rejected Successfully!',
            'The ticket has been rejected and permanently closed.',
            `Rejection Reason:\n${reason}`
          );
        } catch (rejectError: any) {
          const isNetworkError = rejectError?.isNetworkError || !rejectError?.response;
          
          if (isNetworkError) {
            console.warn('API not available, simulating rejection (Demo Mode)');
            
            result = {
              ...ticket,
              status: 'rejected' as const,
              rejectionReason: reason,
            };
            
            // ✅ Demo mode success with reason
            showAlert(
              'info',
              'Ticket Rejected (Demo Mode)',
              'The ticket has been rejected in demo mode.',
              `Rejection Reason:\n${reason}\n\nNote: API not available, this is a demo action.`
            );
          } else {
            // ✅ Real error
            showAlert(
              'error',
              'Failed to Reject Ticket',
              'An error occurred while rejecting the ticket.',
              `Error: ${rejectError.message || 'Failed to reject ticket'}\n\nPlease try again.`
            );
            setSubmitting(false);
            return;
          }
        }
      } else if (actionType === 'request_clarification') {
        try {
          await ticketService.addComment(ticket.id, `[Clarification Request] ${reason}`);
          result = ticket;
          
          // ✅ Success
          showAlert(
            'success',
            'Clarification Requested!',
            'A clarification request has been sent to the requester.',
            `Request:\n${reason}`
          );
        } catch (clarifyError: any) {
          const isNetworkError = clarifyError?.isNetworkError || !clarifyError?.response;
          
          if (isNetworkError) {
            console.warn('API not available, simulating clarification request (Demo Mode)');
            result = ticket;
            
            // ✅ Demo mode success
            showAlert(
              'info',
              'Clarification Requested (Demo Mode)',
              'A clarification request has been sent in demo mode.',
              `Request:\n${reason}\n\nNote: API not available, this is a demo action.`
            );
          } else {
            throw clarifyError;
          }
        }
      }

      // Update ticket state
      if (result) {
        setTicket(result);
        setActionType(null);
        setReason('');
        setErrors({});
        
        // Redirect after modal is closed
        if (actionType !== 'reject') {
          // Will redirect in modal onConfirm
        } else {
          // For rejected tickets, redirect after 3 seconds
          setTimeout(() => {
            router.push('/moderator/ticket-pool');
          }, 3000);
        }
      }
    } catch (error: any) {
      console.error('Error submitting action:', error);
      
      const isNetworkError = error?.isNetworkError || !error?.response;
      const errorMessage = isNetworkError
        ? 'Network error. Please check your connection and try again.'
        : error?.message || 'Failed to submit action. Please try again.';
      
      // ✅ Error alert
      showAlert(
        'error',
        'Action Failed',
        'An error occurred while processing your request.',
        `Error Details:\n${errorMessage}\n\nIf you want to test the functionality, the app will use demo mode when API is not available.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle undo last action
  const handleUndoAction = async () => {
    if (!lastAction || !ticket) return;

    try {
      // Restore previous state
      await ticketService.changeStatus(ticket.id, lastAction.previousStatus);
      
      // Clear undo timer
      if (undoTimer) {
        clearInterval(undoTimer);
        setUndoTimer(null);
      }
      
      setLastAction(null);
      setUndoTimeRemaining(0);
      
      // Refresh ticket
      const updated = await ticketService.getTicketById(ticket.id);
      setTicket(updated);
      
      alert('Last action has been undone');
    } catch (error: any) {
      console.error('Error undoing action:', error);
      alert('Failed to undo action');
    }
  };

  // Handle split ticket
  const handleSplitTicket = async (subtickets: Array<{ subject: string; description: string; priority: string; department: string }>) => {
    if (!ticket) return;

    try {
      await ticketService.splitTicket(ticket.id, subtickets);
      alert('Ticket split successfully!');
      setShowSplitModal(false);
      router.push('/moderator/ticket-pool');
    } catch (error: any) {
      console.error('Error splitting ticket:', error);
      alert('Failed to split ticket');
    }
  };

  // Format undo time
  const formatUndoTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimer) {
        clearInterval(undoTimer);
      }
    };
  }, [undoTimer]);

  // Update undo timer display
  useEffect(() => {
    if (undoTimer && undoTimeRemaining > 0) {
      const interval = setInterval(() => {
        setUndoTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            if (undoTimer) {
              clearInterval(undoTimer);
              setUndoTimer(null);
            }
            setLastAction(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [undoTimer, undoTimeRemaining]);

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8 flex items-center justify-center" style={{ backgroundColor: THEME.colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: THEME.colors.primary }}></div>
          <p className="text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ backgroundColor: THEME.colors.background }}>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Ticket not found</h3>
            <Button variant="primary" onClick={() => router.push('/moderator/ticket-pool')}>
              Back to Ticket Pool
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ backgroundColor: THEME.colors.background }}>
      {/* Header - Responsive */}
      <div className="mb-4 md:mb-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.back()}
          className="mb-4"
        >
          Back
        </Button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2" style={{ color: THEME.colors.primary }}>
              Review Ticket: {ticket.ticketId}
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Review and take action on this ticket
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Scissors className="w-4 h-4" />}
              onClick={() => setShowSplitModal(true)}
            >
              <span className="hidden sm:inline">Create Sub-Tickets</span>
              <span className="sm:hidden">Split</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column - Ticket Details (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Ticket Information Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg md:text-xl font-bold" style={{ color: THEME.colors.primary }}>
                  {ticket.subject}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={ticket.status} />
                  {ticket.priority && <PriorityBadge priority={ticket.priority} />}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              {/* Ticket Metadata - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Requester</p>
                  <p className="text-sm font-medium text-gray-900">{ticket.requesterName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Department</p>
                  <p className="text-sm font-medium text-gray-900">{ticket.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Submitted</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(ticket.submittedDate, 'long')}
                  </p>
                </div>
                {ticket.assignedDate && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Assigned</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(ticket.assignedDate, 'long')}
                    </p>
                  </div>
                )}
              </div>

              {/* SLA Card */}
              {slaDueDate && (
                <div>
                  <SLACard
                    submittedDate={ticket.submittedDate}
                    dueDate={slaOverride || slaDueDate.toISOString()}
                    status={ticket.status}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <AttachmentsCard ticketAttachments={ticket.attachments} />
          )}

          {/* Timeline */}
          <TicketTimeline ticket={ticket} />

          {/* Participants */}
          <ParticipantsCard ticket={ticket} />

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
        </div>

        {/* Right Column - Moderator Actions (1/3 width on large screens, full width on mobile) */}
        <div className="space-y-6">
          {/* Moderator Actions Card - Sticky on desktop */}
          <Card className="shadow-lg lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-bold" style={{ color: THEME.colors.primary }}>
                Moderator Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Action Selection - Radio Buttons */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: THEME.colors.primary }}>
                  Select Action
                </label>
                <div className="space-y-3">
                  {/* Approve & Assign */}
                  <label 
                    className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: actionType === 'approve_assign' ? THEME.colors.primary : '#E5E7EB' }}
                  >
                    <input
                      type="radio"
                      name="action"
                      value="approve_assign"
                      checked={actionType === 'approve_assign'}
                      onChange={(e) => setActionType(e.target.value as ActionType)}
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="font-semibold text-gray-900">Approve & Assign</span>
                      </div>
                      <p className="text-xs text-gray-600">Assign ticket to department/assignee</p>
                    </div>
                  </label>

                  {/* Reject */}
                  <label 
                    className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: actionType === 'reject' ? THEME.colors.error : '#E5E7EB' }}
                  >
                    <input
                      type="radio"
                      name="action"
                      value="reject"
                      checked={actionType === 'reject'}
                      onChange={(e) => setActionType(e.target.value as ActionType)}
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span className="font-semibold text-gray-900">Reject</span>
                      </div>
                      <p className="text-xs text-gray-600">Reject ticket (cannot be undone)</p>
                    </div>
                  </label>

                  {/* Request Clarification */}
                  <label 
                    className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: actionType === 'request_clarification' ? THEME.colors.warning : '#E5E7EB' }}
                  >
                    <input
                      type="radio"
                      name="action"
                      value="request_clarification"
                      checked={actionType === 'request_clarification'}
                      onChange={(e) => setActionType(e.target.value as ActionType)}
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <span className="font-semibold text-gray-900">Request Clarification</span>
                      </div>
                      <p className="text-xs text-gray-600">Request more information from requester</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action-Specific Fields */}
              {actionType === 'approve_assign' && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  {/* Department Selection */}
                  <div>
                    <Select
                      label="Assign to Department *"
                      options={departmentOptions}
                      value={selectedDepartment}
                      onChange={(value) => {
                        setSelectedDepartment(value);
                        setSelectedAssignee('');
                      }}
                      fullWidth
                      error={errors.department}
                    />
                  </div>

                  {/* Department Workload Info - Always Visible */}
                  {selectedDepartment && departmentWorkload && (
                    <div className="p-3 bg-white rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Department Workload</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowWorkload(!showWorkload)}
                          rightIcon={showWorkload ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        >
                          {showWorkload ? 'Hide' : 'View Details'}
                        </Button>
                      </div>
                      
                      {/* Basic Workload Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Active Tickets:</span>
                          <span className="font-semibold">{departmentWorkload.activeTickets}/{departmentWorkload.capacity}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${departmentWorkload.loadPercentage}%`,
                              backgroundColor: departmentWorkload.loadPercentage > 80 ? THEME.colors.error :
                                              departmentWorkload.loadPercentage > 60 ? THEME.colors.warning :
                                              THEME.colors.success
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Available: {departmentWorkload.availableMembers}/{departmentWorkload.totalMembers} members</span>
                          <span>{departmentWorkload.loadPercentage}% capacity</span>
                        </div>
                      </div>

                      {/* Detailed Workload Info (Expandable) */}
                      {showWorkload && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Team Members:</p>
                          {departmentWorkload.members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${member.available ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="font-medium">{member.name}</span>
                              </div>
                              <span className="text-gray-600">
                                {member.currentTickets} ticket{member.currentTickets !== 1 ? 's' : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assignee Selection */}
                  {selectedDepartment && assigneeOptions.length > 0 && (
                    <div>
                      <Select
                        label="Select Assignee (Optional)"
                        options={assigneeOptions}
                        value={selectedAssignee}
                        onChange={setSelectedAssignee}
                        fullWidth
                      />
                    </div>
                  )}

                  {/* Priority Override */}
                  <div>
                    <Select
                      label="Priority Override"
                      options={priorityOptions}
                      value={priorityOverride}
                      onChange={setPriorityOverride}
                      fullWidth
                    />
                  </div>

                  {/* SLA Override */}
                  <div>
                    <Input
                      label="SLA Override (Due Date)"
                      type="datetime-local"
                      value={slaOverride}
                      onChange={(e) => setSlaOverride(e.target.value)}
                      icon={<Calendar className="w-4 h-4" />}
                    />
                    {!slaOverride && slaDueDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Auto-calculated: {formatDate(slaDueDate.toISOString(), 'long')}
                      </p>
                    )}
                  </div>

                  {/* Reason/Comment */}
                  <div>
                    <TextArea
                      label="Reason/Comment (Optional)"
                      placeholder="Add any notes or comments..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Reject Action */}
              {actionType === 'reject' && (
                <>
                  <div className="space-y-4 p-4 bg-red-50 rounded-lg border-2 border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-800 mb-1">
                          Warning: This action cannot be undone
                        </p>
                        <p className="text-xs text-red-700">
                          Ticket will be permanently closed and cannot be reopened.
                        </p>
                      </div>
                    </div>
                    <div>
                      <TextArea
                        label="Rejection Reason *"
                        placeholder="Please provide a detailed reason for rejection..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        required
                        error={errors.reason}
                      />
                    </div>
                  </div>
                  
                  {/* Or use modal instead */}
                  {showRejectModal && ticket && (
                    <RejectTicketModal
                      isOpen={showRejectModal}
                      onClose={() => {
                        setShowRejectModal(false);
                        setActionType(null);
                      }}
                      onConfirm={async (reason) => {
                        try {
                          await ticketService.rejectTicket(ticket.id, reason);
                          alert('Ticket rejected successfully');
                          router.push('/moderator/ticket-pool');
                        } catch (error) {
                          alert('Failed to reject ticket');
                        }
                      }}
                      ticketId={ticket.ticketId}
                      ticketSubject={ticket.subject}
                    />
                  )}
                </>
              )}

              {/* Request Clarification */}
              {actionType === 'request_clarification' && (
                <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <TextArea
                      label="Clarification Request *"
                      placeholder="What information do you need from the requester?"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                      required
                      error={errors.reason}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {actionType && (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleSubmitAction}
                    loading={submitting}
                    disabled={submitting}
                  >
                    Submit Action
                  </Button>
                  
                  {/* Undo Button - Only shows within 15 minutes */}
                  {lastAction && undoTimeRemaining > 0 && (
                    <Button
                      variant="outline"
                      fullWidth
                      leftIcon={<Undo2 className="w-4 h-4" />}
                      onClick={handleUndoAction}
                    >
                      Undo Last Action ({formatUndoTime(undoTimeRemaining)})
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => {
          setAlertModal(prev => ({ ...prev, isOpen: false }));
          // Redirect after closing if needed (for non-reject actions)
          if (actionType !== 'reject' && ticket?.status !== 'rejected') {
            setTimeout(() => {
              router.push('/moderator/ticket-pool');
            }, 500);
          }
        }}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        details={alertModal.details}
        buttonText="OK"
      />

      {/* Split Ticket Modal */}
      {showSplitModal && ticket && (
        <SplitTicketModal
          isOpen={showSplitModal}
          onClose={() => setShowSplitModal(false)}
          onSplit={handleSplitTicket}
          ticketSubject={ticket.subject}
          ticketDescription={ticket.description}
          ticketDepartment={ticket.department}
        />
      )}
    </div>
  );
}
