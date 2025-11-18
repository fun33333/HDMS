'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Upload, XCircle, UserPlus } from 'lucide-react';
import { DEPARTMENTS } from '../../../lib/mockData';
import { THEME } from '../../../lib/theme';

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

  const { tickets, createSubticket, getAssignees, updateTicket, refreshData, user } = useAuth();

  const parentTicket = tickets.find(t => t.id === parent);
  const defaultDepartment = parentTicket?.department || DEPARTMENTS[0];

  const [index, setIndex] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [forms, setForms] = useState<FormData[]>(() =>
    Array.from({ length: count }).map(() => ({
      subject: '',
      description: '',
      priority: 'medium',
      attachments: [],
      department: defaultDepartment,
      assigneeId: ''
    }))
  );
  const [fileInputs, setFileInputs] = useState<{ [k: number]: File[] }>({});
  const [cancelConfirm, setCancelConfirm] = useState<{ open: boolean, index: number | null }>({ open: false, index: null });
  const [assignConfirm, setAssignConfirm] = useState<{ open: boolean, index: number | null }>({ open: false, index: null });

  useEffect(() => {
    // if no parent provided, go back
    if (!parent) {
      router.push('/moderator/new-requests');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parent]);

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

      const newId = createSubticket(parent!, payload);

      if (form.assigneeId) {
        const assignee = getAssignees().find(a => a.id === form.assigneeId);
        if (assignee) {
          updateTicket(newId, {
            assigneeId: form.assigneeId,
            assigneeName: assignee.name,
            status: 'assigned',
            assignedDate: new Date().toISOString(),
            moderatorId: user?.id,
            moderatorName: user?.name
          });
          // Also mark parent ticket assigned when a subticket is assigned
          try {
            updateTicket(parent!, {
              status: 'assigned',
              assignedDate: new Date().toISOString(),
              moderatorId: user?.id,
              moderatorName: user?.name
            });
          } catch (err) {
            console.error('Failed to update parent ticket status', err);
          }
        }
      } else {
        updateTicket(newId, {
          status: 'pending',
          moderatorId: user?.id,
          moderatorName: user?.name
        });
      }

      await refreshData();

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

  const goBackToParent = () => router.push(`/moderator/request-detail/${parent}`);

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
                {getAssignees().filter(a => !forms[index].department || a.department === forms[index].department).map(a => (
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
