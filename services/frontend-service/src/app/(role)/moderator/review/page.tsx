'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { PriorityBadge } from '../../../../components/common/PriorityBadge';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react';
import { THEME } from '../../../../lib/theme';

const ReviewTicketPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { tickets, updateTicket, user } = useAuth();
  const ticketId = params.id as string;
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const ticket = tickets.find(t => t.id === ticketId);
  
  if (!ticket) {
    return (
      <div className="p-6">
        <h1>Ticket not found</h1>
        <button onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  const handleApprove = () => {
    updateTicket(ticketId, {
      isApproved: true,
      status: 'resolved',
      moderatorId: user?.id,
      moderatorName: user?.name
    });
    
    alert('Assignee ka kaam approve ho gaya hai!');
    router.push('/moderator/total-requests');
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    updateTicket(ticketId, {
      isApproved: false,
      status: 'rejected',
      rejectionReason: rejectionReason,
      moderatorId: user?.id,
      moderatorName: user?.name
    });
    
    alert('Assignee ka kaam reject ho gaya hai!');
    setShowRejectModal(false);
    router.push('/moderator/total-requests');
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
          Review Completed Work
        </h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            {/* Ticket Information */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-xl font-bold mb-4" style={{ color: THEME.colors.primary }}>
                Request Details
              </h2>
              
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

                <div className="grid grid-cols-2 gap-4 mt-4">
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
                    <p className="text-sm text-gray-600 mb-1">Request Date:</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-medium text-gray-800">
                        {new Date(ticket.submittedDate).toLocaleDateString()}
                      </p>
                    </div>
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

                {ticket.completedDate && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed Date:</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <p className="font-medium text-green-600">
                        {new Date(ticket.completedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Assignee Completion Details */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-xl font-bold mb-4" style={{ color: THEME.colors.primary }}>
                Assignee Completion Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Assignee Name:</p>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <p className="font-semibold text-gray-900">{ticket.assigneeName || 'Not assigned'}</p>
                  </div>
                </div>

                {ticket.completionNote && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Completion Note:</p>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-gray-800">{ticket.completionNote}</p>
                    </div>
                  </div>
                )}

                {ticket.completionImage && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Completion Image:</p>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={ticket.completionImage} 
                        alt="Completion" 
                        className="w-full max-w-md h-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 justify-center">
              <Button
                variant="danger"
                leftIcon={<XCircle className="w-5 h-5" />}
                onClick={() => setShowRejectModal(true)}
              >
                Reject
              </Button>
              <Button
                variant="success"
                leftIcon={<CheckCircle className="w-5 h-5" />}
                onClick={handleApprove}
              >
                Approve
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 shadow-2xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 text-red-600">Reject Work</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting assignee ka kaam:
              </p>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-32 resize-none mb-4 text-gray-900"
                required
              />
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    rejectionReason.trim()
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReviewTicketPage;
