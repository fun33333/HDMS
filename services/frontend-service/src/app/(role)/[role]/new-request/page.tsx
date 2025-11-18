'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTicketActions } from '../../../../hooks/useTicketActions';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { TextArea } from '../../../../components/ui/TextArea';
import { Select, SelectOption } from '../../../../components/ui/Select';
import { Card, CardContent } from '../../../../components/ui/card';
import { Upload, X, File } from 'lucide-react';
import { THEME } from '../../../../lib/theme';
import { validateTicketSubject, validateTicketDescription } from '../../../../lib/validation';
import { TICKET_PRIORITY } from '../../../../lib/constants';

export default function NewRequestPage() {
  const router = useRouter();
  const { createTicket } = useTicketActions();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    department: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  });
  
  const [attachments, setAttachments] = useState<File[]>([]);

  const departments: SelectOption[] = [
    { value: 'IT', label: 'IT Department' },
    { value: 'HR', label: 'HR Department' },
    { value: 'Finance', label: 'Finance Department' },
    { value: 'Operations', label: 'Operations Department' },
    { value: 'Admin', label: 'Administration' },
  ];

  const priorities: SelectOption[] = [
    { value: TICKET_PRIORITY.LOW, label: 'Low' },
    { value: TICKET_PRIORITY.MEDIUM, label: 'Medium' },
    { value: TICKET_PRIORITY.HIGH, label: 'High' },
    { value: TICKET_PRIORITY.URGENT, label: 'Urgent' },
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const subjectError = validateTicketSubject(formData.subject);
    if (subjectError) newErrors.subject = subjectError;

    const descriptionError = validateTicketDescription(formData.description);
    if (descriptionError) newErrors.description = descriptionError;

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const ticket = await createTicket({
        ...formData,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (ticket) {
        router.push(`/requester/request-detail/${ticket.id}`);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper
      title="Create New Request"
      description="Submit a new help desk ticket"
    >
      <div className="max-w-3xl mx-auto animate-fade-in">
        <Card className="shadow-xl" variant="elevated">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject */}
            <div className="space-y-2">
              <Input
                label="Subject"
                type="text"
                placeholder="Brief description of your request"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                error={errors.subject}
                required
                className="text-base"
              />
            </div>

            {/* Department and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Select
                  label="Department"
                  options={departments}
                  value={formData.department}
                  onChange={(value) => handleChange('department', value)}
                  placeholder="Select department"
                  error={errors.department}
                  fullWidth
                />
              </div>

              <div className="space-y-2">
                <Select
                  label="Priority"
                  options={priorities}
                  value={formData.priority}
                  onChange={(value) => handleChange('priority', value)}
                  placeholder="Select priority"
                  fullWidth
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <TextArea
                label="Description"
                placeholder="Provide detailed information about your request..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                error={errors.description}
                rows={8}
                required
              />
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                Attachments <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all duration-200 group" style={{ borderColor: THEME.colors.medium }}>
                  <Upload className="w-8 h-8 group-hover:scale-110 transition-transform" style={{ color: THEME.colors.primary }} />
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700 block">Click to upload files</span>
                    <span className="text-xs text-gray-500 mt-1 block">or drag and drop</span>
                    <span className="text-xs text-gray-400 mt-1 block">PNG, JPG, PDF, DOC up to 10MB</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </label>

                {attachments.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Selected Files ({attachments.length})
                    </p>
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        style={{ borderColor: THEME.colors.medium }}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 p-2 rounded" style={{ backgroundColor: THEME.colors.light }}>
                            <File className="w-5 h-5" style={{ color: THEME.colors.primary }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="flex-shrink-0 p-2 hover:bg-red-50 rounded-lg transition-colors ml-2"
                          title="Remove file"
                        >
                          <X className="w-5 h-5" style={{ color: THEME.colors.error }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t" style={{ borderColor: THEME.colors.medium + '40' }}>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.back()}
                className="sm:flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="sm:flex-1"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </PageWrapper>
  );
}

