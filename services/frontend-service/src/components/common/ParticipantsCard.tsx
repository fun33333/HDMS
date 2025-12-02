'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { THEME } from '../../lib/theme';
import { Ticket } from '../../types';
import { formatRelativeTime, getInitials, getAvatarColor } from '../../lib/helpers';
import { Users, User } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  role: string;
  joinDate: string;
  avatar?: string;
}

interface ParticipantsCardProps {
  ticket: Ticket;
}

export const ParticipantsCard: React.FC<ParticipantsCardProps> = ({ ticket }) => {
  const participants: Participant[] = [
    {
      id: ticket.requesterId,
      name: ticket.requesterName,
      role: 'Requester',
      joinDate: ticket.submittedDate,
    },
    ...(ticket.moderatorId && ticket.moderatorName
      ? [{
          id: ticket.moderatorId,
          name: ticket.moderatorName,
          role: 'Moderator',
          joinDate: ticket.assignedDate || ticket.submittedDate,
        }]
      : []),
    ...(ticket.assigneeId && ticket.assigneeName
      ? [{
          id: ticket.assigneeId,
          name: ticket.assigneeName,
          role: 'Assignee',
          joinDate: ticket.assignedDate || ticket.submittedDate,
        }]
      : []),
  ];

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'requester':
        return THEME.colors.primary;
      case 'moderator':
        return '#8b5cf6';
      case 'assignee':
        return THEME.colors.success;
      default:
        return THEME.colors.gray;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" style={{ color: THEME.colors.primary }} />
          <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
            Participants
          </h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {participants.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No participants yet</p>
        ) : (
          participants.map((participant) => (
            <div key={participant.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              {/* Avatar */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: getAvatarColor(participant.name) }}
              >
                {participant.avatar ? (
                  <img src={participant.avatar} alt={participant.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(participant.name)
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{participant.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${getRoleColor(participant.role)}20`,
                      color: getRoleColor(participant.role),
                    }}
                  >
                    {participant.role}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Joined {formatRelativeTime(participant.joinDate)}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
