'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../lib/auth';
import ticketService from '../../../../../services/api/ticketService';
import userService from '../../../../../services/api/userService';
import { Ticket } from '../../../../../types';
import ReviewPageHeader from '../../../../../components/review/ReviewPageHeader';
import TicketDetailsPanel from '../../../../../components/review/TicketDetailsPanel';
import ModeratorActionsPanel from '../../../../../components/review/ModeratorActionsPanel';
import TicketChatPanel from '../../../../../components/review/TicketChatPanel';
import AssignTicketModal from '../../../../../components/modals/AssignTicketModal';
import RejectTicketModal from '../../../../../components/modals/RejectTicketModal';
import PostponeModal from '../../../../../components/modals/PostponeModal';
import ClarificationModal from '../../../../../components/modals/ClarificationModal';
import AlertModal from '../../../../../components/modals/AlertModal';
import { THEME } from '../../../../../lib/theme';

export default function ReviewTicketPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const ticketId = params?.id as string;

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [assignees, setAssignees] = useState<any[]>([]);

    // Modal states
    const [activeModal, setActiveModal] = useState<'assign' | 'reject' | 'postpone' | 'clarify' | null>(null);
    const [alertModal, setAlertModal] = useState({
        isOpen: false,
        type: 'success' as 'success' | 'error' | 'warning' | 'info',
        title: '',
        message: '',
        details: '',
    });

    useEffect(() => {
        fetchTicket();
        fetchAssignees();
    }, [ticketId]);

    const fetchTicket = async () => {
        try {
            const data = await ticketService.getTicketById(ticketId);
            setTicket(data);
        } catch (error) {
            console.error('Failed to fetch ticket:', error);
            showAlert('error', 'Error', 'Failed to load ticket');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignees = async () => {
        try {
            const response = await userService.getUsers({ role: 'assignee' });
            setAssignees(response.results); // Extract results array
        } catch (error) {
            console.error('Failed to fetch assignees:', error);
        }
    };

    const showAlert = (
        type: 'success' | 'error' | 'warning' | 'info',
        title: string,
        message: string,
        details?: string
    ) => {
        setAlertModal({ isOpen: true, type, title, message, details: details || '' });
    };

    const handleActionSelect = (action: 'assign' | 'reject' | 'postpone' | 'clarify') => {
        setActiveModal(action);
    };

    const handleAssign = async (assigneeId: string, departmentId?: string) => {
        try {
            await ticketService.assignTicket(ticketId, assigneeId, departmentId);
            showAlert('success', 'Success', 'Ticket assigned successfully');
            setActiveModal(null);
            fetchTicket();
        } catch (error: any) {
            showAlert('error', 'Error', 'Failed to assign ticket', error.message);
        }
    };

    const handleReject = async (reason: string) => {
        try {
            await ticketService.rejectTicket(ticketId, reason);
            showAlert('success', 'Success', 'Ticket rejected');
            setActiveModal(null);
            setTimeout(() => router.push('/moderator/ticket-pool'), 2000);
        } catch (error: any) {
            showAlert('error', 'Error', 'Failed to reject ticket', error.message);
        }
    };

    const handlePostpone = async (reason: string) => {
        try {
            await ticketService.postponeTicket(ticketId, reason);
            showAlert('success', 'Success', 'Ticket postponed');
            setActiveModal(null);
            fetchTicket();
        } catch (error: any) {
            showAlert('error', 'Error', 'Failed to postpone ticket', error.message);
        }
    };

    const handleClarify = async (message: string) => {
        try {
            await ticketService.addComment(ticketId, `[Clarification Request] ${message}`);
            showAlert('success', 'Success', 'Clarification request sent');
            setActiveModal(null);
        } catch (error: any) {
            showAlert('error', 'Error', 'Failed to send request', error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: THEME.colors.primary }} />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Ticket not found</h2>
                    <button onClick={() => router.back()} className="text-blue-600 hover:underline">
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ReviewPageHeader ticketId={ticket.ticketId} />

            <div className="container mx-auto px-4 py-6 lg:grid lg:grid-cols-3 lg:gap-6">
                {/* Left: Ticket Details (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <TicketDetailsPanel ticket={ticket} />
                    <ModeratorActionsPanel onActionSelect={handleActionSelect} />
                </div>

                {/* Right: Chat (1/3) */}
                <div className="hidden lg:block">
                    <TicketChatPanel ticketId={ticket.id} />
                </div>
            </div>

            {/* Mobile Chat */}
            <div className="lg:hidden">
                <TicketChatPanel ticketId={ticket.id} />
            </div>

            {/* Modals */}
            {activeModal === 'assign' && (
                <AssignTicketModal
                    isOpen={true}
                    onClose={() => setActiveModal(null)}
                    onAssign={handleAssign}
                    assignees={assignees}
                    ticketSubject={ticket.subject}
                    ticketDepartment={ticket.department}
                />
            )}

            {activeModal === 'reject' && (
                <RejectTicketModal
                    isOpen={true}
                    onClose={() => setActiveModal(null)}
                    onConfirm={handleReject}
                    ticketId={ticket.ticketId}
                    ticketSubject={ticket.subject}
                />
            )}

            {activeModal === 'postpone' && (
                <PostponeModal
                    isOpen={true}
                    onClose={() => setActiveModal(null)}
                    onConfirm={handlePostpone}
                    ticketId={ticket.ticketId}
                />
            )}

            {activeModal === 'clarify' && (
                <ClarificationModal
                    isOpen={true}
                    onClose={() => setActiveModal(null)}
                    onConfirm={handleClarify}
                    ticketId={ticket.ticketId}
                />
            )}

            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                type={alertModal.type}
                title={alertModal.title}
                message={alertModal.message}
                details={alertModal.details}
                buttonText="OK"
            />
        </div>
    );
}
