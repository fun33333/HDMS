'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/Button';
import { TextArea } from '../../../../../components/ui/TextArea';
import { Select, SelectOption } from '../../../../../components/ui/Select';
import { PriorityBadge } from '../../../../../components/common/PriorityBadge';
import { StatusBadge } from '../../../../../components/common/StatusBadge';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  AlertCircle,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { THEME } from '../../../../../lib/theme';
import ticketService from '../../../../../services/api/ticketService';
import userService from '../../../../../services/api/userService';
import { Ticket, User as UserType } from '../../../../../types';
import { formatDate, formatRelativeTime } from '../../../../../lib/helpers';
import AlertModal from '../../../../../components/modals/AlertModal';
import { DEPARTMENTS } from '../../../../../lib/constants';
import { DashboardSkeleton } from '../../../../../components/skeletons/DashboardSkeleton';

const ReassignTicketDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [assignees, setAssignees] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  // Form state
  const [newDepartment, setNewDepartment] = useState<string>('');
  const [newAssignee, setNewAssignee] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  // Error states
  const [errors, setErrors] = useState<{
    department?: string;
    assignee?: string;
    reason?: string;
  }>({});

  // Alert modal state
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Use Promise.allSettled to handle each API call independently
        const results = await Promise.allSettled([
          ticketService.getTicketById(ticketId).catch(err => {
            // Mark as network error if needed
            if (err?.isNetworkError || !err?.response) {
              (err as any).isNetworkError = true;
            }
            throw err;
          }),
          userService.getUsers({ role: 'assignee' }).catch(err => {
            if (err?.isNetworkError || !err?.response) {
              (err as any).isNetworkError = true;
            }
            throw err;
          })
        ]);

        const ticketResult = results[0];
        const usersResult = results[1];

        // Check if ticket fetch was successful
        if (ticketResult.status === 'fulfilled') {
          setTicket(ticketResult.value);
          setNewDepartment(ticketResult.value.department || '');
          setUseMockData(false);
        } else {
          // Ticket fetch failed - check if network error
          const ticketError = ticketResult.reason;
          const isNetworkError = ticketError?.isNetworkError || !ticketError?.response;

          if (isNetworkError) {
            setUseMockData(true);
            // Generate mock ticket data
            const mockTicket: Ticket = {
              id: ticketId,
              ticketId: `TKT-${ticketId}`,
              subject: 'Sample Ticket for Reassignment',
              description: 'This is a sample ticket that needs to be reassigned to a different department.',
              status: 'in_progress',
              priority: 'high',
              department: 'IT',
              requesterId: '1',
              requesterName: 'John Doe',
              assigneeId: '2',
              assigneeName: 'Current Assignee',
              submittedDate: new Date().toISOString(),
              assignedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            };
            setTicket(mockTicket);
            setNewDepartment(mockTicket.department || '');
          } else {
            setAlertModal({
              isOpen: true,
              type: 'error',
              title: 'Error Loading Ticket',
              message: 'Failed to load ticket details. Please try again.',
              details: ticketError?.message || 'Unknown error occurred',
            });
            return; // Don't continue if ticket fetch failed with non-network error
          }
        }

        // Check if users fetch was successful
        if (usersResult.status === 'fulfilled') {
          setAssignees(usersResult.value.results || []);
        } else {
          // Users fetch failed - check if network error
          const usersError = usersResult.reason;
          const isNetworkError = usersError?.isNetworkError || !usersError?.response;

          if (isNetworkError) {
            // Use mock assignees if network error
            const mockAssignees: UserType[] = [
              { id: '1', name: 'Ahmed Khan', email: 'ahmed@example.com', role: 'assignee', department: 'IT' },
              { id: '2', name: 'Fatima Ali', email: 'fatima@example.com', role: 'assignee', department: 'IT' },
              { id: '3', name: 'Hassan Raza', email: 'hassan@example.com', role: 'assignee', department: 'Development' },
              { id: '4', name: 'Sara Ahmed', email: 'sara@example.com', role: 'assignee', department: 'Finance & Accounts' },
              { id: '5', name: 'Ali Hassan', email: 'ali@example.com', role: 'assignee', department: 'Procurement' },
              { id: '6', name: 'Zainab Malik', email: 'zainab@example.com', role: 'assignee', department: 'Basic Maintenance' },
            ];
            setAssignees(mockAssignees);
          } else {
            // Non-network error for users - just log it, don't block the page
            console.error('Error fetching users:', usersError);
            setAssignees([]);
          }
        }
      } catch (error: any) {
        console.error('Unexpected error fetching data:', error);
        // Fallback to mock data for any unexpected errors
        setUseMockData(true);
        const mockTicket: Ticket = {
          id: ticketId,
          ticketId: `TKT-${ticketId}`,
          subject: 'Sample Ticket for Reassignment',
          description: 'This is a sample ticket that needs to be reassigned to a different department.',
          status: 'in_progress',
          priority: 'high',
          department: 'IT',
          requesterId: '1',
          requesterName: 'John Doe',
          assigneeId: '2',
          assigneeName: 'Current Assignee',
          submittedDate: new Date().toISOString(),
          assignedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        setTicket(mockTicket);
        setNewDepartment(mockTicket.department || '');

        const mockAssignees: UserType[] = [
          { id: '1', name: 'Ahmed Khan', email: 'ahmed@example.com', role: 'assignee', department: 'IT' },
          { id: '2', name: 'Fatima Ali', email: 'fatima@example.com', role: 'assignee', department: 'IT' },
          { id: '3', name: 'Hassan Raza', email: 'hassan@example.com', role: 'assignee', department: 'Development' },
          { id: '4', name: 'Sara Ahmed', email: 'sara@example.com', role: 'assignee', department: 'Finance & Accounts' },
        ];
        setAssignees(mockAssignees);
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchData();
    }
  }, [ticketId]);

  // Get assignees filtered by selected department
  const getAssigneesForDepartment = (department: string): SelectOption[] => {
    if (!department || department === '') return [];

    const filtered = assignees.filter(assignee => assignee.department === department);
    return filtered.map(assignee => ({
      value: assignee.id,
      label: `${assignee.name} (${assignee.department})`,
    }));
  };

  // Department options
  const departmentOptions: SelectOption[] = DEPARTMENTS.map(dept => ({
    value: dept,
    label: dept,
  }));

  // Handle department change
  const handleDepartmentChange = (value: string) => {
    setNewDepartment(value);
    setNewAssignee(''); // Reset assignee when department changes
    setErrors(prev => ({ ...prev, department: undefined }));
  };

  // Handle assignee change
  const handleAssigneeChange = (value: string) => {
    setNewAssignee(value);
    setErrors(prev => ({ ...prev, assignee: undefined }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!newDepartment || newDepartment.trim() === '') {
      newErrors.department = 'Department is required';
    }

    if (!newAssignee || newAssignee.trim() === '') {
      newErrors.assignee = 'Assignee is required';
    }

    if (!reason || reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle reassignment
  const handleReassign = async () => {
    if (!validateForm()) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        title: 'Validation Error',
        message: 'Please fill in all required fields correctly.',
      });
      return;
    }

    setSubmitting(true);

    try {
      if (useMockData) {
        // Simulate API call in demo mode
        await new Promise(resolve => setTimeout(resolve, 1000));

        setAlertModal({
          isOpen: true,
          type: 'success',
          title: 'Ticket Reassigned (Demo Mode)',
          message: 'Ticket has been successfully reassigned in demo mode.',
          details: `Reassigned to ${getAssigneesForDepartment(newDepartment).find(a => a.value === newAssignee)?.label || 'Unknown'} in ${newDepartment} department.`,
        });

        // Update local state
        if (ticket) {
          setTicket({
            ...ticket,
            department: newDepartment,
            assigneeId: newAssignee,
            assigneeName: getAssigneesForDepartment(newDepartment).find(a => a.value === newAssignee)?.label.split(' (')[0] || 'Unknown',
            assignedDate: new Date().toISOString(),
          });
        }
      } else {
        await ticketService.reassignTicket(ticketId, newAssignee, reason);

        setAlertModal({
          isOpen: true,
          type: 'success',
          title: 'Ticket Reassigned Successfully',
          message: 'The ticket has been reassigned and all participants have been notified.',
          details: `Reassigned to ${getAssigneesForDepartment(newDepartment).find(a => a.value === newAssignee)?.label || 'Unknown'} in ${newDepartment} department.`,
        });
      }
    } catch (error: any) {
      console.error('Error reassigning ticket:', error);

      const isNetworkError = error?.isNetworkError || !error?.response;

      if (isNetworkError) {
        setAlertModal({
          isOpen: true,
          type: 'error',
          title: 'Network Error',
          message: 'Unable to reassign ticket. Please check your connection.',
          details: 'The ticket reassignment could not be completed due to a network error.',
        });
      } else {
        setAlertModal({
          isOpen: true,
          type: 'error',
          title: 'Reassignment Failed',
          message: 'Failed to reassign the ticket. Please try again.',
          details: error?.message || 'Unknown error occurred',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle alert modal close
  const handleAlertClose = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));

    // If success, redirect after a short delay
    if (alertModal.type === 'success' && !useMockData) {
      setTimeout(() => {
        router.push('/moderator/reassign');
      }, 500);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!ticket) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Ticket Not Found</h2>
            <p className="text-gray-500 mb-6">The ticket you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push('/moderator/reassign')} variant="primary">
              Go Back to Reassign List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Demo Mode Banner */}
      {useMockData && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <strong>Demo Mode:</strong> Using mock data. API is unavailable.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={() => router.push('/moderator/reassign')}
          variant="secondary"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="mb-4"
        >
          Back to Reassign List
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: THEME.colors.primary }}>
          Reassign Tickets
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Assignment Info - Takes 1 column */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Current Assignment Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Ticket ID</p>
                <p className="text-lg font-bold" style={{ color: THEME.colors.primary }}>
                  {ticket.ticketId || `#${ticket.id}`}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Title</p>
                <p className="text-base font-medium text-gray-900 line-clamp-2">{ticket.subject}</p>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Currently Assigned to
                </p>
                <p className="text-base font-medium text-gray-900">{ticket.department || 'Not assigned'}</p>
              </div>

              {ticket.assignedDate && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Assigned on
                  </p>
                  <p className="text-base text-gray-900">
                    {formatDate(ticket.assignedDate)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(ticket.assignedDate)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Status</p>
                <StatusBadge status={ticket.status} />
              </div>

              {ticket.assigneeName && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-600 mb-1 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Current Assignee
                  </p>
                  <p className="text-base text-gray-900">{ticket.assigneeName}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reassignment Form - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Reassignment Form
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* New Department */}
              <div>
                <Select
                  label="New Department *"
                  options={departmentOptions}
                  value={newDepartment}
                  onChange={handleDepartmentChange}
                  error={errors.department}
                  fullWidth
                  placeholder="Select new department"
                />
              </div>

              {/* New Assignee */}
              <div>
                <Select
                  label="New Assignee *"
                  options={getAssigneesForDepartment(newDepartment)}
                  value={newAssignee}
                  onChange={handleAssigneeChange}
                  error={errors.assignee}
                  fullWidth
                  placeholder={newDepartment ? "Select assignee" : "Select department first"}
                  disabled={!newDepartment || newDepartment === ''}
                />
                {!newDepartment && (
                  <p className="text-xs text-gray-500 mt-1">
                    Please select a department first to see available assignees
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <TextArea
                  label="Reason *"
                  placeholder="Explain why you are reassigning this ticket..."
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setErrors(prev => ({ ...prev, reason: undefined }));
                  }}
                  error={errors.reason}
                  rows={5}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 10 characters required. This reason will be logged and notified to all participants.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => router.push('/moderator/reassign')}
                  variant="secondary"
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReassign}
                  variant="primary"
                  className="flex-1"
                  disabled={submitting || !newDepartment || !newAssignee || !reason.trim()}
                >
                  {submitting ? 'Reassigning...' : 'Confirm Reassignment'}
                </Button>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">What happens when you reassign?</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>The old assignee will lose access immediately</li>
                      <li>The ticket will be assigned to the new department and assignee</li>
                      <li>All participants will be notified</li>
                      <li>An audit log entry will be created</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={handleAlertClose}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        details={alertModal.details}
        buttonText={alertModal.type === 'success' ? 'OK' : 'Close'}
      />
    </div>
  );
};

export default ReassignTicketDetailPage;
