/**
 * PageWrapper Component
 * Wrapper for pages with consistent layout and loading states
 */

'use client';

import React, { ReactNode } from 'react';
import { SkeletonLoader } from '../ui/SkeletonLoader';
import { THEME } from '../../lib/theme';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  actions?: ReactNode;
  className?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  title,
  description,
  loading = false,
  error = null,
  actions,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {title && (
          <div className="mb-6">
            <SkeletonLoader type="text" width="200px" height="32px" className="mb-2" />
            {description && (
              <SkeletonLoader type="text" width="400px" height="20px" />
            )}
          </div>
        )}
        <SkeletonLoader type="card" height="400px" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {(title || description || actions) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b" style={{ borderColor: THEME.colors.medium + '40' }}>
          <div>
            {title && (
              <h1 
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ color: THEME.colors.primary }}
              >
                {title}
              </h1>
            )}
            {description && (
              <p className="text-base text-gray-600">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div 
          className="p-4 rounded-lg border"
          style={{ 
            backgroundColor: THEME.colors.background,
            borderColor: THEME.colors.error,
            color: THEME.colors.error 
          }}
        >
          {error}
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
};

