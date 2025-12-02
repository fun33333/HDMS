'use client';

import React, { useMemo } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { THEME } from '../../lib/theme';

interface SLACardProps {
  submittedDate: string;
  dueDate?: string;
  slaHours?: number; // Default SLA in hours
  status: string;
}

export const SLACard: React.FC<SLACardProps> = ({
  submittedDate,
  dueDate,
  slaHours = 72, // Default 3 days
  status,
}) => {
  const { timeRemaining, percentage, color, isBreached } = useMemo(() => {
    const now = new Date();
    const submitted = new Date(submittedDate);
    const due = dueDate ? new Date(dueDate) : new Date(submitted.getTime() + slaHours * 60 * 60 * 1000);
    
    const diffMs = due.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = Math.floor(diffHours % 24);

    const totalMs = due.getTime() - submitted.getTime();
    const percentage = totalMs > 0 ? (diffMs / totalMs) * 100 : 0;

    let color = '#10b981'; // green
    let isBreached = false;

    if (diffMs < 0) {
      isBreached = true;
      color = '#ef4444'; // red
    } else if (percentage < 25) {
      color = '#ef4444'; // red
    } else if (percentage < 50) {
      color = '#f59e0b'; // yellow
    }

    let timeRemaining = '';
    if (diffMs < 0) {
      const overdueDays = Math.abs(diffDays);
      const overdueHours = Math.abs(remainingHours);
      timeRemaining = overdueDays > 0 
        ? `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`
        : `${overdueHours} hour${overdueHours > 1 ? 's' : ''} overdue`;
    } else {
      timeRemaining = diffDays > 0
        ? `${diffDays} day${diffDays > 1 ? 's' : ''} ${remainingHours > 0 ? `${remainingHours}h` : ''} remaining`
        : `${remainingHours} hour${remainingHours > 1 ? 's' : ''} remaining`;
    }

    return { timeRemaining, percentage: Math.max(0, Math.min(100, percentage)), color, isBreached };
  }, [submittedDate, dueDate, slaHours]);

  // Don't show SLA for resolved/closed tickets
  if (status === 'resolved' || status === 'closed' || status === 'completed') {
    return null;
  }

  return (
    <div className="p-3 bg-gray-50 rounded-lg border" style={{ borderColor: color + '40' }}>
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4" style={{ color }} />
        <span className="text-sm font-medium" style={{ color }}>
          SLA Status
        </span>
      </div>
      <p className="text-sm font-semibold mb-1" style={{ color }}>
        {timeRemaining}
      </p>
      {isBreached && (
        <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
          <AlertCircle className="w-3 h-3" />
          <span>SLA Breached</span>
        </div>
      )}
      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  ); 
};

