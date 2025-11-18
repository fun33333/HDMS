'use client';

import React, { useState } from 'react';
import { X, Scissors, Plus, Trash2, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Select, SelectOption } from '../ui/Select';
import { THEME } from '../../lib/theme';
import { TICKET_PRIORITY, DEPARTMENTS } from '../../lib/constants';

interface Subticket {
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department: string;
}

interface SplitTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSplit: (subtickets: Subticket[]) => void;
  ticketSubject: string;
  ticketDescription: string;
  ticketDepartment: string;
}

export const SplitTicketModal: React.FC<SplitTicketModalProps> = ({
  isOpen,
  onClose,
  onSplit,
  ticketSubject,
  ticketDescription,
  ticketDepartment,
}) => {
  const [subtickets, setSubtickets] = useState<Subticket[]>([
    {
      subject: '',
      description: '',
      priority: 'medium',
      department: ticketDepartment,
    },
  ]);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  if (!isOpen) return null;

  const priorityOptions: SelectOption[] = [
    { value: TICKET_PRIORITY.LOW, label: 'Low' },
    { value: TICKET_PRIORITY.MEDIUM, label: 'Medium' },
    { value: TICKET_PRIORITY.HIGH, label: 'High' },
    { value: TICKET_PRIORITY.URGENT, label: 'Urgent' },
  ];

  const departmentOptions: SelectOption[] = (DEPARTMENTS as readonly string[]).map(dept => ({
    value: dept,
    label: dept,
  }));

  const addSubticket = () => {
    setSubtickets([
      ...subtickets,
      {
        subject: '',
        description: '',
        priority: 'medium',
        department: ticketDepartment,
      },
    ]);
  };

  const removeSubticket = (index: number) => {
    if (subtickets.length > 1) {
      const updated = subtickets.filter((_, i) => i !== index);
      setSubtickets(updated);
      const updatedErrors = { ...errors };
      delete updatedErrors[index];
      setErrors(updatedErrors);
    }
  };

  const updateSubticket = (index: number, field: keyof Subticket, value: any) => {
    const updated = [...subtickets];
    updated[index] = { ...updated[index], [field]: value };
    setSubtickets(updated);

    // Clear error for this field
    if (errors[index]?.[field]) {
      const updatedErrors = { ...errors };
      if (updatedErrors[index]) {
        updatedErrors[index] = { ...updatedErrors[index], [field]: '' };
      }
      setErrors(updatedErrors);
    }
  };

  const validateSubticket = (subticket: Subticket, index: number): Record<string, string> => {
    const subticketErrors: Record<string, string> = {};

    if (!subticket.subject.trim()) {
      subticketErrors.subject = 'Subject is required';
    } else if (subticket.subject.trim().length < 5) {
      subticketErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!subticket.description.trim()) {
      subticketErrors.description = 'Description is required';
    } else if (subticket.description.trim().length < 10) {
      subticketErrors.description = 'Description must be at least 10 characters';
    }

    if (!subticket.department) {
      subticketErrors.department = 'Department is required';
    }

    return subticketErrors;
  };

  const handleSplit = () => {
    const allErrors: Record<number, Record<string, string>> = {};
    let hasErrors = false;

    subtickets.forEach((subticket, index) => {
      const subticketErrors = validateSubticket(subticket, index);
      if (Object.keys(subticketErrors).length > 0) {
        allErrors[index] = subticketErrors;
        hasErrors = true;
      }
    });

    setErrors(allErrors);

    if (!hasErrors) {
      onSplit(subtickets);
      // Reset form
      setSubtickets([
        {
          subject: '',
          description: '',
          priority: 'medium',
          department: ticketDepartment,
        },
      ]);
      setErrors({});
    }
  };

  const handleClose = () => {
    setSubtickets([
      {
        subject: '',
        description: '',
        priority: 'medium',
        department: ticketDepartment,
      },
    ]);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b z-10">
          <div className="flex items-center space-x-2">
            <Scissors className="w-6 h-6" style={{ color: THEME.colors.primary }} />
            <h2 className="text-xl font-bold" style={{ color: THEME.colors.primary }}>
              Split Ticket into Subtickets
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
        <div className="p-6 space-y-6">
          {/* Original Ticket Info */}
          <div className="p-4 rounded-lg border" style={{ backgroundColor: THEME.colors.background, borderColor: THEME.colors.light }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
              Original Ticket
            </h3>
            <p className="text-sm font-medium text-gray-900 mb-1">{ticketSubject}</p>
            <p className="text-xs text-gray-600 line-clamp-2">{ticketDescription}</p>
          </div>

          {/* Subtickets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                Subtickets ({subtickets.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={addSubticket}
              >
                Add Subticket
              </Button>
            </div>

            {subtickets.map((subticket, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border space-y-4"
                style={{ borderColor: THEME.colors.light }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold" style={{ color: THEME.colors.primary }}>
                    Subticket #{index + 1}
                  </h4>
                  {subtickets.length > 1 && (
                    <button
                      onClick={() => removeSubticket(index)}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: THEME.colors.error }} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Subject"
                      type="text"
                      placeholder="Enter subticket subject"
                      value={subticket.subject}
                      onChange={(e) => updateSubticket(index, 'subject', e.target.value)}
                      error={errors[index]?.subject}
                      required
                    />
                  </div>

                  <div>
                    <Select
                      label="Priority"
                      options={priorityOptions}
                      value={subticket.priority}
                      onChange={(value) => updateSubticket(index, 'priority', value)}
                      fullWidth
                    />
                  </div>

                  <div>
                    <Select
                      label="Department"
                      options={departmentOptions}
                      value={subticket.department}
                      onChange={(value) => updateSubticket(index, 'department', value)}
                      error={errors[index]?.department}
                      fullWidth
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <TextArea
                      label="Description"
                      placeholder="Enter detailed description for this subticket..."
                      value={subticket.description}
                      onChange={(e) => updateSubticket(index, 'description', e.target.value)}
                      error={errors[index]?.description}
                      rows={4}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
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
            onClick={handleSplit}
            leftIcon={<Check className="w-4 h-4" />}
            fullWidth
          >
            Split Ticket ({subtickets.length} subticket{subtickets.length !== 1 ? 's' : ''})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SplitTicketModal;

