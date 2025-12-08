import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { THEME } from '../../lib/theme';

interface StatusUpdateSectionProps {
  status: string;
  completionNote?: string;
  viewType?: 'assignee' | 'requestor' | 'moderator';
}

export const StatusUpdateSection: React.FC<StatusUpdateSectionProps> = ({
  status,
  completionNote,
  viewType = 'assignee'
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
          Status Information
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-600">Current Status:</span>
            <span className="ml-2 text-gray-900 capitalize">{status.replace('_', ' ')}</span>
          </div>
          {completionNote && (
            <div>
              <span className="text-sm font-medium text-gray-600">Completion Note:</span>
              <p className="mt-1 text-gray-900">{completionNote}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

