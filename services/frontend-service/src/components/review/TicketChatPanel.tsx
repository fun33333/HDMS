'use client';

import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import TicketChat from '../common/TicketChat';
import { THEME } from '../../lib/theme';

interface TicketChatPanelProps {
    ticketId: string;
}

export const TicketChatPanel: React.FC<TicketChatPanelProps> = ({ ticketId }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile: Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
                style={{ backgroundColor: THEME.colors.primary }}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageSquare className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Mobile: Slide-up Panel */}
            {isOpen && (
                <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t shadow-2xl rounded-t-2xl"
                    style={{ height: '70vh' }}>
                    <div className="h-full flex flex-col">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="font-semibold" style={{ color: THEME.colors.primary }}>
                                Comments & Chat
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="p-1">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <TicketChat ticketId={ticketId} />
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop: Fixed Right Panel */}
            <div className="hidden lg:block lg:sticky lg:top-20 h-[calc(100vh-6rem)]">
                <div className="h-full bg-white border rounded-lg flex flex-col">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold" style={{ color: THEME.colors.primary }}>
                            Comments & Chat
                        </h3>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <TicketChat ticketId={ticketId} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default TicketChatPanel;
