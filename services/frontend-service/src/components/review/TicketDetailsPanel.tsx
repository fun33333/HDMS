'use client';

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { AttachmentsCard } from '../common/AttachmentsCard';
import { TicketTimeline } from '../common/TicketTimeline';
import { ParticipantsCard } from '../common/ParticipantsCard';
import { SLACard } from '../common/SLACard';
import { Ticket } from '../../types';
import { formatDate } from '../../lib/helpers';
import { THEME } from '../../lib/theme';

interface TicketDetailsPanelProps {
    ticket: Ticket;
    slaDueDate?: string;
    canEdit?: boolean;
    onEdit?: () => void;
}

export const TicketDetailsPanel: React.FC<TicketDetailsPanelProps> = ({
    ticket,
    slaDueDate,
    canEdit,
    onEdit,
}) => {
    return (
        <div className="space-y-4">
            {/* Main Info Card */}
            <Card>
                <CardContent className="p-4 md:p-6 space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-xl font-bold text-gray-900">{ticket.subject}</h2>
                                {canEdit && (
                                    <button
                                        onClick={onEdit}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Edit Ticket Details"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <StatusBadge status={ticket.status} />
                            {ticket.priority && <PriorityBadge priority={ticket.priority} />}
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Requestor</p>
                            <div className="text-sm font-medium text-gray-900 whitespace-pre-line">
                                {ticket.requestorName}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Department</p>
                            <p className="text-sm font-medium text-gray-900">{ticket.department}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Submitted</p>
                            <p className="text-sm font-medium text-gray-900">
                                {formatDate(ticket.submittedDate, 'long')}
                            </p>
                        </div>
                        {ticket.assignedDate && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Assigned</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {formatDate(ticket.assignedDate, 'long')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* SLA */}
                    {slaDueDate && (
                        <div className="pt-4 border-t">
                            <SLACard
                                submittedDate={ticket.submittedDate}
                                dueDate={slaDueDate}
                                status={ticket.status}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Attachments */}
            {ticket.attachments && ticket.attachments.length > 0 && (
                <AttachmentsCard ticketAttachments={ticket.attachments} />
            )}

            {/* Timeline */}
            <TicketTimeline ticket={ticket} />

            {/* Participants */}
            <ParticipantsCard ticket={ticket} />
        </div>
    );
};

export default TicketDetailsPanel;
