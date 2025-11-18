import React from 'react';
import { getPriorityColor } from '../../lib/helpers';

interface PriorityBadgeProps {
  priority: string;
  withBorder?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, withBorder = false }) => {
  const colorClasses = getPriorityColor(priority);
  const borderClass = withBorder ? `border ${priority === 'urgent' ? 'border-red-200' : priority === 'high' ? 'border-orange-200' : priority === 'medium' ? 'border-yellow-200' : 'border-green-200'}` : '';

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClasses} ${borderClass}`}>
      {priority.toUpperCase()}
    </span>
  );
};

