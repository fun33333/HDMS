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
import InitialReviewModal from '../../../../../components/modals/InitialReviewModal';
import EditTicketModal from '../../../../../components/modals/EditTicketModal';
import { THEME } from '../../../../../lib/theme';

export default function ReviewTicketPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const ticketId = params?.id as string;

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [assignees, setAssignees] = useState<any[]>([]);
    const [showInitialReview, setShowInitialReview] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Modal states
    const [activeModal, setActiveModal] = useState<'assign' | 'reject' | 'postpone' | 'clarify' | null>(null);
    const [alertModal, setAlertModal] = useState({
        isOpen: false,
        type: 'success' as 'success' | 'error' | 'warning' | 'info',
        title: '',
        message: '',
        details: '',
    });

    // Role-based permissions
    const canModerate = user?.role === 'moderator' || user?.role === 'admin';
    const canAssign = user?.role === 'assignee' || user?.role === 'admin';
    const isRequestor = ticket?.requestorId === user?.id;

    useEffect(() => {
        fetchTicket();
        if (canModerate) {
            fetchAssignees();
        }
    }, [ticketId]);

    const fetchTicket = async () => {
        try {
            const data = await ticketService.getTicketById(ticketId);
            setTicket(data);

            // Show initial review modal for 'submitted' tickets when a moderator opens them
            if (canModerate && data.status === 'submitted') {
                setShowInitialReview(true);
            }
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
            setAssignees(response.results);
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

    const handleConfirmReview = async (data: any) => {
        try {
            setLoading(true);
            await ticketService.confirmReview(ticketId, data);
            showAlert('success', 'Review Confirmed', 'Ticket details updated and assignment confirmed.');
            setShowInitialReview(false);
            await fetchTicket();
        } catch (error: any) {
            const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to confirm review';
            showAlert('error', 'Review Failed', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTicket = async (data: any) => {
        try {
            setLoading(true);
            await ticketService.updateTicket(ticketId, data);
            showAlert('success', 'Success', 'Ticket details updated');
            setShowEditModal(false);
            await fetchTicket();
        } catch (error: any) {
            const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to update ticket';
            showAlert('error', 'Update Failed', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (assigneeId: string, departmentId?: string) => {
        try {
            await ticketService.assignTicket(ticketId, assigneeId, departmentId);

            // Add timeline entry and participant
            await Promise.all([
                ticketService.addComment(ticketId, `[System] Ticket assigned by ${user?.name}`),
                // Participant will be added by backend when ticket is assigned
            ]);

            showAlert('success', 'Success', 'Ticket assigned successfully');
            setActiveModal(null);
            fetchTicket();
        } catch (error: any) {
            const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to assign ticket';
            showAlert('error', 'Error', 'Failed to assign ticket', errorMsg);
            console.error('Assignment error:', error);
        }
    };

    const handleReject = async (reason: string) => {
        try {
            await ticketService.rejectTicket(ticketId, reason);

            // Add timeline entry
            await ticketService.addComment(ticketId, `[System] Ticket rejected by ${user?.name}: ${reason}`);

            showAlert('success', 'Success', 'Ticket rejected');
            setActiveModal(null);
            setShowInitialReview(false);
            setTimeout(() => router.push('/moderator/ticket-pool'), 2000);
        } catch (error: any) {
            const errorMsg = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Unknown error occurred';
            showAlert('error', 'Rejection Failed', errorMsg);
            console.error('Rejection error:', error);
        }
    };

    const handlePostpone = async (reason: string) => {
        try {
            await ticketService.postponeTicket(ticketId, reason);

            // Add timeline entry
            await ticketService.addComment(ticketId, `[System] Ticket postponed by ${user?.name}: ${reason}`);

            showAlert('success', 'Success', 'Ticket postponed');
            setActiveModal(null);
            setShowInitialReview(false);
            fetchTicket();
        } catch (error: any) {
            const errorMsg = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Unknown error occurred';
            showAlert('error', 'Postpone Failed', errorMsg);
            console.error('Postpone error:', error);
        }
    };

    const handleClarify = async (message: string) => {
        try {
            await ticketService.addComment(ticketId, `[Clarification Request] ${message}`);
            showAlert('success', 'Success', 'Clarification request sent');
            setActiveModal(null);
        } catch (error: any) {
            const errorMsg = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Unknown error occurred';
            showAlert('error', 'Request Failed', errorMsg);
            console.error('Clarification error:', error);
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
                    <TicketDetailsPanel
                        ticket={ticket}
                        canEdit={canModerate}
                        onEdit={() => setShowEditModal(true)}
                    />

                    {/* Conditionally show actions based on role */}
                    {canModerate && (
                        <ModeratorActionsPanel
                            onActionSelect={handleActionSelect}
                            disabled={ticket.status === 'rejected' || ticket.status === 'closed'}
                        />
                    )}
                </div>

                {/* Right: Chat (1/3) & Mobile Elements */}
                {/* Rendered once - Layout handled by UnifiedChatPanel component */}
                <div>
                    <TicketChatPanel ticketId={ticket.id} />
                </div>
            </div>

            {/* Modals - Only show for moderators */}
            {canModerate && (
                <>
                    {/* Initial Review Modal */}
                    <InitialReviewModal
                        isOpen={showInitialReview}
                        onClose={() => setShowInitialReview(false)}
                        onConfirm={handleConfirmReview}
                        onReject={handleReject}
                        onPostpone={handlePostpone}
                        ticket={ticket}
                        assignees={assignees}
                        loading={loading}
                    />

                    {/* General Edit Modal */}
                    <EditTicketModal
                        isOpen={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        onSave={handleUpdateTicket}
                        ticket={ticket}
                        loading={loading}
                    />

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
                </>
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
