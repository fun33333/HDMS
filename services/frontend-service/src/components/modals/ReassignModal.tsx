'use client';

import React, { useState } from 'react';
import { X, UserCheck, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select, SelectOption } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { THEME } from '../../lib/theme';
import { DEPARTMENTS } from '../../lib/constants';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
}

interface ReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReassign: (assigneeId: string, reason: string) => void;
  assignees: User[];
  ticketSubject: string;
  ticketDepartment: string;
  currentAssignee?: string;
}

export const ReassignModal: React.FC<ReassignModalProps> = ({
  isOpen,
  onClose,
  onReassign,
  assignees,
  ticketSubject,
  ticketDepartment,
  currentAssignee,
}) => {
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(ticketDepartment);
  const [reason, setReason] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const departmentOptions: SelectOption[] = [
    { value: 'all', label: 'All Departments' },
    ...(DEPARTMENTS as readonly string[]).map(dept => ({ value: dept, label: dept })),
  ];

  const filteredAssignees = assignees.filter(assignee => {
    if (assignee.id === currentAssignee) return false; // Exclude current assignee
    if (!selectedDepartment || selectedDepartment === 'all') return true;
    return assignee.department === selectedDepartment;
  });

  const assigneeOptions: SelectOption[] = filteredAssignees.map(assignee => ({
    value: assignee.id,
    label: `${assignee.name}${assignee.department ? ` (${assignee.department})` : ''}`,
  }));

  const handleReassign = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedAssignee) {
      newErrors.assignee = 'Please select an assignee';
    }

    if (!reason.trim()) {
      newErrors.reason = 'Please provide a reason for reassignment';
    } else if (reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onReassign(selectedAssignee, reason.trim());
      // Reset form
      setSelectedAssignee('');
      setReason('');
      setErrors({});
    }
  };

  const handleClose = () => {
    setSelectedAssignee('');
    setReason('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b z-10">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-6 h-6" style={{ color: THEME.colors.primary }} />
            <h2 className="text-xl font-bold" style={{ color: THEME.colors.primary }}>
              Reassign Ticket
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" style={{ color: THEME.colors.gray }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Ticket Details */}
          <div className="border-r pr-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: THEME.colors.primary }}>
              Ticket Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm mb-1" style={{ color: THEME.colors.gray }}>Subject:</p>
                <p className="font-semibold text-gray-900">{ticketSubject}</p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: THEME.colors.gray }}>Department:</p>
                <p className="font-medium text-gray-800">{ticketDepartment}</p>
              </div>
              {currentAssignee && (
                <div>
                  <p className="text-sm mb-1" style={{ color: THEME.colors.gray }}>Current Assignee:</p>
                  <p className="font-medium text-gray-800">
                    {assignees.find(a => a.id === currentAssignee)?.name || 'Unknown'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Reassign Form */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: THEME.colors.primary }}>
              Select New Assignee
            </h3>

            <div className="space-y-4">
              {/* Department Filter */}
              <div>
                <Select
                  label="Filter by Department"
                  options={departmentOptions}
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                  fullWidth
                />
              </div>

              {/* Assignee Selection */}
              <div>
                <Select
                  label="New Assignee"
                  options={assigneeOptions}
                  value={selectedAssignee}
                  onChange={setSelectedAssignee}
                  placeholder="Select an assignee"
                  error={errors.assignee}
                  fullWidth
                />
                {filteredAssignees.length === 0 && (
                  <div className="mt-2 p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: THEME.colors.background }}>
                    <AlertCircle className="w-4 h-4" style={{ color: THEME.colors.warning }} />
                    <p className="text-sm" style={{ color: THEME.colors.gray }}>
                      No assignees available in this department
                    </p>
                  </div>
                )}
              </div>

              {/* Reason for Reassignment */}
              <div>
                <TextArea
                  label="Reason for Reassignment"
                  placeholder="Explain why you are reassigning this ticket..."
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (errors.reason) {
                      setErrors(prev => ({ ...prev, reason: '' }));
                    }
                  }}
                  error={errors.reason}
                  rows={5}
                  required
                />
                <p className="text-xs mt-1" style={{ color: THEME.colors.gray }}>
                  Minimum 10 characters required
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleReassign}
            disabled={!selectedAssignee || !reason.trim()}
            leftIcon={<Check className="w-4 h-4" />}
            fullWidth
          >
            Reassign Ticket
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReassignModal;

