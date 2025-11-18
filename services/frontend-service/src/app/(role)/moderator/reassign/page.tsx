'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { DEPARTMENTS } from '../../../../lib/mockData';
import { PriorityBadge } from '../../../../components/common/PriorityBadge';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { 
  ArrowLeft,
  Check,
  FileText,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { THEME } from '../../../../lib/theme';

const ReassignTicketPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { tickets, updateTicket, getAssignees, user } = useAuth();
  const ticketId = params.id as string;
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [reassignReason, setReassignReason] = useState<string>('');
  const ticket = tickets.find(t => t.id === ticketId);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(ticket?.department || '');
  
  // Auto-populate rejection reason if ticket was rejected
  useEffect(() => {
    if (ticket?.rejectionReason && !reassignReason) {
      setReassignReason(ticket.rejectionReason);
    }
  }, [ticket, reassignReason]);
  
  if (!ticket) {
    return (
      <div className="p-6">
        <h1>Ticket not found</h1>
        <button onClick={() => router.push('/moderator/assigned-tickets')}>Go Back</button>
      </div>
    );
  }

  const assignees = getAssignees();
  const filteredAssignees = assignees.filter(assignee =>
    !selectedDepartment || selectedDepartment === 'all' || assignee.department === selectedDepartment
  );

  // Mock availability and roles - mapping all new assignees by department
  const assigneeData: { [key: string]: { availability: 'available' | 'busy', role: string } } = {
    // Procurement
    '5': { availability: 'available', role: 'Procurement Specialist' },
    '6': { availability: 'available', role: 'Procurement Officer' },
    
    // Electrical
    '7': { availability: 'available', role: 'Electrician' },
    '8': { availability: 'busy', role: 'Electrical Engineer' },
    
    // IT Mainten
    '9': { availability: 'available', role: 'IT Technician' },
    '10': { availability: 'busy', role: 'IT Support Specialist' },
    
    // IT procurement
    '11': { availability: 'available', role: 'IT Procurement Officer' },
    '12': { availability: 'available', role: 'IT Procurement Specialist' },
    
    // Plumbers
    '13': { availability: 'available', role: 'Plumber' },
    '14': { availability: 'busy', role: 'Senior Plumber' },
    
    // Furniture Mainten
    '15': { availability: 'available', role: 'Furniture Specialist' },
    '16': { availability: 'available', role: 'Carpenter' },
    
    // HR
    '17': { availability: 'available', role: 'HR Officer' },
    '18': { availability: 'busy', role: 'HR Specialist' },
    
    // Accounts
    '19': { availability: 'available', role: 'Accountant' },
    '20': { availability: 'available', role: 'Accounts Officer' }
  };

  const handleReassign = () => {
    if (!selectedAssignee || !reassignReason.trim()) {
      alert('Please select an assignee and provide a reason for reassignment');
      return;
    }
    
    const selectedAssigneeObj = assignees.find(a => a.id === selectedAssignee);
    const assigneeInfo = assigneeData[selectedAssignee];
    
    // Update ticket with new assignee info and reassignment reason
    updateTicket(ticketId, {
      assigneeId: selectedAssignee,
      assigneeName: selectedAssigneeObj?.name || 'Unknown',
      moderatorId: user?.id,
      moderatorName: user?.name,
      status: 'assigned',
      assignedDate: new Date().toISOString(),
      reassignmentReason: reassignReason
    });
    
    alert('Ticket reassigned successfully!');
    router.back();
  };



  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Go Back</span>
        </button>
        <h1 className="text-3xl font-bold" style={{ color: THEME.colors.primary }}>
          Reassign Ticket
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Ticket Details */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: THEME.colors.primary }}>
                Ticket Details
              </h2>
              <StatusBadge status={ticket.status} />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ticket ID:</p>
                <p className="font-semibold text-gray-900">{ticket.ticketId}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Subject:</p>
                <p className="font-semibold text-gray-900">{ticket.subject}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Description:</p>
                <p className="text-gray-700 leading-relaxed">{ticket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Priority:</p>
              <PriorityBadge priority={ticket.priority} />
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Department:</p>
                  <p className="font-medium text-gray-800">{ticket.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Requester:</p>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="font-medium text-gray-800">{ticket.requesterName}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Assignee:</p>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="font-medium text-gray-800">{ticket.assigneeName || 'Not assigned'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Request Date:</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="font-medium text-gray-800">
                      {new Date(ticket.submittedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {ticket.assignedDate && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Assigned Date:</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-medium text-gray-800">
                        {new Date(ticket.assignedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {ticket.rejectionReason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-700 mb-1">Original Rejection Reason:</p>
                  <p className="text-sm text-red-600">{ticket.rejectionReason}</p>
                </div>
              )}

              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                  <div className="space-y-2">
                    {ticket.attachments.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-blue-600">
                        <FileText className="w-4 h-4" />
                        <span>{file}</span>
                        <a href="#" className="text-blue-600 hover:text-blue-800">View</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Reassign to */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6" style={{ color: THEME.colors.primary }}>
              Reassign to
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto mb-6">
              {filteredAssignees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No assignees found in this department</p>
                </div>
              ) : (
                filteredAssignees.map((assignee) => {
                  const assigneeInfo = assigneeData[assignee.id];
                  const isSelected = selectedAssignee === assignee.id;
                  const availability = assigneeInfo?.availability || 'available';
                  const isAvailable = availability === 'available';
                  const role = assigneeInfo?.role || 'Support';
                  
                  return (
                    <div
                      key={assignee.id}
                      onClick={() => setSelectedAssignee(assignee.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{assignee.name}</p>
                            {isSelected && (
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">({role})</p>
                          <div className="flex items-center gap-2 mt-2">
                            {isAvailable ? (
                              <>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-green-600">Available</span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-xs text-red-600">Busy</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reason for Reassignment Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Reassignment <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="Explain why you are reassigning this ticket..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none text-gray-900 placeholder:text-gray-400"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Please provide a reason for reassigning this ticket</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReassign}
                disabled={!selectedAssignee || !reassignReason.trim()}
                className={`flex-1 px-6 py-3 rounded-lg transition-colors ${
                  selectedAssignee && reassignReason.trim()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Reassign Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReassignTicketPage;

