'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../lib/auth';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { Upload, XCircle, UserPlus } from 'lucide-react';
import { DEPARTMENTS } from '../../../../lib/constants';
import { THEME } from '../../../../lib/theme';
import ticketService from '../../../../services/api/ticketService';
import userService from '../../../../services/api/userService';

interface FormData {
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments: string[];
  department: string;
  assigneeId: string;
}

const CreateSubticketsPage: React.FC = () => {
  const router = useRouter();
  const search = useSearchParams();
  const parent = search.get('parent');
  const countParam = search.get('count');
  const count = Math.max(1, Math.min(50, parseInt(countParam || '1', 10)));

  const { user } = useAuth();
  const [parentTicket, setParentTicket] = useState<any>(null);
  const [assignees, setAssignees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);
        
        // Fetch parent ticket if parent ID is provided
        if (parent) {
          try {
            const ticket = await ticketService.getTicketById(parent);
            if (!isMounted) return;
            setParentTicket(ticket);
          } catch (ticketError: any) {
            console.error('Error fetching parent ticket:', ticketError);
            if (!isMounted) return;
            // Don't fail completely if parent ticket fetch fails
            if (ticketError?.isNetworkError) {
              setError('Network error. Please check your connection and try again.');
            } else {
              setError('Failed to load parent ticket. Please try again.');
            }
            setLoading(false);
            return;
          }
        }
        
        // Fetch assignees - this is required for the form
        // Wrap in try-catch to prevent React error boundary from catching
        let usersResult: any;
        try {
          usersResult = await userService.getUsers({ role: 'assignee' });
          if (!isMounted) return;
          // Success - process users
          const usersList = Array.isArray(usersResult) ? usersResult : (usersResult?.results || []);
          setAssignees(usersList);
        } catch (userError: any) {
          // Error caught - handle gracefully
          console.error('Error fetching assignees:', userError);
          if (!isMounted) return;
          // Handle network errors gracefully
          if (userError?.isNetworkError) {
            setError('Network error. Please check your connection and try again.');
          } else {
            setError(userError?.message || 'Failed to load assignees. Please try again.');
          }
          // Set empty array on error to prevent crashes
          setAssignees([]);
        }
      } catch (error: any) {
        console.error('Unexpected error:', error);
        if (!isMounted) return;
        setError('An unexpected error occurred. Please try again.');
        setAssignees([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Wrap fetchData to catch any errors that might escape
    // Ensure promise rejection is handled to prevent Next.js error boundary from catching
    const safeFetchData = async () => {
      try {
        await fetchData();
      } catch (error: any) {
        console.error('Error in fetchData wrapper:', error);
        if (isMounted) {
          setError('An error occurred while loading data. Please try again.');
          setLoading(false);
          setAssignees([]);
        }
      }
    };
    
    // Call and ensure promise is handled to prevent unhandled rejection
    const promise = safeFetchData();
    // Explicitly handle promise rejection to prevent Next.js error boundary
    promise.catch((error: any) => {
      console.error('Unhandled promise rejection caught:', error);
      if (isMounted) {
        setError('An error occurred while loading data. Please try again.');
        setLoading(false);
        setAssignees([]);
      }
    });
    
    return () => {
      isMounted = false;
    };
  }, [parent]);

  const defaultDepartment = parentTicket?.department || DEPARTMENTS[0];

  const [index, setIndex] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [forms, setForms] = useState<FormData[]>(() =>
    Array.from({ length: count }).map(() => ({
      subject: '',
      description: '',
      priority: 'medium',
      attachments: [],
      department: DEPARTMENTS[0],
      assigneeId: ''
    }))
  );

  // Update forms when parentTicket department is loaded
  useEffect(() => {
    if (parentTicket?.department) {
      setForms(prev => prev.map(form => ({
        ...form,
        department: form.department === DEPARTMENTS[0] ? parentTicket.department : form.department
      })));
    }
  }, [parentTicket?.department]);
  const [fileInputs, setFileInputs] = useState<{ [k: number]: File[] }>({});
  const [cancelConfirm, setCancelConfirm] = useState<{ open: boolean, index: number | null }>({ open: false, index: null });
  const [assignConfirm, setAssignConfirm] = useState<{ open: boolean, index: number | null }>({ open: false, index: null });

  const updateForm = (i: number, field: keyof FormData, value: any) => {
    setForms(prev => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: value };
      return copy;
    });
  };

  const handleFileChange = (i: number, files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setFileInputs(prev => ({ ...prev, [i]: arr }));
    const names = arr.map(f => f.name);
    updateForm(i, 'attachments', names);
  };

  const getMissingFields = (form: FormData) => {
    const missing: string[] = [];
    if (!form.subject || !form.subject.trim()) missing.push('Subject');
    if (!form.description || !form.description.trim()) missing.push('Description');
    if (!form.priority) missing.push('Priority');
    if (!form.department) missing.push('Department');
    if (!form.assigneeId) missing.push('Assignee');
    return missing;
  };

  // Open confirm modal for assigning current subticket
  const handleAssignNow = () => {
    const form = forms[index];
    const missing = getMissingFields(form);
    if (missing.length > 0) {
      alert('Please fill required fields before assigning: ' + missing.join(', '));
      return;
    }
    setAssignConfirm({ open: true, index });
  };

  // Perform the actual create + assign operation for given index
  const performAssign = async (idx: number) => {
    const form = forms[idx];
    if (!form) return;
    const missing = getMissingFields(form);
    if (missing.length > 0) {
      alert('Cannot assign. Please fill: ' + missing.join(', '));
      return;
    }

    try {
      setProcessing(true);
      const payload = {
        subject: form.subject,
        description: form.description,
        priority: form.priority,
        attachments: form.attachments,
        department: form.department
      } as any;

      const newTicket = await ticketService.createTicket({
        subject: payload.subject,
        description: payload.description,
        priority: payload.priority,
        department: payload.department,
        attachments: fileInputs[idx] || []
      });

      if (form.assigneeId) {
        const assignee = assignees.find(a => a.id === form.assigneeId);
        if (assignee) {
          await ticketService.updateTicket(newTicket.id, {
            assigneeId: form.assigneeId,
            status: 'assigned'
          });
          // Also mark parent ticket assigned when a subticket is assigned
          try {
            await ticketService.updateTicket(parent!, {
              status: 'assigned'
            });
          } catch (err) {
            console.error('Failed to update parent ticket status', err);
          }
        }
      } else {
        await ticketService.updateTicket(newTicket.id, {
          status: 'pending'
        });
      }

      const updatedForms = forms.filter((_, i) => i !== idx);
      if (updatedForms.length === 0) {
        setAssignConfirm({ open: false, index: null });
        alert('All subtickets processed');
        router.push(`/moderator/request-detail/${parent}`);
        return;
      }
      setForms(updatedForms);
      setIndex(prev => Math.min(prev, updatedForms.length - 1));
      setAssignConfirm({ open: false, index: null });
      alert('Subticket assigned');
    } catch (err) {
      console.error(err);
      alert('Failed to assign subticket');
    } finally {
      setProcessing(false);
    }
  };

  // Cancel (delete) current subticket form without creating ticket
  const handleCancelSubticket = () => {
    const updatedForms = forms.filter((_, i) => i !== index);
    if (updatedForms.length === 0) {
      router.push(`/moderator/request-detail/${parent}`);
      return;
    }
    setForms(updatedForms);
    setIndex(prev => Math.min(prev, updatedForms.length - 1));
  };

  const goBackToParent = () => {
    if (parent) {
      router.push(`/moderator/request-detail/${parent}`);
    } else {
      router.push('/moderator/ticket-pool');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-6" style={{ backgroundColor: THEME.colors.white, minHeight: '100vh' }}>
        <Card className="max-w-3xl mx-auto" style={{ backgroundColor: THEME.colors.white }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: THEME.colors.primary }}></div>
                <p style={{ color: THEME.colors.gray }}>Loading...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6" style={{ backgroundColor: THEME.colors.white, minHeight: '100vh' }}>
        <Card className="max-w-3xl mx-auto" style={{ backgroundColor: THEME.colors.white }}>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <div className="mb-4">
                <XCircle className="w-16 h-16 mx-auto" style={{ color: '#ef4444' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: THEME.colors.primary }}>Error Loading Page</h3>
              <p className="mb-6" style={{ color: THEME.colors.gray }}>{error}</p>
              <div className="space-x-3">
                <Button onClick={() => window.location.reload()} variant="primary">
                  Retry
                </Button>
                <Button onClick={() => router.push('/moderator/ticket-pool')} variant="secondary">
                  Go to Ticket Pool
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message if no parent ticket selected
  if (!parent) {
    return (
      <div className="p-6" style={{ backgroundColor: THEME.colors.white, minHeight: '100vh' }}>
        <Card className="max-w-3xl mx-auto" style={{ backgroundColor: THEME.colors.white }}>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <div className="mb-4">
                <UserPlus className="w-16 h-16 mx-auto" style={{ color: THEME.colors.primary }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: THEME.colors.primary }}>Select Parent Ticket</h3>
              <p className="mb-6" style={{ color: THEME.colors.gray }}>
                To create subtickets, please select a parent ticket from the Ticket Pool first.
              </p>
              <Button onClick={() => router.push('/moderator/ticket-pool')} variant="primary">
                Go to Ticket Pool
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    // 전체 오른쪽 컨텐츠(폼 배경)를 흰색으로 설정
    <div className="p-6" style={{ backgroundColor: THEME.colors.white, minHeight: '100vh' }}>
      {/* Keep the form/card background white to match right-side content */}
      <Card className="max-w-3xl mx-auto" style={{ backgroundColor: THEME.colors.white }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: THEME.colors.primary }}>Create Subtickets ({index + 1} / {forms.length})</h2>
            <button onClick={goBackToParent} className="text-sm hover:text-gray-900" style={{ color: THEME.colors.gray }}>Cancel</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: THEME.colors.gray }}>Subject *</label>
              <input value={forms[index].subject} onChange={(e) => updateForm(index, 'subject', e.target.value)} className="w-full px-4 py-2 border rounded" style={{ borderColor: THEME.colors.medium, color: THEME.colors.black, backgroundColor: THEME.colors.white }} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: THEME.colors.gray }}>Priority</label>
              <select value={forms[index].priority} onChange={(e) => updateForm(index, 'priority', e.target.value as any)} className="w-full px-4 py-2 border rounded" style={{ borderColor: THEME.colors.medium, color: THEME.colors.black, backgroundColor: THEME.colors.white }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: THEME.colors.gray }}>Department</label>
              <select value={forms[index].department} onChange={(e) => updateForm(index, 'department', e.target.value)} className="w-full px-4 py-2 border rounded" style={{ borderColor: THEME.colors.medium, color: THEME.colors.black, backgroundColor: THEME.colors.white }}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: THEME.colors.gray }}>Assignee</label>
              <select value={forms[index].assigneeId} onChange={(e) => updateForm(index, 'assigneeId', e.target.value)} className="w-full px-4 py-2 border rounded" style={{ borderColor: THEME.colors.medium, color: THEME.colors.black, backgroundColor: THEME.colors.white }}>
                <option value="">Select assignee</option>
                {assignees.filter(a => !forms[index].department || a.department === forms[index].department).map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: THEME.colors.gray }}>Description *</label>
              <textarea value={forms[index].description} onChange={(e) => updateForm(index, 'description', e.target.value)} rows={5} className="w-full px-4 py-2 border rounded resize-none" style={{ borderColor: THEME.colors.medium, color: THEME.colors.black, backgroundColor: THEME.colors.white }} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: THEME.colors.gray }}>Attachments</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center space-x-2 px-3 py-2 border rounded cursor-pointer" style={{ borderColor: THEME.colors.medium, backgroundColor: THEME.colors.white }}>
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Choose files</span>
                  <input type="file" multiple onChange={(e) => handleFileChange(index, e.target.files)} className="hidden" />
                </label>
                <div className="text-sm" style={{ color: THEME.colors.gray }}>{forms[index].attachments.length} file(s)</div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="space-x-2">
                <Button onClick={() => setCancelConfirm({ open: true, index })} variant="danger" leftIcon={<XCircle className="w-4 h-4" />} disabled={processing}>
                  Cancel Subticket
                </Button>
              </div>

              <div className="space-x-2">
                <Button onClick={handleAssignNow} variant="success" leftIcon={<UserPlus className="w-4 h-4" />} disabled={processing}>
                  {processing ? 'Processing...' : 'Assign Now'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Cancel Subticket Confirm Modal */}
      {cancelConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md mx-4 bg-white rounded shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: THEME.colors.primary }}>Delete Subticket?</h3>
              <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this subticket form?</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setCancelConfirm({ open: false, index: null })}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // perform delete
                    const idx = cancelConfirm.index ?? index;
                    const updatedForms = forms.filter((_, i) => i !== idx);
                    if (updatedForms.length === 0) {
                      setCancelConfirm({ open: false, index: null });
                      router.push(`/moderator/request-detail/${parent}`);
                      return;
                    }
                    setForms(updatedForms);
                    setIndex(prev => Math.min(prev, updatedForms.length - 1));
                    setCancelConfirm({ open: false, index: null });
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Assign Confirm Modal */}
      {assignConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md mx-4 bg-white rounded shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: THEME.colors.primary }}>Assign Subticket?</h3>
              <p className="text-sm text-gray-600 mb-4">Do you want to assign this subticket now?</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setAssignConfirm({ open: false, index: null })}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const idx = assignConfirm.index ?? index;
                    performAssign(idx);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSubticketsPage;
