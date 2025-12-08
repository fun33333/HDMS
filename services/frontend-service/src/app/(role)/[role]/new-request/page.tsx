'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import { useTicketActions } from '../../../../hooks/useTicketActions';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { TextArea } from '../../../../components/ui/TextArea';
import { Select, SelectOption } from '../../../../components/ui/Select';
import { PriorityBadge } from '../../../../components/common/PriorityBadge';
import { FileUpload, FileWithStatus } from '../../../../components/common/FileUpload';
import { THEME } from '../../../../lib/theme';
import {
  validateTicketSubject,
  validateTicketDescription,
  validateRequired
} from '../../../../lib/validation';
import { TICKET_PRIORITY, DEPARTMENTS } from '../../../../lib/constants';
import { ticketService } from '../../../../services/api/ticketService';
import { AlertCircle, Save } from 'lucide-react';

// Department categories mapping
const DEPARTMENT_CATEGORIES: Record<string, SelectOption[]> = {
  'Development': [
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Fix' },
    { value: 'enhancement', label: 'Enhancement' },
    { value: 'code_review', label: 'Code Review' },
    { value: 'deployment', label: 'Deployment' },
    { value: 'other', label: 'Other' },
  ],
  'Finance & Accounts': [
    { value: 'payment', label: 'Payment Issue' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'expense', label: 'Expense' },
    { value: 'budget', label: 'Budget' },
    { value: 'reports', label: 'Financial Reports' },
    { value: 'other', label: 'Other' },
  ],
  'Procurement': [
    { value: 'purchase', label: 'Purchase Request' },
    { value: 'approval', label: 'Approval' },
    { value: 'vendor', label: 'Vendor Management' },
    { value: 'contract', label: 'Contract' },
    { value: 'other', label: 'Other' },
  ],
  'Basic Maintenance': [
    { value: 'repair', label: 'Repair' },
    { value: 'installation', label: 'Installation' },
    { value: 'general', label: 'General Maintenance' },
    { value: 'urgent', label: 'Urgent Repair' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'other', label: 'Other' },
  ],
  'IT': [
    { value: 'hardware', label: 'Hardware Issue' },
    { value: 'software', label: 'Software Issue' },
    { value: 'network', label: 'Network Issue' },
    { value: 'email', label: 'Email Issue' },
    { value: 'access', label: 'Access Request' },
    { value: 'security', label: 'Security' },
    { value: 'other', label: 'Other' },
  ],
  'Architecture': [
    { value: 'design', label: 'Design Request' },
    { value: 'review', label: 'Design Review' },
    { value: 'planning', label: 'Planning' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'other', label: 'Other' },
  ],
  'Administration': [
    { value: 'documentation', label: 'Documentation' },
    { value: 'policy', label: 'Policy Query' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'other', label: 'Other' },
  ],
};

