'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, MessageSquare, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { THEME } from '../../lib/theme';

interface ModeratorActionsPanelProps {
    onActionSelect: (action: 'assign' | 'reject' | 'postpone' | 'clarify') => void;
    disabled?: boolean;
}

export const ModeratorActionsPanel: React.FC<ModeratorActionsPanelProps> = ({
    onActionSelect,
    disabled = false,
}) => {
    const actions = [
        {
            id: 'assign' as const,
            label: 'Assign',
            icon: CheckCircle,
            color: THEME.colors.success,
            description: 'Assign to department/assignee',
        },
        {
            id: 'reject' as const,
            label: 'Reject',
            icon: XCircle,
            color: THEME.colors.error,
            description: 'Reject ticket permanently',
        },
        {
            id: 'postpone' as const,
            label: 'Postpone',
            icon: Clock,
            color: THEME.colors.warning,
            description: 'Postpone processing',
        },
        {
            id: 'clarify' as const,
            label: 'Request Info',
            icon: MessageSquare,
            color: THEME.colors.info,
            description: 'Ask for clarification',
        },
    ];

    return (
        <div className="bg-white border rounded-lg p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: THEME.colors.primary }}>
                Moderator Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.id}
                            onClick={() => onActionSelect(action.id)}
                            disabled={disabled}
                            className="flex flex-col items-center gap-2 p-4 border-2 rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                borderColor: '#E5E7EB',
                            }}
                        >
                            <Icon className="w-6 h-6" style={{ color: action.color }} />
                            <span className="text-sm font-medium text-gray-900">{action.label}</span>
                            <span className="text-xs text-gray-500 text-center hidden md:block">
                                {action.description}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ModeratorActionsPanel;
