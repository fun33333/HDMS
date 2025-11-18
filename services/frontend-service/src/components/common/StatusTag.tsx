import React from 'react';
import { getStatusColorClasses, getStatusIcon, getStatusBorderColor } from '../../lib/helpers';

interface StatusTagProps {
  status: string;
  withIcon?: boolean;
  withBorder?: boolean;
}

export const StatusTag: React.FC<StatusTagProps> = ({ status, withIcon = false, withBorder = false }) => {
  const colorClasses = getStatusColorClasses(status);
  const IconComponent = getStatusIcon(status);
  const borderClass = withBorder ? `border ${getStatusBorderColor(status)}` : '';

  if (withIcon) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses} ${borderClass}`}>
        <IconComponent className="w-4 h-4 mr-1" />
        <span>{status.toUpperCase()}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClasses} ${borderClass}`}>
      {status.toUpperCase()}
    </span>
  );
};