export default function NewRequestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createTicket } = useTicketActions();

  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [openTicketsCount, setOpenTicketsCount] = useState<number>(0);

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    department: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });

  const [attachments, setAttachments] = useState<FileWithStatus[]>([]);

  // Department options
  const departmentOptions: SelectOption[] = DEPARTMENTS.map(dept => ({
    value: dept,
    label: `${dept} Department`,
  }));

  // Category options (depends on department)
  const categoryOptions = useMemo<SelectOption[]>(() => {
    if (!formData.department) return [];
    return DEPARTMENT_CATEGORIES[formData.department] || [];
  }, [formData.department]);

  // Priority options with preview
  const priorityOptions: SelectOption[] = [
    { value: TICKET_PRIORITY.LOW, label: 'Low' },
    { value: TICKET_PRIORITY.MEDIUM, label: 'Medium' },
    { value: TICKET_PRIORITY.HIGH, label: 'High' },
    { value: TICKET_PRIORITY.URGENT, label: 'Urgent' },
  ];

  // Check open tickets count
  useEffect(() => {
    const checkOpenTickets = async () => {
      if (!user?.id) return;
      try {
        const response = await ticketService.getTickets({
          requestorId: user.id,
          status: 'pending,assigned,in_progress'
        });
        const tickets = Array.isArray(response) ? response : (response?.results || []);
        setOpenTicketsCount(tickets.length);
      } catch (error) {
        // Silently fail
      }
    };
    checkOpenTickets();
  }, [user?.id]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Reset category when department changes
      if (field === 'department') {
        newData.category = '';
      }
      return newData;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setFormError(null);
  };

  const handleAttachmentsChange = (newAttachments: FileWithStatus[]) => {
    setAttachments(newAttachments);
    // Clear attachment error when files are added
    if (newAttachments.length > 0 && errors.attachments) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.attachments;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const subjectError = validateTicketSubject(formData.subject);
    if (subjectError) newErrors.subject = subjectError;

    const descriptionError = validateTicketDescription(formData.description);
    if (descriptionError) newErrors.description = descriptionError;

    if (!validateRequired(formData.department)) {
      newErrors.department = 'Department is required';
    }

    if (!validateRequired(formData.category)) {
      newErrors.category = 'Category is required';
    }

    if (!validateRequired(formData.priority)) {
      newErrors.priority = 'Priority is required';
    }

    // Validate attachments - at least one file is required
    const readyAttachments = attachments.filter(f => f.status === 'ready' || f.status === 'pending');
    if (readyAttachments.length === 0) {
      newErrors.attachments = 'At least one file attachment is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    setFormError(null);

    try {
      // Draft doesn't need full validation
      const ticket = await ticketService.createTicket({
        subject: formData.subject || 'Draft',
        description: formData.description || '',
        department: formData.department || 'IT',
        priority: formData.priority,
        category: formData.category,
        attachments: attachments.map(f => f.file),
        isDraft: true,
      });

      if (ticket) {
        router.push(`/requestor/request-detail/${ticket.id}`);
      }
    } catch (error: any) {
      setFormError(error.message || 'Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      setFormError('Please fix the errors below');
      return;
    }

    // Check open tickets limit
    if (openTicketsCount >= 10) {
      setFormError('You have reached the maximum limit of 10 open tickets. Please resolve or close existing tickets before creating a new one.');
      return;
    }

    setLoading(true);

    try {
      const ticket = await createTicket({
        subject: formData.subject,
        description: formData.description,
        department: formData.department,
        priority: formData.priority,
        category: formData.category,
        attachments: attachments.filter(f => f.status === 'ready' || f.status === 'pending').map(f => f.file),
      });

      if (ticket) {
        router.push(`/requestor/request-detail/${ticket.id}`);
      }
    } catch (error: any) {
      setFormError(error.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const subjectCharCount = formData.subject.length;
  const descriptionCharCount = formData.description.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ backgroundColor: '#e7ecef', minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#274c77' }}>
            Create New Request
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Submit a new help desk ticket
          </p>
        </div>

        {/* Open Tickets Warning */}
        {openTicketsCount >= 8 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                You have {openTicketsCount} open tickets
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                {openTicketsCount >= 10
                  ? 'You have reached the maximum limit. Please resolve existing tickets before creating new ones.'
                  : 'You are approaching the limit of 10 open tickets.'}
              </p>
            </div>
          </div>
        )}

        {/* Form Error */}
        {formError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{formError}</p>
          </div>
        )}

        <Card className="shadow-xl">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                  Basic Information
                </h2>

                {/* Title */}
                <div className="space-y-2">
                  <Input
                    label="Title"
                    type="text"
                    placeholder="Brief description of your request"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    error={errors.subject}
                    required
                    maxLength={200}
                    className="text-base"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Minimum 10 characters required
                    </span>
                    <span className={`text-xs ${subjectCharCount > 200 ? 'text-red-500' : 'text-gray-500'}`}>
                      {subjectCharCount} / 200
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <TextArea
                    label="Description"
                    placeholder="Provide detailed information about your request..."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    error={errors.description}
                    rows={8}
                    required
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Minimum 20 characters required
                    </span>
                    <span className="text-xs text-gray-500">
                      {descriptionCharCount} characters
                    </span>
                  </div>
                </div>

                {/* Department and Category Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Select
                      label="Department"
                      options={departmentOptions}
                      value={formData.department}
                      onChange={(value) => handleChange('department', value)}
                      placeholder="Select department"
                      error={errors.department}
                      fullWidth
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Select
                      label="Category"
                      options={categoryOptions}
                      value={formData.category}
                      onChange={(value) => handleChange('category', value)}
                      placeholder={formData.department ? "Select category" : "Select department first"}
                      error={errors.category}
                      fullWidth
                      required
                      disabled={!formData.department}
                    />
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Select
                    label="Priority"
                    options={priorityOptions}
                    value={formData.priority}
                    onChange={(value) => handleChange('priority', value)}
                    placeholder="Select priority"
                    error={errors.priority}
                    fullWidth
                    required
                  />
                  {formData.priority && (
                    <div className="mt-2">
                      <PriorityBadge priority={formData.priority} />
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments Section */}
              <div className="space-y-4 pt-6 border-t" style={{ borderColor: THEME.colors.light + '40' }}>
                <div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                    Attachments <span className="text-red-500">*</span>
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload files to support your request. Max 250MB per file, 100MB total. <span className="text-red-500 font-medium">At least one file is required.</span>
                  </p>
                </div>
                <FileUpload
                  files={attachments}
                  onFilesChange={handleAttachmentsChange}
                  disabled={loading || savingDraft}
                />
                {errors.attachments && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.attachments}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t" style={{ borderColor: THEME.colors.light + '40' }}>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.back()}
                  className="sm:flex-1"
                  disabled={loading || savingDraft}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleSaveDraft}
                  loading={savingDraft}
                  disabled={loading}
                  leftIcon={<Save className="w-4 h-4" />}
                  className="sm:flex-1"
                >
                  {savingDraft ? 'Saving...' : 'Save as Draft'}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={savingDraft}
                  className="sm:flex-1"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

